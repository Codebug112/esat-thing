'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Paper, getPaperAnswerOptions } from '@/lib/papers-data'
import { createClient } from '@/lib/supabase/client'

interface Props {
  sessionId: string
  paper: Paper
  goalTimeSec: number
}

interface QuestionState {
  answer: string | null
  timeTakenMs: number
  flagged: boolean
  started: boolean
  running: boolean
  startedAt: number | null
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SessionTimer({ sessionId, paper, goalTimeSec }: Props) {
  const router = useRouter()
  const [currentQ, setCurrentQ] = useState(1)
  const [questions, setQuestions] = useState<Record<number, QuestionState>>(() => {
    const initial: Record<number, QuestionState> = {}
    for (let i = 1; i <= paper.questionCount; i++) {
      initial[i] = { answer: null, timeTakenMs: 0, flagged: false, started: false, running: false, startedAt: null }
    }
    return initial
  })
  const [tick, setTick] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const questionsRef = useRef(questions)
  const currentQRef = useRef(currentQ)

  useEffect(() => { questionsRef.current = questions }, [questions])
  useEffect(() => { currentQRef.current = currentQ }, [currentQ])

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 100)
    return () => clearInterval(interval)
  }, [])

  const getCurrentElapsedMs = useCallback(() => {
    const q = questionsRef.current[currentQRef.current]
    if (!q.running || !q.startedAt) return q.timeTakenMs
    return q.timeTakenMs + (Date.now() - q.startedAt)
  }, [])

  function getTotalElapsedMs(): number {
    let total = 0
    for (const q of Object.values(questionsRef.current)) {
      total += q.timeTakenMs
      if (q.running && q.startedAt) total += Date.now() - q.startedAt
    }
    return total
  }

  // Timer color: green < goal, yellow ±5s, red > goal+5s
  function getTimerColor(elapsedMs: number, started: boolean): string {
    if (!started) return 'var(--muted)'
    const goalMs = goalTimeSec * 1000
    const diff = elapsedMs - goalMs
    if (diff < -5000) return '#16a34a'  // green: more than 5s under
    if (diff < 5000) return '#ca8a04'   // yellow: within ±5s of goal
    return '#dc2626'                    // red: more than 5s over
  }

  function getTimerBg(elapsedMs: number, started: boolean): string {
    if (!started) return 'var(--bg)'
    const goalMs = goalTimeSec * 1000
    const diff = elapsedMs - goalMs
    if (diff < -5000) return 'var(--green)'
    if (diff < 5000) return 'var(--yellow)'
    return 'var(--rose)'
  }

  const toggleTimer = useCallback(() => {
    setQuestions(prev => {
      const q = prev[currentQRef.current]
      if (q.running) {
        const elapsed = q.startedAt ? q.timeTakenMs + (Date.now() - q.startedAt) : q.timeTakenMs
        return { ...prev, [currentQRef.current]: { ...q, running: false, startedAt: null, timeTakenMs: elapsed, started: true } }
      } else {
        return { ...prev, [currentQRef.current]: { ...q, running: true, startedAt: Date.now(), started: true } }
      }
    })
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        toggleTimer()
      }
      if (e.code === 'ArrowRight' && currentQRef.current < paper.questionCount) goToQuestion(currentQRef.current + 1)
      if (e.code === 'ArrowLeft' && currentQRef.current > 1) goToQuestion(currentQRef.current - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [toggleTimer, paper.questionCount])

  function stopCurrentTimer() {
    setQuestions(prev => {
      const q = prev[currentQRef.current]
      if (q.running && q.startedAt) {
        const elapsed = q.timeTakenMs + (Date.now() - q.startedAt)
        return { ...prev, [currentQRef.current]: { ...q, running: false, startedAt: null, timeTakenMs: elapsed } }
      }
      return prev
    })
  }

  function goToQuestion(n: number) {
    stopCurrentTimer()
    setCurrentQ(n)
  }

  function setAnswer(qNum: number, ans: string) {
    setQuestions(prev => ({ ...prev, [qNum]: { ...prev[qNum], answer: ans } }))
  }

  function toggleFlag(qNum: number) {
    setQuestions(prev => ({ ...prev, [qNum]: { ...prev[qNum], flagged: !prev[qNum].flagged } }))
  }

  async function submitSession() {
    setSubmitting(true)
    stopCurrentTimer()
    await new Promise(r => setTimeout(r, 50)) // let state settle

    const qs = questionsRef.current
    const supabase = createClient()
    const answersToInsert = Object.entries(qs).map(([qNum, state]) => {
      const qn = Number(qNum)
      const correctAnswer = paper.answers[qn]
      const hasAnswer = state.answer !== null && state.answer !== ''
      return {
        session_id: sessionId,
        question_number: qn,
        user_answer: hasAnswer ? state.answer : null,
        correct_answer: correctAnswer,
        is_correct: hasAnswer ? state.answer === correctAnswer : null,
        time_taken_ms: state.timeTakenMs,
        flagged: state.flagged,
        subject_part: paper.parts?.[qn] ?? null,
      }
    })

    await supabase.from('session_answers').insert(answersToInsert)
    await supabase.from('sessions').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', sessionId)
    router.push(`/results/${sessionId}`)
  }

  const answerOptions = getPaperAnswerOptions(paper)
  const currentState = questions[currentQ]
  const elapsedMs = tick >= 0 ? getCurrentElapsedMs() : 0
  const totalElapsedMs = getTotalElapsedMs()
  const goalMs = goalTimeSec * 1000
  const answeredCount = Object.values(questions).filter(q => q.answer !== null && q.answer !== '').length
  const flaggedNums = Object.entries(questions).filter(([, q]) => q.flagged).map(([n]) => Number(n))
  const currentPart = paper.parts?.[currentQ]

  const timerColor = getTimerColor(elapsedMs, currentState.started)
  const timerBg = getTimerBg(elapsedMs, currentState.started)

  // Subject part color chips
  const partColors: Record<string, string> = {
    Mathematics: 'var(--lavender)',
    Physics: 'var(--blue)',
    Chemistry: 'var(--green)',
    Biology: 'var(--peach)',
    Advanced: 'var(--rose)',
  }

  return (
    <div
      className="min-h-screen flex flex-col select-none"
      style={{ background: 'var(--bg)' }}
      onClick={toggleTimer}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{paper.name}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {answeredCount}/{paper.questionCount} answered
            {currentPart && (
              <span
                className="ml-2 px-2 py-0.5 rounded-md text-xs"
                style={{ background: partColors[currentPart] ?? 'var(--bg)', color: 'var(--text)' }}
              >
                {currentPart}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>total</p>
            <p className="text-sm font-mono font-medium">{formatMs(totalElapsedMs)}</p>
          </div>
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            Finish
          </button>
        </div>
      </div>

      {/* Timer display — full screen tap area */}
      <div
        className="flex-1 flex flex-col items-center justify-center cursor-pointer px-6 rounded-2xl mx-4 my-4 transition-all"
        style={{ background: timerBg, minHeight: '35vh' }}
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: timerColor, opacity: 0.7 }}>
            Question {currentQ} of {paper.questionCount}
          </p>
          <div
            className="text-9xl font-light tabular-nums leading-none"
            style={{ color: timerColor, fontVariantNumeric: 'tabular-nums' }}
          >
            {formatMs(elapsedMs)}
          </div>
          <p className="text-sm mt-5 font-medium" style={{ color: timerColor, opacity: 0.8 }}>
            {!currentState.started
              ? 'tap anywhere or press space to start'
              : currentState.running
              ? 'running — tap or space to stop'
              : 'stopped — tap or space to resume'}
          </p>
          <p className="text-xs mt-2" style={{ color: timerColor, opacity: 0.6 }}>
            goal {formatMs(goalMs)} · green = under · yellow = ±5s · red = over by 5s+
          </p>
        </div>
      </div>

      {/* Controls */}
      <div
        className="border-t px-5 py-5 space-y-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Answer buttons */}
        <div>
          <p className="text-xs font-medium mb-2.5 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Your answer</p>
          <div className="flex gap-2 flex-wrap items-center">
            {answerOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setAnswer(currentQ, opt)}
                className="w-11 h-11 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: currentState.answer === opt ? 'var(--lavender-dark)' : 'var(--bg)',
                  color: currentState.answer === opt ? 'white' : 'var(--text)',
                  border: `1.5px solid ${currentState.answer === opt ? 'var(--lavender-dark)' : 'var(--border)'}`,
                }}
              >
                {opt}
              </button>
            ))}
            {currentState.answer && (
              <button
                onClick={() => setAnswer(currentQ, '')}
                className="px-3 h-11 rounded-xl text-xs"
                style={{ color: 'var(--muted)', border: '1.5px solid var(--border)' }}
              >
                Clear
              </button>
            )}
            <button
              onClick={() => toggleFlag(currentQ)}
              className="h-11 px-3.5 rounded-xl text-xs font-medium ml-auto transition-all"
              style={{
                background: currentState.flagged ? 'var(--yellow)' : 'var(--bg)',
                color: currentState.flagged ? '#854d0e' : 'var(--muted)',
                border: `1.5px solid ${currentState.flagged ? '#fde047' : 'var(--border)'}`,
              }}
            >
              {currentState.flagged ? '⚑ Flagged' : '⚑ Flag'}
            </button>
          </div>
        </div>

        {/* Question grid nav */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => goToQuestion(currentQ - 1)}
            disabled={currentQ === 1}
            className="w-9 h-9 rounded-xl text-sm disabled:opacity-20 flex items-center justify-center"
            style={{ border: '1.5px solid var(--border)', color: 'var(--text)' }}
          >
            ←
          </button>
          <div className="flex-1 overflow-x-auto pb-1">
            <div className="flex gap-1.5">
              {Array.from({ length: paper.questionCount }, (_, i) => i + 1).map(n => {
                const q = questions[n]
                const isActive = n === currentQ
                const hasAnswer = q.answer !== null && q.answer !== ''
                return (
                  <button
                    key={n}
                    onClick={() => goToQuestion(n)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: isActive ? 'var(--lavender-dark)' : q.flagged ? 'var(--yellow)' : hasAnswer ? 'var(--green)' : 'var(--bg)',
                      color: isActive ? 'white' : q.flagged ? '#854d0e' : hasAnswer ? '#14532d' : 'var(--muted)',
                      border: `1.5px solid ${isActive ? 'var(--lavender-dark)' : 'var(--border)'}`,
                    }}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
          </div>
          <button
            onClick={() => goToQuestion(currentQ + 1)}
            disabled={currentQ === paper.questionCount}
            className="w-9 h-9 rounded-xl text-sm disabled:opacity-20 flex items-center justify-center"
            style={{ border: '1.5px solid var(--border)', color: 'var(--text)' }}
          >
            →
          </button>
        </div>

        {/* Flagged reminder */}
        {flaggedNums.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--yellow)' }}>
            <span className="text-xs" style={{ color: '#854d0e' }}>
              ⚑ Flagged: {flaggedNums.map(n => `Q${n}`).join(', ')} — remember to come back
            </span>
          </div>
        )}
      </div>

      {/* Submit confirm */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.25)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-5" style={{ background: 'var(--surface)' }}>
            <div>
              <h2 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Submit paper?</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                {answeredCount}/{paper.questionCount} answered · total {formatMs(totalElapsedMs)}
              </p>
            </div>

            {/* Unanswered questions */}
            {(() => {
              const unanswered = Object.entries(questions)
                .filter(([, q]) => q.answer === null || q.answer === '')
                .map(([n]) => Number(n))
              if (unanswered.length === 0) return null
              return (
                <div className="p-3 rounded-xl" style={{ background: 'var(--rose)' }}>
                  <p className="text-xs font-medium" style={{ color: '#9f1239' }}>
                    {unanswered.length} unanswered: {unanswered.map(n => `Q${n}`).join(', ')}
                  </p>
                  <button
                    onClick={() => { setShowSubmitConfirm(false); goToQuestion(unanswered[0]) }}
                    className="mt-2 text-xs font-medium"
                    style={{ color: '#9f1239', textDecoration: 'underline' }}
                  >
                    Go to first unanswered →
                  </button>
                </div>
              )
            })()}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm border font-medium"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                Keep going
              </button>
              <button
                onClick={submitSession}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'var(--text)', color: 'var(--bg)' }}
              >
                {submitting ? 'Saving…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

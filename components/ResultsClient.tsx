'use client'

import { useState } from 'react'
import { Paper, WRONG_REASONS } from '@/lib/papers-data'
import { createClient } from '@/lib/supabase/client'
import { IconFlag, IconRepeat } from './Icons'

interface Answer {
  id: string
  question_number: number
  user_answer: string | null
  correct_answer: string
  is_correct: boolean | null
  time_taken_ms: number
  flagged: boolean
  wrong_reason: string | null
  subject_part: string | null
}

interface Session {
  id: string
  paper_name: string
  completed_at: string
  goal_time_sec: number
}

interface Props {
  session: Session
  answers: Answer[]
  paper: Paper | null
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function ResultsClient({ session, answers, paper }: Props) {
  const [wrongReasons, setWrongReasons] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const a of answers) { if (a.wrong_reason) init[a.id] = a.wrong_reason }
    return init
  })
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const wrongAnswers = answers.filter(a => a.is_correct === false)
  const correct = answers.filter(a => a.is_correct === true).length
  const answered = answers.filter(a => a.user_answer !== null && a.user_answer !== '').length
  const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0
  const totalTimeMs = answers.reduce((sum, a) => sum + a.time_taken_ms, 0)
  const avgTimeMs = answers.length > 0 ? totalTimeMs / answers.length : 0
  const goalMs = session.goal_time_sec * 1000

  // Redo must be completed before correct answers for wrong Qs are shown
  const [hasRedone, setHasRedone] = useState(wrongAnswers.length === 0)
  const [redoIndex, setRedoIndex] = useState(0)
  const [redoAnswer, setRedoAnswer] = useState<string | null>(null)
  const [redoRevealed, setRedoRevealed] = useState(false)
  const [inRedo, setInRedo] = useState(false)

  const answerOptions = (() => {
    const used = new Set(answers.map(a => a.correct_answer).filter(Boolean))
    return ['A','B','C','D','E','F','G','H'].filter(o => used.has(o))
  })()

  async function saveReason(answerId: string, reason: string) {
    setSaving(prev => ({ ...prev, [answerId]: true }))
    setWrongReasons(prev => ({ ...prev, [answerId]: reason }))
    const supabase = createClient()
    await supabase.from('session_answers').update({ wrong_reason: reason }).eq('id', answerId)
    setSaving(prev => ({ ...prev, [answerId]: false }))
  }

  const wrongByPart: Record<string, Answer[]> = {}
  for (const a of wrongAnswers) {
    const part = a.subject_part ?? 'General'
    if (!wrongByPart[part]) wrongByPart[part] = []
    wrongByPart[part].push(a)
  }

  const partColors: Record<string, string> = {
    Mathematics: 'var(--purple-light)',
    Physics: 'var(--blue-bg)',
    Chemistry: 'var(--green-bg)',
    Biology: 'var(--orange-bg)',
    Advanced: 'var(--red-bg)',
    General: 'var(--bg)',
  }
  const partTextColors: Record<string, string> = {
    Mathematics: 'var(--purple-dark)',
    Physics: 'var(--blue-text)',
    Chemistry: 'var(--green-text)',
    Biology: 'var(--orange-text)',
    Advanced: 'var(--red-text)',
    General: 'var(--muted)',
  }

  // ── Redo mode ────────────────────────────────────────────────────────────────
  const currentRedoAnswer = wrongAnswers[redoIndex]

  if (inRedo && currentRedoAnswer) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--muted)' }}>
              Redo — {redoIndex + 1} / {wrongAnswers.length}
            </p>
            <h2 className="text-lg font-semibold mt-0.5" style={{ color: 'var(--text)' }}>
              Q{currentRedoAnswer.question_number}
              {currentRedoAnswer.subject_part && (
                <span className="ml-2 text-sm font-normal px-2 py-0.5 rounded-md"
                  style={{ background: partColors[currentRedoAnswer.subject_part] ?? partColors.General, color: partTextColors[currentRedoAnswer.subject_part] ?? 'var(--muted)' }}>
                  {currentRedoAnswer.subject_part}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={() => { setInRedo(false); setHasRedone(true) }}
            className="text-sm font-medium"
            style={{ color: 'var(--muted)' }}
          >
            Skip redo
          </button>
        </div>

        <div className="rounded-2xl p-6 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Original answer: <span className="font-semibold" style={{ color: 'var(--red-text)' }}>{currentRedoAnswer.user_answer ?? '—'}</span>
            {' '} · original time: <span className="font-mono">{formatMs(currentRedoAnswer.time_taken_ms)}</span>
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>What is your answer this time?</p>

          {!redoRevealed ? (
            <>
              <div className="flex gap-2 flex-wrap pt-1">
                {answerOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setRedoAnswer(opt)}
                    className="w-11 h-11 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: redoAnswer === opt ? 'var(--purple)' : 'var(--bg)',
                      color: redoAnswer === opt ? 'white' : 'var(--text)',
                      border: `1.5px solid ${redoAnswer === opt ? 'var(--purple)' : 'var(--border)'}`,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setRedoRevealed(true)}
                disabled={!redoAnswer}
                className="mt-2 w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ background: 'var(--purple)', color: 'white' }}
              >
                Reveal answer
              </button>
            </>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="flex items-stretch gap-4">
                <div className="flex-1 p-4 rounded-xl text-center"
                  style={{ background: redoAnswer === currentRedoAnswer.correct_answer ? 'var(--green-bg)' : 'var(--red-bg)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Your redo</p>
                  <p className="text-3xl font-light mt-1">{redoAnswer}</p>
                  <p className="text-xs mt-1 font-semibold" style={{ color: redoAnswer === currentRedoAnswer.correct_answer ? 'var(--green-text)' : 'var(--red-text)' }}>
                    {redoAnswer === currentRedoAnswer.correct_answer ? 'Correct' : 'Still wrong'}
                  </p>
                </div>
                <div className="flex-1 p-4 rounded-xl text-center" style={{ background: 'var(--bg)', border: '1.5px solid var(--border)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Correct answer</p>
                  <p className="text-3xl font-light mt-1" style={{ color: 'var(--green-text)' }}>{currentRedoAnswer.correct_answer}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setRedoAnswer(null)
                  setRedoRevealed(false)
                  if (redoIndex + 1 < wrongAnswers.length) {
                    setRedoIndex(i => i + 1)
                  } else {
                    setInRedo(false)
                    setHasRedone(true)
                  }
                }}
                className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--purple)', color: 'white' }}
              >
                {redoIndex + 1 < wrongAnswers.length ? 'Next wrong answer' : 'Done — see full results'}
              </button>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center">
          {wrongAnswers.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: i <= redoIndex ? 'var(--purple)' : 'var(--border)' }} />
          ))}
        </div>
      </div>
    )
  }

  // ── Main results view ────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{session.paper_name}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {new Date(session.completed_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: pct >= 70 ? 'var(--green-bg)' : pct >= 50 ? 'var(--yellow-bg)' : 'var(--red-bg)',
            border: '1px solid var(--border)',
          }}
        >
          <p className="text-3xl font-light" style={{ color: pct >= 70 ? 'var(--green-text)' : pct >= 50 ? 'var(--yellow-text)' : 'var(--red-text)' }}>
            {correct}/{answered}
          </p>
          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--muted)' }}>{pct}% correct</p>
        </div>
        <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-3xl font-light" style={{ color: 'var(--text)' }}>{formatMs(totalTimeMs)}</p>
          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--muted)' }}>total time</p>
        </div>
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: avgTimeMs > goalMs ? 'var(--red-bg)' : 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <p className="text-3xl font-light" style={{ color: avgTimeMs > goalMs ? 'var(--red-text)' : 'var(--text)' }}>{formatMs(avgTimeMs)}</p>
          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--muted)' }}>avg / question</p>
        </div>
      </div>

      {/* Section time breakdown */}
      {paper?.parts && (() => {
        const byPart: Record<string, { totalMs: number; count: number; correct: number; answered: number }> = {}
        for (const a of answers) {
          const part = a.subject_part ?? 'General'
          if (!byPart[part]) byPart[part] = { totalMs: 0, count: 0, correct: 0, answered: 0 }
          byPart[part].totalMs += a.time_taken_ms
          byPart[part].count++
          if (a.user_answer) {
            byPart[part].answered++
            if (a.is_correct) byPart[part].correct++
          }
        }
        const parts = Object.entries(byPart)
        if (parts.length <= 1) return null
        return (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Time by section</p>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {parts.map(([part, stats]) => {
                const avgMs = stats.count > 0 ? stats.totalMs / stats.count : 0
                const pct = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0
                return (
                  <div key={part} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: partColors[part] ? partTextColors[part] : 'var(--muted)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{part}</span>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>{stats.count}q</span>
                    </div>
                    <div className="flex items-center gap-5 text-right">
                      <div>
                        <p className="text-xs font-mono font-semibold" style={{ color: 'var(--text)' }}>{formatMs(stats.totalMs)}</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>total</p>
                      </div>
                      <div>
                        <p className="text-xs font-mono font-semibold" style={{ color: avgMs > goalMs ? 'var(--red-text)' : 'var(--text)' }}>{formatMs(avgMs)}</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>avg/q</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: pct >= 70 ? 'var(--green-text)' : pct >= 50 ? 'var(--yellow-text)' : 'var(--red-text)' }}>{pct}%</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>correct</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Redo gate — shown until redo is done */}
      {!hasRedone && wrongAnswers.length > 0 && (
        <div className="rounded-2xl p-6 text-center space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text)' }}>
              You got {wrongAnswers.length} question{wrongAnswers.length !== 1 ? 's' : ''} wrong
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              Redo them before seeing the answers — you'll learn more this way.
            </p>
          </div>
          <button
            onClick={() => { setRedoIndex(0); setRedoAnswer(null); setRedoRevealed(false); setInRedo(true) }}
            className="w-full py-3.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: 'var(--purple)', color: 'white', boxShadow: 'var(--shadow-sm)' }}
          >
            <IconRepeat size={15} />
            Redo {wrongAnswers.length} wrong question{wrongAnswers.length !== 1 ? 's' : ''}
          </button>
          <button
            onClick={() => setHasRedone(true)}
            className="text-xs font-medium"
            style={{ color: 'var(--muted)' }}
          >
            Skip — show answers anyway
          </button>
        </div>
      )}

      {/* After redo: redo button again for repeat practice */}
      {hasRedone && wrongAnswers.length > 0 && (
        <button
          onClick={() => { setRedoIndex(0); setRedoAnswer(null); setRedoRevealed(false); setHasRedone(false); setInRedo(true) }}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}
        >
          <IconRepeat size={14} />
          Redo wrong questions again
        </button>
      )}

      {/* Wrong answers — only shown after redo */}
      {hasRedone && wrongAnswers.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
            Wrong answers ({wrongAnswers.length}) — choose why
          </h2>
          {Object.entries(wrongByPart).map(([part, partAnswers]) => (
            <div key={part}>
              {Object.keys(wrongByPart).length > 1 && (
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>{part}</p>
              )}
              <div className="space-y-3">
                {partAnswers.map(a => (
                  <div key={a.id} className="rounded-2xl p-4 space-y-3"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Q{a.question_number}</span>
                        {a.flagged && (
                          <span className="text-xs px-2 py-0.5 rounded-md font-semibold flex items-center gap-1"
                            style={{ background: 'var(--yellow-bg)', color: 'var(--yellow-text)' }}>
                            <IconFlag size={10} />flagged
                          </span>
                        )}
                        {a.subject_part && (
                          <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                            style={{ background: partColors[a.subject_part] ?? partColors.General, color: partTextColors[a.subject_part] ?? 'var(--muted)' }}>
                            {a.subject_part}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span style={{ color: 'var(--muted)' }}>
                          You: <strong style={{ color: 'var(--red-text)' }}>{a.user_answer ?? '—'}</strong>
                        </span>
                        <span style={{ color: 'var(--muted)' }}>
                          Correct: <strong style={{ color: 'var(--green-text)' }}>{a.correct_answer}</strong>
                        </span>
                        <span className="font-mono text-xs" style={{
                          color: a.time_taken_ms > goalMs ? 'var(--red-text)' : 'var(--muted)'
                        }}>
                          {formatMs(a.time_taken_ms)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {WRONG_REASONS.map(r => (
                        <button
                          key={r.id}
                          onClick={() => saveReason(a.id, r.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: wrongReasons[a.id] === r.id ? 'var(--purple)' : 'var(--bg)',
                            color: wrongReasons[a.id] === r.id ? 'white' : 'var(--muted)',
                            border: `1.5px solid ${wrongReasons[a.id] === r.id ? 'var(--purple)' : 'var(--border)'}`,
                            opacity: saving[a.id] ? 0.6 : 1,
                          }}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full table */}
      <div className="space-y-3">
        <h2 className="font-semibold" style={{ color: 'var(--text)' }}>All questions</h2>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Q', paper?.parts ? 'Subject' : null, 'Your answer', 'Correct', 'Time', ''].filter(Boolean).map(h => (
                  <th key={h!} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                    {h}
                  </th>
                ))}
                <th className="text-right px-4 py-3 text-xs" style={{ borderBottom: '1px solid var(--border)' }}></th>
              </tr>
            </thead>
            <tbody>
              {answers.map((a, i) => {
                const isWrong = a.is_correct === false
                const hideCorrect = isWrong && !hasRedone
                return (
                  <tr key={a.id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg)' }}>
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold" style={{ color: 'var(--text)' }}>{a.question_number}</td>
                    {paper?.parts && (
                      <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--muted)' }}>{a.subject_part ?? ''}</td>
                    )}
                    <td className="px-4 py-2.5 font-semibold" style={{ color: a.user_answer ? (a.is_correct ? 'var(--green-text)' : 'var(--red-text)') : 'var(--muted)' }}>
                      {a.user_answer ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 font-semibold" style={{ color: hideCorrect ? 'var(--border)' : 'var(--green-text)' }}>
                      {hideCorrect ? '?' : a.correct_answer}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: a.time_taken_ms > goalMs ? 'var(--red-text)' : 'var(--muted)' }}>
                      {formatMs(a.time_taken_ms)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold">
                      {!a.user_answer ? (
                        <span style={{ color: 'var(--muted)' }}>—</span>
                      ) : a.is_correct ? (
                        <span style={{ color: 'var(--green-text)' }}>✓</span>
                      ) : (
                        <span style={{ color: hideCorrect ? 'var(--border)' : 'var(--red-text)' }}>✗</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!hasRedone && wrongAnswers.length > 0 && (
          <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
            Correct answers for wrong questions are hidden until you complete the redo.
          </p>
        )}
      </div>

      <div className="flex gap-3 pb-10">
        <a href="/papers" className="flex-1 text-center py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'var(--purple)', color: 'white', boxShadow: 'var(--shadow-sm)' }}>
          Do another paper
        </a>
        <a href="/dashboard" className="flex-1 text-center py-3 rounded-xl text-sm font-medium border"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          Dashboard
        </a>
      </div>
    </div>
  )
}

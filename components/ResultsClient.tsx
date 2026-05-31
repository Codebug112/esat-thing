'use client'

import { useState } from 'react'
import { Paper, WRONG_REASONS, getPaperAnswerOptions } from '@/lib/papers-data'
import { createClient } from '@/lib/supabase/client'

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

  // Redo mode: for wrong answers, show a redo interface before revealing the answer
  const [redoMode, setRedoMode] = useState<'hidden' | 'redo' | 'show'>('hidden')
  const [redoIndex, setRedoIndex] = useState(0)
  const [redoAnswer, setRedoAnswer] = useState<string | null>(null)
  const [redoRevealed, setRedoRevealed] = useState(false)

  const wrongAnswers = answers.filter(a => a.is_correct === false)
  const skippedAnswers = answers.filter(a => a.user_answer === null || a.user_answer === '')
  const correct = answers.filter(a => a.is_correct === true).length
  const answered = answers.filter(a => a.user_answer !== null && a.user_answer !== '').length
  const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0
  const totalTimeMs = answers.reduce((sum, a) => sum + a.time_taken_ms, 0)
  const avgTimeMs = answers.length > 0 ? totalTimeMs / answers.length : 0
  const goalMs = session.goal_time_sec * 1000

  const answerOptions = paper ? getPaperAnswerOptions(paper) : ['A','B','C','D','E']

  async function saveReason(answerId: string, reason: string) {
    setSaving(prev => ({ ...prev, [answerId]: true }))
    setWrongReasons(prev => ({ ...prev, [answerId]: reason }))
    const supabase = createClient()
    await supabase.from('session_answers').update({ wrong_reason: reason }).eq('id', answerId)
    setSaving(prev => ({ ...prev, [answerId]: false }))
  }

  // Group wrong answers by subject part
  const wrongByPart: Record<string, Answer[]> = {}
  for (const a of wrongAnswers) {
    const part = a.subject_part ?? 'General'
    if (!wrongByPart[part]) wrongByPart[part] = []
    wrongByPart[part].push(a)
  }

  const partColors: Record<string, string> = {
    Mathematics: '#ede9fe',
    Physics: '#dbeafe',
    Chemistry: '#dcfce7',
    Biology: '#fed7aa',
    Advanced: '#fecdd3',
    General: '#f3f4f6',
  }

  // Redo workflow
  const currentRedoAnswer = wrongAnswers[redoIndex]

  if (redoMode !== 'hidden' && currentRedoAnswer) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--muted)' }}>
              Redo mode — {redoIndex + 1} / {wrongAnswers.length}
            </p>
            <h2 className="text-lg font-semibold mt-0.5" style={{ color: 'var(--text)' }}>
              Q{currentRedoAnswer.question_number}
              {currentRedoAnswer.subject_part && (
                <span className="ml-2 text-sm font-normal px-2 py-0.5 rounded-md"
                  style={{ background: partColors[currentRedoAnswer.subject_part] ?? partColors.General, color: 'var(--text)' }}>
                  {currentRedoAnswer.subject_part}
                </span>
              )}
            </h2>
          </div>
          <button onClick={() => setRedoMode('hidden')} className="text-sm" style={{ color: 'var(--muted)' }}>
            Exit redo
          </button>
        </div>

        <div className="rounded-2xl p-6 space-y-2" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Original answer: <span className="font-semibold" style={{ color: '#dc2626' }}>{currentRedoAnswer.user_answer ?? '—'}</span>
            {' '} · original time: <span className="font-mono">{formatMs(currentRedoAnswer.time_taken_ms)}</span>
          </p>
          <p className="text-sm font-medium mt-2" style={{ color: 'var(--text)' }}>What's your answer this time?</p>

          {!redoRevealed ? (
            <>
              <div className="flex gap-2 flex-wrap pt-2">
                {answerOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setRedoAnswer(opt)}
                    className="w-11 h-11 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: redoAnswer === opt ? 'var(--lavender-dark)' : 'var(--bg)',
                      color: redoAnswer === opt ? 'white' : 'var(--text)',
                      border: `1.5px solid ${redoAnswer === opt ? 'var(--lavender-dark)' : 'var(--border)'}`,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setRedoRevealed(true)}
                disabled={!redoAnswer}
                className="mt-4 w-full py-3 rounded-xl text-sm font-medium disabled:opacity-40"
                style={{ background: 'var(--lavender)', color: '#4c1d95' }}
              >
                Reveal answer
              </button>
            </>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex-1 p-4 rounded-xl text-center"
                  style={{ background: redoAnswer === currentRedoAnswer.correct_answer ? 'var(--green)' : 'var(--rose)' }}>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Your redo</p>
                  <p className="text-2xl font-light">{redoAnswer}</p>
                  <p className="text-xs mt-1" style={{ color: redoAnswer === currentRedoAnswer.correct_answer ? '#16a34a' : '#dc2626' }}>
                    {redoAnswer === currentRedoAnswer.correct_answer ? '✓ Correct!' : '✗ Still wrong'}
                  </p>
                </div>
                <div className="flex-1 p-4 rounded-xl text-center" style={{ background: 'var(--bg)', border: '1.5px solid var(--border)' }}>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Correct answer</p>
                  <p className="text-2xl font-light" style={{ color: '#16a34a' }}>{currentRedoAnswer.correct_answer}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRedoAnswer(null)
                    setRedoRevealed(false)
                    if (redoIndex + 1 < wrongAnswers.length) setRedoIndex(i => i + 1)
                    else setRedoMode('hidden')
                  }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--lavender)', color: '#4c1d95' }}
                >
                  {redoIndex + 1 < wrongAnswers.length ? 'Next wrong answer →' : 'Done'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center">
          {wrongAnswers.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: i <= redoIndex ? 'var(--lavender-dark)' : 'var(--border)' }} />
          ))}
        </div>
      </div>
    )
  }

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
          style={{ background: pct >= 70 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--rose)' }}
        >
          <p className="text-3xl font-light">{correct}/{answered}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{pct}% correct</p>
        </div>
        <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
          <p className="text-3xl font-light">{formatMs(totalTimeMs)}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>total time</p>
        </div>
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: avgTimeMs > goalMs ? 'var(--rose)' : 'var(--surface)', border: '1.5px solid var(--border)' }}
        >
          <p className="text-3xl font-light">{formatMs(avgTimeMs)}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>avg / question</p>
        </div>
      </div>

      {/* Action buttons */}
      {wrongAnswers.length > 0 && (
        <button
          onClick={() => { setRedoIndex(0); setRedoAnswer(null); setRedoRevealed(false); setRedoMode('redo') }}
          className="w-full py-3.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: 'var(--lavender)', color: '#4c1d95' }}
        >
          Redo {wrongAnswers.length} wrong question{wrongAnswers.length !== 1 ? 's' : ''} (without seeing answer first)
        </button>
      )}

      {/* Skipped questions */}
      {skippedAnswers.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Skipped / unanswered ({skippedAnswers.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {skippedAnswers.map(a => (
              <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                style={{ background: 'var(--bg)', border: '1.5px solid var(--border)' }}>
                <span className="font-medium">Q{a.question_number}</span>
                {a.subject_part && <span className="text-xs" style={{ color: 'var(--muted)' }}>{a.subject_part}</span>}
                <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{formatMs(a.time_taken_ms)}</span>
                <span>→ <span className="font-semibold" style={{ color: '#16a34a' }}>{a.correct_answer}</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wrong answers — categorise reasons */}
      {wrongAnswers.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
            Wrong answers ({wrongAnswers.length}) — choose why
          </h2>
          {Object.entries(wrongByPart).map(([part, partAnswers]) => (
            <div key={part}>
              {Object.keys(wrongByPart).length > 1 && (
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>{part}</p>
              )}
              <div className="space-y-3">
                {partAnswers.map(a => (
                  <div key={a.id} className="rounded-2xl p-4 space-y-3"
                    style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">Q{a.question_number}</span>
                        {a.flagged && (
                          <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                            style={{ background: 'var(--yellow)', color: '#854d0e' }}>
                            ⚑ flagged
                          </span>
                        )}
                        {a.subject_part && (
                          <span className="text-xs px-2 py-0.5 rounded-md"
                            style={{ background: partColors[a.subject_part] ?? partColors.General, color: 'var(--text)' }}>
                            {a.subject_part}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span style={{ color: 'var(--muted)' }}>
                          You: <strong style={{ color: '#dc2626' }}>{a.user_answer ?? '—'}</strong>
                        </span>
                        <span style={{ color: 'var(--muted)' }}>
                          Correct: <strong style={{ color: '#16a34a' }}>{a.correct_answer}</strong>
                        </span>
                        <span className="font-mono text-xs" style={{
                          color: a.time_taken_ms > goalMs ? '#dc2626' : 'var(--muted)'
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
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: wrongReasons[a.id] === r.id ? 'var(--lavender-dark)' : 'var(--bg)',
                            color: wrongReasons[a.id] === r.id ? 'white' : 'var(--muted)',
                            border: `1.5px solid ${wrongReasons[a.id] === r.id ? 'var(--lavender-dark)' : 'var(--border)'}`,
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
        <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Q', paper?.parts ? 'Subject' : null, 'Your answer', 'Correct', 'Time', ''].filter(Boolean).map(h => (
                  <th key={h!} className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)', borderBottom: '1.5px solid var(--border)' }}>
                    {h}
                  </th>
                ))}
                <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)', borderBottom: '1.5px solid var(--border)' }}></th>
              </tr>
            </thead>
            <tbody>
              {answers.map((a, i) => (
                <tr key={a.id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg)' }}>
                  <td className="px-4 py-2.5 font-mono text-xs font-medium">{a.question_number}</td>
                  {paper?.parts && (
                    <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--muted)' }}>{a.subject_part ?? ''}</td>
                  )}
                  <td className="px-4 py-2.5 font-semibold" style={{ color: a.user_answer ? (a.is_correct ? '#16a34a' : '#dc2626') : 'var(--muted)' }}>
                    {a.user_answer ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: '#16a34a' }}>{a.correct_answer}</td>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: a.time_taken_ms > goalMs ? '#dc2626' : 'var(--muted)' }}>
                    {formatMs(a.time_taken_ms)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm">
                    {!a.user_answer ? (
                      <span style={{ color: 'var(--muted)' }}>–</span>
                    ) : a.is_correct ? (
                      <span style={{ color: '#16a34a' }}>✓</span>
                    ) : (
                      <span style={{ color: '#dc2626' }}>✗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-3 pb-10">
        <a href="/papers" className="flex-1 text-center py-3 rounded-xl text-sm font-medium"
          style={{ background: 'var(--lavender)', color: '#4c1d95' }}>
          Do another paper
        </a>
        <a href="/dashboard" className="flex-1 text-center py-3 rounded-xl text-sm border"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          Dashboard
        </a>
      </div>
    </div>
  )
}

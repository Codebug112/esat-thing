'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IconFlag, IconCheck, IconX, IconRepeat } from './Icons'
import type { FlaggedPaper } from '@/app/flagged/page'

interface Props {
  papers: FlaggedPaper[]
  userId: string
}

const partColors: Record<string, string> = {
  Mathematics: 'var(--purple-light)',
  Physics: 'var(--blue-bg)',
  Chemistry: 'var(--green-bg)',
  Biology: 'var(--orange-bg)',
  Advanced: 'var(--red-bg)',
}
const partTextColors: Record<string, string> = {
  Mathematics: 'var(--purple-dark)',
  Physics: 'var(--blue-text)',
  Chemistry: 'var(--green-text)',
  Biology: 'var(--orange-text)',
  Advanced: 'var(--red-text)',
}

export default function FlaggedClient({ papers: initialPapers, userId }: Props) {
  const [papers, setPapers] = useState(initialPapers)

  // Practice state
  const [practiceQueue, setPracticeQueue] = useState<{ paperId: string; paperName: string; number: number; correctAnswer: string; subject: string | null; answerOptions: string[] }[]>([])
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [chosenAnswer, setChosenAnswer] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  async function unflag(paperId: string, qNum: number) {
    const supabase = createClient()
    await supabase.from('flagged_questions')
      .delete()
      .eq('user_id', userId)
      .eq('paper_id', paperId)
      .eq('question_number', qNum)

    setPapers(prev => prev
      .map(p => p.paperId !== paperId ? p : { ...p, questions: p.questions.filter(q => q.number !== qNum) })
      .filter(p => p.questions.length > 0)
    )
  }

  function startPractice(paperFilter?: string) {
    const queue = papers
      .filter(p => !paperFilter || p.paperId === paperFilter)
      .flatMap(p => p.questions.map(q => ({
        paperId: p.paperId,
        paperName: p.paperName,
        answerOptions: p.answerOptions,
        number: q.number,
        correctAnswer: q.correctAnswer,
        subject: q.subject,
      })))
    setPracticeQueue(queue)
    setPracticeIndex(0)
    setChosenAnswer(null)
    setRevealed(false)
  }

  function nextPractice() {
    setChosenAnswer(null)
    setRevealed(false)
    if (practiceIndex + 1 < practiceQueue.length) {
      setPracticeIndex(i => i + 1)
    } else {
      setPracticeQueue([])
    }
  }

  const totalFlagged = papers.reduce((s, p) => s + p.questions.length, 0)

  // ── Practice mode ────────────────────────────────────────────────────────────
  if (practiceQueue.length > 0) {
    const current = practiceQueue[practiceIndex]
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--muted)' }}>
              Practice flagged · {practiceIndex + 1} / {practiceQueue.length}
            </p>
            <h2 className="text-lg font-semibold mt-0.5" style={{ color: 'var(--text)' }}>
              Q{current.number}
              {current.subject && (
                <span className="ml-2 text-sm font-normal px-2 py-0.5 rounded-md"
                  style={{ background: partColors[current.subject] ?? 'var(--bg)', color: partTextColors[current.subject] ?? 'var(--muted)' }}>
                  {current.subject}
                </span>
              )}
              <span className="ml-2 text-sm font-normal" style={{ color: 'var(--muted)' }}>· {current.paperName}</span>
            </h2>
          </div>
          <button
            onClick={() => setPracticeQueue([])}
            className="text-sm font-medium"
            style={{ color: 'var(--muted)' }}
          >
            Exit
          </button>
        </div>

        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Look at Q{current.number} in your copy of <strong>{current.paperName}</strong>, then pick your answer.
          </p>

          {!revealed ? (
            <>
              <div className="flex gap-2 flex-wrap">
                {current.answerOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setChosenAnswer(opt)}
                    className="w-11 h-11 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: chosenAnswer === opt ? 'var(--purple)' : 'var(--bg)',
                      color: chosenAnswer === opt ? 'white' : 'var(--text)',
                      border: `1.5px solid ${chosenAnswer === opt ? 'var(--purple)' : 'var(--border)'}`,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setRevealed(true)}
                disabled={!chosenAnswer}
                className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ background: 'var(--purple)', color: 'white' }}
              >
                Reveal answer
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 p-4 rounded-xl text-center"
                  style={{ background: chosenAnswer === current.correctAnswer ? 'var(--green-bg)' : 'var(--red-bg)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Your answer</p>
                  <p className="text-3xl font-light mt-1">{chosenAnswer}</p>
                  <p className="text-xs mt-1 font-semibold" style={{ color: chosenAnswer === current.correctAnswer ? 'var(--green-text)' : 'var(--red-text)' }}>
                    {chosenAnswer === current.correctAnswer ? 'Correct' : 'Wrong'}
                  </p>
                </div>
                <div className="flex-1 p-4 rounded-xl text-center" style={{ background: 'var(--bg)', border: '1.5px solid var(--border)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Correct answer</p>
                  <p className="text-3xl font-light mt-1" style={{ color: 'var(--green-text)' }}>{current.correctAnswer}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    await unflag(current.paperId, current.number)
                    nextPractice()
                  }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border flex items-center justify-center gap-1.5"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                >
                  <IconX size={13} /> Unflag
                </button>
                <button
                  onClick={nextPractice}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5"
                  style={{ background: 'var(--purple)', color: 'white' }}
                >
                  {practiceIndex + 1 < practiceQueue.length ? 'Next' : 'Done'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center flex-wrap">
          {practiceQueue.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: i <= practiceIndex ? 'var(--purple)' : 'var(--border)' }} />
          ))}
        </div>
      </div>
    )
  }

  // ── Main view ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Flagged questions</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            {totalFlagged === 0 ? 'No flagged questions yet' : `${totalFlagged} question${totalFlagged !== 1 ? 's' : ''} across ${papers.length} paper${papers.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {totalFlagged > 0 && (
          <button
            onClick={() => startPractice()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--purple)', color: 'white' }}
          >
            <IconRepeat size={14} />
            Practice all
          </button>
        )}
      </div>

      {totalFlagged === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <IconFlag size={32} style={{ color: 'var(--border)', margin: '0 auto 12px' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Flag questions during a session to add them here.</p>
        </div>
      ) : (
        papers.map(paper => (
          <div key={paper.paperId} className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{paper.paperName}</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{paper.questions.length} flagged</p>
              </div>
              <button
                onClick={() => startPractice(paper.paperId)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}
              >
                <IconRepeat size={12} />
                Practice
              </button>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {paper.questions.map(q => (
                <div
                  key={q.number}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                  style={{ background: 'var(--yellow-bg)', border: '1.5px solid #fde047' }}
                >
                  <IconFlag size={11} style={{ color: 'var(--yellow-text)', flexShrink: 0 }} />
                  <span className="font-semibold" style={{ color: 'var(--yellow-text)' }}>Q{q.number}</span>
                  {q.subject && (
                    <span className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: partColors[q.subject] ?? 'var(--bg)', color: partTextColors[q.subject] ?? 'var(--muted)' }}>
                      {q.subject}
                    </span>
                  )}
                  <button
                    onClick={() => unflag(paper.paperId, q.number)}
                    className="ml-1 rounded p-0.5 hover:opacity-70"
                    style={{ color: 'var(--yellow-text)' }}
                    title="Unflag"
                  >
                    <IconX size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

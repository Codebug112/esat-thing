'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Paper } from '@/lib/papers-data'
import { createClient } from '@/lib/supabase/client'

const CHECKLIST = [
  { id: 'hydrated', label: 'I am hydrated' },
  { id: 'drill', label: 'I have done some practice on drillYourSkill.com' },
  { id: 'whiteboard', label: 'I have a whiteboard and pen ready' },
  { id: 'nocalc', label: 'I am not using a calculator (ESAT doesn\'t allow one)' },
  { id: 'quiet', label: 'I am in a quiet, focused environment' },
]

interface Props {
  paper: Paper
  doneDate: string | null
}

export default function PaperStartForm({ paper, doneDate }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [goalMin, setGoalMin] = useState(2)
  const [loading, setLoading] = useState(false)

  const allChecked = CHECKLIST.every(c => checked[c.id])

  function toggle(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function startSession() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        paper_id: paper.id,
        paper_name: paper.name,
        goal_time_sec: goalMin * 60,
        status: 'in_progress',
      })
      .select('id')
      .single()

    if (error || !session) {
      setLoading(false)
      return
    }

    router.push(`/session/${session.id}`)
  }

  return (
    <>
      <div
        className="flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-colors"
        style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}
        onClick={() => setOpen(true)}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{paper.name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{paper.description}</p>
        </div>
        <div className="flex items-center gap-3">
          {doneDate && (
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              done {new Date(doneDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          )}
          <span className="text-sm font-medium px-3 py-1 rounded-lg" style={{ background: 'var(--lavender)', color: '#4c1d95' }}>
            Start
          </span>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: 'var(--surface)' }}>
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>{paper.name}</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{paper.questionCount} questions</p>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                Before you start
              </p>
              {CHECKLIST.map(c => (
                <label key={c.id} className="flex items-start gap-3 cursor-pointer">
                  <div
                    className="mt-0.5 w-4.5 h-4.5 rounded-md flex-shrink-0 flex items-center justify-center border transition-all"
                    style={{
                      background: checked[c.id] ? 'var(--lavender-dark)' : 'transparent',
                      borderColor: checked[c.id] ? 'var(--lavender-dark)' : 'var(--border)',
                    }}
                    onClick={() => toggle(c.id)}
                  >
                    {checked[c.id] && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text)' }}>{c.label}</span>
                </label>
              ))}
            </div>

            {/* Goal time */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wider block mb-2" style={{ color: 'var(--muted)' }}>
                Goal time per question
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.5}
                  value={goalMin}
                  onChange={e => setGoalMin(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-16 text-right" style={{ color: 'var(--text)' }}>
                  {goalMin} min{goalMin !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                ESAT: ~2 min/question. TMUA Paper 1: ~2.25 min/question.
              </p>
            </div>

            {/* Tip */}
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--yellow)', color: '#713f12' }}>
              <strong>Tip from offer holders:</strong> if you don't see the path to an answer within 5–10 seconds, flag it and move on. Bag the easy marks first.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm border"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={startSession}
                disabled={!allChecked || loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-40"
                style={{ background: 'var(--lavender)', color: '#4c1d95' }}
              >
                {loading ? 'Starting…' : allChecked ? 'Let\'s go' : 'Tick all boxes first'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

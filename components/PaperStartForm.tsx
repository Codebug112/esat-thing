'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Paper } from '@/lib/papers-data'
import { createClient } from '@/lib/supabase/client'
import { IconCheck, IconChevronRight, IconClock, IconX } from './Icons'

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
  isLast: boolean
  typeDot: string
}

export default function PaperStartForm({ paper, doneDate, isLast, typeDot }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [goalSec, setGoalSec] = useState(75)
  const [loading, setLoading] = useState(false)

  const availableParts: string[] = paper.parts
    ? [...new Set(Object.values(paper.parts))].sort()
    : []

  const [selectedParts, setSelectedParts] = useState<string[]>(availableParts)

  const allChecked = CHECKLIST.every(c => checked[c.id])
  const checkedCount = CHECKLIST.filter(c => checked[c.id]).length

  function toggle(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function togglePart(part: string) {
    setSelectedParts(prev =>
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    )
  }

  async function startSession() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        alert('You need to be logged in. Please refresh and try again.')
        setLoading(false)
        return
      }

      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          paper_id: paper.id,
          paper_name: paper.name,
          goal_time_sec: goalSec,
          status: 'in_progress',
        })
        .select('id')
        .single()

      if (error || !session) {
        alert(`Failed to start session: ${error?.message ?? 'unknown error'}`)
        setLoading(false)
        return
      }

      let url = `/session/${session.id}`
      if (paper.parts && availableParts.length > 0) {
        url += `?parts=${selectedParts.map(encodeURIComponent).join(',')}`
      }
      router.push(url)
    } catch (e) {
      alert(`Unexpected error: ${e instanceof Error ? e.message : String(e)}`)
      setLoading(false)
    }
  }

  return (
    <>
      <button
        className="w-full flex items-center justify-between px-5 py-4 transition-colors text-left hover:bg-gray-50"
        style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: doneDate ? '#16a34a' : typeDot }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{paper.name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              {paper.questionCount} questions
              {doneDate && <span className="ml-2" style={{ color: '#16a34a' }}>· done {new Date(doneDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}
          >
            {doneDate ? 'Redo' : 'Start'}
          </span>
          <IconChevronRight size={14} style={{ color: 'var(--muted)' }} />
        </div>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-md)' }}>

            {/* Modal header */}
            <div className="flex items-start justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h2 className="font-semibold text-base" style={{ color: 'var(--text)' }}>{paper.name}</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{paper.questionCount} questions · {paper.description}</p>
                {paper.pdfUrl && (
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium"
                    style={{ color: 'var(--purple)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Open paper PDF
                  </a>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="ml-4 p-1 rounded-lg hover:bg-gray-100 flex-shrink-0" style={{ color: 'var(--muted)' }}>
                <IconX size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Section selector */}
              {availableParts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                      Sections to practice
                    </p>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {selectedParts.length === availableParts.length
                        ? 'All selected'
                        : `${selectedParts.length} of ${availableParts.length}`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableParts.map(part => {
                      const selected = selectedParts.includes(part)
                      return (
                        <button
                          key={part}
                          onClick={() => togglePart(part)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                          style={{
                            background: selected ? 'var(--green-bg)' : 'var(--bg)',
                            border: `1.5px solid ${selected ? '#86efac' : 'var(--border)'}`,
                            color: selected ? 'var(--green-text)' : 'var(--muted)',
                          }}
                        >
                          {selected && <IconCheck size={12} />}
                          {part}
                        </button>
                      )
                    })}
                  </div>
                  {selectedParts.length === 0 && (
                    <p className="text-xs mt-2" style={{ color: '#dc2626' }}>Select at least one section to start.</p>
                  )}
                </div>
              )}

              {/* Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    Before you start
                  </p>
                  <span className="text-xs font-semibold" style={{ color: checkedCount === CHECKLIST.length ? '#16a34a' : 'var(--muted)' }}>
                    {checkedCount}/{CHECKLIST.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {CHECKLIST.map(c => (
                    <button
                      key={c.id}
                      onClick={() => toggle(c.id)}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all"
                      style={{
                        background: checked[c.id] ? 'var(--green-bg)' : 'var(--bg)',
                        border: `1.5px solid ${checked[c.id] ? '#86efac' : 'var(--border)'}`,
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all"
                        style={{
                          background: checked[c.id] ? '#16a34a' : 'var(--surface)',
                          border: `1.5px solid ${checked[c.id] ? '#16a34a' : 'var(--border-strong)'}`,
                        }}
                      >
                        {checked[c.id] && <IconCheck size={11} style={{ color: 'white' }} />}
                      </div>
                      <span className="text-sm" style={{ color: checked[c.id] ? 'var(--green-text)' : 'var(--text)' }}>
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal time */}
              <div className="rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <IconClock size={14} style={{ color: 'var(--muted)' }} />
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                      Goal time per question
                    </p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--purple)' }}>{goalSec}s</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={goalSec}
                  onChange={e => setGoalSec(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: 'var(--purple)' }}
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  <span>50s</span>
                  <span>100s</span>
                </div>
              </div>

              {/* Tip */}
              <div className="flex gap-2.5 px-4 py-3 rounded-xl" style={{ background: 'var(--purple-light)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" style={{ color: 'var(--purple)' }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs" style={{ color: 'var(--purple-dark)' }}>
                  <strong>Tip:</strong> if you don't see the path to an answer within 5–10 seconds, flag it and move on. Bag the easy marks first.
                </p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={startSession}
                disabled={!allChecked || loading || (availableParts.length > 0 && selectedParts.length === 0)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
                style={{ background: 'var(--purple)', color: 'white' }}
              >
                {loading ? 'Starting…' : !allChecked ? `${checkedCount}/${CHECKLIST.length} checked` : selectedParts.length === 0 ? 'Select a section' : "Let's go"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

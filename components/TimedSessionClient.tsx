'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Paper } from '@/lib/papers-data'
import { createClient } from '@/lib/supabase/client'
import { IconPlay, IconPause, IconCheck, IconBook } from './Icons'

interface Props {
  session: { id: string; paper_id: string }
  paper: Paper
}

function formatTime(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export default function TimedSessionClient({ session, paper }: Props) {
  const router = useRouter()
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState('')
  const [saving, setSaving] = useState(false)
  const startRef = useRef<number | null>(null)
  const baseRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const tick = useCallback(() => {
    if (startRef.current !== null) {
      setElapsed(baseRef.current + (Date.now() - startRef.current))
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [])

  function toggleTimer() {
    if (!started) setStarted(true)
    if (running) {
      // Pause
      if (startRef.current !== null) {
        baseRef.current += Date.now() - startRef.current
        startRef.current = null
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setRunning(false)
    } else {
      // Start/resume
      startRef.current = Date.now()
      rafRef.current = requestAnimationFrame(tick)
      setRunning(true)
    }
  }

  function finish() {
    if (running) {
      if (startRef.current !== null) {
        baseRef.current += Date.now() - startRef.current
        startRef.current = null
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setRunning(false)
    }
    setFinished(true)
  }

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  // Spacebar toggle
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' && !finished) {
        e.preventDefault()
        toggleTimer()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  async function saveAndFinish() {
    setSaving(true)
    const supabase = createClient()
    const manualScore = score.trim() ? parseInt(score, 10) : null
    await supabase.from('sessions').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      manual_score: manualScore,
      total_time_ms: Math.round(baseRef.current),
    }).eq('id', session.id)
    router.push('/papers')
  }

  if (finished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
          <div className="px-8 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Finished</p>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{paper.name}</h1>
            <p className="text-2xl font-mono font-bold mt-2" style={{ color: 'var(--purple)' }}>{formatTime(baseRef.current)}</p>
          </div>

          <div className="px-8 py-6 space-y-5">
            {/* Mark scheme link */}
            {paper.markSchemeUrl && (
              <div className="rounded-xl p-4" style={{ background: 'var(--purple-light)', border: '1px solid var(--purple-mid)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--purple-dark)' }}>Mark Scheme</p>
                <a
                  href={paper.markSchemeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: 'var(--purple)' }}
                >
                  <IconBook size={14} />
                  Open mark scheme
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
                <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>Mark your paper before entering your score below.</p>
              </div>
            )}

            {/* Score input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
                Your score {paper.totalMarks ? `(out of ${paper.totalMarks})` : ''}
              </label>
              <input
                type="number"
                min={0}
                max={paper.totalMarks ?? 200}
                placeholder="e.g. 72"
                value={score}
                onChange={e => setScore(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm border"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              />
            </div>
          </div>

          <div className="flex gap-3 px-8 py-5 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => router.push('/papers')}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              Skip
            </button>
            <button
              onClick={saveAndFinish}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'var(--purple)', color: 'white' }}
            >
              <IconCheck size={14} />
              {saving ? 'Saving…' : 'Save & finish'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center cursor-pointer select-none"
      style={{ background: running ? 'var(--green-bg)' : started ? 'var(--yellow-bg)' : 'var(--bg)' }}
      onClick={!finished ? toggleTimer : undefined}
    >
      <div className="text-center px-8">
        <p className="text-sm font-semibold mb-2" style={{ color: 'var(--muted)' }}>{paper.name}</p>
        <p
          className="font-mono font-bold leading-none"
          style={{ fontSize: '5rem', color: running ? 'var(--green-text)' : started ? 'var(--yellow-text)' : 'var(--text)', letterSpacing: '-0.04em' }}
        >
          {formatTime(elapsed)}
        </p>

        <div className="flex items-center justify-center gap-2 mt-6">
          <div
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(0,0,0,0.08)', color: 'var(--text)' }}
          >
            {running ? <IconPause size={16} /> : <IconPlay size={16} />}
            {!started ? 'Tap or press Space to start' : running ? 'Tap to pause' : 'Tap to resume'}
          </div>
        </div>

        {paper.pdfUrl && (
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium px-4 py-2 rounded-full"
            style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--muted)' }}
          >
            <IconBook size={12} />
            Open paper PDF
          </a>
        )}

        {started && (
          <div className="mt-8">
            <button
              onClick={e => { e.stopPropagation(); finish() }}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--purple)', color: 'white', boxShadow: 'var(--shadow)' }}
            >
              Finish paper
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

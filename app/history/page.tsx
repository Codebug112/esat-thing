import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { WRONG_REASONS } from '@/lib/papers-data'
import Nav from '@/components/Nav'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, paper_name, completed_at, goal_time_sec')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  const sessionIds = sessions?.map(s => s.id) ?? []

  const { data: allAnswers } = await supabase
    .from('session_answers')
    .select('session_id, question_number, is_correct, time_taken_ms, wrong_reason, subject_part, user_answer')
    .in('session_id', sessionIds.length > 0 ? sessionIds : ['none'])

  const sessionStats: Record<string, { correct: number; total: number; answered: number; totalMs: number }> = {}
  const mistakeCounts: Record<string, number> = {}
  const wrongByPart: Record<string, number> = {}

  for (const a of allAnswers ?? []) {
    if (!sessionStats[a.session_id]) sessionStats[a.session_id] = { correct: 0, total: 0, answered: 0, totalMs: 0 }
    sessionStats[a.session_id].total++
    sessionStats[a.session_id].totalMs += a.time_taken_ms
    if (a.user_answer !== null && a.user_answer !== '') {
      sessionStats[a.session_id].answered++
      if (a.is_correct) sessionStats[a.session_id].correct++
    }
    if (a.is_correct === false && a.wrong_reason) {
      mistakeCounts[a.wrong_reason] = (mistakeCounts[a.wrong_reason] || 0) + 1
      if (a.subject_part) {
        wrongByPart[a.subject_part] = (wrongByPart[a.subject_part] || 0) + 1
      }
    }
  }

  function formatMs(ms: number): string {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const reasonLabels = Object.fromEntries(WRONG_REASONS.map(r => [r.id, r.label]))
  const totalMistakes = Object.values(mistakeCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav active="history" />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>History</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>All your completed sessions and mistake patterns.</p>
        </div>

        {/* Mistake analysis */}
        {totalMistakes > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* By reason */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Mistakes by reason</h2>
              <div className="space-y-3.5">
                {Object.entries(mistakeCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([reason, count]) => {
                    const pct = Math.round((count / totalMistakes) * 100)
                    return (
                      <div key={reason}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium" style={{ color: 'var(--text)' }}>{reasonLabels[reason] ?? reason}</span>
                          <span style={{ color: 'var(--muted)' }}>{count} <span className="text-xs">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: 'var(--purple)' }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* By subject */}
            {Object.keys(wrongByPart).length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Mistakes by subject</h2>
                <div className="space-y-3.5">
                  {Object.entries(wrongByPart)
                    .sort((a, b) => b[1] - a[1])
                    .map(([part, count]) => {
                      const pct = Math.round((count / totalMistakes) * 100)
                      return (
                        <div key={part}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium" style={{ color: 'var(--text)' }}>{part}</span>
                            <span style={{ color: 'var(--muted)' }}>{count} <span className="text-xs">({pct}%)</span></span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: 'var(--purple)' }} />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Session table */}
        {sessions && sessions.length > 0 ? (
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>All sessions</h2>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>Paper</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>Date</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>Score</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>Total time</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>Avg/Q</th>
                    <th style={{ borderBottom: '1px solid var(--border)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => {
                    const stats = sessionStats[s.id] ?? { correct: 0, total: 0, answered: 0, totalMs: 0 }
                    const pct = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0
                    const avgMs = stats.total > 0 ? stats.totalMs / stats.total : 0
                    return (
                      <tr
                        key={s.id}
                        style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg)', borderBottom: '1px solid var(--border)' }}
                      >
                        <td className="px-4 py-3 font-semibold text-sm" style={{ color: 'var(--text)' }}>{s.paper_name}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>
                          {new Date(s.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-sm">
                          <span style={{ color: pct >= 70 ? 'var(--green-text)' : pct >= 50 ? 'var(--yellow-text)' : 'var(--red-text)' }}>
                            {stats.correct}/{stats.answered} ({pct}%)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: 'var(--muted)' }}>{formatMs(stats.totalMs)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: avgMs > s.goal_time_sec * 1000 ? 'var(--red-text)' : 'var(--muted)' }}>
                          {formatMs(avgMs)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/results/${s.id}`} className="text-xs font-semibold" style={{ color: 'var(--purple)' }}>
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p style={{ color: 'var(--muted)' }}>No completed sessions yet.</p>
            <Link href="/papers" className="mt-4 inline-block text-sm font-semibold" style={{ color: 'var(--purple)' }}>
              Start a paper
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { WRONG_REASONS } from '@/lib/papers-data'

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

  // Build per-session stats
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
      <nav className="border-b px-6 py-4 flex items-center justify-between" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Link href="/dashboard" className="font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
          Aron's ESAT Thing
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/papers" className="text-sm" style={{ color: 'var(--muted)' }}>Papers</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>History</h1>

        {/* Mistake analysis */}
        {totalMistakes > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* By reason */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
              <h2 className="font-medium mb-4" style={{ color: 'var(--text)' }}>Mistakes by reason</h2>
              <div className="space-y-3">
                {Object.entries(mistakeCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([reason, count]) => {
                    const pct = Math.round((count / totalMistakes) * 100)
                    return (
                      <div key={reason}>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: 'var(--text)' }}>{reasonLabels[reason] ?? reason}</span>
                          <span style={{ color: 'var(--muted)' }}>{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: 'var(--lavender-dark)' }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* By subject */}
            {Object.keys(wrongByPart).length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
                <h2 className="font-medium mb-4" style={{ color: 'var(--text)' }}>Mistakes by subject</h2>
                <div className="space-y-3">
                  {Object.entries(wrongByPart)
                    .sort((a, b) => b[1] - a[1])
                    .map(([part, count]) => {
                      const pct = Math.round((count / totalMistakes) * 100)
                      return (
                        <div key={part}>
                          <div className="flex justify-between text-sm mb-1">
                            <span style={{ color: 'var(--text)' }}>{part}</span>
                            <span style={{ color: 'var(--muted)' }}>{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: 'var(--peach)' }} />
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
            <h2 className="font-medium mb-3" style={{ color: 'var(--text)' }}>All sessions</h2>
            <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid var(--border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--bg)', borderBottom: '1.5px solid var(--border)' }}>
                    <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Paper</th>
                    <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Date</th>
                    <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Score</th>
                    <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Total time</th>
                    <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Avg/Q</th>
                    <th></th>
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
                        <td className="px-4 py-3 font-medium text-sm">{s.paper_name}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>
                          {new Date(s.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          <span style={{ color: pct >= 70 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626' }}>
                            {stats.correct}/{stats.answered} ({pct}%)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{formatMs(stats.totalMs)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: avgMs > s.goal_time_sec * 1000 ? '#dc2626' : 'var(--muted)' }}>
                          {formatMs(avgMs)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/results/${s.id}`} className="text-xs font-medium" style={{ color: 'var(--lavender-dark)' }}>
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
            <Link href="/papers" className="mt-4 inline-block text-sm font-medium" style={{ color: 'var(--lavender-dark)' }}>
              Start a paper →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

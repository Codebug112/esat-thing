import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { predictESATScore } from '@/lib/papers-data'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { IconBarChart, IconBook, IconChevronRight, IconTrophy } from '@/components/Icons'
import DeleteDataButton from '@/components/DeleteDataButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, paper_name, completed_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(10)

  const sessionIds = sessions?.map(s => s.id) ?? []
  let sessionStats: { percentCorrect: number }[] = []

  if (sessionIds.length > 0) {
    const { data: answers } = await supabase
      .from('session_answers')
      .select('session_id, is_correct, user_answer')
      .in('session_id', sessionIds)

    if (answers) {
      const bySession: Record<string, { correct: number; answered: number }> = {}
      for (const a of answers) {
        if (!bySession[a.session_id]) bySession[a.session_id] = { correct: 0, answered: 0 }
        if (a.user_answer !== null && a.user_answer !== '') {
          bySession[a.session_id].answered++
          if (a.is_correct) bySession[a.session_id].correct++
        }
      }
      sessionStats = (sessions ?? []).map(s => {
        const stat = bySession[s.id]
        return stat && stat.answered > 0 ? { percentCorrect: (stat.correct / stat.answered) * 100 } : { percentCorrect: 0 }
      })
    }
  }

  const predictedScore = predictESATScore(sessionStats)

  const { data: allWrongAnswers } = await supabase
    .from('session_answers')
    .select('wrong_reason')
    .in('session_id', sessionIds.length > 0 ? sessionIds : ['none'])
    .eq('is_correct', false)
    .not('wrong_reason', 'is', null)

  const mistakeCounts: Record<string, number> = {}
  for (const a of allWrongAnswers ?? []) {
    if (a.wrong_reason) mistakeCounts[a.wrong_reason] = (mistakeCounts[a.wrong_reason] || 0) + 1
  }

  const reasonLabels: Record<string, string> = {
    silly: 'Silly / careless', time: 'Ran out of time',
    concept: "Didn't know concept", misread: 'Misread question',
    arithmetic: 'Arithmetic error', guess: 'Guessed',
  }

  const totalMistakes = Object.values(mistakeCounts).reduce((a, b) => a + b, 0)

  const scoreLabel = predictedScore
    ? predictedScore >= 7 ? 'Strong — competitive for interview'
    : predictedScore >= 5 ? 'Good — above average applicant'
    : predictedScore >= 4 ? 'Average — keep practising'
    : 'Below average — focus on fundamentals'
    : null

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav active="dashboard" />

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">

        {/* Hero score card */}
        <div
          className="rounded-2xl p-8 flex items-center justify-between overflow-hidden relative"
          style={{ background: 'var(--purple)', boxShadow: 'var(--shadow-md)' }}
        >
          {/* Background decoration */}
          <div className="absolute right-0 top-0 opacity-10" style={{ transform: 'translate(30%, -30%)' }}>
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="2"/>
              <circle cx="100" cy="100" r="55" stroke="white" strokeWidth="2"/>
              <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="2"/>
            </svg>
          </div>

          <div>
            <p className="text-sm font-medium mb-1 opacity-70 text-white">Predicted ESAT Score</p>
            {predictedScore ? (
              <>
                <p className="text-6xl font-light text-white tracking-tight">{predictedScore.toFixed(1)}</p>
                <p className="text-sm mt-2 opacity-80 text-white">{scoreLabel}</p>
              </>
            ) : (
              <>
                <p className="text-5xl font-light text-white opacity-30">—</p>
                <p className="text-sm mt-2 text-white opacity-60">Complete a paper to see your score</p>
              </>
            )}
          </div>
          <div className="opacity-30">
            <IconTrophy size={64} style={{ color: 'white' }} />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Papers completed', value: sessions?.length ?? 0, icon: <IconBook size={18} /> },
            { label: 'Mistakes logged', value: totalMistakes, icon: <IconBarChart size={18} /> },
            { label: 'Score range', value: '1–9', icon: <IconTrophy size={18} /> },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ color: 'var(--muted)' }}>{stat.icon}</span>
              </div>
              <p className="text-3xl font-semibold" style={{ color: 'var(--text)' }}>{stat.value}</p>
              <p className="text-xs mt-1 font-medium" style={{ color: 'var(--muted)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mistake breakdown */}
        {Object.keys(mistakeCounts).length > 0 && (
          <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Mistake breakdown</h2>
            <div className="space-y-3.5">
              {Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1]).map(([reason, count]) => {
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
        )}

        {/* CTA */}
        <Link
          href="/papers"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ background: 'var(--purple)', color: 'white', boxShadow: 'var(--shadow-sm)' }}
        >
          <IconBook size={15} />
          Start a paper
        </Link>

        {/* Delete data */}
        {sessions && sessions.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Permanently removes all sessions and answers.</p>
            <DeleteDataButton userId={user.id} />
          </div>
        )}

        {/* Recent sessions */}
        {sessions && sessions.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Recent sessions</h2>
              <Link href="/history" className="text-xs font-medium" style={{ color: 'var(--purple)' }}>View all</Link>
            </div>
            <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
              {sessions.slice(0, 5).map(s => (
                <Link
                  key={s.id}
                  href={`/results/${s.id}`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-gray-50"
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{s.paper_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {new Date(s.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <IconChevronRight size={14} style={{ color: 'var(--muted)' }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

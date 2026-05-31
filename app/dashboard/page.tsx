import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { predictESATScore } from '@/lib/papers-data'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get last 10 completed sessions
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, paper_name, completed_at, started_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(10)

  // Get answer stats per session for score prediction
  const sessionIds = sessions?.map(s => s.id) ?? []
  let sessionStats: { percentCorrect: number }[] = []

  if (sessionIds.length > 0) {
    const { data: answers } = await supabase
      .from('session_answers')
      .select('session_id, is_correct')
      .in('session_id', sessionIds)

    if (answers) {
      const bySession: Record<string, { correct: number; total: number }> = {}
      for (const a of answers) {
        if (!bySession[a.session_id]) bySession[a.session_id] = { correct: 0, total: 0 }
        bySession[a.session_id].total++
        if (a.is_correct) bySession[a.session_id].correct++
      }
      // Sort by session order (most recent = last in array for weighting)
      sessionStats = (sessions ?? [])
        .slice()
        .reverse()
        .map(s => {
          const stat = bySession[s.id]
          return stat ? { percentCorrect: (stat.correct / stat.total) * 100 } : { percentCorrect: 0 }
        })
    }
  }

  const predictedScore = predictESATScore(sessionStats)

  // Get mistake breakdown
  const { data: allWrongAnswers } = await supabase
    .from('session_answers')
    .select('wrong_reason')
    .in('session_id', sessionIds.length > 0 ? sessionIds : ['none'])
    .eq('is_correct', false)
    .not('wrong_reason', 'is', null)

  const mistakeCounts: Record<string, number> = {}
  for (const a of allWrongAnswers ?? []) {
    if (a.wrong_reason) {
      mistakeCounts[a.wrong_reason] = (mistakeCounts[a.wrong_reason] || 0) + 1
    }
  }

  const reasonLabels: Record<string, string> = {
    silly: 'Silly / careless',
    time: 'Ran out of time',
    concept: "Didn't know concept",
    misread: 'Misread question',
    arithmetic: 'Arithmetic error',
    guess: 'Guessed',
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <span className="font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Aron's ESAT Thing</span>
        <div className="flex items-center gap-4">
          <Link href="/papers" className="text-sm" style={{ color: 'var(--muted)' }}>
            Papers
          </Link>
          <Link href="/history" className="text-sm" style={{ color: 'var(--muted)' }}>
            History
          </Link>
          <SignOutButton />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Score card */}
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--lavender)' }}>
          <p className="text-sm font-medium mb-1" style={{ color: '#5b21b6' }}>predicted ESAT score</p>
          {predictedScore ? (
            <>
              <p className="text-7xl font-light tracking-tight" style={{ color: '#3b0764' }}>
                {predictedScore.toFixed(1)}
              </p>
              <p className="text-sm mt-2" style={{ color: '#7c3aed' }}>
                {predictedScore >= 7 ? 'Strong — competitive for interview' :
                 predictedScore >= 5 ? 'Good — above average applicant' :
                 predictedScore >= 4 ? 'Average — keep practising' :
                 'Below average — focus on fundamentals'}
              </p>
            </>
          ) : (
            <p className="text-lg mt-2" style={{ color: '#5b21b6' }}>
              Complete a paper to get your predicted score
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Quick stats */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>papers completed</p>
            <p className="text-4xl font-light mt-1">{sessions?.length ?? 0}</p>
          </div>
          <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>total mistakes logged</p>
            <p className="text-4xl font-light mt-1">
              {Object.values(mistakeCounts).reduce((a, b) => a + b, 0)}
            </p>
          </div>
        </div>

        {/* Mistake breakdown */}
        {Object.keys(mistakeCounts).length > 0 && (
          <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
            <h2 className="font-medium mb-4" style={{ color: 'var(--text)' }}>Mistake breakdown</h2>
            <div className="space-y-3">
              {Object.entries(mistakeCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([reason, count]) => {
                  const total = Object.values(mistakeCounts).reduce((a, b) => a + b, 0)
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={reason}>
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: 'var(--text)' }}>{reasonLabels[reason] ?? reason}</span>
                        <span style={{ color: 'var(--muted)' }}>{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, background: 'var(--lavender-dark)' }}
                        />
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
          className="block w-full text-center py-3.5 rounded-xl font-medium text-sm transition-opacity hover:opacity-80"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          Start a paper
        </Link>

        {/* Recent sessions */}
        {sessions && sessions.length > 0 && (
          <div>
            <h2 className="font-medium mb-3" style={{ color: 'var(--text)' }}>Recent sessions</h2>
            <div className="space-y-2">
              {sessions.slice(0, 5).map(s => (
                <Link
                  key={s.id}
                  href={`/results/${s.id}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:opacity-80"
                  style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}
                >
                  <span className="text-sm font-medium">{s.paper_name}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    {new Date(s.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PAPERS, PaperType } from '@/lib/papers-data'
import Link from 'next/link'
import PaperStartForm from '@/components/PaperStartForm'

export default async function PapersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get completed paper ids to show which are done
  const { data: completedSessions } = await supabase
    .from('sessions')
    .select('paper_id, completed_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  const completedMap: Record<string, string> = {}
  for (const s of completedSessions ?? []) {
    if (!completedMap[s.paper_id]) {
      completedMap[s.paper_id] = s.completed_at
    }
  }

  const types: PaperType[] = ['NSAA', 'ENGAA', 'TMUA']
  const typeColors: Record<PaperType, string> = {
    NSAA: 'var(--green)',
    ENGAA: 'var(--blue)',
    TMUA: 'var(--peach)',
  }
  const typeTextColors: Record<PaperType, string> = {
    NSAA: '#14532d',
    ENGAA: '#1e3a5f',
    TMUA: '#7c2d12',
  }
  const typeDescriptions: Record<PaperType, string> = {
    NSAA: 'Natural Sciences Admissions Assessment — Maths, Physics, Chemistry, Biology',
    ENGAA: 'Engineering Admissions Assessment — Maths & Physics',
    TMUA: 'Test of Mathematics for University Admission — Paper 1 only (mirrors ESAT Maths 2)',
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <nav className="border-b px-6 py-4 flex items-center justify-between" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Link href="/dashboard" className="font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
          Aron's ESAT Thing
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/history" className="text-sm" style={{ color: 'var(--muted)' }}>History</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Papers</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            All answer keys sourced from official Cambridge / UAT UK mark schemes.
          </p>
        </div>

        {types.map(type => (
          <div key={type}>
            <div
              className="inline-block px-3 py-1 rounded-lg text-xs font-medium mb-1"
              style={{ background: typeColors[type], color: typeTextColors[type] }}
            >
              {type}
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>{typeDescriptions[type]}</p>
            <div className="space-y-2">
              {PAPERS.filter(p => p.type === type)
                .sort((a, b) => b.year - a.year)
                .map(paper => {
                  const doneDate = completedMap[paper.id]
                  return (
                    <PaperStartForm key={paper.id} paper={paper} doneDate={doneDate ?? null} />
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

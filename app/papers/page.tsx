import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PAPERS, PaperType } from '@/lib/papers-data'
import Nav from '@/components/Nav'
import PaperStartForm from '@/components/PaperStartForm'

export default async function PapersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: completedSessions } = await supabase
    .from('sessions')
    .select('paper_id, completed_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  const completedMap: Record<string, string> = {}
  for (const s of completedSessions ?? []) {
    if (!completedMap[s.paper_id]) completedMap[s.paper_id] = s.completed_at
  }

  const types: PaperType[] = ['NSAA', 'ENGAA', 'TMUA']

  const typeConfig: Record<PaperType, { bg: string; text: string; dot: string; desc: string }> = {
    NSAA: { bg: 'var(--green-bg)', text: 'var(--green-text)', dot: '#16a34a', desc: 'Natural Sciences — Maths · Physics · Chemistry · Biology' },
    ENGAA: { bg: 'var(--blue-bg)', text: 'var(--blue-text)', dot: '#2563eb', desc: 'Engineering — Maths & Physics' },
    TMUA: { bg: 'var(--orange-bg)', text: 'var(--orange-text)', dot: '#ea580c', desc: 'Test of Mathematics — Paper 1 only (mirrors ESAT Maths 2)' },
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav active="papers" />

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>Papers</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            22 past papers with official answer keys from Cambridge / UAT UK mark schemes.
          </p>
        </div>

        {types.map(type => {
          const cfg = typeConfig[type]
          const papers = PAPERS.filter(p => p.type === type).sort((a, b) => b.year - a.year)
          return (
            <div key={type}>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cfg.text }}>{type}</span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{papers.length} papers</span>
              </div>
              <p className="text-xs mb-4 ml-4.5" style={{ color: 'var(--muted)' }}>{cfg.desc}</p>
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                {papers.map((paper, i) => (
                  <PaperStartForm
                    key={paper.id}
                    paper={paper}
                    doneDate={completedMap[paper.id] ?? null}
                    isLast={i === papers.length - 1}
                    typeDot={cfg.dot}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

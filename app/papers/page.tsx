import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PAPERS, PaperType } from '@/lib/papers-data'
import Nav from '@/components/Nav'
import PaperStartForm from '@/components/PaperStartForm'

const typeConfig: Record<string, { dot: string; desc: string; label: string }> = {
  NSAA: { dot: '#16a34a', label: 'NSAA', desc: 'Natural Sciences Admissions Assessment — Maths · Physics · Chemistry · Biology' },
  ENGAA: { dot: '#2563eb', label: 'ENGAA', desc: 'Engineering Admissions Assessment — Maths & Physics' },
  TMUA: { dot: '#ea580c', label: 'TMUA', desc: 'Test of Mathematics for University Admission — Paper 1 (mirrors ESAT Maths 2)' },
  'PAT-mcq': { dot: '#7c3aed', label: 'PAT — MCQ', desc: 'Oxford Physics Aptitude Test — multiple choice section (auto-marked)' },
  'PAT-timed': { dot: '#a78bfa', label: 'PAT — Full papers', desc: 'Oxford Physics Aptitude Test — full written papers (self-marked with mark scheme)' },
  'Solomon-C': { dot: '#0891b2', label: 'Solomon — Core Maths', desc: 'Solomon Press C1–C4 practice papers (self-marked)' },
  'Solomon-M': { dot: '#0d9488', label: 'Solomon — Mechanics', desc: 'Solomon Press M1–M2 practice papers (self-marked)' },
  'Solomon-S': { dot: '#d97706', label: 'Solomon — Statistics', desc: 'Solomon Press S1–S2 practice papers (self-marked)' },
  'Solomon-FP': { dot: '#dc2626', label: 'Solomon — Further Pure', desc: 'Solomon Press FP1–FP2 practice papers (self-marked)' },
}

function solomonSubgroup(section: string): string {
  if (section.startsWith('C')) return 'Solomon-C'
  if (section.startsWith('M')) return 'Solomon-M'
  if (section.startsWith('S')) return 'Solomon-S'
  return 'Solomon-FP'
}

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

  // Group papers
  const groups: { key: string; papers: typeof PAPERS }[] = [
    { key: 'NSAA', papers: PAPERS.filter(p => p.type === 'NSAA').sort((a, b) => b.year - a.year) },
    { key: 'ENGAA', papers: PAPERS.filter(p => p.type === 'ENGAA').sort((a, b) => b.year - a.year) },
    { key: 'TMUA', papers: PAPERS.filter(p => p.type === 'TMUA').sort((a, b) => b.year - a.year) },
    { key: 'PAT-mcq', papers: PAPERS.filter(p => p.type === 'PAT' && p.mode === 'mcq').sort((a, b) => b.year - a.year) },
    { key: 'PAT-timed', papers: PAPERS.filter(p => p.type === 'PAT' && p.mode === 'timed').sort((a, b) => b.year - a.year) },
    { key: 'Solomon-C', papers: PAPERS.filter(p => p.type === 'Solomon' && /Solomon (C[1-4])/.test(p.name)) },
    { key: 'Solomon-M', papers: PAPERS.filter(p => p.type === 'Solomon' && /Solomon (M[12])/.test(p.name)) },
    { key: 'Solomon-S', papers: PAPERS.filter(p => p.type === 'Solomon' && /Solomon (S[12])/.test(p.name)) },
    { key: 'Solomon-FP', papers: PAPERS.filter(p => p.type === 'Solomon' && /Solomon (FP[12])/.test(p.name)) },
  ].filter(g => g.papers.length > 0)

  const totalMcq = PAPERS.filter(p => p.mode === 'mcq').length
  const totalTimed = PAPERS.filter(p => p.mode === 'timed').length

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav active="papers" />

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>Papers</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {totalMcq} auto-marked MCQ papers · {totalTimed} timed practice papers (self-marked)
          </p>
        </div>

        {groups.map(({ key, papers }) => {
          const cfg = typeConfig[key]
          return (
            <div key={key}>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cfg.dot }}>{cfg.label}</span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{papers.length} papers</span>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--muted)', paddingLeft: '18px' }}>{cfg.desc}</p>
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

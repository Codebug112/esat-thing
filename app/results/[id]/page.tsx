import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPaperById } from '@/lib/papers-data'
import Link from 'next/link'
import ResultsClient from '@/components/ResultsClient'

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!session) redirect('/dashboard')

  const { data: answers } = await supabase
    .from('session_answers')
    .select('*')
    .eq('session_id', id)
    .order('question_number')

  const paper = getPaperById(session.paper_id)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <nav className="border-b px-6 py-4 flex items-center justify-between" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Link href="/dashboard" className="font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
          Aron's ESAT Thing
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/papers" className="text-sm" style={{ color: 'var(--muted)' }}>Papers</Link>
          <Link href="/history" className="text-sm" style={{ color: 'var(--muted)' }}>History</Link>
        </div>
      </nav>
      <ResultsClient
        session={session}
        answers={answers ?? []}
        paper={paper ?? null}
      />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPaperById } from '@/lib/papers-data'
import Nav from '@/components/Nav'
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
      <Nav />
      <ResultsClient
        session={session}
        answers={answers ?? []}
        paper={paper ?? null}
      />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { getPaperById } from '@/lib/papers-data'
import { redirect } from 'next/navigation'
import TimedSessionClient from '@/components/TimedSessionClient'

export default async function TimedSessionPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (!session) redirect('/papers')

  const paper = getPaperById(session.paper_id)
  if (!paper || paper.mode !== 'timed') redirect('/papers')

  return <TimedSessionClient session={session} paper={paper} />
}

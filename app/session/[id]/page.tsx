import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPaperById } from '@/lib/papers-data'
import SessionTimer from '@/components/SessionTimer'

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ parts?: string }>
}) {
  const { id } = await params
  const { parts } = await searchParams
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
  if (session.status === 'completed') redirect(`/results/${id}`)

  const paper = getPaperById(session.paper_id)
  if (!paper) redirect('/papers')

  // Read selectedParts from URL param, or fall back to what was saved in draft_state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const draft = session.draft_state as any
  const savedParts = draft?.__parts__ ?? null
  const selectedParts = parts ? parts.split(',') : savedParts ?? undefined

  const { data: flaggedRows } = await supabase
    .from('flagged_questions')
    .select('question_number')
    .eq('user_id', user.id)
    .eq('paper_id', session.paper_id)

  const existingFlags = new Set((flaggedRows ?? []).map(r => r.question_number))

  return (
    <SessionTimer
      sessionId={id}
      paper={paper}
      goalTimeSec={session.goal_time_sec}
      selectedParts={selectedParts}
      draftState={draft}
      existingFlags={existingFlags}
    />
  )
}

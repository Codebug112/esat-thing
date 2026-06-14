import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPaperById, getPaperAnswerOptions } from '@/lib/papers-data'
import Nav from '@/components/Nav'
import FlaggedClient from '@/components/FlaggedClient'

export interface FlaggedPaper {
  paperId: string
  paperName: string
  answerOptions: string[]
  questions: { number: number; correctAnswer: string; subject: string | null }[]
}

export default async function FlaggedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rows } = await supabase
    .from('flagged_questions')
    .select('paper_id, question_number')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const byPaper: Record<string, number[]> = {}
  for (const row of rows ?? []) {
    if (!byPaper[row.paper_id]) byPaper[row.paper_id] = []
    byPaper[row.paper_id].push(row.question_number)
  }

  const papers: FlaggedPaper[] = Object.entries(byPaper).flatMap(([paperId, qNums]) => {
    const paper = getPaperById(paperId)
    if (!paper) return []
    return [{
      paperId,
      paperName: paper.name,
      answerOptions: getPaperAnswerOptions(paper),
      questions: qNums.sort((a, b) => a - b).map(n => ({
        number: n,
        correctAnswer: paper.answers[n],
        subject: paper.parts?.[n] ?? null,
      })),
    }]
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav active="flagged" />
      <FlaggedClient papers={papers} userId={user.id} />
    </div>
  )
}

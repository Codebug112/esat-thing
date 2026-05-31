'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteDataButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function deleteAll() {
    setDeleting(true)
    const supabase = createClient()
    // Get session IDs first, then delete answers and sessions
    const { data: sessionIds } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', userId)
    if (sessionIds && sessionIds.length > 0) {
      await supabase.from('session_answers').delete().in('session_id', sessionIds.map(s => s.id))
    }
    await supabase.from('sessions').delete().eq('user_id', userId)
    setConfirm(false)
    setDeleting(false)
    router.refresh()
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
        style={{ color: 'var(--red-text)', background: 'var(--red-bg)', border: '1px solid #fca5a5' }}
      >
        Delete all history
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium" style={{ color: 'var(--red-text)' }}>Are you sure?</span>
      <button
        onClick={deleteAll}
        disabled={deleting}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50"
        style={{ background: 'var(--red-text)', color: 'white' }}
      >
        {deleting ? 'Deleting…' : 'Yes, delete everything'}
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="text-xs font-medium px-3 py-1.5 rounded-lg"
        style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        Cancel
      </button>
    </div>
  )
}

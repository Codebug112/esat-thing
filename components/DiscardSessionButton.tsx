'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DiscardSessionButton({ sessionId }: { sessionId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function discard() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('sessions').delete().eq('id', sessionId)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2" onClick={e => e.preventDefault()}>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>Discard?</span>
        <button
          onClick={discard}
          disabled={loading}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold"
          style={{ background: 'var(--red-bg)', color: 'var(--red-text)' }}
        >
          {loading ? '…' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold"
          style={{ background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={e => { e.preventDefault(); setConfirming(true) }}
      className="px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0"
      style={{ background: 'var(--red-bg)', color: 'var(--red-text)' }}
    >
      Discard
    </button>
  )
}

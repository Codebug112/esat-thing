'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
            Aron's ESAT Thing
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--muted)' }}>create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--text)' }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--text)' }}
              placeholder="at least 6 characters"
            />
          </div>

          {error && (
            <p className="text-sm px-3.5 py-2.5 rounded-xl" style={{ background: 'var(--rose)', color: '#9f1239' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-60"
            style={{ background: 'var(--lavender)', color: '#4c1d95' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium" style={{ color: 'var(--text)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

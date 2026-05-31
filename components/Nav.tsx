import Link from 'next/link'
import SignOutButton from './SignOutButton'
import { IconBook, IconHistory, IconTarget } from './Icons'

interface NavProps {
  active?: 'dashboard' | 'papers' | 'history'
}

export default function Nav({ active }: NavProps) {
  return (
    <nav
      className="sticky top-0 z-40 flex items-center justify-between px-6 h-14"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 group">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--purple)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="2.5" fill="white"/>
            <circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.2" fill="none" opacity="0.5"/>
          </svg>
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          Aron's ESAT Thing
        </span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            color: active === 'dashboard' ? 'var(--purple)' : 'var(--muted)',
            background: active === 'dashboard' ? 'var(--purple-light)' : 'transparent',
          }}
        >
          <IconTarget size={14} />
          Dashboard
        </Link>
        <Link
          href="/papers"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            color: active === 'papers' ? 'var(--purple)' : 'var(--muted)',
            background: active === 'papers' ? 'var(--purple-light)' : 'transparent',
          }}
        >
          <IconBook size={14} />
          Papers
        </Link>
        <Link
          href="/history"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            color: active === 'history' ? 'var(--purple)' : 'var(--muted)',
            background: active === 'history' ? 'var(--purple-light)' : 'transparent',
          }}
        >
          <IconHistory size={14} />
          History
        </Link>
      </div>

      <SignOutButton />
    </nav>
  )
}

import { Link, NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'

function TopLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'rounded-[18px] px-3 py-2 text-sm transition',
          isActive
            ? 'bg-white/12 text-bm-text border border-white/12'
            : 'text-bm-muted hover:bg-white/6 hover:text-bm-text border border-transparent',
        )
      }
    >
      {label}
    </NavLink>
  )
}

export function GlassNavbar() {
  return (
    <header className={cn('glass-premium-strong sticky top-4 z-20 rounded-[26px] px-4 py-3 sm:px-5', 'motion-fade')}>
      <div className="flex items-center justify-between gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img
            src="/favicon.svg"
            alt=""
            width={40}
            height={40}
            decoding="async"
            className="h-10 w-10 shrink-0 rounded-full border border-white/12 bg-black/20 object-contain p-1 shadow-glass"
          />
          <div className="min-w-0 leading-tight">
            <div className="text-base font-semibold tracking-tight">БиоДониш</div>
            <div className="text-xs text-bm-muted">Веби мобилӣ бо шиша‑эффект</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          <TopLink to="/" label="Асосӣ" />
          <TopLink to="/lessons" label="Дарс" />
          <TopLink to="/lab" label="Лаборатория" />
          <TopLink to="/tutor" label="Мураббӣ" />
          <TopLink to="/anatomy" label="Анатомия" />
          <TopLink to="/progress" label="Пешрафт" />
          <TopLink to="/profile" label="Профил" />
        </nav>
      </div>
    </header>
  )
}


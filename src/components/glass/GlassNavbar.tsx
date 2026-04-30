import { NavLink } from 'react-router-dom'
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
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[22px] bg-gradient-to-br from-bm-emerald/55 via-bm-cyan/40 to-bm-emerald/20 border border-white/12 shadow-glass" />
          <div className="leading-tight">
            <div className="text-base font-semibold tracking-tight">BioMind AI</div>
            <div className="text-xs text-bm-muted">Веби мобилӣ бо шиша‑эффект</div>
          </div>
        </div>
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


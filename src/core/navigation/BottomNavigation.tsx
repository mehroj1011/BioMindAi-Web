import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'

type Item = { to: string; label: string }

const items: Item[] = [
  { to: '/', label: 'Асосӣ' },
  { to: '/lessons', label: 'Дарс' },
  { to: '/lab', label: 'Лаб' },
  { to: '/tutor', label: 'AI' },
  { to: '/anatomy', label: '3D' },
]

export function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 sm:hidden">
      <div className="mx-auto max-w-6xl px-3 pb-[env(safe-area-inset-bottom)]">
        <div className="glass-premium-strong mt-3 rounded-[28px] px-2 py-2 shadow-glass">
          <div className="flex items-center justify-between gap-1">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'inline-flex flex-1 items-center justify-center rounded-[22px] px-2 py-3 text-[11px] font-semibold transition',
                    'active:scale-[0.98]',
                    isActive
                      ? 'bg-white/12 text-bm-text border border-white/12 shadow-glass'
                      : 'text-bm-muted hover:bg-white/6 hover:text-bm-text border border-transparent',
                  )
                }
              >
                {it.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}


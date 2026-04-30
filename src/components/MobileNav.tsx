import { NavLink } from 'react-router-dom'

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <div
      className={[
        'sm:hidden fixed inset-0 z-40 transition',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      ].join(' ')}
      aria-hidden={!open}
    >
      <div
        className={[
          'absolute inset-0 bg-black/50 transition-opacity',
          open ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onClick={onClose}
      />
      <div
        className={[
          'absolute left-3 right-3 top-20 rounded-3xl border border-bm-border bg-bm-panel2 shadow-glass backdrop-blur-glass transition-transform',
          open ? 'translate-y-0' : '-translate-y-3',
        ].join(' ')}
      >
        <div className="p-3">
          <div className="px-2 pb-2 text-xs text-bm-muted">Меню</div>
          <div className="grid gap-1">
            <MItem to="/" label="Асосӣ" onClose={onClose} />
            <MItem to="/lessons" label="Дарс" onClose={onClose} />
            <MItem to="/tutor" label="Мураббӣ" onClose={onClose} />
            <MItem to="/lab" label="Лаборатория" onClose={onClose} />
            <MItem to="/bioscan" label="БиоСкан" onClose={onClose} />
            <MItem to="/anatomy" label="Анатомия" onClose={onClose} />
            <MItem to="/android" label="Android (APK)" onClose={onClose} />
            <MItem to="/progress" label="Пешрафт" onClose={onClose} />
            <MItem to="/profile" label="Профил" onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MItem({ to, label, onClose }: { to: string; label: string; onClose: () => void }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClose}
      className={({ isActive }) =>
        [
          'rounded-2xl px-4 py-3 text-sm font-semibold transition',
          isActive ? 'bg-white/10 border border-white/10' : 'bg-white/5 border border-bm-border hover:bg-white/8',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}


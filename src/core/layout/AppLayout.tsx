import { type ReactNode } from 'react'
import { BottomNavigation } from '../navigation/BottomNavigation'
import { GlassNavbar } from '../../components/glass/GlassNavbar'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full">
      <div className="mx-auto flex min-h-full max-w-6xl flex-col px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
        <GlassNavbar />

        <main className="flex-1 py-6 pb-28 sm:pb-8 motion-fade min-w-0">{children}</main>

        <footer className="pb-10 pt-4 text-center text-xs text-bm-muted">
          © {new Date().getFullYear()} BioMind AI — версияи веб (Tajik).
        </footer>
      </div>

      <BottomNavigation />
    </div>
  )
}


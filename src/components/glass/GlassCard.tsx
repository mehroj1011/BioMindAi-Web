import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export function GlassCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'glass-premium rounded-[26px] p-5 sm:p-6',
        'transition will-change-transform',
        className,
      )}
    >
      {children}
    </div>
  )
}


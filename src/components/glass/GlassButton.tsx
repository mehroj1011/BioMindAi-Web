import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export function GlassButton({
  children,
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}) {
  const base =
    'rounded-[22px] px-5 py-3 text-sm font-semibold transition will-change-transform active:scale-[0.98]'
  const v =
    variant === 'primary'
      ? 'bg-gradient-to-r from-bm-emerald to-bm-cyan text-black shadow-glass hover:opacity-95'
      : variant === 'secondary'
        ? 'glass-premium text-bm-text hover:bg-white/10'
        : 'border border-white/12 bg-white/5 text-bm-text hover:bg-white/8'

  return (
    <button
      {...props}
      className={cn(base, v, 'motion-pop', props.disabled ? 'opacity-60 pointer-events-none' : '', className)}
    >
      {children}
    </button>
  )
}


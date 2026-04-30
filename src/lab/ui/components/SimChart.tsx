import { useMemo } from 'react'

export function SimChart({
  series,
  lines,
  height = 140,
}: {
  series: Array<{ t: number } & Record<string, number>>
  lines: Array<{ key: string; label: string; color: string }>
  height?: number
}) {
  const pts = useMemo(() => {
    if (series.length < 2) return null
    // Downsample for stable 60fps UI
    const maxPoints = 220
    const stride = Math.max(1, Math.floor(series.length / maxPoints))
    const s2 = stride === 1 ? series : series.filter((_, i) => i % stride === 0 || i === series.length - 1)

    const t0 = s2[0]!.t
    const t1 = s2[s2.length - 1]!.t
    const minT = t0
    const maxT = t1 > t0 ? t1 : t0 + 1
    let maxY = 1
    for (const s of s2) for (const ln of lines) maxY = Math.max(maxY, Number(s[ln.key] ?? 0))
    const w = 1000
    const h = 1000
    const toX = (t: number) => ((t - minT) / (maxT - minT)) * w
    const toY = (y: number) => h - (y / maxY) * h
    const paths = lines.map((ln) => {
      let d = ''
      for (let i = 0; i < s2.length; i++) {
        const s = s2[i]!
        const x = toX(s.t)
        const y = toY(Number(s[ln.key] ?? 0))
        d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
      }
      return { ...ln, d }
    })
    return { paths, maxY }
  }, [series, lines])

  if (!pts) return <div className="rounded-2xl border border-bm-border bg-black/20 p-3 text-xs text-bm-muted">Диаграмма ҳоло маълумот надорад.</div>

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-glass backdrop-blur-glass">
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="w-full" style={{ height }}>
        <path d="M 0 999 L 1000 999" stroke="rgba(255,255,255,0.10)" strokeWidth="8" />
        {pts.paths.map((p) => (
          <path key={p.key} d={p.d} fill="none" stroke={p.color} strokeWidth="14" strokeLinecap="round" className="bm-line-draw" />
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-bm-muted">
        {lines.map((ln) => (
          <div key={ln.key} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: ln.color }} />
            <span>{ln.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}


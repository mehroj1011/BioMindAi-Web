import { useMemo, useState } from 'react'

export function MicroscopeTool() {
  const [src, setSrc] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1.0)
  const [brightness, setBrightness] = useState(1.0)
  const [contrast, setContrast] = useState(1.05)

  const filter = useMemo(() => {
    return `brightness(${brightness}) contrast(${contrast})`
  }, [brightness, contrast])

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Микроскоп (тасвир)</div>
          <div className="mt-2 text-xs text-bm-muted">Тасвир бор кунед ва зум/равшанӣ/контрастро танзим кунед</div>
        </div>
        <label className="rounded-2xl bg-gradient-to-r from-bm-emerald to-bm-cyan px-4 py-2 text-sm font-semibold text-black shadow-glass transition hover:opacity-95 cursor-pointer">
          Бор кардан
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const url = URL.createObjectURL(f)
              setSrc(url)
            }}
          />
        </label>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-bm-border bg-black/20">
        {src ? (
          <div className="relative h-[46vh] w-full overflow-auto">
            <div className="min-h-full min-w-full flex items-center justify-center p-6">
              <img
                src={src}
                alt=""
                style={{
                  transform: `scale(${zoom})`,
                  filter,
                  transformOrigin: 'center center',
                }}
                className="max-w-full rounded-2xl border border-white/10 bg-black/10"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-[46vh] items-center justify-center text-sm text-bm-muted">
            Ҳоло тасвир нест. “Бор кардан”‑ро пахш кунед.
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Slider label="Зум" value={zoom} min={1} max={3} step={0.05} onChange={setZoom} />
        <Slider label="Равшанӣ" value={brightness} min={0.6} max={1.6} step={0.05} onChange={setBrightness} />
        <Slider label="Контраст" value={contrast} min={0.7} max={1.7} step={0.05} onChange={setContrast} />
      </div>
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div className="rounded-3xl border border-bm-border bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3 text-xs text-bm-muted">
        <div className="font-semibold text-bm-text">{label}</div>
        <div className="font-mono">{value.toFixed(2)}</div>
      </div>
      <input
        type="range"
        className="mt-3 w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}


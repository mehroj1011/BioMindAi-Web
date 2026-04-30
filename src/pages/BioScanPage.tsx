import { useEffect, useMemo, useRef, useState } from 'react'

type ScanResult = { title: string; summary: string; details?: string }

function dataUrlToBase64(dataUrl: string) {
  const i = dataUrl.indexOf(',')
  if (i < 0) return ''
  return dataUrl.slice(i + 1)
}

export function BioScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<'idle' | 'starting' | 'ready' | 'denied' | 'no_camera'>('idle')
  const [shot, setShot] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canUseCamera = useMemo(() => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia, [])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const start = async () => {
    setError(null)
    setResult(null)
    setShot(null)
    if (!canUseCamera) return setStatus('no_camera')
    setStatus('starting')
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = s
      const v = videoRef.current
      if (v) {
        v.srcObject = s
        await v.play()
      }
      setStatus('ready')
    } catch (e) {
      const msg = String((e as Error)?.message || e)
      setError(msg)
      setStatus(msg.toLowerCase().includes('permission') ? 'denied' : 'denied')
    }
  }

  const capture = () => {
    const v = videoRef.current
    if (!v) return
    const w = Math.max(1, v.videoWidth || 0)
    const h = Math.max(1, v.videoHeight || 0)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(v, 0, 0, w, h)
    const url = canvas.toDataURL('image/jpeg', 0.85)
    setShot(url)
    setResult(null)
    setError(null)
  }

  const scan = async () => {
    if (!shot) return
    setIsScanning(true)
    setResult(null)
    setError(null)
    try {
      const r = await fetch('/api/bioscan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrlToBase64(shot),
          mimeType: 'image/jpeg',
          userDisplayName: 'Дӯст',
        }),
      })
      const raw = await r.text()
      if (!r.ok) throw new Error(raw.slice(0, 500) || `Код ${r.status}`)
      const j = JSON.parse(raw) as { title?: string; summary?: string; details?: string }
      const title = String(j?.title || '').trim()
      const summary = String(j?.summary || '').trim()
      if (!title || !summary) throw new Error('AI ҷавоби нопурра дод.')
      setResult({ title, summary, details: String(j?.details || '').trim() || undefined })
    } catch (e) {
      setError(String((e as Error)?.message || e))
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <section className="glass rounded-3xl p-6 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">БиоСкан</h2>
          <div className="mt-2 text-sm text-bm-muted">
            Камера → акс → AI шарҳ. Барои растанӣ/ҳайвон/узв/ҳуҷайра ва тасвирҳои биологӣ.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={start}
            className="rounded-2xl bg-gradient-to-r from-bm-emerald to-bm-cyan px-5 py-3 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
          >
            Камераро кушодан
          </button>
          <button
            onClick={capture}
            disabled={status !== 'ready'}
            className={[
              'rounded-2xl px-5 py-3 text-sm font-semibold transition',
              status === 'ready'
                ? 'border border-bm-border bg-white/5 text-bm-text hover:bg-white/8'
                : 'border border-bm-border bg-white/5 text-bm-muted',
            ].join(' ')}
          >
            Акс гирифтан
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
          <div className="text-xs text-bm-muted">Камера</div>
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <video ref={videoRef} playsInline muted className="aspect-video w-full bg-black" />
          </div>
          <div className="mt-3 text-xs text-bm-muted">
            {status === 'idle' && 'Омода. Камераро кушоед.'}
            {status === 'starting' && 'Камера оғоз мешавад…'}
            {status === 'ready' && 'Камера фаъол аст.'}
            {status === 'denied' && 'Иҷозати камера нест. Дар браузер иҷозат диҳед.'}
            {status === 'no_camera' && 'Ин браузер камераро дастгирӣ намекунад.'}
            {error ? `\nХато: ${error}` : ''}
          </div>
        </div>

        <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
          <div className="text-xs text-bm-muted">Акс</div>
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            {shot ? (
              <img src={shot} alt="Captured" className="aspect-video w-full object-contain bg-black" />
            ) : (
              <div className="aspect-video grid place-items-center text-sm text-bm-muted">Ҳанӯз акс нест.</div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={scan}
              disabled={!shot || isScanning}
              className={[
                'rounded-2xl px-5 py-3 text-sm font-semibold shadow-glass transition',
                shot && !isScanning
                  ? 'bg-gradient-to-r from-bm-purple to-bm-cyan text-black hover:opacity-95'
                  : 'bg-white/5 text-bm-muted border border-bm-border',
              ].join(' ')}
            >
              {isScanning ? 'Скан…' : 'Скан бо AI'}
            </button>
            <button
              onClick={() => {
                setShot(null)
                setResult(null)
                setError(null)
              }}
              className="rounded-2xl border border-bm-border bg-white/5 px-5 py-3 text-sm font-semibold text-bm-text transition hover:bg-white/8"
            >
              Тоза кардан
            </button>
          </div>

          {result && (
            <div className="mt-4 rounded-2xl border border-bm-border bg-white/5 p-4">
              <div className="text-sm font-semibold">{result.title}</div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-bm-text">{result.summary}</div>
              {result.details && (
                <div className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-bm-muted">{result.details}</div>
              )}
            </div>
          )}
          {!result && error && <div className="mt-4 text-sm text-bm-muted">Хато: {error}</div>}
        </div>
      </div>
    </section>
  )
}


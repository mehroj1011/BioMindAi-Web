import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { ThreeCanvas, type ThreeContext } from '../../lib/three/ThreeCanvas'

type Q = { q: string; options: { id: string; t: string; ok: boolean }[]; exp: string }

export function EcoGame3D({
  score,
  seed,
  onCorrect,
  onNext,
}: {
  score: number
  seed: number
  onCorrect: () => void
  onNext: () => void
}) {
  const q = useMemo<Q>(() => {
    const qs: Q[] = [
      {
        q: 'Кӣ истеҳсолкунанда аст?',
        options: [
          { id: 'a', t: 'Растаниҳо', ok: true },
          { id: 'b', t: 'Шер', ok: false },
          { id: 'c', t: 'Гург', ok: false },
          { id: 'd', t: 'Ҳашароти хишикор', ok: false },
        ],
        exp: 'Истеҳсолкунандаҳо фотосинтез мекунанд ва энергияро ба экосистема ворид мекунанд.',
      },
      {
        q: 'Агар prey кам шавад, predator одатан чӣ мешавад?',
        options: [
          { id: 'a', t: 'Кам мешавад', ok: true },
          { id: 'b', t: 'Бе тағйир мемонад', ok: false },
          { id: 'c', t: 'Ҳамеша зиёд мешавад', ok: false },
          { id: 'd', t: 'Ба растанӣ мегузарад', ok: false },
        ],
        exp: 'Predator ғизо кам мегирад → шуморааш паст мешавад.',
      },
      {
        q: 'Экосистема чист?',
        options: [
          { id: 'a', t: 'Муҳит + организмҳо ва муносибатҳо', ok: true },
          { id: 'b', t: 'Танҳо ҳайвонот', ok: false },
          { id: 'c', t: 'Танҳо растаниҳо', ok: false },
          { id: 'd', t: 'Танҳо об', ok: false },
        ],
        exp: 'Экосистема маҷмӯи омилҳои зинда/ғайризинда ва робитаҳои онҳост.',
      },
    ]
    return qs[Math.abs(seed) % qs.length]!
  }, [seed])

  const [picked, setPicked] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const correctId = q.options.find((o) => o.ok)?.id ?? null
  const ok = submitted && picked != null && picked === correctId

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
      <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">ЭкоБозӣ (3D) — омӯзиш бо бозӣ</div>
            <div className="mt-1 text-xs text-bm-muted">Ин ҷо 3D саҳна + саволҳои тез</div>
          </div>
          <div className="rounded-2xl border border-bm-border bg-white/5 px-4 py-2 text-sm font-semibold text-bm-text">
            Хол: {score}
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
          <ThreeCanvas
            className="h-[40vh] w-full"
            onInit={(ctx) => initEcoGameScene(ctx)}
            onFrame={(ctx, dt) => {
              ;(ctx.scene.userData as { step?: (dt: number) => void } | undefined)?.step?.(dt)
            }}
            enableControls
          />
        </div>
      </div>

      <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
        <div className="text-sm font-semibold">{q.q}</div>
        <div className="mt-4 grid gap-2">
          {q.options.map((o) => {
            const active = picked === o.id
            const verdict = submitted && (o.id === correctId ? 'ok' : active ? 'bad' : 'none')
            return (
              <button
                key={o.id}
                onClick={() => !submitted && setPicked(o.id)}
                className={[
                  'rounded-2xl border px-4 py-3 text-left text-sm transition',
                  active ? 'bg-white/10 border-white/20' : 'bg-white/5 border-bm-border hover:bg-white/8',
                  verdict === 'ok' ? 'border-bm-emerald/60' : '',
                  verdict === 'bad' ? 'border-red-400/40' : '',
                ].join(' ')}
              >
                {o.t}
              </button>
            )
          })}
        </div>

        {!submitted ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              disabled={!picked}
              onClick={() => setSubmitted(true)}
              className={[
                'rounded-2xl px-5 py-3 text-sm font-semibold shadow-glass transition',
                picked ? 'bg-gradient-to-r from-bm-emerald to-bm-cyan text-black hover:opacity-95' : 'bg-white/5 text-bm-muted border border-bm-border',
              ].join(' ')}
            >
              Санҷидан
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            <div className={['text-sm', ok ? 'text-bm-emerald' : 'text-bm-muted'].join(' ')}>
              {ok ? 'Дуруст! +10 хол' : 'Нодуруст. Шарҳро бинед.'}
            </div>
            <div className="text-sm text-bm-muted">{q.exp}</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  if (ok) onCorrect()
                  setPicked(null)
                  setSubmitted(false)
                  onNext()
                }}
                className="rounded-2xl bg-gradient-to-r from-bm-purple to-bm-cyan px-5 py-3 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
              >
                Саволи нав
              </button>
              <button
                onClick={() => {
                  setPicked(null)
                  setSubmitted(false)
                }}
                className="rounded-2xl border border-bm-border bg-white/5 px-5 py-3 text-sm font-semibold text-bm-text transition hover:bg-white/8"
              >
                Аз нав
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function initEcoGameScene(ctx: ThreeContext) {
  const { scene, camera } = ctx
  scene.clear()
  camera.position.set(0, 6.0, 9.0)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.HemisphereLight(0x9bdcff, 0x0b1220, 0.75))
  scene.add(new THREE.AmbientLight(0xffffff, 0.16))
  const dir = new THREE.DirectionalLight(0xffffff, 0.9)
  dir.position.set(8, 10, 4)
  scene.add(dir)

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.95 }),
  )
  plane.rotation.x = -Math.PI / 2
  scene.add(plane)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, 0.12, 12, 100),
    new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 0.12 }),
  )
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.08
  scene.add(ring)

  const prey = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 20, 16),
    new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 0.10 }),
  )
  const pred = new THREE.Mesh(
    new THREE.SphereGeometry(0.30, 20, 16),
    new THREE.MeshStandardMaterial({ color: 0xa78bfa, emissive: 0xa78bfa, emissiveIntensity: 0.10 }),
  )
  scene.add(prey)
  scene.add(pred)

  let t = 0
  const step = (dt: number) => {
    t += dt
    const r = 2.6
    prey.position.set(Math.cos(t) * r, 0.26, Math.sin(t) * r)
    pred.position.set(Math.cos(t + 1.2) * (r * 0.8), 0.30, Math.sin(t + 1.2) * (r * 0.8))
    ring.rotation.z = t * 0.25
  }
  scene.userData = { step }

  return () => {
    ;(plane.geometry as THREE.BufferGeometry).dispose()
    ;(plane.material as THREE.Material).dispose()
    ;(ring.geometry as THREE.BufferGeometry).dispose()
    ;(ring.material as THREE.Material).dispose()
    ;(prey.geometry as THREE.BufferGeometry).dispose()
    ;(prey.material as THREE.Material).dispose()
    ;(pred.geometry as THREE.BufferGeometry).dispose()
    ;(pred.material as THREE.Material).dispose()
  }
}


import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { ThreeCanvas, type ThreeContext } from '../../lib/three/ThreeCanvas'
import { explainWithAi } from '../../lib/aiExplain'

type Agent = { kind: 'prey' | 'pred'; x: number; z: number; vx: number; vz: number }

export function Ecosystem3D({
  prey,
  predator,
}: {
  prey: number
  predator: number
}) {
  const maxAgents = 70
  const counts = useMemo(() => {
    const p = Math.max(1, Math.min(maxAgents, Math.round(prey)))
    const r = Math.max(1, Math.min(maxAgents, Math.round(predator)))
    return { prey: p, pred: r }
  }, [prey, predator])

  const [picked, setPicked] = useState<'prey' | 'pred' | null>(null)

  const [aiOpen, setAiOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiErr, setAiErr] = useState<string | null>(null)

  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1.0)

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
        <div className="text-sm font-semibold">Экосистема (3D) — prey/predator</div>
        <div className="mt-1 text-xs text-bm-muted">Клик кунед ба сферҳо: сабз=prey, бунафш=predator</div>
        <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
          <ThreeCanvas
            className="h-[44vh] w-full"
            onInit={(ctx) => initEcoScene(ctx, counts.prey, counts.pred, setPicked)}
            onFrame={(ctx, dt) => {
              if (paused) return
              ;(ctx.scene.userData as { step?: (dt: number) => void } | undefined)?.step?.(dt * speed)
            }}
            enableControls
          />
        </div>
        <div className="mt-2 text-xs text-bm-muted">
          Шумора (визуалӣ): prey={counts.prey}, predator={counts.pred} (барои суръат маҳдуд карда мешавад).
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setPaused((v) => !v)}
            className="rounded-2xl border border-bm-border bg-white/5 px-4 py-2 text-xs font-semibold text-bm-text transition hover:bg-white/8"
          >
            {paused ? 'Давом' : 'Пауза'}
          </button>
          <div className="text-xs text-bm-muted">Суръат</div>
          <input
            type="range"
            min={0.5}
            max={2.0}
            step={0.05}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-44"
          />
          <div className="text-xs text-bm-muted font-mono">{speed.toFixed(2)}×</div>
        </div>
      </div>

      <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
        <div className="text-sm font-semibold">Интихоб</div>
        <div className="mt-2 text-sm text-bm-muted">
          {picked ? (
            <>
              Навъ: <span className="text-bm-text font-semibold">{picked === 'prey' ? 'prey (ҷонвар)' : 'predator (хишикор)'}</span>
            </>
          ) : (
            'Сферро интихоб кунед.'
          )}
        </div>

        <div className="mt-4 grid gap-2">
          <button
            onClick={async () => {
              setAiOpen(true)
              setAiLoading(true)
              setAiText(null)
              setAiErr(null)
              try {
                const t = await explainWithAi({
                  title: 'Экосистема: prey/predator',
                  gradeLabel: '5–11',
                  content: [
                    `prey: ${prey}`,
                    `predator: ${predator}`,
                    picked ? `Интихоб: ${picked}` : 'Интихоб нест.',
                    '',
                    'Лутфан фаҳмон: чаро prey/predator тағйир меёбад, мисолҳо биёвар ва 3 саволи санҷишӣ диҳ.',
                  ].join('\n'),
                })
                setAiText(t)
              } catch (e) {
                setAiErr(String((e as Error)?.message || e))
              } finally {
                setAiLoading(false)
              }
            }}
            className="rounded-2xl bg-gradient-to-r from-bm-purple to-bm-cyan px-5 py-3 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
          >
            Фаҳмон бо AI
          </button>
        </div>

        {aiOpen && (
          <div className="mt-4 rounded-3xl border border-bm-border bg-black/25 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-semibold">Шарҳ аз AI</div>
              <button
                onClick={() => setAiOpen(false)}
                className="rounded-2xl border border-bm-border bg-white/5 px-3 py-2 text-xs font-semibold text-bm-text transition hover:bg-white/8"
              >
                Пӯшидан
              </button>
            </div>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-bm-text">
              {aiLoading && <div className="text-sm text-bm-muted">AI фикр мекунад…</div>}
              {!aiLoading && aiErr && <div className="text-sm text-bm-muted">Хато: {aiErr}</div>}
              {!aiLoading && !aiErr && aiText && aiText}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function initEcoScene(ctx: ThreeContext, preyCount: number, predCount: number, setPicked: (k: 'prey' | 'pred' | null) => void) {
  const { scene, camera, renderer, root } = ctx
  scene.clear()
  camera.position.set(0, 6.2, 8.5)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.HemisphereLight(0x9bdcff, 0x0b1220, 0.7))
  scene.add(new THREE.AmbientLight(0xffffff, 0.18))
  const dir = new THREE.DirectionalLight(0xffffff, 0.9)
  dir.position.set(8, 10, 4)
  dir.castShadow = true
  dir.shadow.mapSize.set(1024, 1024)
  scene.add(dir)

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.95, metalness: 0.0 }),
  )
  plane.rotation.x = -Math.PI / 2
  plane.receiveShadow = true
  scene.add(plane)

  const bounds = 6.2
  const mkAgents = (n: number, kind: 'prey' | 'pred'): Agent[] => {
    const a: Agent[] = []
    for (let i = 0; i < n; i++) {
      a.push({
        kind,
        x: (Math.random() * 2 - 1) * bounds,
        z: (Math.random() * 2 - 1) * bounds,
        vx: (Math.random() * 2 - 1) * (kind === 'prey' ? 1.2 : 1.0),
        vz: (Math.random() * 2 - 1) * (kind === 'prey' ? 1.2 : 1.0),
      })
    }
    return a
  }

  const agents = [...mkAgents(preyCount, 'prey'), ...mkAgents(predCount, 'pred')]
  const preyGeo = new THREE.SphereGeometry(0.16, 18, 14)
  const predGeo = new THREE.SphereGeometry(0.22, 18, 14)
  const preyMat = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 0.08 })
  const predMat = new THREE.MeshStandardMaterial({ color: 0xa78bfa, emissive: 0xa78bfa, emissiveIntensity: 0.08 })

  const meshes: THREE.Mesh[] = []
  for (const a of agents) {
    const m = new THREE.Mesh(a.kind === 'prey' ? preyGeo : predGeo, a.kind === 'prey' ? preyMat : predMat)
    m.position.set(a.x, 0.18, a.z)
    m.castShadow = true
    m.userData = { kind: a.kind }
    scene.add(m)
    meshes.push(m)
  }

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  const pickAt = (clientX: number, clientY: number) => {
    const rect = root.getBoundingClientRect()
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -(((clientY - rect.top) / rect.height) * 2 - 1)
    raycaster.setFromCamera(mouse, camera)
    const hits = raycaster.intersectObjects(meshes, false)
    const hit = hits[0]?.object
    const kind = (hit?.userData as { kind?: 'prey' | 'pred' } | undefined)?.kind
    setPicked(kind ?? null)
  }
  const onClick = (e: MouseEvent) => pickAt(e.clientX, e.clientY)
  renderer.domElement.addEventListener('click', onClick)

  const step = (dt: number) => {
    const preyIdx: number[] = []
    const predIdx: number[] = []
    for (let i = 0; i < agents.length; i++) {
      if (agents[i]!.kind === 'prey') preyIdx.push(i)
      else predIdx.push(i)
    }

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i]!
      // Premium-ish behavior:
      // - predators steer toward nearest prey
      // - prey steer away from nearest predator
      // plus mild wander
      let steerX = 0
      let steerZ = 0

      if (a.kind === 'pred') {
        let bestD2 = Infinity
        let tx = a.x
        let tz = a.z
        for (const j of preyIdx) {
          const b = agents[j]!
          const dx = b.x - a.x
          const dz = b.z - a.z
          const d2 = dx * dx + dz * dz
          if (d2 < bestD2) {
            bestD2 = d2
            tx = b.x
            tz = b.z
          }
        }
        const dx = tx - a.x
        const dz = tz - a.z
        const l = Math.hypot(dx, dz) || 1
        steerX += (dx / l) * 1.2
        steerZ += (dz / l) * 1.2
      } else {
        let bestD2 = Infinity
        let ax = a.x
        let az = a.z
        for (const j of predIdx) {
          const b = agents[j]!
          const dx = b.x - a.x
          const dz = b.z - a.z
          const d2 = dx * dx + dz * dz
          if (d2 < bestD2) {
            bestD2 = d2
            ax = b.x
            az = b.z
          }
        }
        const dx = a.x - ax
        const dz = a.z - az
        const l = Math.hypot(dx, dz) || 1
        const panic = bestD2 < 6 ? 1.6 : 0.9
        steerX += (dx / l) * panic
        steerZ += (dz / l) * panic
      }

      const wander = a.kind === 'prey' ? 0.55 : 0.35
      steerX += (Math.random() * 2 - 1) * wander
      steerZ += (Math.random() * 2 - 1) * wander

      a.vx += steerX * dt
      a.vz += steerZ * dt

      const sp = a.kind === 'prey' ? 2.0 : 1.55
      const len = Math.hypot(a.vx, a.vz) || 1
      a.vx = (a.vx / len) * sp
      a.vz = (a.vz / len) * sp

      a.x += a.vx * dt
      a.z += a.vz * dt
      if (a.x > bounds) {
        a.x = bounds
        a.vx *= -1
      }
      if (a.x < -bounds) {
        a.x = -bounds
        a.vx *= -1
      }
      if (a.z > bounds) {
        a.z = bounds
        a.vz *= -1
      }
      if (a.z < -bounds) {
        a.z = -bounds
        a.vz *= -1
      }

      meshes[i]!.position.set(a.x, 0.18, a.z)
    }
  }
  scene.userData = { step }

  return () => {
    renderer.domElement.removeEventListener('click', onClick)
    preyGeo.dispose()
    predGeo.dispose()
    preyMat.dispose()
    predMat.dispose()
    ;(plane.geometry as THREE.BufferGeometry).dispose()
    ;(plane.material as THREE.Material).dispose()
  }
}


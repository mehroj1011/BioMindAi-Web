import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { ThreeCanvas, type ThreeContext } from '../../lib/three/ThreeCanvas'
import { explainWithAi } from '../../lib/aiExplain'

export function Biosphere3D({
  plants,
  herbivores,
  carnivores,
}: {
  plants: number
  herbivores: number
  carnivores: number
}) {
  const counts = useMemo(() => {
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, Math.round(v)))
    return {
      plants: clamp(plants, 10, 160),
      herb: clamp(herbivores, 2, 70),
      carn: clamp(carnivores, 1, 40),
    }
  }, [plants, herbivores, carnivores])

  const [picked, setPicked] = useState<'plants' | 'herb' | 'carn' | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiErr, setAiErr] = useState<string | null>(null)

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
        <div className="text-sm font-semibold">Биосфера (3D) — занҷири ғизоӣ</div>
        <div className="mt-1 text-xs text-bm-muted">Клик: сабз=растанӣ, амбер=гиёҳхӯр, бунафш=гӯштхӯр</div>
        <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
          <ThreeCanvas
            className="h-[44vh] w-full"
            onInit={(ctx) => initBioScene(ctx, counts, setPicked)}
            onFrame={(ctx, dt) => {
              ;(ctx.scene.userData as { step?: (dt: number) => void } | undefined)?.step?.(dt)
            }}
            enableControls
          />
        </div>
      </div>

      <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
        <div className="text-sm font-semibold">Фаҳмон (омӯзиш)</div>
        <div className="mt-2 text-sm text-bm-muted">
          {picked ? (
            <>
              Интихоб: <span className="text-bm-text font-semibold">{picked}</span>
            </>
          ) : (
            'Як гурӯҳро интихоб кунед.'
          )}
        </div>
        <div className="mt-2 text-xs text-bm-muted">
          plants={counts.plants} · herb={counts.herb} · carn={counts.carn}
        </div>

        <button
          onClick={async () => {
            setAiOpen(true)
            setAiLoading(true)
            setAiText(null)
            setAiErr(null)
            try {
              const t = await explainWithAi({
                title: 'Биосфера: занҷири ғизоӣ',
                gradeLabel: '5–11',
                content: [
                  `plants=${counts.plants}`,
                  `herbivores=${counts.herb}`,
                  `carnivores=${counts.carn}`,
                  picked ? `интихоб=${picked}` : 'интихоб нест',
                  '',
                  'Лутфан фаҳмон: ҷараёни энергия, чаро сатҳҳои боло кам мешаванд, 2 мисол, 3 саволи санҷишӣ бо ҷавоб.',
                ].join('\n'),
              })
              setAiText(t)
            } catch (e) {
              setAiErr(String((e as Error)?.message || e))
            } finally {
              setAiLoading(false)
            }
          }}
          className="mt-4 rounded-2xl bg-gradient-to-r from-bm-purple to-bm-cyan px-5 py-3 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
        >
          Фаҳмон бо AI
        </button>

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

function initBioScene(
  ctx: ThreeContext,
  counts: { plants: number; herb: number; carn: number },
  setPicked: (k: 'plants' | 'herb' | 'carn' | null) => void,
) {
  const { scene, camera, renderer, root } = ctx
  scene.clear()
  camera.position.set(0, 6.6, 9.2)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.HemisphereLight(0x9bdcff, 0x0b1220, 0.75))
  scene.add(new THREE.AmbientLight(0xffffff, 0.16))
  const dir = new THREE.DirectionalLight(0xffffff, 0.9)
  dir.position.set(8, 10, 4)
  dir.castShadow = true
  dir.shadow.mapSize.set(1024, 1024)
  scene.add(dir)

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.95, metalness: 0.0 }),
  )
  plane.rotation.x = -Math.PI / 2
  plane.receiveShadow = true
  scene.add(plane)

  const bounds = 7.0
  const mkPoints = (n: number, y: number) => {
    const a: { x: number; z: number; vx: number; vz: number }[] = []
    for (let i = 0; i < n; i++) {
      a.push({
        x: (Math.random() * 2 - 1) * bounds,
        z: (Math.random() * 2 - 1) * bounds,
        vx: (Math.random() * 2 - 1) * 0.8,
        vz: (Math.random() * 2 - 1) * 0.8,
      })
    }
    return { y, a }
  }

  const plants = mkPoints(Math.min(120, counts.plants), 0.12)
  const herb = mkPoints(Math.min(55, counts.herb), 0.22)
  const carn = mkPoints(Math.min(35, counts.carn), 0.32)

  const geoP = new THREE.SphereGeometry(0.14, 18, 14)
  const geoH = new THREE.SphereGeometry(0.19, 18, 14)
  const geoC = new THREE.SphereGeometry(0.24, 18, 14)
  const matP = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 0.06 })
  const matH = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.06 })
  const matC = new THREE.MeshStandardMaterial({ color: 0xa78bfa, emissive: 0xa78bfa, emissiveIntensity: 0.06 })

  const meshes: THREE.Mesh[] = []
  const kinds: ('plants' | 'herb' | 'carn')[] = []

  const addLayer = (layer: typeof plants, geo: THREE.SphereGeometry, mat: THREE.MeshStandardMaterial, kind: 'plants' | 'herb' | 'carn') => {
    for (const p of layer.a) {
      const m = new THREE.Mesh(geo, mat)
      m.position.set(p.x, layer.y, p.z)
      m.castShadow = true
      m.userData = { kind }
      scene.add(m)
      meshes.push(m)
      kinds.push(kind)
    }
  }
  addLayer(plants, geoP, matP, 'plants')
  addLayer(herb, geoH, matH, 'herb')
  addLayer(carn, geoC, matC, 'carn')

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  const pickAt = (clientX: number, clientY: number) => {
    const rect = root.getBoundingClientRect()
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -(((clientY - rect.top) / rect.height) * 2 - 1)
    raycaster.setFromCamera(mouse, camera)
    const hits = raycaster.intersectObjects(meshes, false)
    const hit = hits[0]?.object
    const kind = (hit?.userData as { kind?: 'plants' | 'herb' | 'carn' } | undefined)?.kind
    setPicked(kind ?? null)
  }
  const onClick = (e: MouseEvent) => pickAt(e.clientX, e.clientY)
  renderer.domElement.addEventListener('click', onClick)

  const step = (dt: number) => {
    const bounce = (p: { x: number; z: number; vx: number; vz: number }) => {
      p.x += p.vx * dt
      p.z += p.vz * dt
      if (p.x > bounds) {
        p.x = bounds
        p.vx *= -1
      }
      if (p.x < -bounds) {
        p.x = -bounds
        p.vx *= -1
      }
      if (p.z > bounds) {
        p.z = bounds
        p.vz *= -1
      }
      if (p.z < -bounds) {
        p.z = -bounds
        p.vz *= -1
      }
      p.vx += (Math.random() * 2 - 1) * 0.15 * dt
      p.vz += (Math.random() * 2 - 1) * 0.15 * dt
    }
    let idx = 0
    for (const p of plants.a) {
      bounce(p)
      meshes[idx++]!.position.set(p.x, plants.y, p.z)
    }
    for (const p of herb.a) {
      bounce(p)
      meshes[idx++]!.position.set(p.x, herb.y, p.z)
    }
    for (const p of carn.a) {
      bounce(p)
      meshes[idx++]!.position.set(p.x, carn.y, p.z)
    }
  }
  scene.userData = { step }

  return () => {
    renderer.domElement.removeEventListener('click', onClick)
    geoP.dispose()
    geoH.dispose()
    geoC.dispose()
    matP.dispose()
    matH.dispose()
    matC.dispose()
    ;(plane.geometry as THREE.BufferGeometry).dispose()
    ;(plane.material as THREE.Material).dispose()
    void kinds
  }
}


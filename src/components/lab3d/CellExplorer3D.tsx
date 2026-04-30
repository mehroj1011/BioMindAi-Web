import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { ThreeCanvas, type ThreeContext } from '../../lib/three/ThreeCanvas'
import { explainWithAi } from '../../lib/aiExplain'

type Part = { id: string; title: string; short: string; details: string; color: number; pos: [number, number, number]; r: number }

const parts: Part[] = [
  { id: 'membrane', title: 'Мембрана', short: 'Сарҳад', details: 'Назорати ворид/хориҷ ва алоқа бо муҳит.', color: 0x2dd4bf, pos: [0, 0, 0], r: 2.2 },
  { id: 'nucleus', title: 'Ядро', short: 'ДНК', details: 'Маълумоти ирсӣ ва идоракунии ҳуҷайра.', color: 0xa78bfa, pos: [-0.3, 0.2, 0.4], r: 0.85 },
  { id: 'mito1', title: 'Митохондрия', short: 'АТФ', details: 'Истеҳсоли энергия (АТФ).', color: 0x34d399, pos: [-1.0, -0.1, -0.2], r: 0.35 },
  { id: 'mito2', title: 'Митохондрия', short: 'АТФ', details: 'Истеҳсоли энергия (АТФ).', color: 0x34d399, pos: [0.9, -0.3, 0.2], r: 0.35 },
  { id: 'golgi', title: 'Голҷи', short: 'Бастабандӣ', details: 'Бастабандӣ ва фиристодани моддаҳо.', color: 0xfb7185, pos: [0.9, 0.6, -0.3], r: 0.45 },
  { id: 'ribo', title: 'Рибосома', short: 'Сафеда', details: 'Синтези сафедаҳо.', color: 0xfbbf24, pos: [-0.2, -0.8, 0.8], r: 0.18 },
]

export function CellExplorer3D() {
  const [pickedId, setPickedId] = useState(parts[1]!.id)
  const picked = useMemo(() => parts.find((p) => p.id === pickedId) ?? parts[0]!, [pickedId])

  const [aiOpen, setAiOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiErr, setAiErr] = useState<string | null>(null)

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Кашшофи ҳуҷайра (3D)</div>
            <div className="mt-1 text-xs text-bm-muted">Қисмро пахш кунед (клик) — маълумот/AI шарҳ</div>
          </div>
        </div>
        <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
          <ThreeCanvas
            className="h-[52vh] w-full"
            onInit={(ctx) => initCellScene(ctx, pickedId, setPickedId)}
            onFrame={(ctx, dt) => {
              ctx.scene.rotation.y += dt * 0.12
            }}
            enableControls
          />
        </div>
      </div>

      <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
        <div className="text-sm font-semibold">{picked.title}</div>
        <div className="mt-2 text-sm text-bm-muted">{picked.details}</div>

        <div className="mt-4 grid gap-2">
          {parts
            .filter((p, i, a) => a.findIndex((x) => x.title === p.title) === i)
            .map((p) => (
              <button
                key={p.title}
                onClick={() => setPickedId(p.id)}
                className={[
                  'rounded-2xl border px-4 py-3 text-left text-sm transition',
                  picked.title === p.title ? 'bg-white/10 border-white/20' : 'bg-white/5 border-bm-border hover:bg-white/8',
                ].join(' ')}
              >
                {p.title}
                <div className="mt-1 text-xs text-bm-muted">{p.short}</div>
              </button>
            ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={async () => {
              setAiOpen(true)
              setAiLoading(true)
              setAiText(null)
              setAiErr(null)
              try {
                const t = await explainWithAi({
                  title: `Ҳуҷайра (3D): ${picked.title}`,
                  content: `${picked.details}\n\nЛутфан мисолҳо ва 3 саволи санҷишӣ биёвар.`,
                  gradeLabel: '5–11',
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

function initCellScene(ctx: ThreeContext, pickedId: string, setPickedId: (id: string) => void) {
  const { scene, camera, renderer, root } = ctx
  scene.clear()
  camera.position.set(0, 2.0, 6.2)
  camera.lookAt(0, 0, 0)

  const amb = new THREE.AmbientLight(0xffffff, 0.55)
  scene.add(amb)
  const dir = new THREE.DirectionalLight(0xffffff, 0.85)
  dir.position.set(4, 6, 5)
  scene.add(dir)

  const cellGeo = new THREE.SphereGeometry(2.2, 48, 32)
  const cellMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b1220,
    roughness: 0.35,
    metalness: 0.0,
    transmission: 0.25,
    transparent: true,
    opacity: 0.55,
    thickness: 0.6,
    emissive: 0x001018,
    emissiveIntensity: 0.6,
  })
  const cell = new THREE.Mesh(cellGeo, cellMat)
  cell.userData = { id: 'membrane' }
  scene.add(cell)

  const group = new THREE.Group()
  scene.add(group)

  const meshes: THREE.Mesh[] = []
  for (const p of parts) {
    if (p.id === 'membrane') continue
    const geo = new THREE.SphereGeometry(p.r, 28, 20)
    const mat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.4, metalness: 0.05, emissive: p.color, emissiveIntensity: 0.15 })
    const m = new THREE.Mesh(geo, mat)
    m.position.set(p.pos[0], p.pos[1], p.pos[2])
    m.userData = { id: p.id }
    group.add(m)
    meshes.push(m)
  }

  // highlight ring (simple)
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.0, 0.05, 12, 72),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.35 }),
  )
  ring.visible = false
  scene.add(ring)

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  const pickAt = (clientX: number, clientY: number) => {
    const rect = root.getBoundingClientRect()
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -(((clientY - rect.top) / rect.height) * 2 - 1)
    raycaster.setFromCamera(mouse, camera)
    const hits = raycaster.intersectObjects([cell, ...meshes], false)
    const hit = hits[0]?.object as THREE.Object3D | undefined
    const id = (hit?.userData as { id?: string } | undefined)?.id
    if (id) {
      setPickedId(id)
      const part = parts.find((x) => x.id === id)
      if (part && id !== 'membrane') {
        ring.visible = true
        ring.position.copy((hit as THREE.Mesh).position)
        ring.rotation.set(Math.PI / 2, 0, 0)
        ring.scale.setScalar(Math.max(0.9, part.r * 1.8))
      } else {
        ring.visible = false
      }
    }
  }

  const onClick = (e: MouseEvent) => pickAt(e.clientX, e.clientY)
  renderer.domElement.addEventListener('click', onClick)

  // init highlight
  const initial = parts.find((x) => x.id === pickedId)
  if (initial && pickedId !== 'membrane') {
    ring.visible = true
    ring.position.set(initial.pos[0], initial.pos[1], initial.pos[2])
    ring.rotation.set(Math.PI / 2, 0, 0)
    ring.scale.setScalar(Math.max(0.9, initial.r * 1.8))
  }

  return () => {
    renderer.domElement.removeEventListener('click', onClick)
    cellGeo.dispose()
    cellMat.dispose()
    for (const m of meshes) {
      ;(m.geometry as THREE.BufferGeometry).dispose()
      ;(m.material as THREE.Material).dispose()
    }
    ;(ring.geometry as THREE.BufferGeometry).dispose()
    ;(ring.material as THREE.Material).dispose()
  }
}


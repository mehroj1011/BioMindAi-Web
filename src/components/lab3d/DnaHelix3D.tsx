import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { ThreeCanvas, type ThreeContext } from '../../lib/three/ThreeCanvas'
import { explainWithAi } from '../../lib/aiExplain'

type Pair = { id: string; left: 'A' | 'T' | 'G' | 'C'; right: 'A' | 'T' | 'G' | 'C' }

function complement(b: Pair['left']): Pair['right'] {
  if (b === 'A') return 'T'
  if (b === 'T') return 'A'
  if (b === 'G') return 'C'
  return 'G'
}

function baseColor(b: Pair['left'] | Pair['right']) {
  if (b === 'A') return 0x60a5fa // blue
  if (b === 'T') return 0x34d399 // green
  if (b === 'G') return 0xa78bfa // purple
  return 0xfbbf24 // C amber
}

export function DnaHelix3D({ length = 36 }: { length?: number }) {
  const pairs = useMemo<Pair[]>(() => {
    const bases: Pair['left'][] = ['A', 'T', 'G', 'C']
    const out: Pair[] = []
    for (let i = 0; i < length; i++) {
      const left = bases[i % bases.length]!
      out.push({ id: `bp-${i}`, left, right: complement(left) })
    }
    return out
  }, [length])

  const [picked, setPicked] = useState<Pair | null>(pairs[0] ?? null)

  const [aiOpen, setAiOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiErr, setAiErr] = useState<string | null>(null)

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
        <div className="text-sm font-semibold">ДНК (3D) — double helix</div>
        <div className="mt-1 text-xs text-bm-muted">Клик ба базаҳо (A/T/G/C) — интихоб + шарҳ</div>
        <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
          <ThreeCanvas
            className="h-[52vh] w-full"
            onInit={(ctx) => initDnaScene(ctx, pairs, setPicked)}
            onFrame={(ctx, dt) => {
              // subtle premium motion
              ctx.scene.rotation.y += dt * 0.08
            }}
            enableControls
          />
        </div>
      </div>

      <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
        <div className="text-sm font-semibold">Интихоб</div>
        <div className="mt-2 text-sm text-bm-muted">
          {picked ? (
            <>
              Пайванд: <span className="font-mono text-bm-text">{picked.left}–{picked.right}</span>
            </>
          ) : (
            'Як база/пайвандро интихоб кунед.'
          )}
        </div>

        <div className="mt-3 rounded-2xl border border-bm-border bg-white/5 p-3 text-xs text-bm-muted">
          Қоида: <span className="font-mono text-bm-text">A–T</span> ва <span className="font-mono text-bm-text">G–C</span>
        </div>

        <button
          onClick={async () => {
            setAiOpen(true)
            setAiLoading(true)
            setAiText(null)
            setAiErr(null)
            try {
              const t = await explainWithAi({
                title: 'ДНК: double helix',
                gradeLabel: '5–11',
                content: [
                  picked ? `Интихоб: ${picked.left}-${picked.right}` : 'Интихоб нест',
                  '',
                  'Лутфан фаҳмон: ДНК чист, базаҳо чӣ, чаро ҷуфтшавӣ A–T ва G–C аст, ва репликация чӣ гуна мешавад (кӯтоҳ).',
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

function initDnaScene(ctx: ThreeContext, pairs: Pair[], setPicked: (p: Pair | null) => void) {
  const { scene, camera, renderer, root } = ctx
  scene.clear()
  camera.position.set(0, 3.0, 9.0)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.HemisphereLight(0x9bdcff, 0x0b1220, 0.78))
  scene.add(new THREE.AmbientLight(0xffffff, 0.12))
  const dir = new THREE.DirectionalLight(0xffffff, 0.95)
  dir.position.set(6, 10, 6)
  dir.castShadow = true
  dir.shadow.mapSize.set(1024, 1024)
  scene.add(dir)

  const group = new THREE.Group()
  scene.add(group)

  const backboneGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.7, 16)
  const linkGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.6, 16)
  const baseGeo = new THREE.SphereGeometry(0.18, 22, 16)

  const backMatL = new THREE.MeshPhysicalMaterial({ color: 0x82cdf0, roughness: 0.35, metalness: 0.05, clearcoat: 0.5, clearcoatRoughness: 0.35 })
  const backMatR = new THREE.MeshPhysicalMaterial({ color: 0xfff0b4, roughness: 0.35, metalness: 0.05, clearcoat: 0.5, clearcoatRoughness: 0.35 })
  const linkMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65, metalness: 0.0, opacity: 0.35, transparent: true })

  const meshes: THREE.Mesh[] = []
  const indexToPair: Pair[] = []

  const radius = 2.0
  const stepY = 0.22
  const twist = (Math.PI * 2) / 10.0

  for (let i = 0; i < pairs.length; i++) {
    const p = pairs[i]!
    const ang = i * twist
    const y = (i - pairs.length / 2) * stepY

    const lx = Math.cos(ang) * radius
    const lz = Math.sin(ang) * radius
    const rx = Math.cos(ang + Math.PI) * radius
    const rz = Math.sin(ang + Math.PI) * radius

    // backbone segments
    const segL = new THREE.Mesh(backboneGeo, backMatL)
    segL.position.set(lx, y, lz)
    segL.rotation.z = Math.PI / 2
    segL.castShadow = true
    group.add(segL)

    const segR = new THREE.Mesh(backboneGeo, backMatR)
    segR.position.set(rx, y, rz)
    segR.rotation.z = Math.PI / 2
    segR.castShadow = true
    group.add(segR)

    // bases
    const baseL = new THREE.Mesh(
      baseGeo,
      new THREE.MeshStandardMaterial({ color: baseColor(p.left), roughness: 0.35, metalness: 0.05, emissive: baseColor(p.left), emissiveIntensity: 0.08 }),
    )
    baseL.position.set(lx * 0.78, y, lz * 0.78)
    baseL.userData = { idx: i }
    baseL.castShadow = true
    group.add(baseL)
    meshes.push(baseL)
    indexToPair.push(p)

    const baseR = new THREE.Mesh(
      baseGeo,
      new THREE.MeshStandardMaterial({ color: baseColor(p.right), roughness: 0.35, metalness: 0.05, emissive: baseColor(p.right), emissiveIntensity: 0.08 }),
    )
    baseR.position.set(rx * 0.78, y, rz * 0.78)
    baseR.userData = { idx: i }
    baseR.castShadow = true
    group.add(baseR)
    meshes.push(baseR)
    indexToPair.push(p)

    // base pair link
    const link = new THREE.Mesh(linkGeo, linkMat)
    link.position.set(0, y, 0)
    link.rotation.y = ang
    group.add(link)
  }

  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(4.4, 4.4, 0.22, 48),
    new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.95 }),
  )
  plate.position.set(0, -(pairs.length / 2) * stepY - 0.5, 0)
  plate.receiveShadow = true
  scene.add(plate)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.05, 12, 80),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.25 }),
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
    const hits = raycaster.intersectObjects(meshes, false)
    const hit = hits[0]?.object as THREE.Mesh | undefined
    const idx = (hit?.userData as { idx?: number } | undefined)?.idx
    if (typeof idx === 'number') {
      setPicked(pairs[idx] ?? null)
      ring.visible = true
      ring.position.copy(hit!.position)
      ring.scale.setScalar(1.0)
    }
  }
  const onClick = (e: MouseEvent) => pickAt(e.clientX, e.clientY)
  renderer.domElement.addEventListener('click', onClick)

  return () => {
    renderer.domElement.removeEventListener('click', onClick)
    backboneGeo.dispose()
    linkGeo.dispose()
    baseGeo.dispose()
    backMatL.dispose()
    backMatR.dispose()
    linkMat.dispose()
    ;(plate.geometry as THREE.BufferGeometry).dispose()
    ;(plate.material as THREE.Material).dispose()
    ;(ring.geometry as THREE.BufferGeometry).dispose()
    ;(ring.material as THREE.Material).dispose()
  }
}


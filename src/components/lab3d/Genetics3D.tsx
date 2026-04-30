import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { ThreeCanvas, type ThreeContext } from '../../lib/three/ThreeCanvas'
import { explainWithAi } from '../../lib/aiExplain'

export function Genetics3D({
  punnett,
  dom,
}: {
  punnett: string[][]
  dom: string
}) {
  const flat = useMemo(() => punnett.flat(), [punnett])
  const [pickedIdx, setPickedIdx] = useState<number>(0)
  const picked = flat[pickedIdx] ?? flat[0] ?? ''

  const [aiOpen, setAiOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiErr, setAiErr] = useState<string | null>(null)

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Генетика (3D) — решёткаи Пеннета</div>
            <div className="mt-1 text-xs text-bm-muted">Кубро пахш кунед → генотип ва шарҳ</div>
          </div>
        </div>
        <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
          <ThreeCanvas
            className="h-[44vh] w-full"
            onInit={(ctx) => initPunnettScene(ctx, punnett, dom, pickedIdx, setPickedIdx)}
            enableControls
          />
        </div>
      </div>

      <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
        <div className="text-sm font-semibold">Интихоб</div>
        <div className="mt-2 text-sm text-bm-muted">
          Генотип: <span className="font-mono text-bm-text">{picked}</span>
        </div>
        <div className="mt-2 text-xs text-bm-muted">
          Ранг: доминант зиёдтар — сабз, рецессив зиёдтар — бунафш.
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
                  title: 'Генетика: решёткаи Пеннета',
                  gradeLabel: '5–11',
                  content: [
                    `Генотипи интихобшуда: ${picked}`,
                    `Доминант: ${dom}`,
                    '',
                    'Лутфан фаҳмон: генотип/фенотип чӣ аст, чаро ин генотип дар ин ҳуҷайра ҳосил шуд ва 2 мисол биёвар.',
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

function initPunnettScene(
  ctx: ThreeContext,
  punnett: string[][],
  dom: string,
  pickedIdx: number,
  setPickedIdx: (i: number) => void,
) {
  const { scene, camera, renderer, root } = ctx
  scene.clear()
  camera.position.set(0, 3.0, 7.8)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.HemisphereLight(0x9bdcff, 0x0b1220, 0.65))
  scene.add(new THREE.AmbientLight(0xffffff, 0.25))
  const dir = new THREE.DirectionalLight(0xffffff, 0.9)
  dir.position.set(5, 8, 6)
  dir.castShadow = true
  dir.shadow.mapSize.set(1024, 1024)
  scene.add(dir)

  const group = new THREE.Group()
  scene.add(group)

  const cubes: THREE.Mesh[] = []
  const labels = punnett.flat()
  const positions: [number, number, number][] = [
    [-1.2, 0.2, -1.2],
    [1.2, 0.2, -1.2],
    [-1.2, 0.2, 1.2],
    [1.2, 0.2, 1.2],
  ]

  const baseGeo = new THREE.BoxGeometry(1.4, 1.0, 1.4)
  for (let i = 0; i < 4; i++) {
    const gt = labels[i] ?? ''
    const domCount = gt.split('').filter((c) => c === dom).length
    const t = domCount / 2 // 0..1
    const col = new THREE.Color().setHSL(0.78 - t * 0.35, 0.75, 0.55) // purple -> greenish
    const mat = new THREE.MeshPhysicalMaterial({
      color: col,
      roughness: 0.35,
      metalness: 0.12,
      clearcoat: 0.65,
      clearcoatRoughness: 0.35,
      emissive: col,
      emissiveIntensity: 0.08,
    })
    const m = new THREE.Mesh(baseGeo, mat)
    const p = positions[i]!
    m.position.set(p[0], p[1], p[2])
    m.castShadow = true
    m.receiveShadow = true
    m.userData = { idx: i }
    group.add(m)
    cubes.push(m)

    // 3D label: genotype text above the cube
    const sprite = makeTextSprite(gt || '—')
    sprite.position.set(p[0], 1.0, p[2])
    group.add(sprite)
  }

  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.2, 5.2),
    new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.95, metalness: 0.0 }),
  )
  plate.position.set(0, -0.55, 0)
  plate.receiveShadow = true
  scene.add(plate)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.0, 0.06, 12, 80),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.25 }),
  )
  ring.rotation.set(Math.PI / 2, 0, 0)
  scene.add(ring)

  const applyHighlight = (i: number) => {
    const m = cubes[i]
    if (!m) return
    ring.position.copy(m.position)
    ring.position.y = -0.2
    ring.scale.setScalar(1.25)
  }
  applyHighlight(pickedIdx)

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  const pickAt = (clientX: number, clientY: number) => {
    const rect = root.getBoundingClientRect()
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -(((clientY - rect.top) / rect.height) * 2 - 1)
    raycaster.setFromCamera(mouse, camera)
    const hits = raycaster.intersectObjects(cubes, false)
    const hit = hits[0]?.object
    const idx = (hit?.userData as { idx?: number } | undefined)?.idx
    if (typeof idx === 'number') {
      setPickedIdx(idx)
      applyHighlight(idx)
    }
  }

  const onClick = (e: MouseEvent) => pickAt(e.clientX, e.clientY)
  renderer.domElement.addEventListener('click', onClick)

  return () => {
    renderer.domElement.removeEventListener('click', onClick)
    baseGeo.dispose()
    for (const m of cubes) {
      ;(m.material as THREE.Material).dispose()
    }
    ;(plate.geometry as THREE.BufferGeometry).dispose()
    ;(plate.material as THREE.Material).dispose()
    ;(ring.geometry as THREE.BufferGeometry).dispose()
    ;(ring.material as THREE.Material).dispose()
  }
}

function makeTextSprite(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const c = canvas.getContext('2d')!
  c.clearRect(0, 0, canvas.width, canvas.height)
  c.fillStyle = 'rgba(0,0,0,0.35)'
  roundRect(c, 10, 18, 236, 92, 22)
  c.fill()
  c.strokeStyle = 'rgba(255,255,255,0.18)'
  c.lineWidth = 2
  roundRect(c, 10, 18, 236, 92, 22)
  c.stroke()
  c.fillStyle = 'rgba(255,255,255,0.92)'
  c.font = 'bold 46px system-ui, -apple-system, Segoe UI, Roboto, Arial'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillText(text, canvas.width / 2, canvas.height / 2 + 10)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true })
  const s = new THREE.Sprite(mat)
  s.scale.set(1.6, 0.8, 1)
  return s
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

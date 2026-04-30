import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export type ThreeContext = {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  root: HTMLElement
}

export function ThreeCanvas({
  className,
  onInit,
  onFrame,
  enableControls,
}: {
  className?: string
  onInit: (ctx: ThreeContext) => (() => void) | void
  onFrame?: (ctx: ThreeContext, dt: number) => void
  enableControls?: boolean
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const reportErr = (msg: string | null) => {
    // Avoid setState directly in effect body (lint rule).
    window.setTimeout(() => setErr(msg), 0)
  }

  // Keep callbacks stable for the renderer lifecycle.
  const onInitRef = useRef(onInit)
  const onFrameRef = useRef(onFrame)
  useEffect(() => {
    onInitRef.current = onInit
    onFrameRef.current = onFrame
  }, [onInit, onFrame])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    reportErr(null)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch (e) {
      reportErr(String((e as Error)?.message || e))
      return
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x05070b, 8, 24)
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200)
    camera.position.set(0, 2.2, 6)

    host.appendChild(renderer.domElement)
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'

    const ctx: ThreeContext = { renderer, scene, camera, root: host }

    let disposed = false
    const resize = () => {
      if (disposed) return
      const w = Math.max(1, host.clientWidth)
      const h = Math.max(1, host.clientHeight)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    let cleanupUser: (() => void) | undefined
    try {
      cleanupUser = onInitRef.current(ctx) || undefined
    } catch (e) {
      reportErr(String((e as Error)?.message || e))
      // keep canvas, but stop loop
      disposed = true
    }

    // Minimal orbit controls (drag rotate + wheel zoom)
    const controlsEnabled = enableControls !== false
    const target = new THREE.Vector3(0, 0, 0)
    const spherical = new THREE.Spherical()
    spherical.setFromVector3(camera.position.clone().sub(target))
    let dragging = false
    let lastX = 0
    let lastY = 0

    const applyCamera = () => {
      const v = new THREE.Vector3().setFromSpherical(spherical).add(target)
      camera.position.copy(v)
      camera.lookAt(target)
    }
    applyCamera()

    const onDown = (e: PointerEvent) => {
      if (!controlsEnabled) return
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      ;(renderer.domElement as HTMLCanvasElement).setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!controlsEnabled || !dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      spherical.theta -= dx * 0.006
      spherical.phi -= dy * 0.006
      spherical.phi = Math.max(0.15, Math.min(Math.PI - 0.15, spherical.phi))
      applyCamera()
    }
    const onUp = (e: PointerEvent) => {
      if (!controlsEnabled) return
      dragging = false
      try {
        ;(renderer.domElement as HTMLCanvasElement).releasePointerCapture(e.pointerId)
      } catch {
        // ignore
      }
    }
    const onWheel = (e: WheelEvent) => {
      if (!controlsEnabled) return
      e.preventDefault()
      const delta = Math.sign(e.deltaY)
      spherical.radius *= delta > 0 ? 1.08 : 0.92
      spherical.radius = Math.max(2.8, Math.min(14, spherical.radius))
      applyCamera()
    }

    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('pointerup', onUp)
    renderer.domElement.addEventListener('pointercancel', onUp)
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false })

    let last = performance.now()
    const loop = (now: number) => {
      if (disposed) return
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
      last = now
      try {
        onFrameRef.current?.(ctx, dt)
      } catch (e) {
        reportErr(String((e as Error)?.message || e))
        disposed = true
        return
      }
      renderer.render(scene, camera)
      rafRef.current = window.requestAnimationFrame(loop)
    }
    rafRef.current = window.requestAnimationFrame(loop)

    return () => {
      disposed = true
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('pointerup', onUp)
      renderer.domElement.removeEventListener('pointercancel', onUp)
      renderer.domElement.removeEventListener('wheel', onWheel)
      try {
        cleanupUser?.()
      } catch {
        // ignore
      }
      renderer.dispose()
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement)
    }
  }, [enableControls])

  return (
    <div ref={hostRef} className={['relative', className ?? ''].join(' ')}>
      {err && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-3xl border border-red-400/25 bg-red-500/10 p-4 text-center">
          <div className="max-w-[520px]">
            <div className="text-xs font-semibold text-red-200">Хатои 3D</div>
            <div className="mt-2 whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-red-100">{err}</div>
          </div>
        </div>
      )}
    </div>
  )
}


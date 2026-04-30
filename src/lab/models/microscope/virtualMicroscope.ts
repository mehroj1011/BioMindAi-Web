import { getSampleById, type MicroscopeSample } from './samples'

export type VirtualMicroscopeParams = {
  sampleId: string
  /** target zoom (1..6) */
  zoom: number
  /** focus knob (0..1) */
  focus: number
  /** light intensity (0..1) */
  light: number
}

export type VirtualMicroscopeState = {
  sample: MicroscopeSample
  zoomActual: number
  /** computed blur px */
  blurPx: number
  /** computed brightness scalar */
  brightness: number
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

export function normalizeMicroscope(p: VirtualMicroscopeParams): VirtualMicroscopeParams {
  return {
    sampleId: (p.sampleId || '').trim() || getSampleById(null).id,
    zoom: clamp(p.zoom, 1, 6),
    focus: clamp(p.focus, 0, 1),
    light: clamp(p.light, 0, 1),
  }
}

export function createMicroscopeState(params: VirtualMicroscopeParams): VirtualMicroscopeState {
  const p = normalizeMicroscope(params)
  const sample = getSampleById(p.sampleId)
  return {
    sample,
    zoomActual: p.zoom,
    blurPx: 0,
    brightness: 1,
  }
}

export function stepMicroscope(state: VirtualMicroscopeState, params: VirtualMicroscopeParams, dt: number) {
  const p = normalizeMicroscope(params)
  const nextSample = getSampleById(p.sampleId)
  state.sample = nextSample

  // Smooth zoom animation (exponential smoothing)
  const z = state.zoomActual
  const target = p.zoom
  const speed = 10 // higher = faster converge
  const k = 1 - Math.exp(-speed * dt)
  state.zoomActual = z + (target - z) * k

  // Defocus blur model (quadratic around ideal focus)
  const df = Math.abs(p.focus - nextSample.idealFocus)
  const maxBlur = 14
  state.blurPx = clamp((df * df) * (maxBlur * 4.2), 0, maxBlur)

  // Light intensity -> brightness scalar with gentle floor
  state.brightness = 0.35 + 1.25 * p.light
}


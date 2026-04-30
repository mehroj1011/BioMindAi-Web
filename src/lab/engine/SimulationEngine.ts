import type { SimClock, SimulationModel, StepContext } from './types'

type EngineOptions = {
  dt?: number
  speed?: number
  paused?: boolean
  /** Limit UI notifications (Hz). Default 20. */
  notifyHz?: number
  /**
   * Fixed-step safety: maximum real time (seconds) we simulate per frame.
   * Prevents spiral-of-death on tab re-focus.
   */
  maxFrameTime?: number
  /**
   * Deterministic RNG seed.
   * If omitted, uses Math.random.
   */
  seed?: number
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class SimulationEngine<Params, State> {
  private model: SimulationModel<Params, State>
  private params: Params
  private state: State
  private clock: SimClock
  private lastError: string | null = null
  private accumulator = 0
  private lastNow = 0
  private raf: number | null = null
  private readonly maxFrameTime: number
  private readonly rand: () => number
  private onTick: ((snapshot: { state: State; params: Params; clock: SimClock; error?: string | null }) => void) | null = null
  private readonly notifyEveryS: number
  private lastEmitAtT = 0

  constructor(model: SimulationModel<Params, State>, params: Params, opts?: EngineOptions) {
    this.model = model
    const dt = opts?.dt ?? 1 / 60
    this.clock = {
      t: 0,
      dt,
      speed: opts?.speed ?? 1,
      paused: opts?.paused ?? false,
    }
    this.maxFrameTime = opts?.maxFrameTime ?? 0.25
    const hz = opts?.notifyHz ?? 20
    this.notifyEveryS = hz <= 0 ? 0 : 1 / hz
    this.rand = typeof opts?.seed === 'number' ? mulberry32(opts.seed) : Math.random
    this.params = this.model.normalizeParams ? this.model.normalizeParams(params) : params
    try {
      this.state = this.model.createState(this.params, this.makeCtx())
    } catch (e) {
      // Fail-safe: keep engine alive but paused; UI can show error + allow reset.
      this.lastError = String((e as Error)?.message || e)
      this.clock = { ...this.clock, paused: true }
      this.state = {} as State
    }
  }

  private makeCtx(): StepContext {
    return { clock: this.clock, rand: this.rand }
  }

  getSnapshot() {
    return { state: this.state, params: this.params, clock: this.clock, error: this.lastError }
  }

  setOnTick(fn: ((snapshot: { state: State; params: Params; clock: SimClock; error?: string | null }) => void) | null) {
    this.onTick = fn
    if (fn) this.emit()
  }

  setPaused(paused: boolean) {
    this.clock = { ...this.clock, paused }
    this.emit()
  }

  setSpeed(speed: number) {
    const s = Number.isFinite(speed) ? Math.max(0, Math.min(8, speed)) : 1
    this.clock = { ...this.clock, speed: s }
    this.emit()
  }

  setParams(patch: Partial<Params> | ((p: Params) => Params)) {
    const next = typeof patch === 'function' ? patch(this.params) : ({ ...(this.params as object), ...(patch as object) } as Params)
    this.params = this.model.normalizeParams ? this.model.normalizeParams(next) : next
    // param patch should not keep a stale error around
    this.lastError = null
    this.emit()
  }

  reset(params?: Params) {
    if (params) this.params = this.model.normalizeParams ? this.model.normalizeParams(params) : params
    this.clock = { ...this.clock, t: 0 }
    this.accumulator = 0
    this.lastError = null
    try {
      this.state = this.model.createState(this.params, this.makeCtx())
    } catch (e) {
      this.lastError = String((e as Error)?.message || e)
      this.clock = { ...this.clock, paused: true }
      this.state = {} as State
    }
    this.emit()
  }

  stepOnce() {
    const ctx = this.makeCtx()
    if (this.lastError) return
    try {
      this.model.step(this.state, this.params, ctx)
      this.clock = { ...this.clock, t: this.clock.t + this.clock.dt }
      this.emit()
    } catch (e) {
      this.lastError = String((e as Error)?.message || e)
      this.clock = { ...this.clock, paused: true }
      this.emit()
    }
  }

  start() {
    if (this.raf != null) return
    this.lastNow = performance.now()
    const loop = (now: number) => {
      this.raf = window.requestAnimationFrame(loop)
      const realDt = Math.min(this.maxFrameTime, Math.max(0, (now - this.lastNow) / 1000))
      this.lastNow = now
      if (this.clock.paused || this.clock.speed === 0) return
      if (this.lastError) return
      this.accumulator += realDt * this.clock.speed
      const fixed = this.clock.dt
      const ctx = this.makeCtx()
      // fixed-step integration
      while (this.accumulator >= fixed) {
        try {
          this.model.step(this.state, this.params, ctx)
          this.clock = { ...this.clock, t: this.clock.t + fixed }
          this.accumulator -= fixed
        } catch (e) {
          this.lastError = String((e as Error)?.message || e)
          this.clock = { ...this.clock, paused: true }
          this.accumulator = 0
          this.emit()
          return
        }
      }
      // Avoid re-rendering React at 60fps: emit at a limited rate.
      if (this.notifyEveryS === 0 || this.clock.t - this.lastEmitAtT >= this.notifyEveryS) {
        this.lastEmitAtT = this.clock.t
        this.emit()
      }
    }
    this.raf = window.requestAnimationFrame(loop)
  }

  stop() {
    if (this.raf != null) window.cancelAnimationFrame(this.raf)
    this.raf = null
  }

  dispose() {
    this.stop()
    this.onTick = null
  }

  private emit() {
    this.onTick?.(this.getSnapshot())
  }
}


export type SimId = string

export type SimClock = {
  /** Simulation time (seconds). */
  t: number
  /** Fixed step (seconds). */
  dt: number
  /** Real-time speed multiplier. */
  speed: number
  /** Paused flag. */
  paused: boolean
}

export type StepContext = {
  clock: SimClock
  /** Random generator for deterministic runs (if provided). */
  rand: () => number
}

export type SimulationModel<Params, State> = {
  /** Unique stable id for caching/serialization. */
  id: SimId
  /** Human label for UI. */
  title: string
  /** Short description for UI. */
  description: string

  /** Default params (editable in UI). */
  defaultParams: Params
  /** Create initial state from params. Must be pure/deterministic given ctx.rand. */
  createState: (params: Params, ctx: StepContext) => State
  /** Advance simulation by one fixed dt step. Must mutate or return new state consistently. */
  step: (state: State, params: Params, ctx: StepContext) => void

  /** Optional: validate/sanitize parameters. */
  normalizeParams?: (params: Params) => Params

  /** Optional: serialize/restore for persistence. */
  serializeState?: (state: State) => unknown
  deserializeState?: (raw: unknown) => State | null
}


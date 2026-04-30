export type LotkaVolterraParams = {
  prey0: number
  pred0: number
  /** prey growth rate (α) */
  alpha: number
  /** predation rate (β) */
  beta: number
  /** predator death rate (γ) */
  gamma: number
  /** predator reproduction efficiency (δ) */
  delta: number
  /** optional carrying capacity for prey (K). If <=0, disabled */
  carryingCapacity: number
}

export type LotkaVolterraState = {
  prey: number
  pred: number
  /** rolling time series for UI plotting */
  series: { t: number; prey: number; pred: number }[]
  lastSampleT: number
}

export function normalizeLV(p: LotkaVolterraParams): LotkaVolterraParams {
  const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))
  return {
    prey0: clamp(p.prey0, 1, 400),
    pred0: clamp(p.pred0, 0, 200),
    alpha: clamp(p.alpha, 0, 5),
    beta: clamp(p.beta, 0, 5),
    gamma: clamp(p.gamma, 0, 5),
    delta: clamp(p.delta, 0, 5),
    carryingCapacity: clamp(p.carryingCapacity, 0, 2000),
  }
}

function deriv(prey: number, pred: number, p: LotkaVolterraParams) {
  const preyEff = p.carryingCapacity > 0 ? prey * (1 - prey / p.carryingCapacity) : prey
  const dPrey = p.alpha * preyEff - p.beta * prey * pred
  const dPred = p.delta * prey * pred - p.gamma * pred
  return { dPrey, dPred }
}

/** RK4 integrator for better stability in real-time stepping. */
export function stepLotkaVolterra(state: LotkaVolterraState, params: LotkaVolterraParams, t: number, dt: number) {
  const prey0 = state.prey
  const pred0 = state.pred

  const k1 = deriv(prey0, pred0, params)
  const k2 = deriv(prey0 + (dt * k1.dPrey) / 2, pred0 + (dt * k1.dPred) / 2, params)
  const k3 = deriv(prey0 + (dt * k2.dPrey) / 2, pred0 + (dt * k2.dPred) / 2, params)
  const k4 = deriv(prey0 + dt * k3.dPrey, pred0 + dt * k3.dPred, params)

  const prey = Math.max(0, prey0 + (dt / 6) * (k1.dPrey + 2 * k2.dPrey + 2 * k3.dPrey + k4.dPrey))
  const pred = Math.max(0, pred0 + (dt / 6) * (k1.dPred + 2 * k2.dPred + 2 * k3.dPred + k4.dPred))

  state.prey = prey
  state.pred = pred

  // Downsample series logging (keeps charts cheap)
  const sampleEvery = 0.15
  if (t - (state.lastSampleT ?? -1e9) >= sampleEvery) {
    state.lastSampleT = t
    state.series.push({ t, prey, pred })
    const minT = t - 25
    while (state.series.length > 2 && state.series[0]!.t < minT) state.series.shift()
  }
}


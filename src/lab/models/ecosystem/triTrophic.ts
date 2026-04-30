export type TriTrophicParams = {
  plants0: number
  herbivores0: number
  predators0: number
  /** °C */
  temperature: number
  /** mm/month (simplified) */
  rainfall: number
}

export type TriTrophicState = {
  plants: number
  herbivores: number
  predators: number
  /** 0..1 */
  balance: number
  series: Array<{ t: number; plants: number; herbivores: number; predators: number; balance: number }>
  lastSampleT: number
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

export function normalizeTri(p: TriTrophicParams): TriTrophicParams {
  return {
    plants0: clamp(p.plants0, 1, 2000),
    herbivores0: clamp(p.herbivores0, 0, 800),
    predators0: clamp(p.predators0, 0, 300),
    temperature: clamp(p.temperature, -5, 45),
    rainfall: clamp(p.rainfall, 0, 500),
  }
}

function smoothStep01(x: number) {
  const t = clamp(x, 0, 1)
  return t * t * (3 - 2 * t)
}

/**
 * Environment → plant productivity scalars.
 * This is intentionally simplified but behaves plausibly:
 * - temp optimum around 24°C (bell-like)
 * - rainfall saturates after ~250mm
 */
function envProductivity(tempC: number, rain: number) {
  // temp bell around 24°C with width ~12°C
  const t = (tempC - 24) / 12
  const tempScalar = Math.exp(-t * t) // 0..1
  // rainfall saturation 0..1
  const rainScalar = smoothStep01(rain / 250)
  const prod = clamp(tempScalar * (0.35 + 0.65 * rainScalar), 0.05, 1.0)
  return { tempScalar, rainScalar, prod }
}

type InternalRates = {
  r: number
  K: number
  cPH: number
  ePH: number
  mH: number
  cHP: number
  eHP: number
  mP: number
}

function rates(params: TriTrophicParams): InternalRates {
  const { prod } = envProductivity(params.temperature, params.rainfall)
  // Units are per-second-like since engine dt is seconds. Keep small for stability.
  const rBase = 0.18
  const KBase = 900
  return {
    r: rBase * prod, // plant intrinsic growth
    K: KBase * (0.55 + 0.65 * prod), // carrying capacity influenced by env
    cPH: 0.00055, // herb consumption coefficient
    ePH: 0.18, // conversion plants→herbivores
    mH: 0.06, // herbivore natural mortality
    cHP: 0.00075, // predator consumption coefficient
    eHP: 0.14, // conversion herbivores→predators
    mP: 0.08, // predator natural mortality
  }
}

function deriv(plants: number, herb: number, pred: number, p: TriTrophicParams) {
  const k = rates(p)
  const dPlants = k.r * plants * (1 - plants / k.K) - k.cPH * plants * herb
  const dHerb = k.ePH * k.cPH * plants * herb - k.mH * herb - k.cHP * herb * pred
  const dPred = k.eHP * k.cHP * herb * pred - k.mP * pred
  return { dPlants, dHerb, dPred }
}

/** RK4 integrator for stability in real-time. */
export function stepTriTrophic(state: TriTrophicState, params: TriTrophicParams, t: number, dt: number) {
  const p = normalizeTri(params)
  const x0 = state.plants
  const y0 = state.herbivores
  const z0 = state.predators

  const k1 = deriv(x0, y0, z0, p)
  const k2 = deriv(x0 + (dt * k1.dPlants) / 2, y0 + (dt * k1.dHerb) / 2, z0 + (dt * k1.dPred) / 2, p)
  const k3 = deriv(x0 + (dt * k2.dPlants) / 2, y0 + (dt * k2.dHerb) / 2, z0 + (dt * k2.dPred) / 2, p)
  const k4 = deriv(x0 + dt * k3.dPlants, y0 + dt * k3.dHerb, z0 + dt * k3.dPred, p)

  const plants = Math.max(0, x0 + (dt / 6) * (k1.dPlants + 2 * k2.dPlants + 2 * k3.dPlants + k4.dPlants))
  const herbivores = Math.max(0, y0 + (dt / 6) * (k1.dHerb + 2 * k2.dHerb + 2 * k3.dHerb + k4.dHerb))
  const predators = Math.max(0, z0 + (dt / 6) * (k1.dPred + 2 * k2.dPred + 2 * k3.dPred + k4.dPred))

  state.plants = plants
  state.herbivores = herbivores
  state.predators = predators

  // Balance metric: low relative change over a short window => higher balance.
  // (tool-like signal for “ecosystem equilibrium-ish”)
  const rel = (a: number, b: number) => (a <= 0 || b <= 0 ? 1 : Math.abs(a - b) / Math.max(1e-6, (a + b) / 2))
  const prev = state.series[state.series.length - 1]
  const drift = prev ? (rel(prev.plants, plants) + rel(prev.herbivores, herbivores) + rel(prev.predators, predators)) / 3 : 1
  const balanceNow = clamp(1 - drift * 12, 0, 1)
  state.balance = 0.88 * state.balance + 0.12 * balanceNow

  const sampleEvery = 0.15
  if (t - (state.lastSampleT ?? -1e9) >= sampleEvery) {
    state.lastSampleT = t
    state.series.push({ t, plants, herbivores, predators, balance: state.balance })
    const minT = t - 30
    while (state.series.length > 2 && state.series[0]!.t < minT) state.series.shift()
  }
}


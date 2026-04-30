import type { SimulationModel } from '../../engine/types'
import { normalizeLV, stepLotkaVolterra, type LotkaVolterraParams, type LotkaVolterraState } from '../../models/ecosystem/lotkaVolterra'

export const EcosystemSim: SimulationModel<LotkaVolterraParams, LotkaVolterraState> = {
  id: 'lab.ecosystem.lotka-volterra',
  title: 'Экосистема',
  description: 'Модели predator–prey (Лотка–Волтерра) бо ҳисобкунии real-time ва устувории RK4.',
  defaultParams: {
    prey0: 60,
    pred0: 12,
    alpha: 1.1,
    beta: 0.02,
    gamma: 0.9,
    delta: 0.015,
    carryingCapacity: 250,
  },
  normalizeParams: normalizeLV,
  createState: (params, ctx) => {
    const p = normalizeLV(params)
    const s: LotkaVolterraState = {
      prey: p.prey0,
      pred: p.pred0,
      series: [{ t: 0, prey: p.prey0, pred: p.pred0 }],
      lastSampleT: 0,
    }
    // small random perturbation (deterministic via ctx.rand if seeded)
    const jitter = () => (ctx.rand() - 0.5) * 0.0005
    s.prey = Math.max(0, s.prey * (1 + jitter()))
    s.pred = Math.max(0, s.pred * (1 + jitter()))
    return s
  },
  step: (state, params, ctx) => {
    stepLotkaVolterra(state, normalizeLV(params), ctx.clock.t + ctx.clock.dt, ctx.clock.dt)
  },
}


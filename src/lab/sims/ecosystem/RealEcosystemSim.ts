import type { SimulationModel } from '../../engine/types'
import { normalizeTri, stepTriTrophic, type TriTrophicParams, type TriTrophicState } from '../../models/ecosystem/triTrophic'

export const RealEcosystemSim: SimulationModel<TriTrophicParams, TriTrophicState> = {
  id: 'lab.ecosystem.real',
  title: 'Экосистема (реалӣ)',
  description: 'Растаниҳо → herbivores → predators бо афзоиши логистикӣ ва таъсири ҳарорат/боришот. Real-time + диаграммаҳои зинда.',
  defaultParams: {
    plants0: 520,
    herbivores0: 80,
    predators0: 18,
    temperature: 24,
    rainfall: 210,
  },
  normalizeParams: normalizeTri,
  createState: (params) => {
    const p = normalizeTri(params)
    const s: TriTrophicState = {
      plants: p.plants0,
      herbivores: p.herbivores0,
      predators: p.predators0,
      balance: 0.3,
      series: [{ t: 0, plants: p.plants0, herbivores: p.herbivores0, predators: p.predators0, balance: 0.3 }],
      lastSampleT: 0,
    }
    return s
  },
  step: (state, params, ctx) => {
    stepTriTrophic(state, normalizeTri(params), ctx.clock.t + ctx.clock.dt, ctx.clock.dt)
  },
}


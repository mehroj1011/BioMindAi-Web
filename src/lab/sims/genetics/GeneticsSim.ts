import type { SimulationModel } from '../../engine/types'
import { computeMendelianState, normalizeMendelian, type MendelianParams, type MendelianState } from '../../models/genetics/mendelian'

export const GeneticsSim: SimulationModel<MendelianParams, MendelianState> = {
  id: 'lab.genetics.mendelian',
  title: 'Генетика',
  description: 'Кросси Менделӣ (яксумфат). Решёткаи Пеннета + фоизҳои генотип/фенотип.',
  defaultParams: {
    dominantAllele: 'A',
    recessiveAllele: 'a',
    parent1: 'Aa',
    parent2: 'Aa',
  },
  normalizeParams: normalizeMendelian,
  createState: (params) => computeMendelianState(params),
  step: (state, params) => {
    // Deterministic “analysis model”:
    // in a real lab tool, “step” is used for animations; the math is recomputed from params.
    const next = computeMendelianState(params)
    state.p1 = next.p1
    state.p2 = next.p2
    state.g1 = next.g1
    state.g2 = next.g2
    state.punnett = next.punnett
    state.genotypePct = next.genotypePct
    state.phenotypePct = next.phenotypePct
  },
}


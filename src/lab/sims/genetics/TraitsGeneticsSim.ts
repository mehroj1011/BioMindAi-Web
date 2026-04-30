import type { SimulationModel } from '../../engine/types'
import { computeMultiTraitState, normalizeMultiTrait, type MultiTraitParams, type MultiTraitState } from '../../models/genetics/multiTrait'

export const TraitsGeneticsSim: SimulationModel<MultiTraitParams, MultiTraitState> = {
  id: 'lab.genetics.traits',
  title: 'Генетика (traits)',
  description: 'Ранги чашм + ранги мӯй + гурӯҳи хун (ABO). Решёткаи Пеннета, доминант/рецессив, эҳтимолият ва шарҳ.',
  defaultParams: {
    eyesP1: 'Bb',
    eyesP2: 'Bb',
    hairP1: 'Dd',
    hairP2: 'Dd',
    bloodP1: 'AO',
    bloodP2: 'BO',
  },
  normalizeParams: normalizeMultiTrait,
  createState: (params) => computeMultiTraitState(params),
  step: (state, params) => {
    const next = computeMultiTraitState(params)
    state.eyes = next.eyes
    state.hair = next.hair
    state.blood = next.blood
    state.combinedTop = next.combinedTop
  },
}


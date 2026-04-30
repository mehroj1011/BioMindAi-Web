import type { SimulationModel } from '../../engine/types'
import {
  createSaveEcosystemState,
  defaultSaveEcosystemParams,
  normalizeSaveEcosystemParams,
  registerAdjustment,
  stepSaveEcosystem,
  type SaveEcosystemParams,
  type SaveEcosystemState,
} from '../../models/challenges/saveEcosystem'
import {
  createFixGeneticsState,
  defaultFixGeneticsParams,
  normalizeFixGeneticsParams,
  registerGeneticsAdjustment,
  stepFixGenetics,
  type FixGeneticsParams,
  type FixGeneticsState,
} from '../../models/challenges/fixGenetics'
import type { ChallengeId } from '../../models/challenges/types'

export type ChallengesParams = {
  scenario: ChallengeId
  // per-scenario params are nested (so UI can patch cleanly)
  eco: SaveEcosystemParams
  gen: FixGeneticsParams
  /** one-shot “adjustment happened” flag to penalize score (set by UI on param change) */
  adjusted?: boolean
}

export type ChallengesState = {
  scenario: ChallengeId
  eco: SaveEcosystemState
  gen: FixGeneticsState
}

export const ChallengesSim: SimulationModel<ChallengesParams, ChallengesState> = {
  id: 'lab.challenges',
  title: 'Сценарияҳо',
  description: 'Бозӣ/миссияҳо: “Нигоҳ доштани экосистема” ва “Ҳалли масъалаи генетикӣ”. Хол, муваффақ/ноком.',
  defaultParams: {
    scenario: 'save-ecosystem',
    eco: defaultSaveEcosystemParams(),
    gen: defaultFixGeneticsParams(),
    adjusted: false,
  },
  normalizeParams: (p) => {
    const scenario = p.scenario === 'fix-genetics' ? 'fix-genetics' : 'save-ecosystem'
    return {
      scenario,
      eco: normalizeSaveEcosystemParams(p.eco ?? defaultSaveEcosystemParams()),
      gen: normalizeFixGeneticsParams(p.gen ?? defaultFixGeneticsParams()),
      adjusted: Boolean(p.adjusted),
    }
  },
  createState: (params) => {
    const p = ChallengesSim.normalizeParams ? ChallengesSim.normalizeParams(params) : params
    return {
      scenario: p.scenario,
      eco: createSaveEcosystemState(p.eco),
      gen: createFixGeneticsState(p.gen),
    }
  },
  step: (state, params, ctx) => {
    const p = ChallengesSim.normalizeParams ? ChallengesSim.normalizeParams(params) : params
    state.scenario = p.scenario

    if (p.adjusted) {
      if (p.scenario === 'save-ecosystem') registerAdjustment(state.eco)
      else registerGeneticsAdjustment(state.gen)
    }

    stepSaveEcosystem(state.eco, p.eco, ctx.clock.t + ctx.clock.dt, ctx.clock.dt)
    stepFixGenetics(state.gen, p.gen, ctx.clock.t + ctx.clock.dt, ctx.clock.dt)
  },
}


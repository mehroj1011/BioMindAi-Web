import type { SimulationModel } from '../../engine/types'
import {
  applyMutation,
  createDnaState,
  normalizeDnaParams,
  startReplication,
  stepReplication,
  type DnaParams,
  type DnaState,
  type MutationType,
} from '../../models/dna/dnaModel'

export type DnaSimParams = DnaParams & {
  /** request an action from UI */
  action?: { kind: 'mutate'; mutation: MutationType } | { kind: 'replicate' } | { kind: 'clear-mismatch' } | null
}

export const DnaSim: SimulationModel<DnaSimParams, DnaState> = {
  id: 'lab.dna.sim',
  title: 'ДНК',
  description: 'Double helix (3D), ҷуфтҳои база (A–T, G–C), мутация ва репликация бо шарҳи омӯзишӣ.',
  defaultParams: {
    length: 36,
    spin: 0.65,
    autoSpin: true,
    action: null,
  },
  normalizeParams: (p) => {
    const base = normalizeDnaParams(p)
    return { ...base, action: p.action ?? null }
  },
  createState: (params, ctx) => createDnaState(params, ctx.rand),
  step: (state, params, ctx) => {
    const p = DnaSim.normalizeParams ? DnaSim.normalizeParams(params) : params

    // Handle one-shot actions
    const a = (p as DnaSimParams).action
    if (a?.kind === 'mutate') applyMutation(state, p, ctx.rand, ctx.clock.t, a.mutation)
    if (a?.kind === 'replicate') startReplication(state, ctx.clock.t)
    if (a?.kind === 'clear-mismatch') {
      state.mismatches.clear()
      state.effectText = 'Ҳолати мутация тоза шуд. Ҷуфтшавӣ боз муқаррарӣ ҳисобида мешавад.'
    }

    // replication progress if running
    stepReplication(state, ctx.clock.dt)
  },
}


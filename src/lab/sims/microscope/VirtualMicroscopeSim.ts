import type { SimulationModel } from '../../engine/types'
import {
  createMicroscopeState,
  normalizeMicroscope,
  stepMicroscope,
  type VirtualMicroscopeParams,
  type VirtualMicroscopeState,
} from '../../models/microscope/virtualMicroscope'

export const VirtualMicroscopeSim: SimulationModel<VirtualMicroscopeParams, VirtualMicroscopeState> = {
  id: 'lab.microscope.virtual',
  title: 'Микроскоп',
  description: 'Виртуалӣ: зум, фокус, равшанӣ + blur ҳангоми фокус нодуруст. Бо намунаҳои воқеии тасвирҳо.',
  defaultParams: {
    sampleId: 'onion-epidermis',
    zoom: 2.2,
    focus: 0.55,
    light: 0.65,
  },
  normalizeParams: normalizeMicroscope,
  createState: (params) => createMicroscopeState(params),
  step: (state, params, ctx) => {
    stepMicroscope(state, params, ctx.clock.dt)
  },
}


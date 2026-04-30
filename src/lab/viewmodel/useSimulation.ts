import { useEffect, useMemo, useRef, useState } from 'react'
import { SimulationEngine } from '../engine/SimulationEngine'
import type { SimClock, SimulationModel } from '../engine/types'

export type SimSnapshot<P, S> = { params: P; state: S; clock: SimClock; error?: string | null }

export function useSimulation<P, S>(model: SimulationModel<P, S>, initialParams?: P, opts?: { seed?: number }) {
  const engineRef = useRef<SimulationEngine<P, S> | null>(null)
  const [snap, setSnap] = useState<SimSnapshot<P, S> | null>(() => null)

  const params0 = useMemo(() => {
    const p = initialParams ?? model.defaultParams
    return model.normalizeParams ? model.normalizeParams(p) : p
  }, [initialParams, model])

  useEffect(() => {
    const eng = new SimulationEngine(model, params0, { seed: opts?.seed, notifyHz: 20 })
    engineRef.current = eng
    eng.setOnTick((s) => setSnap(s))
    // Start ticking; the first onTick will populate initial snapshot
    eng.start()
    return () => {
      eng.dispose()
      engineRef.current = null
    }
  }, [model, params0, opts?.seed])

  const api = useMemo(() => {
    return {
      setPaused: (v: boolean) => engineRef.current?.setPaused(v),
      togglePaused: () => {
        const e = engineRef.current
        if (!e) return
        e.setPaused(!e.getSnapshot().clock.paused)
      },
      setSpeed: (v: number) => engineRef.current?.setSpeed(v),
      setParams: (patch: Partial<P> | ((p: P) => P)) => engineRef.current?.setParams(patch),
      reset: (p?: P) => engineRef.current?.reset(p),
      stepOnce: () => engineRef.current?.stepOnce(),
    }
  }, [])

  return { snap, api }
}


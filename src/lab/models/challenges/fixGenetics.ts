import { computeMultiTraitState, normalizeMultiTrait, type MultiTraitParams } from '../genetics/multiTrait'
import type { ChallengeStatus, ScoreState } from './types'

export type FixGeneticsParams = MultiTraitParams & {
  playing: boolean
  timeLimitS: number
}

export type FixGeneticsState = {
  status: ChallengeStatus
  reason: string
  score: ScoreState
  remainingS: number
  target: {
    /** require at least this probability */
    blueEyesPct: number
    bloodOPct: number
  }
  result: {
    blueEyesPct: number
    bloodOPct: number
  }
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

export function defaultFixGeneticsParams(): FixGeneticsParams {
  return {
    eyesP1: 'Bb',
    eyesP2: 'Bb',
    hairP1: 'Dd',
    hairP2: 'Dd',
    bloodP1: 'AO',
    bloodP2: 'BO',
    playing: false,
    timeLimitS: 60,
  }
}

export function normalizeFixGeneticsParams(p: FixGeneticsParams): FixGeneticsParams {
  const base = normalizeMultiTrait(p)
  return {
    ...base,
    playing: Boolean(p.playing),
    timeLimitS: clamp(Number.isFinite(p.timeLimitS) ? p.timeLimitS : 60, 20, 180),
  }
}

export function createFixGeneticsState(params: FixGeneticsParams): FixGeneticsState {
  const p = normalizeFixGeneticsParams(params)
  const st = computeMultiTraitState(p)
  const blue = st.eyes.phenotypePct.find((x) => x.label.includes('кабуд'))?.pct ?? 0
  const o = st.blood.phenotypePct.find((x) => x.label.includes('O'))?.pct ?? 0
  return {
    status: 'ready',
    reason: 'Ҳадаф: эҳтимолияти “чашми кабуд” ва “гурӯҳи хун O”‑ро баланд кунед.',
    score: { score: 0, startedAtT: null, finishedAtT: null, adjustments: 0 },
    remainingS: p.timeLimitS,
    target: { blueEyesPct: 50, bloodOPct: 25 },
    result: { blueEyesPct: blue, bloodOPct: o },
  }
}

export function startFixGenetics(st: FixGeneticsState, nowT: number, params: FixGeneticsParams) {
  const p = normalizeFixGeneticsParams(params)
  st.status = 'running'
  st.reason = 'Танҳо генотипҳои волидонро интихоб кунед, то ҳадаф иҷро шавад.'
  st.score = { score: 1000, startedAtT: nowT, finishedAtT: null, adjustments: 0 }
  st.remainingS = p.timeLimitS
}

export function registerGeneticsAdjustment(st: FixGeneticsState) {
  if (st.status !== 'running') return
  st.score.adjustments += 1
  st.score.score = Math.max(0, st.score.score - 12)
}

export function stepFixGenetics(st: FixGeneticsState, params: FixGeneticsParams, t: number, _dt: number) {
  const p = normalizeFixGeneticsParams(params)
  void _dt

  if (!p.playing) {
    if (st.status === 'running') {
      st.status = 'ready'
      st.reason = 'Бозӣ қатъ шуд.'
    }
    return
  }
  if (st.status === 'ready') startFixGenetics(st, t, p)
  if (st.status !== 'running') return

  st.remainingS = Math.max(0, p.timeLimitS - (t - (st.score.startedAtT ?? t)))
  st.score.score = Math.max(0, st.score.score - 0.45)

  const res = computeMultiTraitState(p)
  const blue = res.eyes.phenotypePct.find((x) => x.label.includes('кабуд'))?.pct ?? 0
  const o = res.blood.phenotypePct.find((x) => x.label.includes('O'))?.pct ?? 0
  st.result = { blueEyesPct: blue, bloodOPct: o }

  const ok = blue >= st.target.blueEyesPct && o >= st.target.bloodOPct
  if (ok) {
    st.status = 'success'
    st.reason = 'Муваффақ: эҳтимолиятҳо ба ҳадаф расиданд.'
    st.score.finishedAtT = t
    st.score.score = Math.round(st.score.score + 220 - st.score.adjustments * 10)
    return
  }

  if (st.remainingS <= 0.001) {
    st.status = 'failure'
    st.reason = 'Вақт тамом шуд. Ҳадаф иҷро нашуд.'
    st.score.finishedAtT = t
  }
}


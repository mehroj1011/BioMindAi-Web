import { normalizeTri, stepTriTrophic, type TriTrophicParams, type TriTrophicState } from '../ecosystem/triTrophic'
import type { ChallengeStatus, ScoreState } from './types'

export type SaveEcosystemParams = TriTrophicParams & {
  /** start/stop scenario */
  playing: boolean
  /** hard mode toggles */
  hard: boolean
  /** time limit (s) */
  timeLimitS: number
}

export type SaveEcosystemState = {
  status: ChallengeStatus
  reason: string
  eco: TriTrophicState
  score: ScoreState
  /** seconds remaining (derived) */
  remainingS: number
  /** must keep stable for this long to win */
  stableForS: number
  stableHoldS: number
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

export function defaultSaveEcosystemParams(): SaveEcosystemParams {
  return {
    plants0: 360,
    herbivores0: 160,
    predators0: 70,
    temperature: 30,
    rainfall: 90,
    playing: false,
    hard: false,
    timeLimitS: 70,
  }
}

export function normalizeSaveEcosystemParams(p: SaveEcosystemParams): SaveEcosystemParams {
  const base = normalizeTri(p)
  return {
    ...base,
    playing: Boolean(p.playing),
    hard: Boolean(p.hard),
    timeLimitS: clamp(Number.isFinite(p.timeLimitS) ? p.timeLimitS : 70, 20, 180),
  }
}

export function createSaveEcosystemState(params: SaveEcosystemParams): SaveEcosystemState {
  const p = normalizeSaveEcosystemParams(params)
  const eco: TriTrophicState = {
    plants: p.plants0,
    herbivores: p.herbivores0,
    predators: p.predators0,
    balance: 0.2,
    series: [{ t: 0, plants: p.plants0, herbivores: p.herbivores0, predators: p.predators0, balance: 0.2 }],
    lastSampleT: 0,
  }
  return {
    status: 'ready',
    reason: 'Оғоз кунед ва тавозуни экосистемаро нигоҳ доред.',
    eco,
    score: { score: 0, startedAtT: null, finishedAtT: null, adjustments: 0 },
    remainingS: p.timeLimitS,
    stableForS: 0,
    stableHoldS: 10,
  }
}

export function startSaveEcosystem(st: SaveEcosystemState, nowT: number, params: SaveEcosystemParams) {
  const p = normalizeSaveEcosystemParams(params)
  st.status = 'running'
  st.reason = 'Ҳадаф: тавозунро нигоҳ доред, нобудшавиро иҷозат надиҳед.'
  st.score = { score: p.hard ? 1300 : 1000, startedAtT: nowT, finishedAtT: null, adjustments: 0 }
  st.remainingS = p.timeLimitS
  st.stableForS = 0
}

export function registerAdjustment(st: SaveEcosystemState) {
  if (st.status !== 'running') return
  st.score.adjustments += 1
  st.score.score = Math.max(0, st.score.score - 10)
}

export function stepSaveEcosystem(st: SaveEcosystemState, params: SaveEcosystemParams, t: number, dt: number) {
  const p = normalizeSaveEcosystemParams(params)

  if (!p.playing) {
    if (st.status === 'running') {
      st.status = 'ready'
      st.reason = 'Бозӣ қатъ шуд.'
    }
    return
  }

  if (st.status === 'ready') startSaveEcosystem(st, t, p)
  if (st.status !== 'running') return

  // advance ecosystem
  stepTriTrophic(st.eco, p, t, dt)

  // time + score drain
  st.remainingS = Math.max(0, p.timeLimitS - (t - (st.score.startedAtT ?? t)))
  st.score.score = Math.max(0, st.score.score - (p.hard ? 0.9 : 0.6))

  // Failure conditions: extinction or runaway
  const plants = st.eco.plants
  const herb = st.eco.herbivores
  const pred = st.eco.predators
  if (plants <= 1 || herb <= 0.5) {
    st.status = 'failure'
    st.reason = 'Ноком: herbivores ё plants нобуд шуд.'
    st.score.finishedAtT = t
    return
  }
  if (pred <= 0.2) {
    st.status = 'failure'
    st.reason = 'Ноком: predators аз байн рафт → занҷири ғизоӣ вайрон шуд.'
    st.score.finishedAtT = t
    return
  }
  if (plants > 1800 || herb > 700 || pred > 280) {
    st.status = 'failure'
    st.reason = 'Ноком: яке аз аҳолӣ аз ҳад зиёд калон шуд (overflow).'
    st.score.finishedAtT = t
    return
  }

  // Success: keep balanced for stableHoldS seconds
  const balanced = st.eco.balance >= (p.hard ? 0.72 : 0.65)
  st.stableForS = balanced ? st.stableForS + dt : Math.max(0, st.stableForS - dt * 0.6)
  if (st.stableForS >= st.stableHoldS) {
    st.status = 'success'
    st.reason = 'Муваффақ: тавозун нигоҳ дошта шуд.'
    st.score.finishedAtT = t
    st.score.score = Math.round(st.score.score + 250 - st.score.adjustments * 8)
    return
  }

  if (st.remainingS <= 0.001) {
    st.status = 'failure'
    st.reason = 'Вақт тамом шуд. Тавозун ба даст наомад.'
    st.score.finishedAtT = t
  }
}


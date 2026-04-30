export type ChallengeId = 'save-ecosystem' | 'fix-genetics'

export type ChallengeStatus = 'ready' | 'running' | 'success' | 'failure'

export type ScoreState = {
  score: number
  startedAtT: number | null
  finishedAtT: number | null
  adjustments: number
}


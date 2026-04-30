export type Base = 'A' | 'T' | 'G' | 'C'

export type MutationType = 'substitution' | 'deletion' | 'insertion'

export type MutationEvent = {
  id: string
  atT: number
  type: MutationType
  index: number
  from?: Base
  to?: Base
  note: string
}

export type ReplicationEvent = {
  id: string
  startedAtT: number
  finishedAtT?: number
  errors: number
}

export type DnaParams = {
  /** Number of base pairs visualized (12..80) */
  length: number
  /** Animation speed for helix rotation (rad/s) */
  spin: number
  /** If true, show the strand as “replicating” */
  autoSpin: boolean
}

export type DnaState = {
  strand: Base[]
  /** true if complement pairing is broken at index (after mutation) */
  mismatches: Set<number>
  lastMutation: MutationEvent | null
  mutationLog: MutationEvent[]
  replication: ReplicationEvent | null
  /** 0..1 progress when replicating */
  replicationProgress: number
  /** educational label about current effect */
  effectText: string
}

export function complement(b: Base): Base {
  if (b === 'A') return 'T'
  if (b === 'T') return 'A'
  if (b === 'G') return 'C'
  return 'G'
}

const bases: Base[] = ['A', 'T', 'G', 'C']

export function randomBase(rand: () => number): Base {
  return bases[Math.floor(rand() * bases.length)] ?? 'A'
}

export function normalizeDnaParams(p: DnaParams): DnaParams {
  const len = Number.isFinite(p.length) ? Math.round(p.length) : 36
  return {
    length: Math.max(12, Math.min(80, len)),
    spin: Number.isFinite(p.spin) ? Math.max(0, Math.min(2.5, p.spin)) : 0.6,
    autoSpin: Boolean(p.autoSpin),
  }
}

export function createDnaState(params: DnaParams, rand: () => number): DnaState {
  const p = normalizeDnaParams(params)
  const strand: Base[] = []
  for (let i = 0; i < p.length; i++) strand.push(randomBase(rand))
  return {
    strand,
    mismatches: new Set<number>(),
    lastMutation: null,
    mutationLog: [],
    replication: null,
    replicationProgress: 0,
    effectText: 'ДНК: базаҳо бо қоидаи ҷуфтшавӣ пайваст мешаванд (A–T, G–C).',
  }
}

export function mutationExplanation(ev: MutationEvent) {
  if (ev.type === 'substitution') {
    return (
      `Субституция (ивазкунӣ): дар мавқеи ${ev.index + 1} база ${ev.from} → ${ev.to} шуд.\n` +
      'Ин метавонад ба кодонҳо таъсир расонад ва сафеда (protein) дигар шавад.'
    )
  }
  if (ev.type === 'deletion') {
    return (
      `Делеция (несткунӣ): дар мавқеи ${ev.index + 1} як база нест шуд.\n` +
      'Ин метавонад “frameshift” ба вуҷуд орад (тағйири чаҳорчӯбаи хондан).'
    )
  }
  return (
    `Инсерция (илова): дар мавқеи ${ev.index + 1} базаи нав илова шуд.\n` +
    'Ин ҳам метавонад “frameshift” ба вуҷуд орад.'
  )
}

export function applyMutation(state: DnaState, params: DnaParams, rand: () => number, t: number, kind: MutationType) {
  const p = normalizeDnaParams(params)
  const idx = Math.max(0, Math.min(state.strand.length - 1, Math.floor(rand() * state.strand.length)))
  const id = `mut-${Math.floor(t * 1000)}-${Math.floor(rand() * 1e6)}`

  if (kind === 'substitution') {
    const from = state.strand[idx] ?? 'A'
    let to = randomBase(rand)
    if (to === from) to = from === 'A' ? 'G' : 'A'
    state.strand[idx] = to
    state.mismatches.add(idx)
    const ev: MutationEvent = {
      id,
      atT: t,
      type: kind,
      index: idx,
      from,
      to,
      note: 'Ивазкунии база',
    }
    state.lastMutation = ev
    state.mutationLog.unshift(ev)
    state.effectText = mutationExplanation(ev)
    return
  }

  if (kind === 'deletion') {
    const from = state.strand[idx] ?? 'A'
    state.strand.splice(idx, 1)
    // keep within length bounds by adding one random base at end
    while (state.strand.length < p.length) state.strand.push(randomBase(rand))
    state.mismatches = new Set([...state.mismatches].map((i) => (i > idx ? i - 1 : i)).filter((i) => i >= 0 && i < state.strand.length))
    const ev: MutationEvent = { id, atT: t, type: kind, index: idx, from, note: 'Несткунии база' }
    state.lastMutation = ev
    state.mutationLog.unshift(ev)
    state.effectText = mutationExplanation(ev)
    return
  }

  // insertion
  const to = randomBase(rand)
  state.strand.splice(idx, 0, to)
  // trim back to target length
  while (state.strand.length > p.length) state.strand.pop()
  state.mismatches = new Set([...state.mismatches].map((i) => (i >= idx ? i + 1 : i)).filter((i) => i >= 0 && i < state.strand.length))
  const ev: MutationEvent = { id, atT: t, type: kind, index: idx, to, note: 'Иловаи база' }
  state.lastMutation = ev
  state.mutationLog.unshift(ev)
  state.effectText = mutationExplanation(ev)
}

export function startReplication(state: DnaState, t: number) {
  if (state.replication) return
  state.replication = { id: `rep-${Math.floor(t * 1000)}`, startedAtT: t, errors: 0 }
  state.replicationProgress = 0
  state.effectText =
    'Репликация: ду спирал ҷудо мешавад ва ҳар як занҷир ҳамчун қолаб (template) барои сохтани занҷири нав истифода мешавад.'
}

export function stepReplication(state: DnaState, dt: number) {
  if (!state.replication) return
  const speed = 0.22 // progress per second
  state.replicationProgress = Math.min(1, state.replicationProgress + dt * speed)
  if (state.replicationProgress >= 1 && !state.replication.finishedAtT) {
    state.replication.finishedAtT = state.replication.startedAtT + 1 / speed
    // if mismatches exist, treat as “errors found”
    state.replication.errors = state.mismatches.size
    state.effectText =
      state.mismatches.size > 0
        ? `Репликация анҷом ёфт, аммо ${state.mismatches.size} ҷуфтшавии нодуруст/тағйирёфта дида мешавад → метавонад ба мутация оварда расонад.`
        : 'Репликация анҷом ёфт. Ҷуфтшавӣ дуруст аст (A–T, G–C).'
  }
}


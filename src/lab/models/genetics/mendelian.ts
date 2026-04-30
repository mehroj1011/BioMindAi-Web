export type MendelianParams = {
  dominantAllele: string
  recessiveAllele: string
  parent1: string
  parent2: string
}

export type MendelianState = {
  /** normalized genotypes */
  p1: string
  p2: string
  /** gametes */
  g1: [string, string]
  g2: [string, string]
  /** 2x2 punnett grid */
  punnett: [[string, string], [string, string]]
  /** derived summary */
  genotypePct: { genotype: string; pct: number }[]
  phenotypePct: { label: string; pct: number }[]
}

function normAllele(x: string, fallback: string) {
  const c = (x || '').trim().slice(0, 1)
  if (!c) return fallback
  return c
}

export function normalizeMendelian(p: MendelianParams): MendelianParams {
  const dom = normAllele(p.dominantAllele, 'A')
  const rec = normAllele(p.recessiveAllele, 'a')
  const normalizeGenotype = (raw: string) => {
    const s = (raw || '').trim()
    const chars = s.split('').filter((c) => c.toLowerCase() === dom.toLowerCase() || c.toLowerCase() === rec.toLowerCase())
    const a = chars[0] ?? dom
    const b = chars[1] ?? rec
    const canon = [a, b]
      .map((c) => (c.toLowerCase() === dom.toLowerCase() ? dom : rec))
      .sort((u, v) => (u === dom ? -1 : 1) - (v === dom ? -1 : 1))
      .join('')
    return canon
  }
  return {
    dominantAllele: dom,
    recessiveAllele: rec,
    parent1: normalizeGenotype(p.parent1),
    parent2: normalizeGenotype(p.parent2),
  }
}

function gametes(gt: string): [string, string] {
  const a = gt[0] ?? 'A'
  const b = gt[1] ?? 'a'
  return [a, b]
}

function computeSummary(punnett: [[string, string], [string, string]], dom: string) {
  const flat = [punnett[0][0], punnett[0][1], punnett[1][0], punnett[1][1]]
  const counts = new Map<string, number>()
  for (const gt of flat) counts.set(gt, (counts.get(gt) ?? 0) + 1)
  const genotypePct = [...counts.entries()]
    .map(([genotype, c]) => ({ genotype, pct: (c / 4) * 100 }))
    .sort((a, b) => b.pct - a.pct)

  const dominantCount = flat.filter((gt) => gt.includes(dom)).length
  const recessiveCount = 4 - dominantCount
  const phenotypePct = [
    { label: 'Нишонаи доминант', pct: (dominantCount / 4) * 100 },
    { label: 'Нишонаи рецессив', pct: (recessiveCount / 4) * 100 },
  ]
  return { genotypePct, phenotypePct }
}

export function computeMendelianState(params: MendelianParams): MendelianState {
  const p = normalizeMendelian(params)
  const g1 = gametes(p.parent1)
  const g2 = gametes(p.parent2)
  const make = (a: string, b: string) => normalizeMendelian({ ...p, parent1: a + b, parent2: p.parent2 }).parent1
  const punnett: [[string, string], [string, string]] = [
    [make(g1[0], g2[0]), make(g1[0], g2[1])],
    [make(g1[1], g2[0]), make(g1[1], g2[1])],
  ]
  const { genotypePct, phenotypePct } = computeSummary(punnett, p.dominantAllele)
  return { p1: p.parent1, p2: p.parent2, g1, g2, punnett, genotypePct, phenotypePct }
}


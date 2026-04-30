export type TraitId = 'eyes' | 'hair' | 'blood'

export type SimpleTrait = {
  id: 'eyes' | 'hair'
  name: string
  /** Dominant allele symbol (e.g. 'B') */
  dom: string
  /** Recessive allele symbol (e.g. 'b') */
  rec: string
  dominantPhenotype: string
  recessivePhenotype: string
}

export const EYE_COLOR: SimpleTrait = {
  id: 'eyes',
  name: 'Eye color',
  dom: 'B',
  rec: 'b',
  dominantPhenotype: 'Чашмони қаҳваранг (доминант)',
  recessivePhenotype: 'Чашмони кабуд (рецессив)',
}

export const HAIR_COLOR: SimpleTrait = {
  id: 'hair',
  name: 'Hair color',
  dom: 'D',
  rec: 'd',
  dominantPhenotype: 'Мӯи тира (доминант)',
  recessivePhenotype: 'Мӯи равшан (рецессив)',
}

export type ABOAllele = 'A' | 'B' | 'O'
export type ABOGenotype = 'AA' | 'AO' | 'BB' | 'BO' | 'AB' | 'OO'
export type BloodType = 'A' | 'B' | 'AB' | 'O'

export function normalizeABOGenotype(x: string): ABOGenotype {
  const s = (x || '').trim().toUpperCase()
  const map: Record<string, ABOGenotype> = {
    AA: 'AA',
    AO: 'AO',
    OA: 'AO',
    BB: 'BB',
    BO: 'BO',
    OB: 'BO',
    AB: 'AB',
    BA: 'AB',
    OO: 'OO',
  }
  return map[s] ?? 'AO'
}

export function aboGametes(gt: ABOGenotype): [ABOAllele, ABOAllele] {
  const a = gt[0] as ABOAllele
  const b = gt[1] as ABOAllele
  return [a, b]
}

export function aboChildGenotype(a: ABOAllele, b: ABOAllele): ABOGenotype {
  const pair = [a, b].sort().join('') as string
  // sort() makes 'O' before 'A'/'B' sometimes; normalize explicitly
  if (pair === 'AO' || pair === 'OA') return 'AO'
  if (pair === 'BO' || pair === 'OB') return 'BO'
  if (pair === 'AB' || pair === 'BA') return 'AB'
  if (pair === 'AA') return 'AA'
  if (pair === 'BB') return 'BB'
  return 'OO'
}

export function aboPhenotype(gt: ABOGenotype): BloodType {
  if (gt === 'AB') return 'AB'
  if (gt === 'AA' || gt === 'AO') return 'A'
  if (gt === 'BB' || gt === 'BO') return 'B'
  return 'O'
}

export function normalizeSimpleGenotype(raw: string, dom: string, rec: string) {
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

export function simpleGametes(gt: string): [string, string] {
  return [(gt[0] ?? 'A') as string, (gt[1] ?? 'a') as string]
}

export function simplePhenotype(gt: string, dom: string) {
  return gt.includes(dom) ? 'dominant' : 'recessive'
}


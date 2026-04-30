import {
  EYE_COLOR,
  HAIR_COLOR,
  aboGametes,
  aboPhenotype,
  normalizeABOGenotype,
  normalizeSimpleGenotype,
  simpleGametes,
  simplePhenotype,
  type ABOGenotype,
  type BloodType,
} from './traits'

export type MultiTraitParams = {
  eyesP1: string
  eyesP2: string
  hairP1: string
  hairP2: string
  bloodP1: ABOGenotype
  bloodP2: ABOGenotype
}

export type Punnett2x2 = [[string, string], [string, string]]

export type MultiTraitState = {
  eyes: {
    p1: string
    p2: string
    punnett: Punnett2x2
    phenotypePct: Array<{ label: string; pct: number; explain: string }>
  }
  hair: {
    p1: string
    p2: string
    punnett: Punnett2x2
    phenotypePct: Array<{ label: string; pct: number; explain: string }>
  }
  blood: {
    p1: ABOGenotype
    p2: ABOGenotype
    punnett: Punnett2x2
    phenotypePct: Array<{ label: string; pct: number; explain: string }>
  }
  combinedTop: Array<{ label: string; pct: number; explain: string }>
}

export function normalizeMultiTrait(p: MultiTraitParams): MultiTraitParams {
  const eyes1 = normalizeSimpleGenotype(p.eyesP1, EYE_COLOR.dom, EYE_COLOR.rec)
  const eyes2 = normalizeSimpleGenotype(p.eyesP2, EYE_COLOR.dom, EYE_COLOR.rec)
  const hair1 = normalizeSimpleGenotype(p.hairP1, HAIR_COLOR.dom, HAIR_COLOR.rec)
  const hair2 = normalizeSimpleGenotype(p.hairP2, HAIR_COLOR.dom, HAIR_COLOR.rec)
  return {
    eyesP1: eyes1,
    eyesP2: eyes2,
    hairP1: hair1,
    hairP2: hair2,
    bloodP1: normalizeABOGenotype(p.bloodP1),
    bloodP2: normalizeABOGenotype(p.bloodP2),
  }
}

function punnettFromGametes(g1: [string, string], g2: [string, string], normalizeChild: (raw: string) => string): Punnett2x2 {
  const make = (a: string, b: string) => normalizeChild(a + b)
  return [
    [make(g1[0], g2[0]), make(g1[0], g2[1])],
    [make(g1[1], g2[0]), make(g1[1], g2[1])],
  ]
}

function pctFrom4<T extends string>(values: [T, T, T, T]) {
  const counts = new Map<T, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()].map(([k, c]) => ({ k, pct: (c / 4) * 100 })).sort((a, b) => b.pct - a.pct)
}

function explainSimpleTraitPhenotype(traitName: string, domLabel: string) {
  return {
    dominant:
      `${traitName}: ҳузури аллели доминант (${domLabel}) барои нишон додани нишона кифоя аст. ` +
      `Ҳатто агар генотип гетерозигота бошад, фенотип доминант мешавад.`,
    recessive:
      `${traitName}: фенотипи рецессив танҳо вақте пайдо мешавад, ки кӯдак ду аллели рецессив дошта бошад. ` +
      `Ин ҳолат одатан ҳангоми омезиши аллелҳои рецессив аз ҳарду волид рӯй медиҳад.`,
  }
}

function explainBlood(type: BloodType) {
  if (type === 'AB') return 'Хун AB: аллелҳои A ва B кодоминантанд, бинобар ин ҳар ду нишон дода мешаванд.'
  if (type === 'A') return 'Хун A: генотип AA ё AO. Аллели A бар O доминант аст.'
  if (type === 'B') return 'Хун B: генотип BB ё BO. Аллели B бар O доминант аст.'
  return 'Хун O: танҳо генотип OO. Аллели O рецессив аст.'
}

export function computeMultiTraitState(params: MultiTraitParams): MultiTraitState {
  const p = normalizeMultiTrait(params)

  // Eyes
  const eyesG1 = simpleGametes(p.eyesP1)
  const eyesG2 = simpleGametes(p.eyesP2)
  const eyesPunnett = punnettFromGametes(eyesG1, eyesG2, (raw) => normalizeSimpleGenotype(raw, EYE_COLOR.dom, EYE_COLOR.rec))
  const eyesFlat = [eyesPunnett[0][0], eyesPunnett[0][1], eyesPunnett[1][0], eyesPunnett[1][1]]
  const eyesPh = eyesFlat.map((gt) => (simplePhenotype(gt, EYE_COLOR.dom) === 'dominant' ? 'dom' : 'rec')) as ['dom', 'dom', 'dom', 'dom']
  const eyesPct = pctFrom4(eyesPh).map((x) => {
    const exp = explainSimpleTraitPhenotype('Ранги чашм', EYE_COLOR.dom)
    if (x.k === 'dom') return { label: EYE_COLOR.dominantPhenotype, pct: x.pct, explain: exp.dominant }
    return { label: EYE_COLOR.recessivePhenotype, pct: x.pct, explain: exp.recessive }
  })

  // Hair
  const hairG1 = simpleGametes(p.hairP1)
  const hairG2 = simpleGametes(p.hairP2)
  const hairPunnett = punnettFromGametes(hairG1, hairG2, (raw) => normalizeSimpleGenotype(raw, HAIR_COLOR.dom, HAIR_COLOR.rec))
  const hairFlat = [hairPunnett[0][0], hairPunnett[0][1], hairPunnett[1][0], hairPunnett[1][1]]
  const hairPh = hairFlat.map((gt) => (simplePhenotype(gt, HAIR_COLOR.dom) === 'dominant' ? 'dom' : 'rec')) as ['dom', 'dom', 'dom', 'dom']
  const hairPct = pctFrom4(hairPh).map((x) => {
    const exp = explainSimpleTraitPhenotype('Ранги мӯй', HAIR_COLOR.dom)
    if (x.k === 'dom') return { label: HAIR_COLOR.dominantPhenotype, pct: x.pct, explain: exp.dominant }
    return { label: HAIR_COLOR.recessivePhenotype, pct: x.pct, explain: exp.recessive }
  })

  // Blood (ABO)
  const b1 = aboGametes(p.bloodP1)
  const b2 = aboGametes(p.bloodP2)
  const bloodPunnett = punnettFromGametes(
    b1,
    b2,
    (raw) => normalizeABOGenotype(raw),
  )
  const bloodFlat = [bloodPunnett[0][0], bloodPunnett[0][1], bloodPunnett[1][0], bloodPunnett[1][1]] as [ABOGenotype, ABOGenotype, ABOGenotype, ABOGenotype]
  const bloodTypes = bloodFlat.map((gt) => aboPhenotype(gt)) as [BloodType, BloodType, BloodType, BloodType]
  const bloodPct = pctFrom4(bloodTypes).map((x) => ({ label: `Гурӯҳи хун: ${x.k}`, pct: x.pct, explain: explainBlood(x.k) }))

  // Combined outcomes (assume independent assortment across these traits)
  const toMap = (arr: Array<{ label: string; pct: number; explain: string }>) => arr.map((x) => ({ ...x, p: x.pct / 100 }))
  const eyesM = toMap(eyesPct)
  const hairM = toMap(hairPct)
  const bloodM = toMap(bloodPct)

  const combined: Array<{ label: string; pct: number; explain: string }> = []
  for (const e of eyesM) {
    for (const h of hairM) {
      for (const b of bloodM) {
        const pJoint = e.p * h.p * b.p
        combined.push({
          label: `${e.label} • ${h.label} • ${b.label}`,
          pct: pJoint * 100,
          explain: [
            'Ин эҳтимолият аз қоидаи маҳсулот истифода мекунад (traits мустақил ҳисобида мешаванд):',
            `P(чашм)=${(e.p * 100).toFixed(0)}% × P(мӯй)=${(h.p * 100).toFixed(0)}% × P(хун)=${(b.p * 100).toFixed(0)}%`,
            'Эзоҳ: дар зиндагии воқеӣ баъзе генҳо метавонанд вобастагӣ дошта бошанд (linkage), вале ин модел омӯзишӣ аст.',
          ].join('\n'),
        })
      }
    }
  }
  combined.sort((a, b) => b.pct - a.pct)
  const combinedTop = combined.slice(0, 6)

  return {
    eyes: { p1: p.eyesP1, p2: p.eyesP2, punnett: eyesPunnett, phenotypePct: eyesPct },
    hair: { p1: p.hairP1, p2: p.hairP2, punnett: hairPunnett, phenotypePct: hairPct },
    blood: { p1: p.bloodP1, p2: p.bloodP2, punnett: bloodPunnett, phenotypePct: bloodPct },
    combinedTop,
  }
}


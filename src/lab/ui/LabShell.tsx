import { useMemo, useState } from 'react'
import type { SimulationModel } from '../engine/types'
import { useSimulation } from '../viewmodel/useSimulation'
import { useLabAiExplain } from '../viewmodel/useLabAiExplain'
import { SimChart } from './components/SimChart'
import { microscopeSamples } from '../models/microscope/samples'
import { ThreeCanvas } from '../../lib/three/ThreeCanvas'
import { type Base } from '../models/dna/dnaModel'
import { initPremiumDnaScene } from './dna/premiumDnaScene'

type AnyModel = SimulationModel<unknown, unknown>

export function LabShell({ sims }: { sims: AnyModel[] }) {
  const [activeId, setActiveId] = useState(sims[0]?.id ?? '')
  const active = useMemo(() => sims.find((s) => s.id === activeId) ?? sims[0], [sims, activeId])
  const activeSafe = active ?? sims[0]
  // Hooks must be unconditional. If we have no sims, we can render null after calling hooks with a dummy model.
  const dummy = useMemo<AnyModel>(
    () => ({
      id: 'lab.dummy',
      title: '—',
      description: '',
      defaultParams: {},
      createState: () => ({}),
      step: () => {},
    }),
    [],
  )
  const model = (activeSafe ?? dummy) as unknown as SimulationModel<Record<string, unknown>, Record<string, unknown>>
  const { snap, api } = useSimulation(model, undefined, { seed: 1234 })
  const hasSims = Boolean(activeSafe)
  const snapSafe = useMemo(() => {
    return (snap ?? { params: {}, state: {}, clock: { paused: true, speed: 1, t: 0, dt: 1 / 60 } }) as {
      params: Record<string, unknown>
      state: Record<string, unknown>
      clock: { paused: boolean; speed: number; t: number; dt: number }
    }
  }, [snap])

  const aiPayload = useMemo(() => {
    const simId = activeSafe?.id ?? 'lab.dummy'
    const params = snapSafe.params
    const state = snapSafe.state
    const clock = snapSafe.clock

    // Helper: safe number
    const n = (x: unknown, fallback = 0) => (typeof x === 'number' && Number.isFinite(x) ? x : fallback)
    const s = (x: unknown, fallback = '') => (typeof x === 'string' ? x : fallback)

    if (simId === 'lab.ecosystem.real') {
      const st = state as { plants?: number; herbivores?: number; predators?: number; balance?: number; series?: Array<{ t: number; plants: number; herbivores: number; predators: number }> }
      const series = st.series ?? []
      const last = series[series.length - 1]
      const prev = series[series.length - 6] // ~ a moment ago depending on dt
      const trend = last && prev
        ? `Тренд (охир): plants ${last.plants > prev.plants ? '↑' : '↓'}; herbivores ${last.herbivores > prev.herbivores ? '↑' : '↓'}; predators ${last.predators > prev.predators ? '↑' : '↓'}`
        : 'Тренд: маълумот кам аст.'

      const title = 'Экосистема (реалӣ)'
      const content = [
        'Сен лабораторияи экологияро шарҳ медиҳӣ.',
        'Қоида: plants меафзоянд; herbivores plants мехӯранд; predators herbivores мехӯранд.',
        '',
        `plants=${n(st.plants)}; herbivores=${n(st.herbivores)}; predators=${n(st.predators)}`,
        `temperature=${n(params.temperature)}°C; rainfall=${n(params.rainfall)}mm`,
        `balance≈${Math.round(n(st.balance) * 100)}%`,
        trend,
        '',
        'Фаҳмон: чаро чунин шуд ва чӣ тавр тавозунро беҳтар кунем (маслиҳатҳои амалӣ).',
      ].join('\n')
      const autoKey = JSON.stringify({
        simId,
        // only change when params change or every ~8 seconds
        tBucket: Math.floor(n(clock.t, 0) / 8),
        plants: Math.round(n(st.plants)),
        herb: Math.round(n(st.herbivores)),
        pred: Math.round(n(st.predators)),
        temperature: Math.round(n(params.temperature)),
        rainfall: Math.round(n(params.rainfall)),
      })
      return { title, content, autoKey }
    }

    if (simId === 'lab.ecosystem.lotka-volterra') {
      const st = state as { prey?: number; pred?: number }
      const title = 'Экосистема (prey/predator)'
      const content = [
        'Сен симулятсияи prey/predator‑ро шарҳ медиҳӣ.',
        `prey=${n(st.prey)}; predator=${n(st.pred)}`,
        `α(growth)=${n(params.alpha)}; β(predation)=${n(params.beta)}; γ(death)=${n(params.gamma)}; δ(efficiency)=${n(params.delta)}; K=${n(params.carryingCapacity)}`,
        '',
        'Фаҳмон: агар predator зиёд шавад, prey чӣ мешавад? Агар prey зиёд шавад, predator чӣ мешавад?',
      ].join('\n')
      const autoKey = JSON.stringify({ simId, prey: Math.round(n(st.prey)), pred: Math.round(n(st.pred)), alpha: n(params.alpha), beta: n(params.beta), gamma: n(params.gamma), delta: n(params.delta) })
      return { title, content, autoKey }
    }

    if (simId === 'lab.genetics.traits') {
      const st = state as { combinedTop?: Array<{ label: string; pct: number }> }
      const title = 'Генетика (traits)'
      const content = [
        'Сен натиҷаҳои решёткаи Пеннета‑ро шарҳ медиҳӣ.',
        `Eye: P1=${s(params.eyesP1)} P2=${s(params.eyesP2)}`,
        `Hair: P1=${s(params.hairP1)} P2=${s(params.hairP2)}`,
        `Blood: P1=${s(params.bloodP1)} P2=${s(params.bloodP2)}`,
        '',
        'Натиҷаҳои муҳим (Top):',
        ...(st.combinedTop ?? []).slice(0, 4).map((x) => `- ${x.label}: ${(n(x.pct)).toFixed(1)}%`),
        '',
        'Фаҳмон: доминант/рецессив чист, ва чаро ABO (AB) “кодоминант” аст.',
      ].join('\n')
      const autoKey = JSON.stringify({ simId, eyesP1: s(params.eyesP1), eyesP2: s(params.eyesP2), hairP1: s(params.hairP1), hairP2: s(params.hairP2), bloodP1: s(params.bloodP1), bloodP2: s(params.bloodP2) })
      return { title, content, autoKey }
    }

    if (simId === 'lab.genetics.mendelian') {
      const st = state as { p1?: string; p2?: string; phenotypePct?: Array<{ label: string; pct: number }> }
      const title = 'Генетика (Менделӣ)'
      const content = [
        'Сен натиҷаи кросси Менделиро шарҳ медиҳӣ.',
        `Parent1=${s(st.p1)} Parent2=${s(st.p2)} dominant=${s(params.dominantAllele)} recessive=${s(params.recessiveAllele)}`,
        'Фоизҳо:',
        ...(st.phenotypePct ?? []).map((x) => `- ${x.label}: ${n(x.pct).toFixed(0)}%`),
        '',
        'Фаҳмон: чаро чунин фоизҳо баромад ва мисоли хеле содда биёр.',
      ].join('\n')
      const autoKey = JSON.stringify({ simId, p1: s(params.parent1), p2: s(params.parent2), dom: s(params.dominantAllele), rec: s(params.recessiveAllele) })
      return { title, content, autoKey }
    }

    if (simId === 'lab.dna.sim') {
      const st = state as { lastMutation?: Record<string, unknown>; replicationProgress?: number; mutationLog?: Array<{ id: string }> }
      const title = 'ДНК (симулятсия)'
      const lastId = s(st.mutationLog?.[0]?.id)
      const content = [
        'Сен ДНК‑симулятсияро шарҳ медиҳӣ.',
        `length=${n(params.length)} spin=${n(params.spin)} autoSpin=${String(Boolean(params.autoSpin))}`,
        `replication=${Math.round(n(st.replicationProgress) * 100)}%`,
        st.lastMutation ? `lastMutation: type=${s(st.lastMutation.type)} index=${n(st.lastMutation.index) + 1} from=${s(st.lastMutation.from)} to=${s(st.lastMutation.to)}` : 'lastMutation: none',
        '',
        'Фаҳмон: мутация чӣ таъсир дорад ва репликация чӣ хел кор мекунад — бо мисоли хеле содда.',
      ].join('\n')
      const autoKey = JSON.stringify({ simId, len: n(params.length), rep: Math.floor(n(st.replicationProgress) * 10), lastId })
      return { title, content, autoKey }
    }

    if (simId === 'lab.microscope.virtual') {
      const st = state as { blurPx?: number; zoomActual?: number; sample?: { title?: string } }
      const title = 'Микроскоп (виртуалӣ)'
      const content = [
        'Сен микроскопро шарҳ медиҳӣ.',
        `sample=${s(st.sample?.title)}`,
        `zoomTarget=${n(params.zoom)} zoomActual=${n(st.zoomActual)} focus=${n(params.focus)} light=${n(params.light)}`,
        `blurPx≈${n(st.blurPx).toFixed(1)}`,
        '',
        'Фаҳмон: чаро blur зиёд мешавад ва чӣ гуна дуруст фокус кардан лозим.',
      ].join('\n')
      const autoKey = JSON.stringify({ simId, sampleId: s(params.sampleId), zoom: Math.round(n(params.zoom) * 10), focus: Math.round(n(params.focus) * 1000), light: Math.round(n(params.light) * 100) })
      return { title, content, autoKey }
    }

    return {
      title: 'Лаборатория',
      content: `simId=${simId}\nparams=${JSON.stringify(params).slice(0, 900)}\nstate=${JSON.stringify(state).slice(0, 900)}`,
      autoKey: JSON.stringify({ simId }),
    }
  }, [activeSafe?.id, snapSafe])

  const ai = useLabAiExplain({
    title: aiPayload.title,
    content: aiPayload.content,
    autoKey: aiPayload.autoKey,
    enabled: true,
  })

  if (!hasSims) {
    return (
      <div className="mx-auto grid max-w-3xl gap-4 p-6">
        <div className="glass-premium-strong rounded-[32px] p-6">
          <div className="text-sm font-semibold text-bm-text">Лаборатория</div>
          <div className="mt-2 text-sm text-bm-muted">Ҳоло симулятсияҳо бор нашуданд. Лутфан саҳифаро нав кунед.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <section className="glass-premium-strong rounded-[32px] p-6 sm:p-10 motion-fade">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Лаборатория (нав)</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-bm-muted sm:text-base">
              Ин модул ҳамчун системаи симулятсия сохта шудааст: engine + models + viewmodel + UI. Ҳар симулятсия мустақил ва аз нав истифодашаванда аст.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-bm-muted">
              <span className="h-2 w-2 rounded-full bg-bm-green shadow-glass" />
              Dashboard • real-time • glass UI
              <span className="ml-1 font-mono">{snapSafe.clock.paused ? 'таваққуф' : `${snapSafe.clock.speed.toFixed(2)}×`}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {sims.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={[
                  'rounded-2xl border px-4 py-2 text-xs font-semibold transition motion-pop',
                  s.id === active.id
                    ? 'border-white/18 bg-white/12 text-bm-text shadow-glass'
                    : 'border-white/10 bg-white/5 text-bm-muted hover:bg-white/8',
                ].join(' ')}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="glass-premium rounded-[32px] p-5 motion-fade">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{activeSafe!.title}</div>
              <div className="mt-1 text-xs text-bm-muted">{activeSafe!.description}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => api.togglePaused()}
                className="rounded-2xl border border-white/12 bg-white/6 px-4 py-2 text-xs font-semibold text-bm-text transition hover:bg-white/10"
              >
                {snapSafe.clock.paused ? 'Давом' : 'Пауза'}
              </button>
              <button
                onClick={() => api.stepOnce()}
                className="rounded-2xl border border-white/12 bg-white/6 px-4 py-2 text-xs font-semibold text-bm-text transition hover:bg-white/10"
              >
                Қадам
              </button>
              <button
                onClick={() => api.reset()}
                className="rounded-2xl border border-white/12 bg-white/6 px-4 py-2 text-xs font-semibold text-bm-text transition hover:bg-white/10"
              >
                Аз нав
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            <div key={activeSafe!.id} className="motion-fade">
              <SimMainPanel simId={activeSafe!.id} snap={snapSafe as unknown as AnySnap} />
            </div>
          </div>
        </div>

        <div className="glass-premium-strong rounded-[32px] p-5 motion-fade lg:sticky lg:top-4 h-fit min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Панели идоракунӣ</div>
              <div className="mt-1 text-xs text-bm-muted">Слайдерҳо + баргардониши фаврӣ.</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-bm-muted">
              вақт=<span className="font-mono">{snapSafe.clock.t.toFixed(1)}</span>с
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div key={`${activeSafe!.id}-params`} className="motion-fade">
              <SimParamsPanel simId={activeSafe!.id} snap={snapSafe as unknown as AnySnap} setParams={api.setParams} setSpeed={api.setSpeed} />
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Шарҳ аз AI</div>
                <div className="mt-1 text-xs text-bm-muted">AI мефаҳмонад, ки дар симулятсия чӣ шуд (бо забони содда).</div>
              </div>
              <button
                onClick={() => void ai.explainNow()}
                className="rounded-2xl bg-gradient-to-r from-bm-purple to-bm-cyan px-4 py-2 text-xs font-semibold text-black shadow-glass transition hover:opacity-95"
              >
                Фаҳмон бо AI
              </button>
            </div>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-bm-text">
              {ai.loading && (
                <div className="grid gap-2">
                  <div className="h-4 w-2/3 animate-pulse rounded-xl bg-white/10" />
                  <div className="h-4 w-full animate-pulse rounded-xl bg-white/10" />
                  <div className="h-4 w-5/6 animate-pulse rounded-xl bg-white/10" />
                </div>
              )}
              {!ai.loading && ai.err && <div className="text-sm text-bm-muted">Хато: {ai.err}</div>}
              {!ai.loading && !ai.err && ai.text && ai.text}
              {!ai.loading && !ai.err && !ai.text && (
                <div className="text-sm text-bm-muted">
                  Масалан: “Агар predators зиёд шавад, herbivores кам мешавад…” — параметрҳоро тағйир диҳед, AI худкор шарҳ медиҳад.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Field({ label, value, onChange, step, min, max }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number }) {
  return (
    <label className="grid gap-1">
      <div className="text-xs font-semibold text-bm-muted">{label}</div>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={step ?? 1}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-2xl border border-bm-border bg-black/25 px-4 py-2 text-sm text-bm-text outline-none focus:border-white/15"
      />
    </label>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-1">
      <div className="text-xs font-semibold text-bm-muted">{label}</div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-bm-border bg-black/25 px-4 py-2 text-sm text-bm-text outline-none focus:border-white/15"
      />
    </label>
  )
}

type AnySnap = { params: Record<string, unknown>; state: Record<string, unknown>; clock: { paused: boolean; speed: number }; error?: string | null }

function SimMainPanel({ simId, snap }: { simId: string; snap: AnySnap | null }) {
  if (!snap) return <div className="text-sm text-bm-muted">Омода мешавад…</div>
  if (snap.error) {
    return (
      <div className="rounded-3xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
        <div className="text-xs font-semibold text-red-200">Хатои симулятсия</div>
        <div className="mt-2 whitespace-pre-wrap font-mono text-[12px] leading-relaxed">{snap.error}</div>
        <div className="mt-3 text-xs text-red-200/80">Кӯшиш кунед “Аз нав” ё параметрҳоро тағйир диҳед.</div>
      </div>
    )
  }

  const isObj = (x: unknown): x is Record<string, unknown> => Boolean(x) && typeof x === 'object'
  const n = (x: unknown, fallback = 0) => (typeof x === 'number' && Number.isFinite(x) ? x : fallback)
  const s = (x: unknown, fallback = '') => (typeof x === 'string' ? x : fallback)

  if (simId === 'lab.challenges') {
    const stAny = snap.state as Record<string, unknown>
    const scenario = stAny.scenario === 'fix-genetics' ? 'fix-genetics' : 'save-ecosystem'
    const ecoRaw = stAny.eco
    const genRaw = stAny.gen
    if (!ecoRaw || typeof ecoRaw !== 'object' || !genRaw || typeof genRaw !== 'object') {
      return <div className="text-sm text-bm-muted">Омода мешавад…</div>
    }

    const eco = ecoRaw as {
      status: string
      reason: string
      remainingS: number
      stableForS: number
      stableHoldS: number
      eco: { plants: number; herbivores: number; predators: number; balance: number; series: Array<{ t: number; plants: number; herbivores: number; predators: number; balance: number }> }
      score: { score: number; adjustments: number }
    }
    const gen = genRaw as {
      status: string
      reason: string
      remainingS: number
      target: { blueEyesPct: number; bloodOPct: number }
      result: { blueEyesPct: number; bloodOPct: number }
      score: { score: number; adjustments: number }
    }

    const badge = (status: string) => {
      if (status === 'success') return 'bg-bm-green/20 text-bm-green border-bm-green/30'
      if (status === 'failure') return 'bg-red-500/15 text-red-200 border-red-400/25'
      if (status === 'running') return 'bg-bm-cyan/15 text-bm-cyan border-bm-cyan/25'
      return 'bg-white/6 text-bm-muted border-white/10'
    }

    return (
      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="glass-premium rounded-[28px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Сенария</div>
                <div className="mt-1 text-xs text-bm-muted">Ин ҷо миссияҳоро иҷро мекунед ва хол мегиред.</div>
              </div>
              <div className={['rounded-2xl border px-3 py-2 text-xs font-semibold', badge(scenario === 'save-ecosystem' ? eco.status : gen.status)].join(' ')}>
                {scenario === 'save-ecosystem' ? eco.status : gen.status}
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-bm-muted">
              <div>
                Хол: <span className="font-mono text-bm-text">{scenario === 'save-ecosystem' ? eco.score.score : gen.score.score}</span>
                <span className="ml-3 text-xs text-bm-muted">тағйирот: {scenario === 'save-ecosystem' ? eco.score.adjustments : gen.score.adjustments}</span>
              </div>
              <div>
                Вақт: <span className="font-mono text-bm-text">{(scenario === 'save-ecosystem' ? eco.remainingS : gen.remainingS).toFixed(1)}с</span>
              </div>
              <div className="whitespace-pre-wrap text-xs leading-relaxed">{scenario === 'save-ecosystem' ? eco.reason : gen.reason}</div>
            </div>
          </div>

          {scenario === 'save-ecosystem' ? (
            <div className="glass-premium rounded-[28px] p-4">
              <div className="text-sm font-semibold">Нигоҳ доштани экосистема</div>
              <div className="mt-2 grid grid-cols-3 gap-3">
                <Kpi label="Растаниҳо" value={eco.eco.plants} />
                <Kpi label="Гиёҳхорон" value={eco.eco.herbivores} />
                <Kpi label="Даррандаҳо" value={eco.eco.predators} />
              </div>
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between gap-3 text-xs text-bm-muted">
                  <span>Тавозун</span>
                  <span className="font-mono">{Math.round(eco.eco.balance * 100)}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/8">
                  <div className="h-2 rounded-full bg-gradient-to-r from-bm-cyan via-bm-green to-bm-purple" style={{ width: `${Math.max(0, Math.min(100, eco.eco.balance * 100))}%` }} />
                </div>
                <div className="mt-2 text-xs text-bm-muted">
                  Устуворӣ: <span className="font-mono">{eco.stableForS.toFixed(1)}</span> / <span className="font-mono">{eco.stableHoldS.toFixed(0)}</span>с
                </div>
              </div>
              <div className="mt-3">
                <SimChart
                  series={eco.eco.series}
                  lines={[
                    { key: 'plants', label: 'растаниҳо', color: '#22c55e' },
                    { key: 'herbivores', label: 'гиёҳхорон', color: '#34d399' },
                    { key: 'predators', label: 'даррандаҳо', color: '#a78bfa' },
                  ]}
                  height={170}
                />
              </div>
            </div>
          ) : (
            <div className="glass-premium rounded-[28px] p-4">
              <div className="text-sm font-semibold">Ҳалли масъалаи генетикӣ</div>
              <div className="mt-2 text-xs text-bm-muted">Ҳадафҳоро иҷро кунед (эҳтимолиятҳо).</div>
              <div className="mt-3 grid gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3 text-xs text-bm-muted">
                    <span>Чашми кабуд</span>
                    <span className="font-mono">{gen.result.blueEyesPct.toFixed(0)}% / {gen.target.blueEyesPct}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/8">
                    <div className="h-2 rounded-full bg-bm-cyan" style={{ width: `${Math.max(0, Math.min(100, (gen.result.blueEyesPct / gen.target.blueEyesPct) * 100))}%` }} />
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3 text-xs text-bm-muted">
                    <span>Гурӯҳи хун O</span>
                    <span className="font-mono">{gen.result.bloodOPct.toFixed(0)}% / {gen.target.bloodOPct}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/8">
                    <div className="h-2 rounded-full bg-bm-green" style={{ width: `${Math.max(0, Math.min(100, (gen.result.bloodOPct / gen.target.bloodOPct) * 100))}%` }} />
                  </div>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-bm-muted">
                Маслиҳат: барои O → <span className="font-mono text-bm-text">OO</span> лозим мешавад; барои чашми кабуд → <span className="font-mono text-bm-text">bb</span>.
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (simId === 'lab.dna.sim') {
    const st = (isObj(snap.state) ? snap.state : {}) as Record<string, unknown>
    const strand = (Array.isArray(st.strand) ? (st.strand as Base[]) : []) as Base[]
    const mismatches = (st.mismatches instanceof Set ? (st.mismatches as Set<number>) : new Set<number>()) as Set<number>
    const replicationProgress = n(st.replicationProgress, 0)
    const effectText = s(st.effectText, '')
    const lastMutation = (isObj(st.lastMutation) ? (st.lastMutation as Record<string, unknown>) : null) as
      | { type: string; index: number; from?: string; to?: string }
      | null
    const mutationLog = (Array.isArray(st.mutationLog) ? (st.mutationLog as Array<Record<string, unknown>>) : []).map((m) => ({
      id: s(m.id),
      type: s(m.type),
      index: n(m.index, 0),
      from: s(m.from, ''),
      to: s(m.to, ''),
      atT: n(m.atT, 0),
    }))

    const p = (isObj(snap.params) ? snap.params : {}) as Record<string, unknown>
    const spin = n(p.spin, 0.65)
    const autoSpin = Boolean(p.autoSpin ?? true)

    return (
      <div className="grid gap-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-bm-border bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Ду‑спирал (3D)</div>
                <div className="mt-1 text-xs text-bm-muted">A–T ва G–C • мутацияҳо бо ранги сурх нишон дода мешаванд</div>
              </div>
              <div className="text-xs font-mono text-bm-muted">
                len={strand.length} • rep={(replicationProgress * 100).toFixed(0)}%
              </div>
            </div>
            <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
              <ThreeCanvas
                className="h-[54vh] w-full"
                onInit={(ctx) => initPremiumDnaScene(ctx, strand)}
                onFrame={(ctx, dt) => {
                  const ud = ctx.scene.userData as { apply?: (strand: Base[], mismatches: Set<number>) => void }
                  ud.apply?.(strand, mismatches)
                  if (autoSpin) ctx.scene.rotation.y += dt * spin
                }}
                enableControls
              />
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-bm-muted">
              Амалҳоро аз панели “Параметрҳо” истифода баред: mutation / replication.
            </div>
          </div>

          <div className="rounded-2xl border border-bm-border bg-black/20 p-4">
            <div className="text-sm font-semibold">Шарҳ (таъсири мутация)</div>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-bm-muted">{effectText}</div>

            {lastMutation && (
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-bm-muted">
                Охирин мутация: <span className="font-mono text-bm-text">{s(lastMutation.type)}</span> дар мавқеи{' '}
                <span className="font-mono text-bm-text">{n(lastMutation.index, 0) + 1}</span>
              </div>
            )}

            <div className="mt-4">
              <div className="text-xs font-semibold text-bm-muted">Сабтҳо (охиринҳо)</div>
              <div className="mt-2 grid gap-2">
                {mutationLog.slice(0, 4).map((m) => (
                  <div key={m.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-bm-muted">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-bm-text">{m.type}</span>
                      <span className="font-mono">#{m.index + 1}</span>
                    </div>
                    {(m.from || m.to) && (
                      <div className="mt-1 font-mono">
                        {m.from || '—'} → {m.to || '—'}
                      </div>
                    )}
                  </div>
                ))}
                {mutationLog.length === 0 && <div className="text-xs text-bm-muted">Ҳоло мутация нест.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (simId === 'lab.microscope.virtual') {
    const st = (isObj(snap.state) ? snap.state : {}) as Record<string, unknown>
    const sample = (isObj(st.sample) ? (st.sample as Record<string, unknown>) : null) as Record<string, unknown> | null
    if (!sample) return <div className="text-sm text-bm-muted">Омода мешавад…</div>
    const zoomActual = n(st.zoomActual, 1)
    const blurPx = n(st.blurPx, 0)
    const brightness = n(st.brightness, 1)

    const p = (isObj(snap.params) ? snap.params : {}) as Record<string, unknown>
    const zoom = n(p.zoom, 1)
    const focus = n(p.focus, 0)
    const light = n(p.light, 0.6)
    const vignette = 0.55 + (1 - light) * 0.25
    const contrast = 1.05 + light * 0.15
    const filter = `brightness(${brightness.toFixed(3)}) contrast(${contrast.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`
    return (
      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-bm-border bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{s(sample.title, 'Намуна')}</div>
                <div className="mt-1 text-xs text-bm-muted">{s(sample.subtitle, '')}</div>
              </div>
              <div className="text-xs font-mono text-bm-muted">
                z={zoomActual.toFixed(2)}× • blur={blurPx.toFixed(1)}px
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-[999px] border border-white/10 bg-black/40">
              <div
                className="relative h-[46vh] w-full"
                style={{
                  background:
                    `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,${vignette}) 70%, rgba(0,0,0,0.95) 100%)`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={s(sample.imageUrl, '')}
                    alt=""
                    crossOrigin="anonymous"
                    style={{
                      transform: `scale(${zoomActual})`,
                      transformOrigin: 'center center',
                      filter,
                      transition: 'filter 120ms linear',
                      willChange: 'transform, filter',
                    }}
                    className="select-none"
                    draggable={false}
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-[999px] ring-1 ring-white/10" />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <Kpi label="Мақсади зум" value={zoom} />
              <Kpi label="Фокус" value={focus} />
              <Kpi label="Рӯшноӣ" value={light} />
            </div>
          </div>

          <div className="rounded-2xl border border-bm-border bg-black/20 p-4">
            <div className="text-sm font-semibold">Маълумот дар бораи намуна</div>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-bm-muted">{s(sample.info, '')}</div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-bm-muted">
              Blur ҳангоми фокус нодуруст зиёд мешавад. Барои “тасвири равшан” фокусро ба арзиши беҳтарин наздик кунед.
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (simId === 'lab.genetics.traits') {
    const st = (isObj(snap.state) ? snap.state : {}) as Record<string, unknown>
    const eyes = (isObj(st.eyes) ? (st.eyes as Record<string, unknown>) : null) as Record<string, unknown> | null
    const hair = (isObj(st.hair) ? (st.hair as Record<string, unknown>) : null) as Record<string, unknown> | null
    const blood = (isObj(st.blood) ? (st.blood as Record<string, unknown>) : null) as Record<string, unknown> | null
    if (!eyes || !hair || !blood) return <div className="text-sm text-bm-muted">Омода мешавад…</div>
    const combinedTop = (Array.isArray(st.combinedTop) ? (st.combinedTop as Array<Record<string, unknown>>) : []).map((x) => ({
      label: s(x.label),
      pct: n(x.pct, 0),
      explain: s(x.explain),
    }))

    return (
      <div className="grid gap-4">
        <TraitPunnettCard
          title="Eye color"
          p1={s(eyes.p1)}
          p2={s(eyes.p2)}
          punnett={(eyes.punnett as [[string, string], [string, string]]) ?? [['—', '—'], ['—', '—']]}
        />
        <TraitPunnettCard
          title="Hair color"
          p1={s(hair.p1)}
          p2={s(hair.p2)}
          punnett={(hair.punnett as [[string, string], [string, string]]) ?? [['—', '—'], ['—', '—']]}
        />
        <TraitPunnettCard
          title="Blood type (ABO)"
          p1={s(blood.p1)}
          p2={s(blood.p2)}
          punnett={(blood.punnett as [[string, string], [string, string]]) ?? [['—', '—'], ['—', '—']]}
        />

        <div className="grid gap-3 md:grid-cols-2">
          <ResultCard
            title="Натиҷаҳо: чашм"
            items={
              (Array.isArray(eyes.phenotypePct) ? (eyes.phenotypePct as Array<{ label: string; pct: number; explain: string }>) : []) as Array<{
                label: string
                pct: number
                explain: string
              }>
            }
          />
          <ResultCard
            title="Натиҷаҳо: мӯй"
            items={
              (Array.isArray(hair.phenotypePct) ? (hair.phenotypePct as Array<{ label: string; pct: number; explain: string }>) : []) as Array<{
                label: string
                pct: number
                explain: string
              }>
            }
          />
          <ResultCard
            title="Натиҷаҳо: гурӯҳи хун"
            items={
              (Array.isArray(blood.phenotypePct) ? (blood.phenotypePct as Array<{ label: string; pct: number; explain: string }>) : []) as Array<{
                label: string
                pct: number
                explain: string
              }>
            }
          />
          <div className="rounded-2xl border border-bm-border bg-black/20 p-4">
            <div className="text-xs font-semibold text-bm-muted">Эҳтимолияти комбинатсия (боло)</div>
            <div className="mt-3 grid gap-2">
              {combinedTop.map((x) => (
                <div key={x.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-bm-text">{x.label}</div>
                    <div className="text-sm font-mono text-bm-muted">{x.pct.toFixed(1)}%</div>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-bm-muted">{x.explain}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (simId === 'lab.ecosystem.real') {
    const st = (isObj(snap.state) ? snap.state : {}) as Record<string, unknown>
    const series = Array.isArray(st.series) ? (st.series as Array<Record<string, unknown>>) : []
    if (series.length === 0) return <div className="text-sm text-bm-muted">Омода мешавад…</div>
    const seriesTyped = series.map((x) => ({
      t: n(x.t, 0),
      plants: n(x.plants, 0),
      herbivores: n(x.herbivores, 0),
      predators: n(x.predators, 0),
      balance: n(x.balance, 0),
    }))
    const plants = n(st.plants, n(series[series.length - 1]?.plants, 0))
    const herbivores = n(st.herbivores, n(series[series.length - 1]?.herbivores, 0))
    const predators = n(st.predators, n(series[series.length - 1]?.predators, 0))
    const balancePct = Math.round(n(st.balance, 0) * 100)
    return (
      <div className="grid gap-3">
        <div className="grid grid-cols-3 gap-3">
          <Kpi label="Растаниҳо" value={plants} />
          <Kpi label="Гиёҳхорон" value={herbivores} />
          <Kpi label="Даррандаҳо" value={predators} />
        </div>
        <div className="rounded-2xl border border-bm-border bg-black/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold text-bm-muted">Тавозуни экосистема</div>
            <div className="text-xs font-mono text-bm-muted">{balancePct}%</div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/8">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-bm-cyan via-bm-green to-bm-purple transition-[width] duration-300"
              style={{ width: `${Math.max(0, Math.min(100, balancePct))}%` }}
            />
          </div>
        </div>
        <SimChart
          series={seriesTyped}
          lines={[
            { key: 'plants', label: 'plants', color: '#22c55e' },
            { key: 'herbivores', label: 'herbivores', color: '#34d399' },
            { key: 'predators', label: 'predators', color: '#a78bfa' },
          ]}
          height={170}
        />
      </div>
    )
  }

  if (simId === 'lab.ecosystem.lotka-volterra') {
    const st = (isObj(snap.state) ? snap.state : {}) as Record<string, unknown>
    const series = Array.isArray(st.series) ? (st.series as Array<Record<string, unknown>>) : []
    if (series.length === 0) return <div className="text-sm text-bm-muted">Омода мешавад…</div>
    const seriesTyped = series.map((x) => ({ t: n(x.t, 0), prey: n(x.prey, 0), pred: n(x.pred, 0) }))
    const prey = n(st.prey, n(series[series.length - 1]?.prey, 0))
    const pred = n(st.pred, n(series[series.length - 1]?.pred, 0))
    return (
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Kpi label="Prey" value={prey} />
          <Kpi label="Predator" value={pred} />
        </div>
        <SimChart
          series={seriesTyped}
          lines={[
            { key: 'prey', label: 'prey', color: '#34d399' },
            { key: 'pred', label: 'predator', color: '#a78bfa' },
          ]}
          height={160}
        />
      </div>
    )
  }

  if (simId === 'lab.genetics.mendelian') {
    const st = (isObj(snap.state) ? snap.state : {}) as Record<string, unknown>
    if (!st.punnett || !st.g1 || !st.g2) return <div className="text-sm text-bm-muted">Омода мешавад…</div>
    const g1 = Array.isArray(st.g1) ? (st.g1 as [string, string]) : (['—', '—'] as [string, string])
    const g2 = Array.isArray(st.g2) ? (st.g2 as [string, string]) : (['—', '—'] as [string, string])
    const punnett = (st.punnett as [[string, string], [string, string]]) ?? [['—', '—'], ['—', '—']]
    const genotypePct = Array.isArray(st.genotypePct) ? (st.genotypePct as Array<Record<string, unknown>>) : []
    const phenotypePct = Array.isArray(st.phenotypePct) ? (st.phenotypePct as Array<Record<string, unknown>>) : []
    return (
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Kpi label="Волидайн 1" value={s(st.p1)} mono />
          <Kpi label="Волидайн 2" value={s(st.p2)} mono />
        </div>
        <div className="rounded-2xl border border-bm-border bg-black/20 p-3">
          <div className="text-xs font-semibold text-bm-muted">Решёткаи Пеннета</div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
            <div />
            <Cell v={g2[0]} />
            <Cell v={g2[1]} />
            <Cell v={g1[0]} muted />
            <Cell v={punnett?.[0]?.[0] ?? '—'} />
            <Cell v={punnett?.[0]?.[1] ?? '—'} />
            <Cell v={g1[1]} muted />
            <Cell v={punnett?.[1]?.[0] ?? '—'} />
            <Cell v={punnett?.[1]?.[1] ?? '—'} />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-bm-border bg-black/20 p-3">
            <div className="text-xs font-semibold text-bm-muted">Генотип (%)</div>
            <div className="mt-2 grid gap-1 text-sm">
              {genotypePct.map((x) => (
                <div key={s(x.genotype)} className="flex items-center justify-between gap-3">
                  <span className="font-mono">{s(x.genotype)}</span>
                  <span className="text-bm-muted">{n(x.pct).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-bm-border bg-black/20 p-3">
            <div className="text-xs font-semibold text-bm-muted">Фенотип (%)</div>
            <div className="mt-2 grid gap-1 text-sm">
              {phenotypePct.map((x) => (
                <div key={s(x.label)} className="flex items-center justify-between gap-3">
                  <span>{s(x.label)}</span>
                  <span className="text-bm-muted">{n(x.pct).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <div className="text-sm text-bm-muted">Ин симулятсия ҳоло UI надорад.</div>
}

function SimParamsPanel({
  simId,
  snap,
  setParams,
  setSpeed,
}: {
  simId: string
  snap: AnySnap | null
  setParams: (patch: Record<string, unknown>) => void
  setSpeed: (v: number) => void
}) {
  const n = (x: unknown, fallback = 0) => (typeof x === 'number' && Number.isFinite(x) ? x : fallback)
  const s = (x: unknown, fallback = '') => (typeof x === 'string' ? x : fallback)
  const speed = Number(snap?.clock?.speed ?? 1)
  return (
    <>
      {simId === 'lab.challenges' && (
        <>
          <label className="grid gap-1">
            <div className="text-xs font-semibold text-bm-muted">Сенария</div>
            <select
              value={s(snap?.params?.scenario, 'save-ecosystem')}
              onChange={(e) => setParams({ scenario: e.target.value, adjusted: true })}
              className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-2 text-sm text-bm-text outline-none focus:border-white/18"
            >
              <option value="save-ecosystem">Нигоҳ доштани экосистема</option>
              <option value="fix-genetics">Ҳалли масъалаи генетикӣ</option>
            </select>
          </label>

          {s(snap?.params?.scenario, 'save-ecosystem') === 'save-ecosystem' ? (
            <>
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-bm-text">
                <span className="text-sm font-semibold">Оғоз</span>
                <input
                  type="checkbox"
                  checked={Boolean(((snap?.params as Record<string, unknown>)?.eco as Record<string, unknown> | undefined)?.playing ?? false)}
                  onChange={(e) => {
                    const eco = ((snap?.params as Record<string, unknown>)?.eco as Record<string, unknown> | undefined) ?? {}
                    setParams({ eco: { ...eco, playing: e.target.checked }, adjusted: true })
                    window.setTimeout(() => setParams({ adjusted: false }), 0)
                  }}
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-bm-text">
                <span className="text-sm font-semibold">Режими душвор</span>
                <input
                  type="checkbox"
                  checked={Boolean(((snap?.params as Record<string, unknown>)?.eco as Record<string, unknown> | undefined)?.hard ?? false)}
                  onChange={(e) => {
                    const eco = ((snap?.params as Record<string, unknown>)?.eco as Record<string, unknown> | undefined) ?? {}
                    setParams({ eco: { ...eco, hard: e.target.checked }, adjusted: true })
                    window.setTimeout(() => setParams({ adjusted: false }), 0)
                  }}
                />
              </label>
              <Field
                label="Ҳарорат (°C)"
                value={n((((snap?.params as Record<string, unknown>)?.eco as Record<string, unknown> | undefined)?.temperature), 24)}
                min={-5}
                max={45}
                step={0.5}
                onChange={(v) => {
                  const eco = ((snap?.params as Record<string, unknown>)?.eco as Record<string, unknown> | undefined) ?? {}
                  setParams({ eco: { ...eco, temperature: v }, adjusted: true })
                  window.setTimeout(() => setParams({ adjusted: false }), 0)
                }}
              />
              <Field
                label="Боришот (мм)"
                value={n((((snap?.params as Record<string, unknown>)?.eco as Record<string, unknown> | undefined)?.rainfall), 200)}
                min={0}
                max={500}
                step={5}
                onChange={(v) => {
                  const eco = ((snap?.params as Record<string, unknown>)?.eco as Record<string, unknown> | undefined) ?? {}
                  setParams({ eco: { ...eco, rainfall: v }, adjusted: true })
                  window.setTimeout(() => setParams({ adjusted: false }), 0)
                }}
              />
              <Field
                label="Оғози растаниҳо"
                value={n((((snap?.params as Record<string, unknown>)?.eco as Record<string, unknown> | undefined)?.plants0), 400)}
                min={1}
                max={2000}
                step={5}
                onChange={(v) => {
                  const eco = ((snap?.params as Record<string, unknown>)?.eco as Record<string, unknown> | undefined) ?? {}
                  setParams({ eco: { ...eco, plants0: v }, adjusted: true })
                  window.setTimeout(() => setParams({ adjusted: false }), 0)
                }}
              />
              <Field
                label="Оғози гиёҳхорон"
                value={n((((snap?.params as Record<string, unknown>)?.eco as Record<string, unknown> | undefined)?.herbivores0), 120)}
                min={0}
                max={800}
                step={2}
                onChange={(v) => {
                  const eco = ((snap?.params as Record<string, unknown>)?.eco as Record<string, unknown> | undefined) ?? {}
                  setParams({ eco: { ...eco, herbivores0: v }, adjusted: true })
                  window.setTimeout(() => setParams({ adjusted: false }), 0)
                }}
              />
              <Field
                label="Оғози даррандаҳо"
                value={n((((snap?.params as Record<string, unknown>)?.eco as Record<string, unknown> | undefined)?.predators0), 40)}
                min={0}
                max={300}
                step={1}
                onChange={(v) => {
                  const eco = ((snap?.params as Record<string, unknown>)?.eco as Record<string, unknown> | undefined) ?? {}
                  setParams({ eco: { ...eco, predators0: v }, adjusted: true })
                  window.setTimeout(() => setParams({ adjusted: false }), 0)
                }}
              />
            </>
          ) : (
            <>
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-bm-text">
                <span className="text-sm font-semibold">Оғоз</span>
                <input
                  type="checkbox"
                  checked={Boolean(((snap?.params as Record<string, unknown>)?.gen as Record<string, unknown> | undefined)?.playing ?? false)}
                  onChange={(e) => {
                    const gen = ((snap?.params as Record<string, unknown>)?.gen as Record<string, unknown> | undefined) ?? {}
                    setParams({ gen: { ...gen, playing: e.target.checked }, adjusted: true })
                    window.setTimeout(() => setParams({ adjusted: false }), 0)
                  }}
                />
              </label>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-bm-muted">
                Барои иҷрои ҳадаф: кабуд → <span className="font-mono text-bm-text">bb</span>, O → <span className="font-mono text-bm-text">OO</span>.
              </div>
              <TextField
                label="Eye P1"
                value={s((((snap?.params as Record<string, unknown>)?.gen as Record<string, unknown> | undefined)?.eyesP1), 'Bb')}
                onChange={(v) => {
                  const gen = ((snap?.params as Record<string, unknown>)?.gen as Record<string, unknown> | undefined) ?? {}
                  setParams({ gen: { ...gen, eyesP1: v }, adjusted: true })
                  window.setTimeout(() => setParams({ adjusted: false }), 0)
                }}
              />
              <TextField
                label="Eye P2"
                value={s((((snap?.params as Record<string, unknown>)?.gen as Record<string, unknown> | undefined)?.eyesP2), 'Bb')}
                onChange={(v) => {
                  const gen = ((snap?.params as Record<string, unknown>)?.gen as Record<string, unknown> | undefined) ?? {}
                  setParams({ gen: { ...gen, eyesP2: v }, adjusted: true })
                  window.setTimeout(() => setParams({ adjusted: false }), 0)
                }}
              />
              <TextField
                label="Blood P1"
                value={s((((snap?.params as Record<string, unknown>)?.gen as Record<string, unknown> | undefined)?.bloodP1), 'AO')}
                onChange={(v) => {
                  const gen = ((snap?.params as Record<string, unknown>)?.gen as Record<string, unknown> | undefined) ?? {}
                  setParams({ gen: { ...gen, bloodP1: v.toUpperCase() }, adjusted: true })
                  window.setTimeout(() => setParams({ adjusted: false }), 0)
                }}
              />
              <TextField
                label="Blood P2"
                value={s((((snap?.params as Record<string, unknown>)?.gen as Record<string, unknown> | undefined)?.bloodP2), 'BO')}
                onChange={(v) => {
                  const gen = ((snap?.params as Record<string, unknown>)?.gen as Record<string, unknown> | undefined) ?? {}
                  setParams({ gen: { ...gen, bloodP2: v.toUpperCase() }, adjusted: true })
                  window.setTimeout(() => setParams({ adjusted: false }), 0)
                }}
              />
              <TextField
                label="Hair P1"
                value={s((((snap?.params as Record<string, unknown>)?.gen as Record<string, unknown> | undefined)?.hairP1), 'Dd')}
                onChange={(v) => {
                  const gen = ((snap?.params as Record<string, unknown>)?.gen as Record<string, unknown> | undefined) ?? {}
                  setParams({ gen: { ...gen, hairP1: v }, adjusted: true })
                  window.setTimeout(() => setParams({ adjusted: false }), 0)
                }}
              />
              <TextField
                label="Hair P2"
                value={s((((snap?.params as Record<string, unknown>)?.gen as Record<string, unknown> | undefined)?.hairP2), 'Dd')}
                onChange={(v) => {
                  const gen = ((snap?.params as Record<string, unknown>)?.gen as Record<string, unknown> | undefined) ?? {}
                  setParams({ gen: { ...gen, hairP2: v }, adjusted: true })
                  window.setTimeout(() => setParams({ adjusted: false }), 0)
                }}
              />
            </>
          )}
        </>
      )}
      <label className="grid gap-1">
        <div className="text-xs font-semibold text-bm-muted">Суръат</div>
        <input
          type="range"
          min={0}
          max={3}
          step={0.05}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="bm-slider"
        />
        <div className="text-[11px] font-mono text-bm-muted">{speed.toFixed(2)}×</div>
      </label>

      {simId === 'lab.ecosystem.real' && (
        <>
          <Field label="plants" value={n(snap?.params?.plants0, 0)} min={1} max={2000} onChange={(v) => setParams({ plants0: v })} />
          <Field label="herbivores" value={n(snap?.params?.herbivores0, 0)} min={0} max={800} onChange={(v) => setParams({ herbivores0: v })} />
          <Field label="predators" value={n(snap?.params?.predators0, 0)} min={0} max={300} onChange={(v) => setParams({ predators0: v })} />
          <Field label="temperature (°C)" value={n(snap?.params?.temperature, 24)} step={0.5} min={-5} max={45} onChange={(v) => setParams({ temperature: v })} />
          <Field label="rainfall (mm)" value={n(snap?.params?.rainfall, 200)} step={5} min={0} max={500} onChange={(v) => setParams({ rainfall: v })} />
        </>
      )}

      {simId === 'lab.ecosystem.lotka-volterra' && (
        <>
          <Field label="prey0" value={n(snap?.params?.prey0, 0)} min={1} max={400} onChange={(v) => setParams({ prey0: v })} />
          <Field label="pred0" value={n(snap?.params?.pred0, 0)} min={0} max={200} onChange={(v) => setParams({ pred0: v })} />
          <Field label="α (growth)" value={n(snap?.params?.alpha, 0)} step={0.01} min={0} max={5} onChange={(v) => setParams({ alpha: v })} />
          <Field label="β (predation)" value={n(snap?.params?.beta, 0)} step={0.001} min={0} max={5} onChange={(v) => setParams({ beta: v })} />
          <Field label="γ (death)" value={n(snap?.params?.gamma, 0)} step={0.01} min={0} max={5} onChange={(v) => setParams({ gamma: v })} />
          <Field label="δ (efficiency)" value={n(snap?.params?.delta, 0)} step={0.001} min={0} max={5} onChange={(v) => setParams({ delta: v })} />
          <Field label="K (capacity)" value={n(snap?.params?.carryingCapacity, 0)} step={1} min={0} max={2000} onChange={(v) => setParams({ carryingCapacity: v })} />
        </>
      )}

      {simId === 'lab.genetics.mendelian' && (
        <>
          <TextField label="Доминант" value={s(snap?.params?.dominantAllele)} onChange={(v) => setParams({ dominantAllele: v })} />
          <TextField label="Рецессив" value={s(snap?.params?.recessiveAllele)} onChange={(v) => setParams({ recessiveAllele: v })} />
          <TextField label="Волидайн 1" value={s(snap?.params?.parent1)} onChange={(v) => setParams({ parent1: v })} />
          <TextField label="Волидайн 2" value={s(snap?.params?.parent2)} onChange={(v) => setParams({ parent2: v })} />
        </>
      )}

      {simId === 'lab.genetics.traits' && (
        <>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-bm-muted">
            Генотипҳо: барои чашм истифода баред <span className="font-mono text-bm-text">B/b</span>, барои мӯй <span className="font-mono text-bm-text">D/d</span>.
            Барои хун: <span className="font-mono text-bm-text">AA, AO, BB, BO, AB, OO</span>.
          </div>
          <TextField label="Eye P1" value={s(snap?.params?.eyesP1, 'Bb')} onChange={(v) => setParams({ eyesP1: v })} />
          <TextField label="Eye P2" value={s(snap?.params?.eyesP2, 'Bb')} onChange={(v) => setParams({ eyesP2: v })} />
          <TextField label="Hair P1" value={s(snap?.params?.hairP1, 'Dd')} onChange={(v) => setParams({ hairP1: v })} />
          <TextField label="Hair P2" value={s(snap?.params?.hairP2, 'Dd')} onChange={(v) => setParams({ hairP2: v })} />
          <TextField label="Blood P1" value={s(snap?.params?.bloodP1, 'AO')} onChange={(v) => setParams({ bloodP1: v.toUpperCase() })} />
          <TextField label="Blood P2" value={s(snap?.params?.bloodP2, 'BO')} onChange={(v) => setParams({ bloodP2: v.toUpperCase() })} />
        </>
      )}

      {simId === 'lab.microscope.virtual' && (
        <>
          <label className="grid gap-1">
            <div className="text-xs font-semibold text-bm-muted">Намуна</div>
            <select
              value={s(snap?.params?.sampleId, microscopeSamples[0]?.id ?? '')}
              onChange={(e) => setParams({ sampleId: e.target.value })}
              className="w-full rounded-2xl border border-bm-border bg-black/25 px-4 py-2 text-sm text-bm-text outline-none focus:border-white/15"
            >
              {microscopeSamples.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <div className="text-xs font-semibold text-bm-muted">Зум</div>
            <input
              type="range"
              min={1}
              max={6}
              step={0.02}
              value={n(snap?.params?.zoom, 1)}
              onChange={(e) => setParams({ zoom: Number(e.target.value) })}
              className="bm-slider"
            />
            <div className="text-[11px] font-mono text-bm-muted">{n(snap?.params?.zoom, 1).toFixed(2)}×</div>
          </label>

          <label className="grid gap-1">
            <div className="text-xs font-semibold text-bm-muted">Фокус</div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={n(snap?.params?.focus, 0.5)}
              onChange={(e) => setParams({ focus: Number(e.target.value) })}
              className="bm-slider"
            />
            <div className="text-[11px] font-mono text-bm-muted">{n(snap?.params?.focus, 0.5).toFixed(3)}</div>
          </label>

          <label className="grid gap-1">
            <div className="text-xs font-semibold text-bm-muted">Шиддати рӯшноӣ</div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={n(snap?.params?.light, 0.6)}
              onChange={(e) => setParams({ light: Number(e.target.value) })}
              className="bm-slider"
            />
            <div className="text-[11px] font-mono text-bm-muted">{n(snap?.params?.light, 0.6).toFixed(2)}</div>
          </label>
        </>
      )}

      {simId === 'lab.dna.sim' && (
        <>
          <Field label="Length" value={n(snap?.params?.length, 36)} min={12} max={80} step={1} onChange={(v) => setParams({ length: v })} />
          <Field label="Spin (rad/s)" value={n(snap?.params?.spin, 0.65)} min={0} max={2.5} step={0.05} onChange={(v) => setParams({ spin: v })} />
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-bm-border bg-black/25 px-4 py-3 text-sm text-bm-text">
            <span className="text-sm font-semibold">Гардиши худкор</span>
            <input
              type="checkbox"
              checked={Boolean(snap?.params?.autoSpin ?? true)}
              onChange={(e) => setParams({ autoSpin: e.target.checked })}
            />
          </label>

          <div className="grid gap-2">
            <button
              onClick={() => {
                setParams({ action: { kind: 'mutate', mutation: 'substitution' } })
                window.setTimeout(() => setParams({ action: null }), 0)
              }}
              className="rounded-2xl border border-bm-border bg-white/5 px-4 py-3 text-sm font-semibold text-bm-text transition hover:bg-white/8"
            >
              Mutation: substitution
            </button>
            <button
              onClick={() => {
                setParams({ action: { kind: 'mutate', mutation: 'deletion' } })
                window.setTimeout(() => setParams({ action: null }), 0)
              }}
              className="rounded-2xl border border-bm-border bg-white/5 px-4 py-3 text-sm font-semibold text-bm-text transition hover:bg-white/8"
            >
              Mutation: deletion
            </button>
            <button
              onClick={() => {
                setParams({ action: { kind: 'mutate', mutation: 'insertion' } })
                window.setTimeout(() => setParams({ action: null }), 0)
              }}
              className="rounded-2xl border border-bm-border bg-white/5 px-4 py-3 text-sm font-semibold text-bm-text transition hover:bg-white/8"
            >
              Mutation: insertion
            </button>
            <button
              onClick={() => {
                setParams({ action: { kind: 'replicate' } })
                window.setTimeout(() => setParams({ action: null }), 0)
              }}
              className="rounded-2xl bg-gradient-to-r from-bm-emerald to-bm-cyan px-4 py-3 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
            >
              Replication
            </button>
            <button
              onClick={() => {
                setParams({ action: { kind: 'clear-mismatch' } })
                window.setTimeout(() => setParams({ action: null }), 0)
              }}
              className="rounded-2xl border border-bm-border bg-white/5 px-4 py-3 text-sm font-semibold text-bm-text transition hover:bg-white/8"
            >
              Тоза кардани ҳолати мутация
            </button>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-bm-muted">
              Қоида: <span className="font-mono text-bm-text">A–T</span> ва <span className="font-mono text-bm-text">G–C</span>. Мутация метавонад ҷуфтшавиро вайрон кунад.
            </div>
          </div>
        </>
      )}
    </>
  )
}

function Kpi({ label, value, mono }: { label: string; value: number | string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-bm-border bg-black/20 p-3">
      <div className="text-[11px] font-semibold text-bm-muted">{label}</div>
      <div className={['mt-1 text-xl font-semibold text-bm-text', mono ? 'font-mono' : ''].join(' ')}>
        {typeof value === 'number' ? value.toFixed(2) : value}
      </div>
    </div>
  )
}

function Cell({ v, muted }: { v: string; muted?: boolean }) {
  return (
    <div className={['rounded-2xl border px-3 py-2 font-mono', muted ? 'border-white/10 bg-white/5 text-bm-muted' : 'border-bm-border bg-black/25 text-bm-text'].join(' ')}>
      {v || '—'}
    </div>
  )
}

function TraitPunnettCard({
  title,
  p1,
  p2,
  punnett,
}: {
  title: string
  p1: string
  p2: string
  punnett: [[string, string], [string, string]]
}) {
  return (
    <div className="rounded-2xl border border-bm-border bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-bm-muted">Волидайн: {p1} × {p2}</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <PunnettCell v={punnett[0][0]} />
        <PunnettCell v={punnett[0][1]} />
        <PunnettCell v={punnett[1][0]} />
        <PunnettCell v={punnett[1][1]} />
      </div>
    </div>
  )
}

function PunnettCell({ v }: { v: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center font-mono text-base text-bm-text motion-pop">
      {v}
    </div>
  )
}

function ResultCard({ title, items }: { title: string; items: Array<{ label: string; pct: number; explain: string }> }) {
  return (
    <div className="rounded-2xl border border-bm-border bg-black/20 p-4">
      <div className="text-xs font-semibold text-bm-muted">{title}</div>
      <div className="mt-3 grid gap-2">
        {items.map((x) => (
          <div key={x.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-semibold text-bm-text">{x.label}</div>
              <div className="text-sm font-mono text-bm-muted">{x.pct.toFixed(0)}%</div>
            </div>
            <div className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-bm-muted">{x.explain}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


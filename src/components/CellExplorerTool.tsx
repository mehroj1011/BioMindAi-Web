import { useMemo, useState } from 'react'
import { explainWithAi } from '../lib/aiExplain'

type Organelle = {
  id: string
  title: string
  short: string
  details: string
  color: string
}

const organelles: Organelle[] = [
  {
    id: 'membrane',
    title: 'Мембранаи ҳуҷайра',
    short: 'Сарҳад ва назорат',
    details: 'Мембрана воридшавӣ ва хориҷшавии моддаҳоро назорат мекунад, инчунин алоқаи ҳуҷайраро бо муҳит таъмин мекунад.',
    color: '#2dd4bf',
  },
  {
    id: 'nucleus',
    title: 'Ядро',
    short: 'ДНК ва идоракунӣ',
    details: 'Ядро маълумоти ирсӣ (ДНК)-ро нигоҳ медорад ва фаъолияти ҳуҷайраро идора мекунад (синтези сафеда, тақсимшавӣ).',
    color: '#a78bfa',
  },
  {
    id: 'mitochondria',
    title: 'Митохондрия',
    short: 'Энергия (АТФ)',
    details: 'Митохондрия “нерӯгоҳ”-и ҳуҷайра аст: дар он нафаскашии ҳуҷайравӣ мегузарад ва АТФ тавлид мешавад.',
    color: '#34d399',
  },
  {
    id: 'ribosome',
    title: 'Рибосома',
    short: 'Синтези сафеда',
    details: 'Рибосомаҳо сафедаҳоро аз рӯи маълумоти РНК месозанд. Онҳо метавонанд озод ё дар ЭПШ бошанд.',
    color: '#fbbf24',
  },
  {
    id: 'er',
    title: 'Шабакаи эндоплазмавӣ (ЭПШ)',
    short: 'Транспорт ва синтез',
    details: 'ЭПШ сафедаҳо ва липидҳоро синтез/интиқол мекунад. ЭПШ-и ноҳамвор рибосома дорад, ҳамвор — не.',
    color: '#60a5fa',
  },
  {
    id: 'golgi',
    title: 'Аппарати Голҷи',
    short: 'Бастабандӣ ва фиристодан',
    details: 'Аппарати Голҷи молекулаҳоро тағйир медиҳад, бастабандӣ мекунад ва ба ҷои лозим мефиристад (секретсия).',
    color: '#fb7185',
  },
  {
    id: 'lysosome',
    title: 'Лизосома',
    short: 'Тозакунӣ ва таҷзия',
    details: 'Лизосомаҳо ферментҳо доранд ва моддаҳои нолозим/қисмҳои вайроншударо таҷзия мекунанд.',
    color: '#f472b6',
  },
  {
    id: 'chloroplast',
    title: 'Хлоропласт (растанӣ)',
    short: 'Фотосинтез',
    details: 'Хлоропласт дар ҳуҷайраи растанӣ аст ва фотосинтезро иҷро мекунад (хлорофилл).',
    color: '#22c55e',
  },
  {
    id: 'wall',
    title: 'Девори ҳуҷайра (растанӣ)',
    short: 'Устуворӣ',
    details: 'Девори ҳуҷайра ба ҳуҷайраи растанӣ шакл ва устуворӣ медиҳад; аз мембрана ҷудо аст.',
    color: '#94a3b8',
  },
]

export function CellExplorerTool() {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return organelles
    return organelles.filter((o) => (o.title + ' ' + o.short + ' ' + o.details).toLowerCase().includes(s))
  }, [q])

  const [pickedId, setPickedId] = useState<string>('nucleus')
  const picked = useMemo(() => organelles.find((o) => o.id === pickedId) ?? organelles[0]!, [pickedId])

  const [aiOpen, setAiOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiErr, setAiErr] = useState<string | null>(null)

  return (
    <section className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Кашшофи ҳуҷайра — ҳуҷайра (интерактив)</div>
          <div className="mt-2 text-xs text-bm-muted">Органелларо интихоб кунед, шарҳ бинед ва “Фаҳмон бо AI”‑ро истифода баред.</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
          <div className="text-xs text-bm-muted">Ҷустуҷӯ</div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Масалан: митохондрия, ДНК, фотосинтез…"
            className="mt-2 w-full rounded-2xl border border-bm-border bg-black/20 px-4 py-3 text-sm text-bm-text outline-none focus:border-white/30"
          />

          <div className="mt-4 grid gap-2">
            {filtered.map((o) => (
              <button
                key={o.id}
                onClick={() => setPickedId(o.id)}
                className={[
                  'rounded-2xl border px-4 py-3 text-left text-sm transition',
                  pickedId === o.id ? 'bg-white/10 border-white/20' : 'bg-white/5 border-bm-border hover:bg-white/8',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: o.color }} />
                  <div>
                    <div className="font-semibold">{o.title}</div>
                    <div className="mt-1 text-xs text-bm-muted">{o.short}</div>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <div className="text-sm text-bm-muted">Ҳеҷ чиз ёфт нашуд.</div>}
          </div>
        </div>

        <div className="rounded-3xl border border-bm-border bg-black/20 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{picked.title}</div>
              <div className="mt-2 text-sm text-bm-muted">{picked.details}</div>
            </div>
            <button
              onClick={async () => {
                setAiOpen(true)
                setAiLoading(true)
                setAiText(null)
                setAiErr(null)
                try {
                  const t = await explainWithAi({
                    title: `Кашшофи ҳуҷайра: ${picked.title}`,
                    content: [
                      `Қисм: ${picked.title}`,
                      `Кӯтоҳ: ${picked.short}`,
                      `Тафсил: ${picked.details}`,
                      '',
                      'Лутфан шарҳро бо мисолҳо ва 3 саволи санҷишӣ биёвар.',
                    ].join('\n'),
                    gradeLabel: '5–11',
                  })
                  setAiText(t)
                } catch (e) {
                  setAiErr(String((e as Error)?.message || e))
                } finally {
                  setAiLoading(false)
                }
              }}
              className="rounded-2xl bg-gradient-to-r from-bm-purple to-bm-cyan px-5 py-3 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
            >
              Фаҳмон бо AI
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-bm-border bg-black/25 p-4">
            <div className="text-xs text-bm-muted">Схемаи содда (диаграмма)</div>
            <div className="mt-3 grid place-items-center">
              <svg viewBox="0 0 520 320" className="w-full max-w-[760px]">
                <defs>
                  <radialGradient id="cellGlow" cx="50%" cy="45%" r="60%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="520" height="320" fill="url(#cellGlow)" />
                <ellipse cx="260" cy="160" rx="200" ry="120" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
                <ellipse cx="260" cy="160" rx="175" ry="100" fill="rgba(0,0,0,0.20)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

                {/* Nucleus */}
                <ellipse cx="250" cy="150" rx="58" ry="44" fill="rgba(167,139,250,0.25)" stroke="rgba(167,139,250,0.65)" strokeWidth="2" />
                <circle cx="270" cy="150" r="12" fill="rgba(167,139,250,0.55)" />

                {/* Mitochondria */}
                <ellipse cx="165" cy="155" rx="32" ry="14" fill="rgba(52,211,153,0.18)" stroke="rgba(52,211,153,0.6)" strokeWidth="2" />
                <ellipse cx="350" cy="195" rx="32" ry="14" fill="rgba(52,211,153,0.18)" stroke="rgba(52,211,153,0.6)" strokeWidth="2" />

                {/* Golgi */}
                <path d="M320 120 C350 110, 372 120, 386 138 C370 150, 350 152, 328 146" fill="none" stroke="rgba(251,113,133,0.75)" strokeWidth="4" strokeLinecap="round" />
                <path d="M318 140 C350 132, 372 140, 386 156 C370 168, 350 170, 328 165" fill="none" stroke="rgba(251,113,133,0.55)" strokeWidth="4" strokeLinecap="round" />

                {/* Selected highlight */}
                {picked.id === 'nucleus' && <ellipse cx="250" cy="150" rx="70" ry="54" fill="none" stroke={picked.color} strokeWidth="3" />}
                {picked.id === 'mitochondria' && <ellipse cx="165" cy="155" rx="44" ry="22" fill="none" stroke={picked.color} strokeWidth="3" />}
                {picked.id === 'golgi' && <circle cx="360" cy="145" r="38" fill="none" stroke={picked.color} strokeWidth="3" />}
                {picked.id === 'membrane' && <ellipse cx="260" cy="160" rx="206" ry="126" fill="none" stroke={picked.color} strokeWidth="3" />}
              </svg>
            </div>
          </div>

          {aiOpen && (
            <div className="mt-4 rounded-3xl border border-bm-border bg-black/25 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Шарҳ аз AI</div>
                  <div className="mt-1 text-xs text-bm-muted">{picked.title}</div>
                </div>
                <button
                  onClick={() => setAiOpen(false)}
                  className="rounded-2xl border border-bm-border bg-white/5 px-3 py-2 text-xs font-semibold text-bm-text transition hover:bg-white/8"
                >
                  Пӯшидан
                </button>
              </div>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-bm-text">
                {aiLoading && <div className="text-sm text-bm-muted">AI фикр мекунад…</div>}
                {!aiLoading && aiErr && <div className="text-sm text-bm-muted">Хато: {aiErr}</div>}
                {!aiLoading && !aiErr && aiText && aiText}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}


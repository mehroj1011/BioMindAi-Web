import { useMemo, useState } from 'react'
import { buildBioDigitalUrl } from '../lib/biodigital'
import { getAnatomyState, markRecent, toggleFavorite } from '../lib/anatomy'

const presetModels = [
  {
    id: 'lungs-coronal',
    title: 'Шуш (буриши короналӣ)',
    url: 'https://human.biodigital.com/view?id=production/maleAdult/lungs_coronal_cross_section&lang=en&ref=share',
  },
  {
    id: 'female-complete',
    title: 'Бадани зан (пурра)',
    url: 'https://human.biodigital.com/view?id=production/femaleAdult/female_complete_anatomy_20&lang=en&ref=share',
  },
  {
    id: 'male-complete',
    title: 'Бадани мард (пурра)',
    url: 'https://human.biodigital.com/view?id=production/maleAdult/male_complete_anatomy_20&lang=en&ref=share',
  },
  {
    id: 'heart-quiz',
    title: 'Дил (санҷиш: сатҳ ва клапанҳо)',
    url: 'https://human.biodigital.com/view?id=production/maleAdult/external_heart_surface_features_and_valves_quiz&lang=en&ref=share',
  },
  {
    id: 'brain-region',
    title: 'Майна',
    url: 'https://human.biodigital.com/view?id=production/maleAdult/male_region_brain_20&lang=en&ref=share',
  },
] as const

export function AnatomyPage() {
  const [modelId, setModelId] = useState<string>(presetModels[2]?.id ?? 'male-complete')
  const [reloadKey, setReloadKey] = useState(0)
  const [query, setQuery] = useState('')
  const [aState, setAState] = useState(() => getAnatomyState())
  const [loading, setLoading] = useState(true)

  // `key={reloadKey}` on iframe already forces reload; keep memo deps minimal.
  const url = useMemo(() => {
    const picked = presetModels.find((m) => m.id === modelId)
    return buildBioDigitalUrl(picked?.url ?? presetModels[0]?.url ?? '')
  }, [modelId])

  const models = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = [...presetModels]
    if (!q) return base
    return base.filter((m) => m.title.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.url.toLowerCase().includes(q))
  }, [query])

  const favorites = useMemo(() => new Set(aState.favorites), [aState.favorites])
  const recents = useMemo(() => aState.recents.slice(0, 6), [aState.recents])

  return (
    <div className="grid gap-6">
      <section className="glass rounded-3xl p-6 sm:p-10">
        <h2 className="text-2xl font-semibold tracking-tight">Анатомия 3D (браузер)</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bm-muted sm:text-base">
          Ин ҷо мо саҳифаҳои BioDigital Human‑ро ҳамчун намоиши веб (бе API‑калид) мекушоем. Моделҳоро интихоб кунед — ҳамааш бояд равон ва зебо кор кунад.
        </p>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <div className="md:col-span-1">
            <div className="text-sm font-semibold">Модел интихоб кунед</div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ҷустуҷӯ…"
              className="mt-3 w-full rounded-2xl border border-bm-border bg-black/20 px-4 py-3 text-sm text-bm-text outline-none focus:border-white/30"
            />

            {recents.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-bm-muted">Охиринҳо</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {recents.map((id) => (
                    <button
                      key={id}
                      onClick={() => {
                        setModelId(id)
                        setReloadKey((x) => x + 1)
                      }}
                      className="rounded-full border border-bm-border bg-white/5 px-3 py-1 text-xs text-bm-text hover:bg-white/8"
                    >
                      {id.split('/').slice(-1)[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-2">
              {models.map((m) => {
                const fav = favorites.has(m.id)
                return (
                  <div
                    key={m.id}
                    className={[
                      'rounded-2xl border p-3 text-left text-sm transition',
                      modelId === m.id ? 'border-white/30 bg-white/10' : 'border-bm-border bg-white/5 hover:bg-white/8',
                    ].join(' ')}
                  >
                    <button
                      onClick={() => {
                        setModelId(m.id)
                        setReloadKey((x) => x + 1)
                        setAState(markRecent(m.id))
                      }}
                      className="block w-full text-left"
                    >
                      <div className="font-semibold">{m.title}</div>
                    </button>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setAState(toggleFavorite(m.id))}
                        className="rounded-full border border-bm-border bg-black/20 px-3 py-1 text-xs text-bm-text hover:bg-white/8"
                      >
                        {fav ? '★ Дӯстдошта' : '☆ Дӯстдошта'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-bm-muted">Намоиши BioDigital</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setLoading(true)
                    setReloadKey((x) => x + 1)
                  }}
                  className="rounded-2xl border border-bm-border bg-white/5 px-4 py-2 text-sm font-semibold text-bm-text transition hover:bg-white/8"
                >
                  Аз нав
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-gradient-to-r from-bm-emerald to-bm-cyan px-4 py-2 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
                >
                  Кушодан дар таб
                </a>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-3xl border border-bm-border bg-black/30">
              <div className="relative">
                <iframe
                  key={reloadKey}
                  title="BioDigital Human"
                  src={url}
                  className="h-[56vh] w-full sm:h-[62vh] lg:h-[70vh]"
                  allow="fullscreen; xr-spatial-tracking"
                  onLoad={() => setLoading(false)}
                />
                {loading && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/30">
                    <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-bm-muted shadow-glass">
                      Бор мешавад…
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-xs text-bm-muted">
              Агар браузер блок кунад: санҷед third‑party cookies / tracking protection / VPN. Барои беҳтарин таҷриба “Кушодан дар таб” ҳам дастрас аст.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


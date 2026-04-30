import { Link, useParams } from 'react-router-dom'
import { lessons, expandedTopics as topics } from '../data/lessons'
import { useMemo, useState } from 'react'
import { explainWithAi } from '../lib/aiExplain'

export function LessonTopicPage() {
  const { topicId, gradeId } = useParams()
  const topic = topics.find((t) => t.id === topicId)
  const [q, setQ] = useState('')
  const [aiQ, setAiQ] = useState('')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiErr, setAiErr] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const list = useMemo(() => lessons.filter((l) => l.topicId === topicId), [topicId])
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter((l) => l.title.toLowerCase().includes(s))
  }, [q, list])

  const gradeLabel = useMemo(() => (gradeId ? `Синфи ${gradeId}` : undefined), [gradeId])
  const backTo = gradeId ? `/lessons/grade/${encodeURIComponent(gradeId)}` : '/lessons'
  const backLabel = gradeId ? 'Ба мавзӯъҳои синф' : 'Ба синфҳо'

  return (
    <section className="glass rounded-3xl p-6 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{topic?.title ?? 'Мавзӯъ'}</h2>
          <div className="mt-2 text-sm text-bm-muted">{topic?.subtitle ?? ''}</div>
        </div>
        <Link
          to={backTo}
          className="rounded-2xl border border-bm-border bg-white/5 px-4 py-2 text-sm font-semibold text-bm-text transition hover:bg-white/8"
        >
          {backLabel}
        </Link>
      </div>

      <div className="mt-5 grid gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ҷустуҷӯ дар дарсҳо…"
          className="w-full rounded-2xl border border-bm-border bg-black/20 px-4 py-3 text-sm text-bm-text outline-none ring-0 focus:border-white/30"
        />
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <input
            value={aiQ}
            onChange={(e) => setAiQ(e.target.value)}
            placeholder="Пурсидан аз AI дар бораи ин мавзӯъ…"
            className="w-full rounded-2xl border border-bm-border bg-black/20 px-4 py-3 text-sm text-bm-text outline-none ring-0 focus:border-white/30"
          />
          <button
            onClick={async () => {
              setAiOpen(true)
              setAiErr(null)
              setAiText(null)
              setAiLoading(true)
              try {
                const context = [
                  `Мавзӯъ: ${topic?.title ?? 'Мавзӯъ'}`,
                  topic?.subtitle ? `Шарҳ: ${topic.subtitle}` : '',
                  '',
                  'Дарсҳо дар ин мавзӯъ:',
                  ...list.slice(0, 60).map((l) => `- ${l.title}`),
                  list.length > 60 ? `… ва боз ${list.length - 60} дарс.` : '',
                ]
                  .filter(Boolean)
                  .join('\n')

                const t = await explainWithAi({
                  title: topic?.title ?? 'Мавзӯъ',
                  content: context,
                  gradeLabel,
                  extraQuestion: aiQ.trim() || 'Ин мавзӯъро фаҳмон ва аз содда ба мураккаб биёвар.',
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
            Пурсидан
          </button>
        </div>
        <div className="text-xs text-bm-muted">Мисол: «Ин мавзӯъро мисолҳо бо тасвир (тавсиф) фаҳмон.»</div>
      </div>

      <div className="mt-6 grid gap-3">
        {filtered.map((l) => (
          <Link
            key={l.id}
            to={
              gradeId
                ? `/lessons/grade/${encodeURIComponent(gradeId)}/lesson/${encodeURIComponent(l.id)}`
                : `/lessons/lesson/${encodeURIComponent(l.topicId)}/${encodeURIComponent(l.id)}`
            }
            className="rounded-3xl border border-bm-border bg-white/5 p-5 transition hover:bg-white/8"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">{l.title}</div>
              <div className="text-xs text-bm-muted">{l.minutes} дақ</div>
            </div>
            <div className="mt-2 text-xs text-bm-muted">Мини‑квиз пас аз хондан</div>
          </Link>
        ))}
        {filtered.length === 0 && <div className="text-sm text-bm-muted">Дарс нест.</div>}
      </div>

      {aiOpen && (
        <div className="mt-6 rounded-3xl border border-bm-border bg-black/25 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Ҷавоби AI</div>
              <div className="mt-1 text-xs text-bm-muted">{topic?.title ?? 'Мавзӯъ'}</div>
            </div>
            <button
              onClick={() => setAiOpen(false)}
              className="rounded-2xl border border-bm-border bg-white/5 px-3 py-2 text-xs font-semibold text-bm-text transition hover:bg-white/8"
            >
              Пӯшидан
            </button>
          </div>
          <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-bm-text">
            {aiLoading && <div className="text-sm text-bm-muted">AI фикр мекунад…</div>}
            {!aiLoading && aiErr && <div className="text-sm text-bm-muted">Хато: {aiErr}</div>}
            {!aiLoading && !aiErr && aiText && aiText}
          </div>
        </div>
      )}
    </section>
  )
}


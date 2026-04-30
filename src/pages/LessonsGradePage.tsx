import { Link, useParams } from 'react-router-dom'
import { grades, lessons, expandedTopics as topics } from '../data/lessons'
import { useMemo, useState } from 'react'

export function LessonsGradePage() {
  const { gradeId } = useParams()
  const grade = grades.find((g) => g.id === gradeId)
  const [q, setQ] = useState('')
  const list = useMemo(() => topics.filter((t) => t.gradeId === gradeId), [gradeId])
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter((t) => (t.title + ' ' + t.subtitle).toLowerCase().includes(s))
  }, [q, list])

  return (
    <section className="glass rounded-3xl p-6 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{grade?.title ?? 'Синф'}</h2>
          <div className="mt-2 text-sm text-bm-muted">{grade?.subtitle ?? ''}</div>
        </div>
        <Link
          to="/lessons"
          className="rounded-2xl border border-bm-border bg-white/5 px-4 py-2 text-sm font-semibold text-bm-text transition hover:bg-white/8"
        >
          Ба синфҳо
        </Link>
      </div>

      <div className="mt-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ҷустуҷӯ дар мавзӯъҳо…"
          className="w-full rounded-2xl border border-bm-border bg-black/20 px-4 py-3 text-sm text-bm-text outline-none ring-0 focus:border-white/30"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {filtered.map((t) => {
          const count = lessons.filter((l) => l.topicId === t.id).length
          return (
            <div key={t.id} className="rounded-3xl border border-bm-border bg-white/5 p-5">
              <div className="text-sm font-semibold">{t.title}</div>
              <div className="mt-2 text-sm text-bm-muted">{t.subtitle}</div>
              <div className="mt-4 text-xs text-bm-muted">{count} дарс</div>
              <div className="mt-4">
                <Link
                  to={`/lessons/grade/${encodeURIComponent(t.gradeId)}/topic/${encodeURIComponent(t.id)}`}
                  className="inline-flex rounded-2xl bg-gradient-to-r from-bm-emerald to-bm-cyan px-4 py-2 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
                >
                  Кушодан
                </Link>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <div className="text-sm text-bm-muted">Ҳеҷ мавзӯъ ёфт нашуд.</div>}
      </div>
    </section>
  )
}


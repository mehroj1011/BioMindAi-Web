import { Link } from 'react-router-dom'
import { grades, lessons, expandedTopics as topics } from '../data/lessons'
import { useMemo, useState } from 'react'
import { instituteBooks100Plus, instituteModules } from '../data/institute'

export function LessonsPage() {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'school' | 'institute' | 'books'>('school')

  const filteredGrades = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return grades
    return grades.filter((g) => {
      const gradeTopics = topics.filter((t) => t.gradeId === g.id)
      const hitInGrade = (g.title + ' ' + g.subtitle).toLowerCase().includes(s)
      const hitInTopics = gradeTopics.some((t) => (t.title + ' ' + t.subtitle).toLowerCase().includes(s))
      return hitInGrade || hitInTopics
    })
  }, [q])

  const filteredModules = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return instituteModules
    return instituteModules.filter((m) => (m.title + ' ' + m.subtitle + ' ' + m.semester + ' ' + m.area).toLowerCase().includes(s))
  }, [q])

  const filteredBooks = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return instituteBooks100Plus
    return instituteBooks100Plus.filter((b) => {
      const hay = `${b.titleTj} ${b.author ?? ''} ${b.area} ${b.level} ${b.type} ${b.summaryTj}`.toLowerCase()
      return hay.includes(s)
    })
  }, [q])

  return (
    <div className="grid gap-6">
      <section className="glass rounded-3xl p-6 sm:p-10">
        <h2 className="text-2xl font-semibold tracking-tight">Дарс</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bm-muted sm:text-base">
          Мактаб (5–11) + маводҳои институтӣ + китобхона. Ҳама матнҳо бо забони тоҷикӣ (барои китобҳо — метамаълумот + аннотатсия).
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => setTab('school')}
            className={[
              'rounded-2xl border px-4 py-2 text-xs font-semibold transition',
              tab === 'school' ? 'border-white/18 bg-white/12 text-bm-text shadow-glass' : 'border-white/10 bg-white/5 text-bm-muted hover:bg-white/8',
            ].join(' ')}
          >
            Мактаб (5–11)
          </button>
          <button
            onClick={() => setTab('institute')}
            className={[
              'rounded-2xl border px-4 py-2 text-xs font-semibold transition',
              tab === 'institute' ? 'border-white/18 bg-white/12 text-bm-text shadow-glass' : 'border-white/10 bg-white/5 text-bm-muted hover:bg-white/8',
            ].join(' ')}
          >
            Институт
          </button>
          <button
            onClick={() => setTab('books')}
            className={[
              'rounded-2xl border px-4 py-2 text-xs font-semibold transition',
              tab === 'books' ? 'border-white/18 bg-white/12 text-bm-text shadow-glass' : 'border-white/10 bg-white/5 text-bm-muted hover:bg-white/8',
            ].join(' ')}
          >
            Китобҳо (100+)
          </button>
        </div>

        <div className="mt-5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tab === 'school' ? 'Ҷустуҷӯ: синф ё мавзӯъ…' : tab === 'institute' ? 'Ҷустуҷӯ: модул/фан…' : 'Ҷустуҷӯ: китоб/муаллиф/соҳа…'}
            className="w-full rounded-2xl border border-bm-border bg-black/20 px-4 py-3 text-sm text-bm-text outline-none ring-0 focus:border-white/30"
          />
          <div className="mt-2 text-xs text-bm-muted">
            Масалан: «ҳуҷайра», «экология», «генетика», «микробиология», «анатомия».
          </div>
        </div>

        {tab === 'school' && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {filteredGrades.map((g) => {
              const gradeTopics = topics.filter((t) => t.gradeId === g.id)
              const count = lessons.filter((l) => l.gradeId === g.id).length
              return (
                <div key={g.id} className="rounded-3xl border border-bm-border bg-white/5 p-5">
                  <div className="text-sm font-semibold">{g.title}</div>
                  <div className="mt-2 text-sm text-bm-muted">{g.subtitle}</div>
                  <div className="mt-4 text-xs text-bm-muted">
                    {gradeTopics.length} мавзӯъ · {count} дарс
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/lessons/grade/${g.id}`}
                      className="inline-flex rounded-2xl bg-gradient-to-r from-bm-emerald to-bm-cyan px-4 py-2 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
                    >
                      Кушодан
                    </Link>
                  </div>
                </div>
              )
            })}
            {filteredGrades.length === 0 && <div className="text-sm text-bm-muted">Ҳеҷ чиз ёфт нашуд.</div>}
          </div>
        )}

        {tab === 'institute' && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {filteredModules.map((m) => (
              <div key={m.id} className="rounded-3xl border border-bm-border bg-white/5 p-5">
                <div className="text-sm font-semibold">{m.title}</div>
                <div className="mt-2 text-sm text-bm-muted">{m.subtitle}</div>
                <div className="mt-4 text-xs text-bm-muted">
                  {m.semester} · {m.area}
                </div>
                <div className="mt-4 text-xs text-bm-muted">
                  Маслиҳат: дар ҷустуҷӯ номи фанро нависед; китобҳои мувофиқро дар таби “Китобҳо” пайдо мекунед.
                </div>
              </div>
            ))}
            {filteredModules.length === 0 && <div className="text-sm text-bm-muted">Ҳеҷ чиз ёфт нашуд.</div>}
          </div>
        )}

        {tab === 'books' && (
          <div className="mt-6 grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-black/25 p-4 text-xs text-bm-muted">
              Эзоҳ: мо матни пурраи китобҳоро нусха намекунем (ҳуқуқи муаллиф). Ин ҷо китобхона ҳамчун “каталог + аннотатсия” аст; барои баъзе маводҳо линкҳои расмии дастрас дода мешаванд.
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {filteredBooks.map((b) => (
                <div key={b.id} className="rounded-3xl border border-bm-border bg-white/5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{b.titleTj}</div>
                      <div className="mt-1 text-xs text-bm-muted">
                        {b.area} · {b.level} · {b.type} · {b.language}
                      </div>
                      {b.author && <div className="mt-1 text-xs text-bm-muted">Муаллиф: {b.author}</div>}
                    </div>
                    <Link
                      to={`/library/book/${encodeURIComponent(b.id)}`}
                      className="rounded-2xl border border-white/12 bg-white/6 px-3 py-2 text-xs font-semibold text-bm-text transition hover:bg-white/10"
                    >
                      Кушодан
                    </Link>
                  </div>
                  <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-bm-muted">{b.summaryTj}</div>
                  {b.source && <div className="mt-3 text-[11px] text-bm-muted/80">Манбаъ: {b.source}</div>}
                </div>
              ))}
            </div>
            {filteredBooks.length === 0 && <div className="text-sm text-bm-muted">Ҳеҷ китоб ёфт нашуд.</div>}
          </div>
        )}
      </section>
    </div>
  )
}


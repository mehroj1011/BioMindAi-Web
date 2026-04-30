import { Link, useNavigate, useParams } from 'react-router-dom'
import { lessons } from '../data/lessons'
import { addXp } from '../lib/progress'
import { useMemo, useState } from 'react'
import { explainWithAi } from '../lib/aiExplain'

export function LessonQuizPage() {
  const { topicId, lessonId, gradeId } = useParams()
  const nav = useNavigate()
  const id = lessonId
  const lesson = gradeId
    ? lessons.find((l) => l.gradeId === gradeId && l.id === id)
    : lessons.find((l) => l.topicId === topicId && l.id === id)

  const [picked, setPicked] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const gradeLabel = useMemo(() => (gradeId ? `Синфи ${gradeId}` : undefined), [gradeId])
  const [aiOpen, setAiOpen] = useState(false)
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiErr, setAiErr] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const correctId = useMemo(() => {
    const o = lesson?.quiz.options.find((x) => x.correct)
    return o?.id ?? null
  }, [lesson?.quiz.options])

  if (!lesson) {
    return (
      <section className="glass rounded-3xl p-6 sm:p-10">
        <div className="text-sm text-bm-muted">Квиз ёфт нашуд.</div>
        <div className="mt-4">
          <Link
            to="/lessons"
            className="rounded-2xl border border-bm-border bg-white/5 px-4 py-2 text-sm font-semibold text-bm-text transition hover:bg-white/8"
          >
            Ба дарсҳо
          </Link>
        </div>
      </section>
    )
  }

  const isCorrect = submitted && picked != null && picked === correctId

  return (
    <section className="glass rounded-3xl p-6 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Квиз</h2>
          <div className="mt-2 text-sm text-bm-muted">{lesson.title}</div>
        </div>
        <Link
          to={
            gradeId
              ? `/lessons/grade/${encodeURIComponent(gradeId)}/lesson/${encodeURIComponent(lesson.id)}`
              : `/lessons/lesson/${encodeURIComponent(lesson.topicId)}/${encodeURIComponent(lesson.id)}`
          }
          className="rounded-2xl border border-bm-border bg-white/5 px-4 py-2 text-sm font-semibold text-bm-text transition hover:bg-white/8"
        >
          Ба дарс
        </Link>
      </div>

      <div className="mt-6 rounded-3xl border border-bm-border bg-black/20 p-5">
        <div className="text-sm font-semibold">{lesson.quiz.question}</div>
        <div className="mt-4 grid gap-2">
          {lesson.quiz.options.map((o) => {
            const active = picked === o.id
            const verdict =
              submitted && (o.id === correctId ? 'correct' : active ? 'wrong' : 'none')
            return (
              <button
                key={o.id}
                onClick={() => !submitted && setPicked(o.id)}
                className={[
                  'rounded-2xl border px-4 py-3 text-left text-sm transition',
                  active ? 'bg-white/10 border-white/20' : 'bg-white/5 border-bm-border hover:bg-white/8',
                  verdict === 'correct' ? 'border-bm-emerald/60' : '',
                  verdict === 'wrong' ? 'border-red-400/40' : '',
                ].join(' ')}
              >
                {o.label}
              </button>
            )
          })}
        </div>

        {!submitted ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              disabled={!picked}
              onClick={() => setSubmitted(true)}
              className={[
                'rounded-2xl px-5 py-3 text-sm font-semibold shadow-glass transition',
                picked
                  ? 'bg-gradient-to-r from-bm-emerald to-bm-cyan text-black hover:opacity-95'
                  : 'bg-white/5 text-bm-muted border border-bm-border',
              ].join(' ')}
            >
              Санҷидан
            </button>
            <button
              onClick={async () => {
                setAiOpen(true)
                setAiErr(null)
                setAiText(null)
                setAiLoading(true)
                try {
                  const t = await explainWithAi({
                    title: `Квиз: ${lesson.title}`,
                    content: [
                      `Савол: ${lesson.quiz.question}`,
                      '',
                      'Ҷавобҳо:',
                      ...lesson.quiz.options.map((o) => `- ${o.label}`),
                      '',
                      'Шарҳи мавҷуда:',
                      lesson.quiz.explanation,
                    ].join('\n'),
                    gradeLabel,
                    extraQuestion: 'Шарҳ деҳ ва чаро ҷавоби дуруст ҳамин аст?',
                  })
                  setAiText(t)
                } catch (e) {
                  setAiErr(String((e as Error)?.message || e))
                } finally {
                  setAiLoading(false)
                }
              }}
              className="rounded-2xl border border-bm-border bg-white/5 px-5 py-3 text-sm font-semibold text-bm-text transition hover:bg-white/8"
            >
              Фаҳмон бо AI
            </button>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            <div className={['text-sm', isCorrect ? 'text-bm-emerald' : 'text-bm-muted'].join(' ')}>
              {isCorrect ? 'Дуруст! +25 XP' : 'Нодуруст. Боз кӯшиш кунед ё шарҳро бинед.'}
            </div>
            <div className="text-sm text-bm-muted">{lesson.quiz.explanation}</div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  if (isCorrect) addXp(25)
                  nav('/progress')
                }}
                className="rounded-2xl bg-gradient-to-r from-bm-emerald to-bm-cyan px-5 py-3 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
              >
                Ба пешрафт
              </button>
              <button
                onClick={() => {
                  setPicked(null)
                  setSubmitted(false)
                }}
                className="rounded-2xl border border-bm-border bg-white/5 px-5 py-3 text-sm font-semibold text-bm-text transition hover:bg-white/8"
              >
                Аз нав
              </button>
            </div>
          </div>
        )}
      </div>

      {aiOpen && (
        <div className="mt-6 rounded-3xl border border-bm-border bg-black/25 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Шарҳ аз AI</div>
              <div className="mt-1 text-xs text-bm-muted">Бо забони тоҷикӣ</div>
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


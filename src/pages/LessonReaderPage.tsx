import { Link, useNavigate, useParams } from 'react-router-dom'
import { addXp } from '../lib/progress'
import { lessons } from '../data/lessons'
import { getLocalStorageString, setLocalStorageString, storageKeys } from '../lib/storage'
import { useMemo, useState } from 'react'
import { explainWithAi } from '../lib/aiExplain'

type LessonsState = {
  completedLessonIds: string[]
}

function loadLessonsState(): LessonsState {
  const raw = getLocalStorageString(storageKeys.lessons)
  if (raw) {
    try {
      return JSON.parse(raw) as LessonsState
    } catch {
      // ignore
    }
  }
  return { completedLessonIds: [] }
}

function saveLessonsState(s: LessonsState) {
  setLocalStorageString(storageKeys.lessons, JSON.stringify(s))
}

export function LessonReaderPage() {
  const { topicId, lessonId, gradeId } = useParams()
  const nav = useNavigate()
  const lesson = gradeId
    ? lessons.find((l) => l.gradeId === gradeId && l.id === lessonId)
    : lessons.find((l) => l.topicId === topicId && l.id === lessonId)

  const gradeLabel = useMemo(() => (gradeId ? `Синфи ${gradeId}` : undefined), [gradeId])
  const [aiOpen, setAiOpen] = useState(false)
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiErr, setAiErr] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  if (!lesson) {
    return (
      <section className="glass rounded-3xl p-6 sm:p-10">
        <div className="text-sm text-bm-muted">Дарс ёфт нашуд.</div>
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

  const state = loadLessonsState()
  const key = `${lesson.topicId}:${lesson.id}`
  const completed = state.completedLessonIds.includes(key)

  return (
    <section className="glass rounded-3xl p-6 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{lesson.title}</h2>
          <div className="mt-2 text-sm text-bm-muted">{lesson.minutes} дақиқа</div>
        </div>
        <Link
          to={
            gradeId
              ? `/lessons/grade/${encodeURIComponent(gradeId)}/topic/${encodeURIComponent(lesson.topicId)}`
              : `/lessons/topic/${encodeURIComponent(lesson.topicId)}`
          }
          className="rounded-2xl border border-bm-border bg-white/5 px-4 py-2 text-sm font-semibold text-bm-text transition hover:bg-white/8"
        >
          Ба рӯйхат
        </Link>
      </div>

      <div className="mt-6 whitespace-pre-wrap rounded-3xl border border-bm-border bg-black/20 p-5 text-sm leading-relaxed text-bm-text">
        {lesson.content}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() =>
            nav(
              gradeId
                ? `/lessons/grade/${encodeURIComponent(gradeId)}/quiz/${encodeURIComponent(lesson.id)}`
                : `/lessons/quiz/${encodeURIComponent(lesson.topicId)}/${encodeURIComponent(lesson.id)}`
            )
          }
          className="rounded-2xl bg-gradient-to-r from-bm-emerald to-bm-cyan px-5 py-3 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
        >
          Гузаштан ба квиз
        </button>
        <button
          onClick={async () => {
            setAiOpen(true)
            setAiErr(null)
            setAiText(null)
            setAiLoading(true)
            try {
              const t = await explainWithAi({
                title: lesson.title,
                content: lesson.content,
                gradeLabel,
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
        <button
          disabled={completed}
          onClick={() => {
            if (completed) return
            const next = {
              ...state,
              completedLessonIds: [...state.completedLessonIds, key],
            }
            saveLessonsState(next)
            addXp(40)
            nav('/progress')
          }}
          className={[
            'rounded-2xl px-5 py-3 text-sm font-semibold transition',
            completed ? 'border border-bm-border bg-white/5 text-bm-muted' : 'border border-bm-border bg-white/5 text-bm-text hover:bg-white/8',
          ].join(' ')}
        >
          {completed ? 'Аллакай анҷом шуд' : 'Анҷом шуд (+40 XP)'}
        </button>
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


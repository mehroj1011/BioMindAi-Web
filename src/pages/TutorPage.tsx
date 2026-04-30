import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { getLocalStorageString, setLocalStorageString, storageKeys } from '../lib/storage'

type Role = 'user' | 'assistant'
type Msg = { id: string; role: Role; text: string; at: number }

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

function demoAnswerTj(prompt: string): string {
  const p = prompt.trim()
  if (!p) return 'Лутфан савол нависед.'
  const lower = p.toLowerCase()
  if (lower.includes('дил') || lower.includes('heart')) {
    return [
      'Дил узви асосии системаи дилу раг мебошад.',
      'Он хунро ба тамоми бадан мефиристад, то оксиген ва ғизо ба ҳуҷайраҳо расад.',
      'Агар хоҳед, ман инчунин сохтори дил (даҳлезҳо/меъдачаҳо, клапанҳо) ва гардиши хунро шарҳ медиҳам.',
    ].join('\n')
  }
  if (lower.includes('днк') || lower.includes('dna')) {
    return [
      'ДНК (DNA) молекулаест, ки маълумоти ирсиро нигоҳ медорад.',
      'Он аз нуклеотидҳо сохта шудааст: A, T, G, C.',
      'Ҷуфтшавӣ: A–T ва G–C. Ин барои нусхабардорӣ (репликация) муҳим аст.',
    ].join('\n')
  }
  return [
    'Ман фаҳмидам. Барои ҷавоби дақиқ, лутфан бигӯед:',
    '- синф/сатҳи шумо чандум аст?',
    '- мавзӯъ аз кадом қисми биология (анатомия, генетика, экология...) аст?',
    '',
    'Ҳоло ҷавоби кӯтоҳ:',
    `Саволи шумо: “${p}”. Ман метавонам шарҳи қадам‑ба‑қадам ва мисолҳо диҳам.`,
  ].join('\n')
}

async function tryServerAnswer(message: string, history: { role: Role; text: string }[]): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25_000)
    const r = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message, history, userDisplayName: 'Дӯст' }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!r.ok) return null
    const json = (await r.json()) as { text?: string }
    const t = String(json.text || '').trim()
    return t || null
  } catch {
    return null
  }
}

async function readApiStatus(): Promise<'down' | 'no_key' | 'ok'> {
  try {
    const r = await fetch('/api/health')
    if (!r.ok) return 'down'
    const j = (await r.json()) as { ok?: boolean; geminiConfigured?: boolean }
    if (!j.ok) return 'down'
    return j.geminiConfigured ? 'ok' : 'no_key'
  } catch {
    return 'down'
  }
}

export function TutorPage() {
  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      id: uid(),
      role: 'assistant',
      at: Date.now(),
      text:
        'Салом! Ман мураббии BioMind ҳастам. Саволатонро бо забони тоҷикӣ нависед — ман кӯмак мекунам.\n\n(Ҳоло демо‑режим аст; баъд Gemini/API пайваст мекунем.)',
    },
  ])
  const [draft, setDraft] = useState(() => getLocalStorageString(storageKeys.tutorDraft) ?? '')
  const [isThinking, setIsThinking] = useState(false)
  const [apiStatus, setApiStatus] = useState<'unknown' | 'down' | 'no_key' | 'ok'>('unknown')
  const [diagOpen, setDiagOpen] = useState(false)
  const [diagText, setDiagText] = useState<string>('')
  const [diagLoading, setDiagLoading] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)
  const messagesRef = useRef<Msg[]>(messages)

  useEffect(() => {
    setLocalStorageString(storageKeys.tutorDraft, draft)
  }, [draft])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    ;(async () => {
      const s = await readApiStatus()
      setApiStatus(s)
    })()
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, isThinking])

  const canSend = useMemo(() => draft.trim().length > 0 && !isThinking, [draft, isThinking])

  const onSend = (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || isThinking) return
    setDraft('')
    const userMsg: Msg = { id: uid(), role: 'user', text, at: Date.now() }
    setMessages((m) => [...m, userMsg])
    setIsThinking(true)
    ;(async () => {
      try {
        // Send last ~20 turns to preserve context.
        const snapshot = [...messagesRef.current, userMsg]
        .slice(-20)
        .map((m) => ({ role: m.role, text: m.text }))
        // Re-check health on send to avoid stale UI state.
        const latest = await readApiStatus()
        setApiStatus(latest)
        const server = await tryServerAnswer(text, snapshot)
        const answer =
          server ??
          (latest === 'down'
            ? 'AI сервер дастрас нест. Лутфан серверро ба кор андозед.'
            : latest === 'no_key'
              ? 'AI калид надорад (GEMINI_API_KEY). Онро дар сервер гузоред.'
              : demoAnswerTj(text))
        const a: Msg = { id: uid(), role: 'assistant', text: answer, at: Date.now() }
        setMessages((m) => [...m, a])
      } finally {
        setIsThinking(false)
      }
    })()
  }

  return (
    <section className="glass rounded-3xl p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 px-2 pb-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Мураббии AI</h2>
          <div className="text-xs text-bm-muted">Чат барои саволу ҷавоб (Tajik UI)</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setDiagOpen(true)
              setDiagLoading(true)
              setDiagText('')
              try {
                const r = await fetch('/api/health')
                const raw = await r.text()
                if (!r.ok) {
                  setDiagText(`❌ /api/health: код ${r.status}\n\n${raw.slice(0, 800)}`)
                  setApiStatus('down')
                  return
                }
                let parsed: unknown = null
                try {
                  parsed = JSON.parse(raw)
                } catch {
                  // ignore
                }
                setDiagText(
                  [
                    '✅ /api/health: ОК',
                    '',
                    'Raw JSON:',
                    raw,
                    '',
                    parsed && typeof parsed === 'object'
                      ? `geminiConfigured: ${String((parsed as { geminiConfigured?: boolean }).geminiConfigured)}`
                      : '',
                    '',
                    'Агар geminiConfigured=false бошад: калидро дар server/.env гузоред ва dev:full-ро боз оғоз кунед.',
                  ]
                    .filter(Boolean)
                    .join('\n'),
                )
                const s = await readApiStatus()
                setApiStatus(s)
              } catch (e) {
                setDiagText(`❌ Хато ҳангоми санҷиш: ${String((e as Error)?.message || e)}`)
                setApiStatus('down')
              } finally {
                setDiagLoading(false)
              }
            }}
            className="rounded-2xl border border-bm-border bg-white/5 px-4 py-2 text-sm font-semibold text-bm-text transition hover:bg-white/8"
          >
            Санҷиш
          </button>
          <button
            onClick={() =>
              setMessages([
                {
                  id: uid(),
                  role: 'assistant',
                  at: Date.now(),
                  text:
                    'Салом! Ман мураббии BioMind ҳастам. Саволатонро нависед.\n\n(Ҳоло демо‑режим аст; баъд Gemini/API пайваст мекунем.)',
                },
              ])
            }
            className="rounded-2xl border border-bm-border bg-white/5 px-4 py-2 text-sm font-semibold text-bm-text transition hover:bg-white/8"
          >
            Пок кардан
          </button>
        </div>
      </div>

      {apiStatus !== 'ok' && (
        <div className="mb-3 rounded-3xl border border-bm-border bg-black/20 p-4 text-xs text-bm-muted">
          {apiStatus === 'down' && (
            <div>
              AI сервер дастрас нест. Барои ҷавобҳои воқеӣ: <code className="rounded bg-white/5 px-2 py-1">npm run dev:full</code> иҷро кунед.
            </div>
          )}
          {apiStatus === 'no_key' && (
            <div>
              AI сервер ҳаст, аммо <code className="rounded bg-white/5 px-2 py-1">GEMINI_API_KEY</code> нест. `.env`‑ро пур кунед.
            </div>
          )}
          {apiStatus === 'unknown' && <div>AI ҳолат санҷида мешавад…</div>}
        </div>
      )}

      {diagOpen && (
        <div className="mb-3 rounded-3xl border border-bm-border bg-black/25 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Санҷиши пайваст</div>
              <div className="mt-1 text-xs text-bm-muted">Ҳолати backend ва калиди Gemini</div>
            </div>
            <button
              onClick={() => setDiagOpen(false)}
              className="rounded-2xl border border-bm-border bg-white/5 px-3 py-2 text-xs font-semibold text-bm-text transition hover:bg-white/8"
            >
              Пӯшидан
            </button>
          </div>
          <div className="mt-3 whitespace-pre-wrap rounded-2xl border border-bm-border bg-black/20 p-3 text-xs text-bm-text">
            {diagLoading ? 'Санҷида истодаам…' : diagText || '—'}
          </div>
        </div>
      )}

      <div
        ref={listRef}
        className="h-[62vh] overflow-auto rounded-3xl border border-bm-border bg-black/25 p-3 sm:p-4"
      >
        <div className="grid gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={[
                'max-w-[92%] rounded-3xl px-4 py-3 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'ml-auto bg-gradient-to-r from-bm-emerald/25 to-bm-cyan/20 border border-white/10'
                  : 'mr-auto bg-white/6 border border-bm-border',
              ].join(' ')}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          ))}
          {isThinking && (
            <div className="mr-auto max-w-[92%] rounded-3xl border border-bm-border bg-white/6 px-4 py-3 text-sm text-bm-muted">
              Фикр мекунам…
            </div>
          )}
        </div>
      </div>

      <form onSubmit={onSend} className="mt-3 flex gap-2 px-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Савол нависед…"
          className="flex-1 rounded-2xl border border-bm-border bg-black/20 px-4 py-3 text-sm text-bm-text outline-none focus:border-white/30"
        />
        <button
          disabled={!canSend}
          className={[
            'rounded-2xl px-5 py-3 text-sm font-semibold shadow-glass transition',
            canSend ? 'bg-gradient-to-r from-bm-emerald to-bm-cyan text-black hover:opacity-95' : 'bg-white/5 text-bm-muted border border-bm-border',
          ].join(' ')}
        >
          Фиристодан
        </button>
      </form>

      <div className="mt-3 px-1 text-xs text-bm-muted">
        Барои версияи прод: калиди Gemini-ро дар браузер нигоҳ намекунем — backend/proxy лозим мешавад.
      </div>
    </section>
  )
}


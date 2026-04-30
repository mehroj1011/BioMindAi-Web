import { Link, useParams } from 'react-router-dom'
import { instituteBooks100Plus } from '../data/institute'
import { useEffect, useMemo, useState } from 'react'
import { buildBookContentTj } from '../data/bookContentTj'

async function isCached(url: string) {
  const cacheNames = await caches.keys()
  for (const name of cacheNames) {
    const c = await caches.open(name)
    const hit = await c.match(url, { ignoreSearch: false })
    if (hit) return true
  }
  return false
}

export function LibraryBookPage() {
  const { bookId } = useParams()
  const book = useMemo(() => instituteBooks100Plus.find((b) => b.id === bookId), [bookId])
  const [cacheState, setCacheState] = useState<'unknown' | 'cached' | 'not-cached'>('unknown')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const defer = (fn: () => void) => window.setTimeout(fn, 0)

  useEffect(() => {
    let mounted = true
    defer(() => {
      if (!mounted) return
      setErr(null)
      setBusy(false)
      setCacheState('unknown')
    })
    const url = book?.url
    if (!url) {
      defer(() => mounted && setCacheState('not-cached'))
      return
    }
    void (async () => {
      try {
        const ok = await isCached(url)
        defer(() => mounted && setCacheState(ok ? 'cached' : 'not-cached'))
      } catch (e) {
        defer(() => mounted && setErr(String((e as Error)?.message || e)))
      }
    })()
    return () => {
      mounted = false
    }
  }, [book?.url])

  if (!book) {
    return (
      <div className="mx-auto grid max-w-3xl gap-4 px-3 py-5 sm:p-6">
        <div className="glass-premium-strong rounded-[32px] p-6">
          <div className="text-sm font-semibold text-bm-text">Китоб ёфт нашуд</div>
          <div className="mt-2 text-sm text-bm-muted">Рамз: {bookId}</div>
          <div className="mt-4">
            <Link to="/lessons" className="rounded-2xl border border-bm-border bg-white/5 px-4 py-2 text-sm font-semibold text-bm-text transition hover:bg-white/8">
              Ба китобхона
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 px-3 py-5 sm:p-6">
      <div className="glass-premium-strong rounded-[32px] p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xl font-semibold text-bm-text">{book.titleTj}</div>
            <div className="mt-2 text-sm text-bm-muted">
              {book.area} · {book.level} · {book.type} · {book.language}
            </div>
            {book.author && <div className="mt-1 text-sm text-bm-muted">Муаллиф: {book.author}</div>}
            {book.year && <div className="mt-1 text-sm text-bm-muted">Сол: {book.year}</div>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/lessons" className="rounded-2xl border border-white/12 bg-white/6 px-4 py-2 text-xs font-semibold text-bm-text transition hover:bg-white/10">
              Ба китобҳо
            </Link>
            {book.url && (
              <a href={book.url} target="_blank" rel="noreferrer" className="rounded-2xl bg-gradient-to-r from-bm-emerald to-bm-cyan px-4 py-2 text-xs font-semibold text-black shadow-glass transition hover:opacity-95">
                Кушодани манбаъ
              </a>
            )}
          </div>
        </div>

        <div className="mt-5 whitespace-pre-wrap rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-relaxed text-bm-text">
          {book.contentTj ? book.contentTj : buildBookContentTj(book)}
        </div>

        {book.source && <div className="mt-4 text-xs text-bm-muted">Манбаъ: {book.source}</div>}

        {book.url && (
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-bm-muted">
                Офлайн:
                <span className="ml-2 rounded-xl border border-white/10 bg-black/25 px-2 py-1 font-mono text-[11px] text-bm-text">
                  {cacheState === 'unknown' ? 'checking…' : cacheState === 'cached' ? 'cached' : 'not cached'}
                </span>
              </div>
              <button
                disabled={busy}
                onClick={async () => {
                  if (!book.url) return
                  setBusy(true)
                  setErr(null)
                  try {
                    // Just fetching once is enough: SW will cache the response (we’ll add rule for PDFs).
                    await fetch(book.url, { mode: 'no-cors' })
                    const ok = await isCached(book.url)
                    setCacheState(ok ? 'cached' : 'not-cached')
                  } catch (e) {
                    setErr(String((e as Error)?.message || e))
                  } finally {
                    setBusy(false)
                  }
                }}
                className="rounded-2xl border border-white/12 bg-white/6 px-4 py-2 text-xs font-semibold text-bm-text transition hover:bg-white/10 disabled:opacity-50"
              >
                Кеш кардан барои офлайн
              </button>
            </div>
            {err && <div className="mt-3 text-xs text-bm-muted">Хато: {err}</div>}
            <div className="mt-3 text-[11px] text-bm-muted/80">
              Эзоҳ: баъзе манбаъҳо (хусусан берун аз сайт) метавонанд офлайн маҳдуд бошанд. Барои беҳтарин натиҷа, аввал “Кушодани манбаъ”‑ро кушоед, баъд кеш кунед.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


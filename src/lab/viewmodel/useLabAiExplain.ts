import { useEffect, useMemo, useRef, useState } from 'react'
import { explainWithAi } from '../../lib/aiExplain'

export function useLabAiExplain(args: {
  title: string
  /** short deterministic key: when this changes, we may auto-explain */
  autoKey: string
  /** plain text context for the AI */
  content: string
  /** if true, auto explain on key change */
  enabled: boolean
}) {
  const { title, autoKey, content, enabled } = args
  const [open, setOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const lastKeyRef = useRef<string>('')
  const debounceRef = useRef<number | null>(null)

  const run = useMemo(() => {
    return async () => {
      if (!open) return
      setLoading(true)
      setErr(null)
      try {
        const t = await explainWithAi({
          title,
          gradeLabel: '5–11',
          content,
          extraQuestion:
            'Фаҳмон бо забони бисёр содда ва кӯтоҳ. ' +
            'Сабаб‑натиҷа навис (мисол: “Агар predators зиёд шавад, herbivores кам мешавад…”). ' +
            'Нагӯй формулаҳо; ба мисолҳои рӯзмарра монанд кун.',
        })
        setText(t)
      } catch (e) {
        setErr(String((e as Error)?.message || e))
      } finally {
        setLoading(false)
      }
    }
  }, [content, open, title])

  useEffect(() => {
    if (!enabled) return
    if (!open) return
    if (!autoKey) return
    if (autoKey === lastKeyRef.current) return

    // debounce to wait after the user changes params / action completes
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      lastKeyRef.current = autoKey
      void run()
    }, 900)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [autoKey, enabled, open, run])

  return {
    open,
    setOpen,
    loading,
    text,
    err,
    explainNow: run,
    clear: () => setText(null),
  }
}


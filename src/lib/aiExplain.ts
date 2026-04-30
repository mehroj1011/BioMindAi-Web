export async function explainWithAi(args: {
  title: string
  content: string
  gradeLabel?: string
  extraQuestion?: string
}): Promise<string> {
  const { title, content, gradeLabel, extraQuestion } = args

  const message = [
    'Лутфан ин мавзӯъро ба забони тоҷикӣ фаҳмон.',
    'Шакл: 1) Тавзеҳи содда, 2) Қадамҳо/нуқтаҳо, 3) 2 мисол, 4) 3 саволи кӯтоҳи санҷишӣ бо ҷавоб.',
    gradeLabel ? `Сатҳ: ${gradeLabel}.` : '',
    `Сарлавҳа: ${title}`,
    extraQuestion ? `Саволи корбар: ${extraQuestion}` : '',
    '',
    'Матни дарс:',
    content,
  ]
    .filter(Boolean)
    .join('\n')

  const r = await fetch('/api/tutor', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      userDisplayName: 'Дӯст',
      message,
    }),
  })

  const raw = await r.text()
  if (!r.ok) {
    try {
      const j = JSON.parse(raw) as { error?: string; details?: string }
      if (j?.error === 'gemini_not_configured') {
        throw new Error('AI сервер танзим нашудааст (GEMINI_API_KEY нест).')
      }
      throw new Error(j?.details || j?.error || 'AI хато дод.')
    } catch {
      throw new Error(raw.slice(0, 220) || 'AI хато дод.')
    }
  }

  const j = JSON.parse(raw) as { text?: string }
  const text = String(j?.text || '').trim()
  if (!text) throw new Error('AI ҷавоб надод.')
  return text
}


import type { VercelRequest, VercelResponse } from '@vercel/node'

type Role = 'user' | 'assistant'
type Turn = { role: Role; text: string }

function s(x: unknown) {
  return String(x ?? '').trim()
}

function jsonError(res: VercelResponse, status: number, error: string, details?: string) {
  res
    .status(status)
    .setHeader('Cache-Control', 'no-store')
    .json({ error, ...(details ? { details } : {}) })
}

function buildSystemInstruction(userDisplayName = 'Дӯст') {
  return `
Ту — мураббии касбии биология дар барномаи «БиоДониш» ҳастӣ.
Қоидаҳо:
- Ҳамеша ба забони тоҷикӣ (алфубои кириллӣ) ҷаваб бидеҳ.
- Корбар: «${userDisplayName}». Ба ӯ муроҷиатро дӯстона нигоҳ дор.
- Адабиёти илмиро риоя кун: дақиқ, аммо барои донишҷӯ фаҳмо.
- Агар савол ба биология ё саломатии умумӣ дахл надошта бошад, кӯтоҳ ҷаваб дӣ ва ба мавзӯи биология эҳтимомро гузор.
- Ҷавобҳоро кӯтоҳ ва сохторнок навис: 3–10 ҷумла, баъд 3–6 bullet (агар лозим бошад).
`.trim()
}

function toGeminiContents(history: Turn[], message: string) {
  const userTurn: Turn = { role: 'user', text: message }
  const turns: Turn[] = [...history, userTurn].filter((t): t is Turn => Boolean(s(t.text)))
  // Gemini API uses roles: "user" | "model"
  return turns.map((t) => {
    const role: 'user' | 'model' = t.role === 'assistant' ? 'model' : 'user'
    return {
      role,
      parts: [{ text: s(t.text) }],
    }
  })
}

async function callGeminiText(args: {
  apiKey: string
  model: string
  systemInstruction: string
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(args.model)}:generateContent?key=${encodeURIComponent(
    args.apiKey,
  )}`

  const body = {
    systemInstruction: {
      parts: [{ text: args.systemInstruction }],
    },
    contents: args.contents,
    generationConfig: {
      temperature: 0.6,
      topP: 0.9,
      maxOutputTokens: 800,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  }

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  const raw = await r.text()
  if (!r.ok) {
    let details = raw
    try {
      const j = JSON.parse(raw) as { error?: { message?: string } }
      details = s(j?.error?.message) || raw
    } catch {
      // ignore
    }
    throw new Error(details.slice(0, 1200) || `Gemini HTTP ${r.status}`)
  }

  const j = JSON.parse(raw) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
      finishReason?: string
    }>
  }
  const text = s(j?.candidates?.[0]?.content?.parts?.map((p) => s(p.text)).join('') ?? '')
  return text
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return jsonError(res, 405, 'method_not_allowed')
  }

  const apiKey = s(process.env.GEMINI_API_KEY)
  if (!apiKey) return jsonError(res, 503, 'gemini_not_configured', 'GEMINI_API_KEY is missing')

  const model = s(process.env.GEMINI_MODEL) || 'gemini-1.5-flash'

  let body: unknown = null
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    body = req.body
  }

  const message = s((body as { message?: unknown })?.message)
  const history = ((body as { history?: unknown })?.history ?? []) as unknown
  const userDisplayName = s((body as { userDisplayName?: unknown })?.userDisplayName) || 'Дӯст'

  if (!message) return jsonError(res, 400, 'bad_request', 'message is required')

  const safeHistory: Turn[] = Array.isArray(history)
    ? (history as Array<{ role?: unknown; text?: unknown }>)
        .slice(-30)
        .map((t) => ({
          role: (t?.role === 'assistant' ? 'assistant' : 'user') satisfies Role,
          text: s(t?.text).slice(0, 4000),
        }))
    : []

  try {
    const systemInstruction = buildSystemInstruction(userDisplayName)
    const contents = toGeminiContents(safeHistory, message)
    const text = await callGeminiText({ apiKey, model, systemInstruction, contents })
    if (!text) return jsonError(res, 502, 'empty_response', 'Gemini returned empty text')
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ text })
  } catch (e) {
    return jsonError(res, 502, 'gemini_error', s((e as Error)?.message || e))
  }
}


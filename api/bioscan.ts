import type { VercelRequest, VercelResponse } from '@vercel/node'

function s(x: unknown) {
  return String(x ?? '').trim()
}

function jsonError(res: VercelResponse, status: number, error: string, details?: string) {
  res
    .status(status)
    .setHeader('Cache-Control', 'no-store')
    .json({ error, ...(details ? { details } : {}) })
}

async function callGeminiVision(args: {
  apiKey: string
  model: string
  systemInstruction: string
  promptText: string
  mimeType: string
  imageBase64: string
}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(args.model)}:generateContent?key=${encodeURIComponent(
    args.apiKey,
  )}`

  const body = {
    systemInstruction: { parts: [{ text: args.systemInstruction }] },
    contents: [
      {
        role: 'user',
        parts: [
          { text: args.promptText },
          {
            inlineData: {
              mimeType: args.mimeType,
              data: args.imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      topP: 0.9,
      maxOutputTokens: 900,
      responseMimeType: 'application/json',
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
    }>
  }

  // With responseMimeType JSON, Gemini returns JSON string in `text`.
  const txt = s(j?.candidates?.[0]?.content?.parts?.map((p) => s(p.text)).join('') ?? '')
  return txt
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return jsonError(res, 405, 'method_not_allowed')
  }

  const apiKey = s(process.env.GEMINI_API_KEY)
  if (!apiKey) return jsonError(res, 503, 'gemini_not_configured', 'GEMINI_API_KEY is missing')

  const model = s(process.env.GEMINI_VISION_MODEL) || s(process.env.GEMINI_MODEL) || 'gemini-1.5-flash'

  let body: unknown = null
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    body = req.body
  }

  const imageBase64 = s((body as { imageBase64?: unknown })?.imageBase64)
  const mimeType = s((body as { mimeType?: unknown })?.mimeType) || 'image/jpeg'
  const userDisplayName = s((body as { userDisplayName?: unknown })?.userDisplayName) || 'Дӯст'

  if (!imageBase64) return jsonError(res, 400, 'bad_request', 'imageBase64 is required')
  if (!/^image\/(jpeg|jpg|png|webp)$/i.test(mimeType)) return jsonError(res, 400, 'bad_request', 'unsupported mimeType')

  const systemInstruction = `
Ту — ассистенти визуалии биология дар барномаи «БиоДониш».
Қоидаҳо:
- Забон: тоҷикӣ (кириллӣ).
- Танҳо он чизеро бигӯй, ки аз тасвир воқеан дида мешавад; агар боварӣ нест, бигӯ «эҳтимол».
- Агар тасвир биологӣ набошад, кӯтоҳ бигӯ ва пурс: «Ин барои биология аст?»
- Ҷавобро ҳатман ба шакли JSON баргардон.
`.trim()

  const promptText = `
Аз ин тасвир як шарҳи кӯтоҳи биологӣ диҳ.
Формат: JSON, бидуни markdown.
Схема:
{
  "title": "сарлавҳаи 2-6 калима",
  "summary": "4-10 ҷумла, фаҳмо барои донишҷӯ",
  "details": "ихтиёрӣ: 3-7 bullet бо фактҳо/истилоҳҳо/маслиҳатҳо"
}
Номи корбар: ${userDisplayName}
`.trim()

  try {
    const jsonText = await callGeminiVision({
      apiKey,
      model,
      systemInstruction,
      promptText,
      mimeType,
      imageBase64,
    })

    // Validate the JSON shape.
    const parsed = JSON.parse(jsonText) as { title?: unknown; summary?: unknown; details?: unknown }
    const title = s(parsed?.title)
    const summary = s(parsed?.summary)
    const details = s(parsed?.details)
    if (!title || !summary) return jsonError(res, 502, 'bad_model_response', 'missing title/summary')

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ title, summary, ...(details ? { details } : {}) })
  } catch (e) {
    return jsonError(res, 502, 'gemini_error', s((e as Error)?.message || e))
  }
}


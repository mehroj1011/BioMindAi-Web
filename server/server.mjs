import dotenv from 'dotenv'
import express from 'express'

// Load env from project root `.env` first, then allow `server/.env` to override.
// `override: true` ensures a previously-set empty env doesn't mask the file value.
dotenv.config({ override: true })
dotenv.config({ path: new URL('./.env', import.meta.url), override: true })

const app = express()
app.use(express.json({ limit: '1mb' }))

function systemInstruction(userDisplayName = 'Дӯст') {
  return `
Ту — мураббии касбии биология дар барномаи «BioMind AI» ҳастӣ.
Қоидаҳо:
- Ҳамеша ба забони тоҷикӣ (алфубои кириллӣ) ҷаваб бидеҳ.
- Корбар: «${userDisplayName}». Ба ӯ муроҷиатро дӯстона нигоҳ дор.
- Адабиёти илмиро риоя кун: дақиқ, аммо барои донишҷӯ фаҳмо.
- Агар савол ба биология ё саломатии умумӣ дахл надошта бошад, кӯтоҳ ҷаваб дӣ ва ба мавзӯи биология эҳтимомро гузор.
- Вақте таърихи чат дода шудааст, аз ҷавобҳои қаблӣ барои пайдарпайгӣ истифода бурда, такрори беҳуда накун.
`.trim()
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, geminiConfigured: Boolean((process.env.GEMINI_API_KEY || '').trim()) })
})

app.post('/api/tutor', async (req, res) => {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim()
  const userDisplayName = String(req.body?.userDisplayName || 'Дӯст').trim() || 'Дӯст'
  const message = String(req.body?.message || '').trim()
  const history = Array.isArray(req.body?.history) ? req.body.history : null
  if (!message && (!history || history.length === 0)) return res.status(400).json({ error: 'message_required' })
  if (!apiKey) return res.status(501).json({ error: 'gemini_not_configured' })

  try {
    // Gemini REST (generateContent) — server-side so key stays private.
    const url =
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=' +
      encodeURIComponent(apiKey)
    // NOTE: The public Generative Language API may reject `systemInstruction`.
    // We embed system guidance as a first user message for broad compatibility.
    const contents = [{ role: 'user', parts: [{ text: systemInstruction(userDisplayName) }] }]
    if (history) {
      for (const m of history) {
        const role = m?.role === 'assistant' ? 'model' : 'user'
        const text = String(m?.text || '').trim()
        if (!text) continue
        contents.push({ role, parts: [{ text }] })
      }
    } else if (message) {
      contents.push({ role: 'user', parts: [{ text: message }] })
    }
    const body = {
      contents,
      generationConfig: { temperature: 0.6, maxOutputTokens: 900 },
    }
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const raw = await r.text()
    if (!r.ok) return res.status(502).json({ error: 'gemini_http', details: raw.slice(0, 800) })
    const json = JSON.parse(raw)
    const text =
      json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('')?.trim() ||
      ''
    if (!text) return res.status(502).json({ error: 'gemini_empty' })
    res.json({ text })
  } catch (e) {
    res.status(500).json({ error: 'server_error', details: String(e?.message || e) })
  }
})

app.post('/api/bioscan', async (req, res) => {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim()
  const userDisplayName = String(req.body?.userDisplayName || 'Дӯст').trim() || 'Дӯст'
  const imageBase64 = String(req.body?.imageBase64 || '').trim()
  const mimeType = String(req.body?.mimeType || 'image/jpeg').trim() || 'image/jpeg'
  if (!apiKey) return res.status(501).json({ error: 'gemini_not_configured' })
  if (!imageBase64) return res.status(400).json({ error: 'image_required' })

  try {
    const url =
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=' +
      encodeURIComponent(apiKey)

    const prompt = [
      systemInstruction(userDisplayName),
      '',
      'Вазифа: Тасвирро ҳамчун мутахассиси биология таҳлил кун.',
      'Қоидаҳо:',
      '- Ба тоҷикӣ навис.',
      '- Агар тасвир биологӣ набошад, рост гӯй ва 1–2 саволи равшанкунанда пурс.',
      '- Ҷавобро JSON-формат баргардон:',
      '  { "title": string, "summary": string, "details": string }',
      '- summary: 3–8 ҷумла, фаҳмо барои хонанда.',
      '- details: нишонаҳо/далелҳо, эҳтимолҳо, маслиҳати бехатарӣ (агар лозим).',
    ].join('\n')

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.4, maxOutputTokens: 900 },
    }

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const raw = await r.text()
    if (!r.ok) return res.status(502).json({ error: 'gemini_http', details: raw.slice(0, 800) })
    const json = JSON.parse(raw)
    const text =
      json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('')?.trim() || ''
    if (!text) return res.status(502).json({ error: 'gemini_empty' })

    // Try to parse model output as JSON; if it fails, wrap it.
    try {
      const out = JSON.parse(text)
      return res.json(out)
    } catch {
      return res.json({
        title: 'Натиҷаи BioScan',
        summary: text.slice(0, 2000),
        details: '',
      })
    }
  } catch (e) {
    res.status(500).json({ error: 'server_error', details: String(e?.message || e) })
  }
})

const port = Number(process.env.PORT || 8787)
app.listen(port, () => {
  console.log(`[api] listening on http://127.0.0.1:${port}`)
})


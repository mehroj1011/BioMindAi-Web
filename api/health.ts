import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const key = String(process.env.GEMINI_API_KEY || '').trim()
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json({
    ok: true,
    geminiConfigured: Boolean(key),
  })
}


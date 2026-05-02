import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Same-origin redirect to the real GitHub Release asset.
 * This avoids CORS issues with `fetch()` from the browser and avoids hardcoding wrong filenames.
 */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  const url =
    'https://github.com/mehroj1011/BioMindAi/releases/download/v1.0.0/app-release.apk'

  // Encourage download filename in browsers that respect filename on same-origin redirects.
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.setHeader('Content-Disposition', 'attachment; filename="biomindai-android-latest.apk"')
  res.status(302).setHeader('Location', url).end()
}

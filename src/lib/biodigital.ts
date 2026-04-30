/**
 * BioDigital URL helper.
 *
 * We support two modes:
 * - Direct share/view URL (recommended when you don't have a developer key)
 * - Widget URL (legacy) when you only have a model id
 */
export function buildBioDigitalUrl(input: string): string {
  const s = (input ?? '').trim()
  if (!s) return 'https://human.biodigital.com/'
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  // fallback to widget by model id
  const u = new URL('https://human.biodigital.com/widget/')
  u.searchParams.set('m', s)
  u.searchParams.set('lang', 'en')
  return u.toString()
}


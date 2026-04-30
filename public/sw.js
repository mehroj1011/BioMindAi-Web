/* Simple service worker for BioMind AI PWA.
   - Cache-first for static assets
   - Network-first for /api
   - SPA offline fallback to cached /index.html
*/

const CACHE_VERSION = 'bm-pwa-v2'
const CORE_CACHE = `${CACHE_VERSION}:core`
const RUNTIME_CACHE = `${CACHE_VERSION}:runtime`
const API_CACHE = `${CACHE_VERSION}:api`
const DOCS_CACHE = `${CACHE_VERSION}:docs`
const APK_CACHE = `${CACHE_VERSION}:apk`

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icons.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CORE_CACHE)
      await cache.addAll(CORE_ASSETS)
      self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.map((k) => (k.startsWith('bm-pwa-') && !k.startsWith(CACHE_VERSION) ? caches.delete(k) : Promise.resolve())),
      )
      self.clients.claim()
    })(),
  )
})

async function cacheFirst(req) {
  const cache = await caches.open(RUNTIME_CACHE)
  const cached = await cache.match(req)
  if (cached) return cached
  const res = await fetch(req)
  if (res && res.ok) cache.put(req, res.clone())
  return res
}

async function networkFirst(req) {
  const cache = await caches.open(API_CACHE)
  try {
    const res = await fetch(req)
    if (res && res.ok) cache.put(req, res.clone())
    return res
  } catch {
    const cached = await cache.match(req)
    if (cached) return cached
    throw new Error('offline')
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  // Only handle GET
  if (req.method !== 'GET') return

  // API caching (same-origin /api/*)
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(req))
    return
  }

  // Navigation requests → serve cached index.html when offline (SPA)
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req)
          const cache = await caches.open(CORE_CACHE)
          cache.put('/index.html', fresh.clone())
          return fresh
        } catch {
          const cache = await caches.open(CORE_CACHE)
          const cached = await cache.match('/index.html')
          return cached || Response.error()
        }
      })(),
    )
    return
  }

  // Static assets: scripts/styles/images/fonts
  const dest = req.destination
  if (url.origin === self.location.origin && (dest === 'script' || dest === 'style' || dest === 'image' || dest === 'font')) {
    event.respondWith(cacheFirst(req))
    return
  }

  // Library docs (PDF/XLSX) cache-first so they can open offline after first view/cache.
  const isDoc = url.pathname.endsWith('.pdf') || url.pathname.endsWith('.xlsx')
  const allowDocOrigin =
    url.origin === 'https://biological.tnu.tj' ||
    url.origin === 'https://tnu.tj'
  if (isDoc && allowDocOrigin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(DOCS_CACHE)
        const hit = await cache.match(req)
        if (hit) return hit
        const res = await fetch(req)
        // opaque responses (no-cors) are still cacheable
        if (res) cache.put(req, res.clone())
        return res
      })(),
    )
    return
  }

  // APK: cache-first (large file; cached after first download)
  if (url.origin === self.location.origin && url.pathname.endsWith('.apk')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(APK_CACHE)
        const hit = await cache.match(req)
        if (hit) return hit
        const res = await fetch(req)
        if (res && res.ok) cache.put(req, res.clone())
        return res
      })(),
    )
    return
  }
})


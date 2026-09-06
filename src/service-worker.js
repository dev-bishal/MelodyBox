/*
 * MelodyBox service worker.
 *
 * Not part of the app bundle: vite.config.js copies this to dist/sw.js at build
 * time, filling in the three placeholders below with that build's version hash,
 * asset list and shell URL. Registered from main.jsx in production builds only.
 */
const VERSION = '__VERSION__'
const PRECACHE = __PRECACHE__
const SHELL = '__SHELL__'

// Assets are served with `Vary: Origin`, and Vite's module script is fetched
// with crossorigin (so it carries an Origin header the precache fetch did not).
// Every entry here is keyed by a unique URL, so match on the URL alone.
const MATCH = { ignoreVary: true }

const STATIC = `melodybox-static-${VERSION}`
const RUNTIME = `melodybox-runtime-${VERSION}`

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC)
      .then((cache) => cache.addAll(PRECACHE))
      // The app is a single bundle loaded up front, so an open tab keeps
      // working on the old assets while the next load gets the new ones.
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC && key !== RUNTIME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// Covers, fonts and the icon stylesheet: answer from cache, refresh behind it.
function staleWhileRevalidate(event) {
  return caches.open(RUNTIME).then(async (cache) => {
    const cached = await cache.match(event.request, MATCH)
    const network = fetch(event.request).then((response) => {
      if (response.ok) cache.put(event.request, response.clone())
      return response
    })
    if (!cached) return network
    event.waitUntil(network.catch(() => {})) // keep the refresh alive past the response
    return cached
  })
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return

  // Audio is streamed with Range requests, which a cached whole-file response
  // can't answer — always let it go straight to the network.
  if (request.headers.has('range') || /\.(mp3|m4a|ogg|wav|flac)$/i.test(url.pathname)) return

  // Every in-app route renders from the same HTML. The CMS at /admin/ is its
  // own page, so it is not an app route.
  if (request.mode === 'navigate' && !url.pathname.includes('/admin')) {
    event.respondWith(caches.match(SHELL, MATCH).then((cached) => cached || fetch(request)))
    return
  }

  if (url.origin === self.location.origin) {
    // Build output is content-hashed, so a precache hit is always current.
    event.respondWith(
      caches.match(request, MATCH).then((cached) => cached || staleWhileRevalidate(event)),
    )
    return
  }

  event.respondWith(staleWhileRevalidate(event))
})

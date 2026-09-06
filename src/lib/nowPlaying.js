// Reflects the playing track outside the app's own UI: the browser tab
// (title, favicon and link-preview meta) and the OS media controls — the
// Android notification panel, the desktop browser's media overlay and the
// lock screen.
import { asset } from './library.js'

const BASE_TITLE = 'MelodyBox | Music Player'

// Android and the desktop overlays pick the largest artwork they are offered,
// so advertise the cover at every size they ask for.
const ARTWORK_SIZES = ['96x96', '192x192', '256x256', '384x384', '512x512']

// Covers are either a remote URL or a site-absolute upload; both have to reach
// the OS as fully-qualified URLs.
const absolute = (p) => (p ? new URL(asset(p), window.location.href).href : '')

/* ----------------------------- browser tab ----------------------------- */

// The markup's own favicon, remembered so it can come back when playback stops.
let defaultIcon = null

function iconLink() {
  let link = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  if (!defaultIcon) {
    defaultIcon = {
      href: link.getAttribute('href') || '',
      type: link.getAttribute('type') || '',
    }
  }
  return link
}

function setIcon(href, type) {
  const link = iconLink()
  link.setAttribute('href', href)
  if (type) link.setAttribute('type', type)
  else link.removeAttribute('type')
}

// Covers come in arbitrary aspect ratios and browsers squash a non-square
// favicon, so centre-crop the cover ourselves before handing it over.
function squareIcon(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onerror = reject
    img.onload = () => {
      const size = 64
      const side = Math.min(img.naturalWidth, img.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      canvas
        .getContext('2d')
        .drawImage(
          img,
          (img.naturalWidth - side) / 2,
          (img.naturalHeight - side) / 2,
          side,
          side,
          0,
          0,
          size,
          size,
        )
      try {
        resolve(canvas.toDataURL('image/png'))
      } catch (err) {
        reject(err) // host sent no CORS headers — the canvas is tainted
      }
    }
    img.src = url
  })
}

// Bumped on every change so a slow cover can't overwrite a newer track's icon.
let iconRequest = 0

function setCoverIcon(url) {
  const request = ++iconRequest
  squareIcon(url)
    .then((dataUrl) => {
      if (request === iconRequest) setIcon(dataUrl, 'image/png')
    })
    .catch(() => {
      // Can't crop it — hand the browser the cover and let it scale.
      if (request === iconRequest) setIcon(url, '')
    })
}

function restoreIcon() {
  iconRequest++ // cancel any cover still loading
  iconLink() // make sure the original href/type were captured
  setIcon(defaultIcon.href, defaultIcon.type)
}

function metaTag(attr, key) {
  return document.head.querySelector(`meta[${attr}="${key}"]`)
}

function setMeta(attr, key, content) {
  let tag = metaTag(attr, key)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function removeMeta(attr, key) {
  metaTag(attr, key)?.remove()
}

// Tab title, favicon and the share preview's featured image.
export function updateTab(song, isPlaying) {
  if (!song) {
    document.title = BASE_TITLE
    restoreIcon()
    setMeta('property', 'og:title', BASE_TITLE)
    setMeta('name', 'twitter:title', BASE_TITLE)
    removeMeta('property', 'og:image')
    removeMeta('name', 'twitter:image')
    return
  }

  const label = `${song.title} · ${song.artist}`
  document.title = isPlaying ? `▶ ${label}` : label

  const cover = absolute(song.cover)
  if (cover) {
    setCoverIcon(cover)
    setMeta('property', 'og:image', cover)
    setMeta('name', 'twitter:image', cover)
  } else {
    restoreIcon()
  }
  setMeta('property', 'og:title', label)
  setMeta('name', 'twitter:title', label)
}

/* -------------------------- OS media controls -------------------------- */

const hasMediaSession = () =>
  typeof navigator !== 'undefined' && 'mediaSession' in navigator

// What the notification panel, lock screen and desktop overlay display.
export function updateMediaSession(song) {
  if (!hasMediaSession()) return
  if (!song || !window.MediaMetadata) {
    navigator.mediaSession.metadata = null
    return
  }
  const cover = absolute(song.cover)
  navigator.mediaSession.metadata = new window.MediaMetadata({
    title: song.title,
    artist: song.artist,
    album: song.album || '',
    artwork: cover ? ARTWORK_SIZES.map((sizes) => ({ src: cover, sizes })) : [],
  })
}

export function setPlaybackState(state) {
  if (hasMediaSession()) navigator.mediaSession.playbackState = state
}

// Feeds the scrubber and elapsed/remaining times in the OS controls.
export function syncPositionState(audio) {
  if (!hasMediaSession() || !navigator.mediaSession.setPositionState) return
  const { duration } = audio
  try {
    if (!Number.isFinite(duration) || duration <= 0) {
      navigator.mediaSession.setPositionState()
      return
    }
    navigator.mediaSession.setPositionState({
      duration,
      playbackRate: audio.playbackRate || 1,
      position: Math.min(Math.max(audio.currentTime, 0), duration),
    })
  } catch {
    /* the scrubber is optional — never let it break playback */
  }
}

// Wires the OS buttons to the player. Returns a cleanup that unbinds them.
export function bindMediaSessionActions(handlers) {
  if (!hasMediaSession()) return () => {}
  const set = (action, handler) => {
    try {
      navigator.mediaSession.setActionHandler(action, handler)
    } catch {
      /* this browser doesn't know the action */
    }
  }
  Object.entries(handlers).forEach(([action, handler]) => set(action, handler))
  return () => Object.keys(handlers).forEach((action) => set(action, null))
}

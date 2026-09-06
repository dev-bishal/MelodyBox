// Loads all CMS-managed content (JSON files in src/content) at build time.
const songModules = import.meta.glob('../content/songs/*.json', { eager: true })
const albumModules = import.meta.glob('../content/albums/*.json', { eager: true })
const artistModules = import.meta.glob('../content/artists/*.json', { eager: true })
const playlistModules = import.meta.glob('../content/playlists/*.json', { eager: true })

const values = (mods) => Object.values(mods).map((m) => m.default ?? m)

// Multi-value CMS fields (a song's artists, an artist's genres) arrive as an array
// from Decap's relation/list widgets, but entries written before those widgets, or
// left empty, can still be a plain string or missing. Normalise everything to a list.
const toList = (value) =>
  (Array.isArray(value) ? value : [value])
    .map((v) => (typeof v === 'string' ? v.trim() : v))
    .filter(Boolean)

// Each normaliser keeps the original field as a comma-joined display string (so
// components can render it as-is) and exposes the plural field for matching.
const normalizeSong = (song) => {
  const artists = toList(song.artist)
  const genres = toList(song.genre)
  return {
    ...song,
    artists,
    artist: artists.join(', '),
    genres,
    genre: genres.join(', '),
  }
}

const normalizeArtist = (artist) => {
  const genres = toList(artist.genre)
  return { ...artist, genres, genre: genres.join(', ') }
}

// Newest first — "Latest Added" ordering used across the site
export const songs = values(songModules)
  .map(normalizeSong)
  .sort((a, b) => new Date(b.date) - new Date(a.date))
export const albums = values(albumModules).sort((a, b) => b.year - a.year)
export const artists = values(artistModules)
  .map(normalizeArtist)
  .sort((a, b) => a.name.localeCompare(b.name))
export const playlists = values(playlistModules).sort((a, b) =>
  a.name.localeCompare(b.name),
)

// Genres are not a CMS collection of their own — they are derived from the genre
// fields on songs and artists, so anything typed into either place gets a page.
const GENRE_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-pink-500 to-rose-500',
  'from-blue-500 to-cyan-400',
  'from-green-500 to-emerald-400',
  'from-orange-500 to-yellow-400',
  'from-purple-500 to-indigo-400',
  'from-red-500 to-pink-400',
]

const GENRE_ICONS = [
  'fa-guitar',
  'fa-drum',
  'fa-headphones',
  'fa-compact-disc',
  'fa-wave-square',
  'fa-microphone',
]

export const genreId = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Keyed off the id rather than list position, so a genre keeps the same look as
// the library grows around it.
const pickFor = (list, id) => {
  const hash = [...id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7)
  return list[Math.abs(hash) % list.length]
}

export const genres = (() => {
  const byId = new Map()
  const add = (name) => {
    const id = genreId(name)
    if (!id || byId.has(id)) return
    byId.set(id, {
      id,
      name,
      color: pickFor(GENRE_COLORS, id),
      icon: pickFor(GENRE_ICONS, id),
    })
  }
  songs.forEach((s) => s.genres.forEach(add))
  artists.forEach((a) => a.genres.forEach(add))
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
})()

const songById = Object.fromEntries(songs.map((s) => [s.id, s]))

export const getSong = (id) => songById[id]
export const getAlbum = (id) => albums.find((a) => a.id === id)
export const getArtist = (id) => artists.find((a) => a.id === id)
export const getPlaylist = (id) => playlists.find((p) => p.id === id)
export const getGenre = (id) => genres.find((g) => g.id === id)

export const albumSongs = (album) =>
  songs.filter((s) => s.album === album.title)
export const artistSongs = (artist) =>
  songs.filter((s) => s.artists.includes(artist.name))
export const playlistSongs = (playlist) =>
  (playlist.songs || []).map((id) => songById[id]).filter(Boolean)
export const genreSongs = (genre) =>
  songs.filter((s) => s.genres.some((g) => genreId(g) === genre.id))
export const genreArtists = (genre) =>
  artists.filter((a) => a.genres.some((g) => genreId(g) === genre.id))

export const searchSongs = (query) => {
  const q = query.trim().toLowerCase()
  if (!q) return songs
  return songs.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      (s.album || '').toLowerCase().includes(q),
  )
}

// Resolve site-absolute media paths ("/media/...") against the deploy base
// so they work under a GitHub Pages sub-path.
export const asset = (p) =>
  p && p.startsWith('/') ? import.meta.env.BASE_URL + p.slice(1) : p

export const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export const totalDuration = (list) => {
  // song.duration is "M:SS"
  const secs = list.reduce((sum, s) => {
    const [m, sec] = (s.duration || '0:00').split(':').map(Number)
    return sum + m * 60 + (sec || 0)
  }, 0)
  return Math.round(secs / 60) + ' min'
}

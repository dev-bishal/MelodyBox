import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { asset, getSong, songs } from '../lib/library.js'
import {
  bindMediaSessionActions,
  setPlaybackState,
  syncPositionState,
  updateMediaSession,
  updateTab,
} from '../lib/nowPlaying.js'

const PlayerContext = createContext(null)

const STORAGE_KEY = 'melodybox-queue'

function loadSavedQueue() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && Array.isArray(saved.ids)) {
      const q = saved.ids.map(getSong).filter(Boolean)
      const index = Math.min(Math.max(saved.index || 0, 0), Math.max(q.length - 1, 0))
      if (q.length) return { queue: q, index }
    }
  } catch {
    /* corrupted storage — fall through to default */
  }
  // Default queue: first 5 songs in the library
  return { queue: songs.slice(0, 5), index: 0 }
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null)
  if (!audioRef.current) audioRef.current = new Audio()

  const initial = useRef(loadSavedQueue()).current
  const [queue, setQueue] = useState(initial.queue)
  const [index, setIndex] = useState(initial.index)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [volume, setVolume] = useState(0.8)
  // A restored queue is not a playing queue: the tab and the OS controls stay
  // out of the way until the user actually starts something.
  const [started, setStarted] = useState(false)

  const current = queue[index] || null

  const isPlayingRef = useRef(isPlaying)
  isPlayingRef.current = isPlaying
  const stateRef = useRef({})
  stateRef.current = { queue, index, shuffle, repeat }

  // Load a new source whenever the current song changes
  useEffect(() => {
    const audio = audioRef.current
    if (!current) {
      audio.removeAttribute('src')
      audio.load()
      setCurrentTime(0)
      setDuration(0)
      return
    }
    const src = new URL(asset(current.audio), window.location.href).href
    if (audio.src !== src) {
      audio.src = src
      audio.load()
      setCurrentTime(0)
      if (isPlayingRef.current) audio.play().catch(() => setIsPlaying(false))
    }
  }, [current?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Audio element event wiring (once)
  useEffect(() => {
    const audio = audioRef.current
    const onTime = () => setCurrentTime(audio.currentTime)
    const onMeta = () => {
      setDuration(audio.duration)
      syncPositionState(audio)
    }
    const onSeeked = () => syncPositionState(audio)
    // The browser can start or stop playback on its own (an incoming call, a
    // headset button, another app taking audio focus) — follow the element.
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      const { queue: q, index: i, shuffle: sh, repeat: rp } = stateRef.current
      if (!q.length) return
      let next
      if (sh && q.length > 1) {
        do {
          next = Math.floor(Math.random() * q.length)
        } while (next === i)
      } else if (i + 1 < q.length) {
        next = i + 1
      } else if (rp) {
        next = 0
      } else {
        setIsPlaying(false)
        return
      }
      setIndex(next)
      setIsPlaying(true)
    }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('seeked', onSeeked)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('seeked', onSeeked)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  // Browsers only surface OS media controls for media attached to the page, so
  // keep the (invisible) audio element in the document while the app is up.
  useEffect(() => {
    const audio = audioRef.current
    document.body.appendChild(audio)
    return () => audio.remove()
  }, [])

  useEffect(() => {
    audioRef.current.volume = volume
  }, [volume])

  // Persist the queue
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ids: queue.map((s) => s.id), index }),
    )
  }, [queue, index])

  const api = useMemo(() => {
    const audio = () => audioRef.current

    const playQueue = (list, startIndex = 0) => {
      if (!list.length) return
      setQueue(list)
      setIndex(startIndex)
      setIsPlaying(true)
      // If the same song is already loaded, the src effect won't fire — play directly
      setTimeout(() => audio().play().catch(() => {}), 0)
    }

    const playSong = (song) => {
      const { queue: q } = stateRef.current
      const i = q.findIndex((s) => s.id === song.id)
      if (i >= 0) playQueue(q, i)
      else playQueue([...q, song], q.length)
    }

    const play = () => {
      if (!stateRef.current.queue.length) return
      audio().play().catch(() => setIsPlaying(false))
      setIsPlaying(true)
    }

    const pause = () => {
      audio().pause()
      setIsPlaying(false)
    }

    const toggle = () => {
      if (audio().paused) play()
      else pause()
    }

    const stop = () => {
      audio().pause()
      audio().currentTime = 0
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const step = (dir) => {
      const { queue: q, index: i, shuffle: sh } = stateRef.current
      if (!q.length) return
      let next
      if (sh && q.length > 1) {
        do {
          next = Math.floor(Math.random() * q.length)
        } while (next === i)
      } else {
        next = (i + dir + q.length) % q.length
      }
      setIndex(next)
      setIsPlaying(true)
      setTimeout(() => audio().play().catch(() => {}), 0)
    }

    const seek = (t) => {
      audio().currentTime = t
      setCurrentTime(t)
      syncPositionState(audio())
    }

    const skip = (delta) => {
      const t = Math.min(Math.max(audio().currentTime + delta, 0), audio().duration || 0)
      seek(t)
    }

    const addToQueue = (song) => {
      // functional update so several adds in one tick don't clobber each other
      setQueue((q) => (q.some((s) => s.id === song.id) ? q : [...q, song]))
    }

    const playNext = (song) => {
      const { queue: q, index: i } = stateRef.current
      const rest = q.filter((s) => s.id !== song.id)
      const cur = Math.min(i, rest.length - 1)
      rest.splice(cur + 1, 0, song)
      setQueue(rest)
    }

    const removeFromQueue = (i) => {
      const { queue: q, index: cur } = stateRef.current
      const next = q.filter((_, j) => j !== i)
      if (!next.length) {
        setQueue([])
        setIndex(0)
        stop()
        return
      }
      if (i < cur) {
        setIndex(cur - 1)
      } else if (i === cur) {
        // the song after the removed one takes its slot; clamp at the end
        setIndex(Math.min(cur, next.length - 1))
      }
      setQueue(next)
    }

    const moveInQueue = (from, to) => {
      if (from === to) return
      const { queue: q, index: cur } = stateRef.current
      const next = [...q]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      let newIndex = cur
      if (cur === from) newIndex = to
      else if (from < cur && to >= cur) newIndex = cur - 1
      else if (from > cur && to <= cur) newIndex = cur + 1
      setQueue(next)
      setIndex(newIndex)
    }

    const clearQueue = () => {
      setQueue([])
      setIndex(0)
      stop()
    }

    return {
      playQueue,
      playSong,
      play,
      pause,
      toggle,
      stop,
      next: () => step(1),
      prev: () => step(-1),
      seek,
      skip,
      addToQueue,
      playNext,
      removeFromQueue,
      moveInQueue,
      clearQueue,
      setShuffle,
      setRepeat,
      setVolume,
    }
  }, [])

  useEffect(() => {
    if (isPlaying) setStarted(true)
  }, [isPlaying])

  const nowPlaying = started ? current : null

  // Browser tab: the title and favicon follow the playing track
  useEffect(() => {
    updateTab(nowPlaying, isPlaying)
  }, [nowPlaying, isPlaying])

  // Notification panel / lock screen / desktop media overlay
  useEffect(() => {
    updateMediaSession(nowPlaying)
    syncPositionState(audioRef.current)
  }, [nowPlaying])

  useEffect(() => {
    setPlaybackState(nowPlaying ? (isPlaying ? 'playing' : 'paused') : 'none')
    syncPositionState(audioRef.current)
  }, [nowPlaying, isPlaying])

  // Their buttons drive the same player the UI does
  useEffect(
    () =>
      bindMediaSessionActions({
        play: api.play,
        pause: api.pause,
        stop: api.stop,
        previoustrack: api.prev,
        nexttrack: api.next,
        seekbackward: (d) => api.skip(-(d.seekOffset || 10)),
        seekforward: (d) => api.skip(d.seekOffset || 10),
        seekto: (d) => api.seek(d.seekTime),
      }),
    [api],
  )

  const value = {
    queue,
    index,
    current,
    isPlaying,
    currentTime,
    duration,
    shuffle,
    repeat,
    volume,
    ...api,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export const usePlayer = () => useContext(PlayerContext)

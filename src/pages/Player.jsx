import { useMemo, useRef, useState } from 'react'
import { usePlayer } from '../context/PlayerContext.jsx'
import { asset, formatTime, songs, totalDuration } from '../lib/library.js'

function ControlTile({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'hover:bg-white dark:hover:bg-gray-700'
      }`}
    >
      <i
        className={`fas ${icon} text-xl mb-2 ${
          active ? '' : 'text-gray-600 dark:text-gray-300'
        }`}
      ></i>
      <span className={`text-xs ${active ? '' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </span>
    </button>
  )
}

function AddSongsModal({ onClose }) {
  const { queue, addToQueue } = usePlayer()
  const [search, setSearch] = useState('')
  const available = useMemo(() => {
    const q = search.trim().toLowerCase()
    return songs.filter(
      (s) =>
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q),
    )
  }, [search])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-3">Add Songs to Current Playlist</h3>
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all songs..."
              className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
        </div>
        <div className="px-4 py-2 overflow-y-auto flex-1">
          {available.map((song) => {
            const added = queue.some((s) => s.id === song.id)
            return (
              <div
                key={song.id}
                className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center min-w-0">
                  <img
                    src={asset(song.cover)}
                    alt={song.title}
                    className="w-10 h-10 rounded object-cover mr-3 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-medium truncate">{song.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => addToQueue(song)}
                  disabled={added}
                  className={`px-3 py-1 text-sm rounded shrink-0 ml-3 ${
                    added
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 cursor-default'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {added ? (
                    <>
                      <i className="fas fa-check mr-1"></i>Added
                    </>
                  ) : (
                    'Add'
                  )}
                </button>
              </div>
            )
          })}
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Player() {
  const {
    queue,
    index,
    current,
    isPlaying,
    currentTime,
    duration,
    shuffle,
    repeat,
    volume,
    toggle,
    next,
    prev,
    seek,
    skip,
    playQueue,
    removeFromQueue,
    moveInQueue,
    clearQueue,
    setShuffle,
    setRepeat,
    setVolume,
  } = usePlayer()

  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const dragFrom = useRef(null)
  const [dragOver, setDragOver] = useState(null)

  const progress = duration ? (currentTime / duration) * 100 : 0

  const onDrop = (to) => {
    if (dragFrom.current !== null && dragFrom.current !== to) {
      moveInQueue(dragFrom.current, to)
    }
    dragFrom.current = null
    setDragOver(null)
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Now Playing</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {current ? (
              <>
                Playing from:{' '}
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  Current Playlist
                </span>
              </>
            ) : (
              'Your queue is empty — add some songs below'
            )}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium flex items-center space-x-2 transition-colors"
        >
          <i className="fas fa-plus"></i>
          <span className="hidden sm:inline">Add Songs</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column: CD + controls */}
        <div className="lg:w-1/2">
          <div className="mb-8">
            <div className="relative mx-auto max-w-md">
              <div className={`relative cd-disc ${isPlaying ? 'cd-spinning' : ''}`}>
                <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                <div className="absolute inset-8 rounded-full border-4 border-white/5"></div>
                <div className="absolute inset-16 rounded-full border-4 border-white/5"></div>
                <div className="cd-album-art">
                  {current ? (
                    <img
                      src={asset(current.cover)}
                      alt={current.title}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <i className="fas fa-music text-white/40 text-4xl"></i>
                    </div>
                  )}
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 rounded-full border-4 border-gray-700 z-10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-900 rounded-full z-10"></div>
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-full"></div>
              </div>
            </div>
          </div>

          {/* Song info */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {current ? current.title : 'Nothing playing'}
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">
              {current?.artist || '—'}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {current
                ? [current.album, current.genre].filter(Boolean).join(' • ')
                : 'Add songs to the playlist to get started'}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatTime(currentTime)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatTime(duration)}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                className="progress-large w-full relative z-10"
                style={{ '--progress': `${progress}%` }}
                min="0"
                max={duration || 0}
                step="0.1"
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Advanced controls */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6">
            <div className="grid grid-cols-5 gap-2 md:gap-4 mb-6">
              <ControlTile icon="fa-step-backward" label="Previous" onClick={prev} />
              <ControlTile icon="fa-backward" label="-10s" onClick={() => skip(-10)} />
              <ControlTile
                icon={isPlaying ? 'fa-pause' : 'fa-play'}
                label={isPlaying ? 'Pause' : 'Play'}
                onClick={toggle}
                active
              />
              <ControlTile icon="fa-forward" label="+10s" onClick={() => skip(10)} />
              <ControlTile icon="fa-step-forward" label="Next" onClick={next} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShuffle(!shuffle)}
                  className={
                    shuffle
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }
                  title="Shuffle"
                >
                  <i className="fas fa-random"></i>
                </button>
                <button
                  onClick={() => setRepeat(!repeat)}
                  className={
                    repeat
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }
                  title="Repeat"
                >
                  <i className="fas fa-redo"></i>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <i className="fas fa-volume-up text-gray-500"></i>
                <input
                  type="range"
                  className="w-24"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: editable current playlist */}
        <div className="lg:w-1/2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">Current Playlist</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Drag songs to reorder
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearQueue}
                    className="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Add Songs
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="Search in playlist..."
                      className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {queue.length} songs • {totalDuration(queue)}
                </span>
              </div>
            </div>

            {/* Queue rows */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {queue.map((song, i) => {
                const hidden =
                  filter &&
                  !song.title.toLowerCase().includes(filter.toLowerCase()) &&
                  !song.artist.toLowerCase().includes(filter.toLowerCase())
                if (hidden) return null
                const isCurrent = i === index
                return (
                  <div
                    key={song.id}
                    draggable
                    onDragStart={(e) => {
                      dragFrom.current = i
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOver(i)
                    }}
                    onDragLeave={() => setDragOver((d) => (d === i ? null : d))}
                    onDrop={() => onDrop(i)}
                    onDragEnd={() => {
                      dragFrom.current = null
                      setDragOver(null)
                    }}
                    className={`${
                      isCurrent
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    } ${dragOver === i ? 'drag-over' : ''} ${
                      dragFrom.current === i ? 'dragging' : ''
                    }`}
                  >
                    <div className="flex items-center p-4">
                      <div className="flex items-center justify-center w-8 mr-4 shrink-0">
                        <div className="relative">
                          <span className="text-gray-500 dark:text-gray-400">{i + 1}</span>
                          {isCurrent && isPlaying && (
                            <div className="absolute -inset-1 bg-indigo-500 rounded-full opacity-20 animate-ping"></div>
                          )}
                        </div>
                      </div>
                      <div
                        className="flex-1 flex items-center min-w-0 cursor-pointer"
                        onClick={() => playQueue(queue, i)}
                      >
                        <div className="w-12 h-12 rounded overflow-hidden mr-4 shrink-0">
                          <img
                            src={asset(song.cover)}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4
                            className={`font-medium truncate ${
                              isCurrent ? 'text-indigo-600 dark:text-indigo-400' : ''
                            }`}
                          >
                            {song.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {song.artist}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 ml-4 shrink-0">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {song.duration}
                        </span>
                        <button
                          onClick={() => removeFromQueue(i)}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                          title="Remove from playlist"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                        <span
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
                          title="Drag to reorder"
                        >
                          <i className="fas fa-grip-vertical"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {!queue.length && (
                <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                  <i className="fas fa-music text-3xl mb-3 block opacity-40"></i>
                  The current playlist is empty.
                  <div className="mt-4">
                    <button
                      onClick={() => setModalOpen(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium"
                    >
                      <i className="fas fa-plus mr-2"></i>Add Songs
                    </button>
                  </div>
                </div>
              )}
            </div>

            {queue.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Drag and drop to reorder • Click a song to play it •{' '}
                  <i className="fas fa-times mx-1"></i> removes it
                </div>
              </div>
            )}
          </div>

          {/* Up next */}
          {queue.length > index + 1 && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-bold">Up Next</h4>
              </div>
              <div className="p-4">
                {queue.slice(index + 1, index + 3).map((song) => (
                  <div key={song.id} className="flex items-center mb-3 last:mb-0">
                    <div className="w-10 h-10 rounded overflow-hidden mr-3 shrink-0">
                      <img
                        src={asset(song.cover)}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-medium text-sm truncate">{song.title}</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {song.artist}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {song.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && <AddSongsModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { usePlayer } from '../context/PlayerContext.jsx'
import {
  albumSongs,
  artistSongs,
  asset,
  genreArtists,
  genreSongs,
  playlistSongs,
} from '../lib/library.js'

function PlayOverlayButton({ onPlay }) {
  return (
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onPlay()
        }}
        className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center"
        aria-label="Play"
      >
        <i className="fas fa-play text-xs md:text-base"></i>
      </button>
    </div>
  )
}

export function SongCard({ song, indexInList, list }) {
  const { playQueue, addToQueue, queue } = usePlayer()
  const inQueue = queue.some((s) => s.id === song.id)
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg md:rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative">
        <img
          src={asset(song.cover)}
          alt={song.title}
          className="w-full h-32 md:h-48 object-cover"
          loading="lazy"
        />
        <PlayOverlayButton onPlay={() => playQueue(list, indexInList)} />
      </div>
      <div className="p-3 md:p-4">
        <h4 className="font-semibold truncate text-sm md:text-base">{song.title}</h4>
        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm truncate">{song.artist}</p>
        <div className="flex items-center justify-between mt-2 md:mt-3">
          <span className="text-gray-500 dark:text-gray-400 text-xs">{song.duration}</span>
          <button
            onClick={() => addToQueue(song)}
            title={inQueue ? 'Already in current playlist' : 'Add to current playlist'}
            className={
              inQueue
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
            }
          >
            <i className={`fas ${inQueue ? 'fa-check' : 'fa-plus'} text-xs md:text-sm`}></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export function PlaylistCard({ playlist }) {
  const { playQueue } = usePlayer()
  const list = playlistSongs(playlist)
  return (
    <Link
      to={`/playlists/${playlist.id}`}
      className="group block bg-white dark:bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-5 shadow hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div
        className={`relative w-full h-28 md:h-40 mb-3 md:mb-4 rounded-lg bg-gradient-to-r ${playlist.color} flex items-center justify-center overflow-hidden`}
      >
        <i className={`fas ${playlist.icon} text-white text-2xl md:text-4xl`}></i>
        {list.length > 0 && <PlayOverlayButton onPlay={() => playQueue(list, 0)} />}
      </div>
      <h4 className="font-bold md:text-lg mb-1 truncate">{playlist.name}</h4>
      <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
        {list.length} songs
      </p>
    </Link>
  )
}

export function GenreCard({ genre }) {
  const { playQueue } = usePlayer()
  const list = genreSongs(genre)
  const artistCount = genreArtists(genre).length
  return (
    <Link
      to={`/genres/${genre.id}`}
      className="group block bg-white dark:bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-5 shadow hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div
        className={`relative w-full h-28 md:h-40 mb-3 md:mb-4 rounded-lg bg-gradient-to-r ${genre.color} flex items-center justify-center overflow-hidden`}
      >
        <i className={`fas ${genre.icon} text-white text-2xl md:text-4xl`}></i>
        {list.length > 0 && <PlayOverlayButton onPlay={() => playQueue(list, 0)} />}
      </div>
      <h4 className="font-bold md:text-lg mb-1 truncate">{genre.name}</h4>
      <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
        {list.length} songs • {artistCount} artists
      </p>
    </Link>
  )
}

export function ArtistCard({ artist }) {
  const { playQueue } = usePlayer()
  const list = artistSongs(artist)
  return (
    <Link
      to={`/artists/${artist.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg md:rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="relative h-36 md:h-48">
        <img
          src={asset(artist.image)}
          alt={artist.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${artist.color} opacity-60`}></div>
        <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4">
          <h4 className="font-bold text-base md:text-xl text-white">{artist.name}</h4>
          {artist.genre && (
            <p className="text-white/80 text-xs md:text-sm">{artist.genre}</p>
          )}
        </div>
      </div>
      <div className="p-3 md:p-4 flex justify-between items-center">
        <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
          {list.length} songs
        </span>
        <button
          onClick={(e) => {
            e.preventDefault()
            if (list.length) playQueue(list, 0)
          }}
          className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center"
          aria-label={`Play ${artist.name}`}
        >
          <i className="fas fa-play text-xs md:text-sm"></i>
        </button>
      </div>
    </Link>
  )
}

export function AlbumCard({ album }) {
  const { playQueue } = usePlayer()
  const list = albumSongs(album)
  return (
    <Link
      to={`/albums/${album.id}`}
      className="group block bg-white dark:bg-gray-800 rounded-lg md:rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="relative h-32 md:h-40">
        <img
          src={asset(album.cover)}
          alt={album.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <button
          onClick={(e) => {
            e.preventDefault()
            if (list.length) playQueue(list, 0)
          }}
          className={`absolute top-2 md:top-3 right-2 md:right-3 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r ${album.color} rounded-full flex items-center justify-center hover:scale-110 transition-transform`}
          aria-label={`Play ${album.title}`}
        >
          <i className="fas fa-play text-white text-xs md:text-sm"></i>
        </button>
      </div>
      <div className="p-3 md:p-4">
        <h4 className="font-bold text-sm md:text-lg truncate">{album.title}</h4>
        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm truncate">{album.artist}</p>
        <div className="flex items-center justify-between mt-2 md:mt-3">
          <span className="text-gray-500 dark:text-gray-400 text-xs">{album.year}</span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">{list.length} songs</span>
        </div>
      </div>
    </Link>
  )
}

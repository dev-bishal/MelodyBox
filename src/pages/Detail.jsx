import { Link, useParams } from 'react-router-dom'
import SongRow from '../components/SongRow.jsx'
import { ArtistCard } from '../components/Cards.jsx'
import { usePlayer } from '../context/PlayerContext.jsx'
import {
  albumSongs,
  artistSongs,
  asset,
  genreArtists,
  genreSongs,
  getAlbum,
  getArtist,
  getGenre,
  getPlaylist,
  playlistSongs,
  totalDuration,
} from '../lib/library.js'

const config = {
  album: {
    get: getAlbum,
    songsOf: albumSongs,
    label: 'Album',
    backTo: '/albums',
  },
  artist: {
    get: getArtist,
    songsOf: artistSongs,
    label: 'Artist',
    backTo: '/artists',
  },
  playlist: {
    get: getPlaylist,
    songsOf: playlistSongs,
    label: 'Playlist',
    backTo: '/playlists',
  },
  genre: {
    get: getGenre,
    songsOf: genreSongs,
    artistsOf: genreArtists,
    label: 'Genre',
    backTo: '/genres',
  },
}

export default function Detail({ type }) {
  const { id } = useParams()
  const { playQueue, addToQueue } = usePlayer()
  const { get, songsOf, artistsOf, label, backTo } = config[type]
  const item = get(id)

  if (!item) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          This {label.toLowerCase()} could not be found.
        </p>
        <Link to={backTo} className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Back to {label}s
        </Link>
      </div>
    )
  }

  const list = songsOf(item)
  const relatedArtists = artistsOf ? artistsOf(item) : []
  const name = item.title || item.name
  const image = item.cover || item.image
  const subtitle =
    item.description ||
    [item.artist, item.genre, item.year].filter(Boolean).join(' • ')

  return (
    <div>
      {/* Hero */}
      <div
        className={`rounded-xl md:rounded-2xl p-6 md:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r ${
          item.color || 'from-indigo-500 to-purple-600'
        }`}
      >
        {image ? (
          <img
            src={asset(image)}
            alt={name}
            className="w-36 h-36 md:w-48 md:h-48 rounded-xl object-cover shadow-lg shrink-0"
          />
        ) : (
          <div className="w-36 h-36 md:w-48 md:h-48 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <i className={`fas ${item.icon || 'fa-music'} text-white text-5xl`}></i>
          </div>
        )}
        <div className="text-center sm:text-left">
          <span className="inline-block px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-white text-xs md:text-sm font-medium mb-3">
            {label}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{name}</h1>
          {subtitle && (
            <p className="text-white/90 text-sm md:text-base mb-4">{subtitle}</p>
          )}
          <p className="text-white/80 text-sm mb-5">
            {list.length} songs • {totalDuration(list)}
          </p>
          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <button
              onClick={() => list.length && playQueue(list, 0)}
              className="px-5 md:px-6 py-2 md:py-3 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-100 transition text-sm md:text-base"
            >
              <i className="fas fa-play mr-2"></i> Play All
            </button>
            <button
              onClick={() => list.forEach(addToQueue)}
              className="px-5 md:px-6 py-2 md:py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/30 transition text-sm md:text-base"
            >
              <i className="fas fa-plus mr-2"></i> Add to Queue
            </button>
          </div>
        </div>
      </div>

      {relatedArtists.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg md:text-xl font-bold mb-4">Artists</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </div>
      )}

      {/* Song list */}
      {relatedArtists.length > 0 && (
        <h3 className="text-lg md:text-xl font-bold mb-4">Songs</h3>
      )}
      <div className="space-y-1">
        {list.map((song, i) => (
          <SongRow key={song.id} song={song} indexInList={i} list={list} showAlbum={type !== 'album'} />
        ))}
        {!list.length && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            No songs here yet.
          </p>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const titles = {
  '/': ['Home', 'Welcome back! Explore your music'],
  '/songs': ['All Songs', 'Browse your entire music library'],
  '/albums': ['Albums', 'Browse albums in your library'],
  '/artists': ['Artists', 'Browse artists in your library'],
  '/playlists': ['Playlists', 'Your curated collections'],
  '/genres': ['Genres', 'Browse genres in your library'],
  '/player': ['Now Playing', 'Control playback and edit your queue'],
}

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const base = '/' + (pathname.split('/')[1] || '')
  const [title, subtitle] = titles[pathname] || titles[base] || ['MelodyBox', '']

  const submit = (e) => {
    e.preventDefault()
    navigate(`/songs?q=${encodeURIComponent(query)}`)
    setMobileSearchOpen(false)
  }

  const searchInput = (extra) => (
    <div className={`relative ${extra}`}>
      <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search songs, artists, albums..."
        className="pl-12 pr-4 py-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  )

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="ml-12 lg:ml-0">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm hidden md:block">{subtitle}</p>
        </div>

        <div className="flex items-center space-x-2 md:space-x-6">
          <form onSubmit={submit} className="hidden md:block w-64 lg:w-96">
            {searchInput()}
          </form>

          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden sidebar-item p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label="Search"
          >
            <i className="fas fa-search text-lg"></i>
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <form onSubmit={submit} className="mt-4 md:hidden">
          {searchInput()}
        </form>
      )}
    </header>
  )
}

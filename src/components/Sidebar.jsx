import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { playlists } from '../lib/library.js'

const menu = [
  { to: '/', icon: 'fa-home', label: 'Home', end: true },
  { to: '/songs', icon: 'fa-music', label: 'All Songs' },
  { to: '/playlists', icon: 'fa-compact-disc', label: 'Playlists' },
  { to: '/artists', icon: 'fa-microphone-alt', label: 'Artists' },
  { to: '/albums', icon: 'fa-record-vinyl', label: 'Albums' },
  { to: '/genres', icon: 'fa-guitar', label: 'Genres' },
]

export default function Sidebar({ open, onClose }) {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const itemClass = ({ isActive }) =>
    `sidebar-item flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
    }`

  return (
    <aside
      className={`w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col z-50 shrink-0 transition-transform duration-300 max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:bottom-0 ${
        open ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'
      }`}
    >
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-music text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Melody
              <span className="text-indigo-600 dark:text-indigo-400">Box</span>
            </h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            aria-label="Close menu"
          >
            <i className="fas fa-times text-gray-600 dark:text-gray-300"></i>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="mb-8">
          <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider mb-4 px-2">
            Menu
          </h3>
          <ul>
            {menu.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={itemClass} onClick={onClose}>
                  <i className={`fas ${item.icon} text-lg w-5 text-center`}></i>
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Playlists */}
        <div>
          <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider mb-4 px-2">
            Your Playlists
          </h3>
          <ul>
            {playlists.map((pl) => (
              <li key={pl.id}>
                <NavLink
                  to={`/playlists/${pl.id}`}
                  className="sidebar-item flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  onClick={onClose}
                >
                  <div
                    className={`w-8 h-8 bg-gradient-to-r ${pl.color} rounded flex items-center justify-center shrink-0`}
                  >
                    <i className={`fas ${pl.icon} text-white text-xs`}></i>
                  </div>
                  <span className="truncate">{pl.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Theme toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setDark(!dark)}
          className="sidebar-item w-full flex items-center justify-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        >
          <i className={`fas ${dark ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
          <span className="text-sm font-medium">{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  )
}

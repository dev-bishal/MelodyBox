import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', icon: 'fa-home', label: 'Home', end: true },
  { to: '/songs', icon: 'fa-music', label: 'Songs' },
  { to: '/playlists', icon: 'fa-compact-disc', label: 'Playlists' },
  { to: '/artists', icon: 'fa-microphone-alt', label: 'Artists' },
  { to: '/albums', icon: 'fa-record-vinyl', label: 'Albums' },
  { to: '/genres', icon: 'fa-guitar', label: 'Genres' },
]

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30 py-2 flex">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400'
            }`
          }
        >
          <i className={`fas ${item.icon} text-lg mb-1`}></i>
          <span className="text-xs">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Songs from './pages/Songs.jsx'
import Albums from './pages/Albums.jsx'
import Artists from './pages/Artists.jsx'
import Playlists from './pages/Playlists.jsx'
import Genres from './pages/Genres.jsx'
import Player from './pages/Player.jsx'
import Detail from './pages/Detail.jsx'
import { useEffect } from 'react'

export default function App() {
  const { pathname } = useLocation()

  // Scroll the content pane back to top on navigation
  useEffect(() => {
    document.getElementById('main-scroll')?.scrollTo(0, 0)
  }, [pathname])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/songs" element={<Songs />} />
        <Route path="/albums" element={<Albums />} />
        <Route path="/albums/:id" element={<Detail type="album" />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/artists/:id" element={<Detail type="artist" />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/playlists/:id" element={<Detail type="playlist" />} />
        <Route path="/genres" element={<Genres />} />
        <Route path="/genres/:id" element={<Detail type="genre" />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </Layout>
  )
}

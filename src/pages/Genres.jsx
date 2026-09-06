import { useState } from 'react'
import { GenreCard } from '../components/Cards.jsx'
import LoadMore from '../components/LoadMore.jsx'
import { genres } from '../lib/library.js'

const PAGE_SIZE = 8

export default function Genres() {
  const [shown, setShown] = useState(PAGE_SIZE)
  const visible = genres.slice(0, shown)

  // Unlike the other collections, genres are derived — with none tagged anywhere
  // the page would otherwise render an empty grid.
  if (!genres.length) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-16">
        No genres yet — add one to a song or an artist in the CMS.
      </p>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {visible.map((genre) => (
          <GenreCard key={genre.id} genre={genre} />
        ))}
      </div>
      <LoadMore
        shown={shown}
        total={genres.length}
        onMore={() => setShown(shown + PAGE_SIZE)}
        endMessage="That's every genre in your library"
      />
    </div>
  )
}

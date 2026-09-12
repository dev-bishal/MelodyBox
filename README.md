# MelodyBox — Web Music Player

![Melody Box React Music player](./public/screenshot.png)


A Spotify-style music player web app built with **React**, **Tailwind CSS 4**, and **Decap CMS**, designed for hosting on **GitHub Pages**.

## Features

- 🏠 **Home** — featured playlist hero, latest added songs, playlist/artist/album carousels
- 🎵 **All Songs** — searchable list with Load More pagination, play or queue any song
- 💿 **Albums / Artists / Playlists** — card grids with Load More, each with a detail page
- ▶️ **Player page** — spinning CD artwork, full controls, and an editable **Current Playlist**:
  - drag & drop to reorder
  - remove songs
  - add songs from the whole library (Add Songs modal, or the + button on any song)
- 🎧 **Persistent playback** — music keeps playing across page changes; the mini player at the bottom opens the full Player when clicked
- 🔔 **Now playing everywhere** — the browser tab shows the track title and its cover art as the favicon, and playback appears in the mobile notification panel / lock screen and the desktop browser's media controls, with working play, pause, next, previous and scrubbing
- 📥 **Installable PWA** — install it from the browser and it runs in its own window; the app shell, icons and fonts are cached, so it opens and navigates without a connection
- 🌙 Light/dark theme with saved preference
- 📱 Fully responsive (mobile bottom nav + slide-in sidebar)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Installing as an app

The production build ships a web app manifest and a service worker (`dist/sw.js`,
generated at build time by the plugin in `vite.config.js` from
`src/service-worker.js`). Chrome, Edge and Android offer "Install app"; on iOS use
Share → Add to Home Screen.

The service worker precaches the app shell and serves it on every navigation, so
routes load offline. Audio is deliberately left to the network — it is streamed
with Range requests that a cached whole-file response cannot answer — and covers
hosted off-site need a connection the first time they are shown.

Service workers only run over HTTPS or on `localhost`, so use `npm run build &&
npm run preview` to try it locally; `npm run dev` does not register one.

## Content management (Decap CMS)

All content lives as JSON files in `src/content/` (songs, albums, artists, playlists) and is bundled at build time. Demo audio is in `public/media/audio/`.

### Editing locally

```bash
npm run cms    # starts the Decap local proxy (decap-server)
npm run dev    # in another terminal
```

Then open http://localhost:5173/admin/ — the local backend writes straight to the files in your working copy.

### Editing in production (GitHub Pages)

1. In `public/admin/config.yml`, set `repo:` to your `<username>/<repo>`.
2. Decap's GitHub backend needs an OAuth gateway. Easiest options:
   - Use a hosted OAuth provider and set `base_url` in the backend config, or
   - Keep using the local workflow above and push changes with git.
3. Editors sign in with GitHub; every save is a commit, which triggers a redeploy.

## Deploying to GitHub Pages

1. Create a GitHub repository and push this project to the `main` branch.
2. In the repo settings → **Pages**, set **Source** to **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`.

The app uses clean history-based URLs (no `#`). The workflow automatically sets the correct base path from your repository name and copies `index.html` to `404.html` so deep links (e.g. `/albums/ocean-dreams`) load correctly on GitHub Pages.

## Adding real music

Replace the generated demo tracks in `public/media/audio/` with your MP3s and update each song's `audio` and `duration` fields (via the CMS or by editing `src/content/songs/*.json`).

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { PlayerProvider } from './context/PlayerContext.jsx'
import './index.css'

// Offline shell + installability. Only production builds emit dist/sw.js.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(() => {
        /* offline support is a bonus — never let it block the app */
      })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

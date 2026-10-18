import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { ErrorBoundary } from './components/error-boundary'
import { CHUNK_RELOAD_KEY, clearAppAssetCaches } from './lib/chunk-recovery'
import './lib/fetch-interceptor'
import './app/globals.css'

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()

  try {
    const lastReload = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0)
    if (Date.now() - lastReload < 15_000) return

    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()))
    window.setTimeout(() => sessionStorage.removeItem(CHUNK_RELOAD_KEY), 15_000)
    void clearAppAssetCaches()
      .catch((error) => {
        console.error('[App] Could not clear cached assets after a failed dynamic import:', error)
      })
      .finally(() => window.location.reload())
  } catch (error) {
    console.error('[App] Could not recover from a failed dynamic import:', error)
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary name="Application">
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

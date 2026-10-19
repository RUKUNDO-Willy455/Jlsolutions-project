import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    } else {
      // Dev: a worker left over from an earlier run keeps serving its cached
      // shell, so edits appear not to apply and API calls go nowhere. Drop it.
      navigator.serviceWorker
        .getRegistrations()
        .then(regs => Promise.all(regs.map(r => r.unregister())))
        .then(() => (window.caches ? caches.keys() : []))
        .then(keys => Promise.all(keys.map(k => caches.delete(k))))
        .catch(() => {})
    }
  })
}
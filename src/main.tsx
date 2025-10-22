import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/dashboard.css'
import App from './App.tsx'

// Initialize MSW in development
async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCKS !== 'true') {
    console.log('MSW disabled - VITE_USE_MOCKS is not true')
    return
  }

  console.log('Starting MSW worker...')
  const { worker } = await import('./mocks/browser')
  
  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start({
    onUnhandledRequest: 'bypass',
  }).then(() => {
    console.log('MSW worker started successfully')
  }).catch((error) => {
    console.error('Failed to start MSW worker:', error)
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})

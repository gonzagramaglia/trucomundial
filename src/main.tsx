import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/i18n'
import App from './App.tsx'
import { TwitchApp } from './components/twitch/TwitchApp.tsx'

const cleanPath = typeof window !== 'undefined' ? window.location.pathname.replace(/^\/trucomundial/, '') : ''
const isTwitch = cleanPath === '/twitch' || cleanPath === '/twitch/' || cleanPath === '/en/twitch' || cleanPath === '/en/twitch/'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isTwitch ? <TwitchApp /> : <App />}
  </StrictMode>,
)

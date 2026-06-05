import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/i18n'
import App from './App.tsx'

import { TwitchApp } from './components/twitch/TwitchApp.tsx'

const isTwitch = window.location.pathname === '/twitch'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isTwitch ? <TwitchApp /> : <App />}
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Design tokens — the repo-root styles.css @imports tokens/fonts, colors,
// typography and spacing (the single styling layer, per the design system).
import '../styles.css'
import './styles/global.css'

import { App } from './App'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

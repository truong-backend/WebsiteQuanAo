import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@app/styles/global.css'
import { Providers } from '@app/providers'
import { AppRouter } from '@app/router/router'
import { ChatBot } from '@widgets/chatbot'

// Toast root container (imperative toasts append here)
const toastRoot = document.createElement('div')
toastRoot.id = 'toast-root'
toastRoot.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;'
document.body.appendChild(toastRoot)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <AppRouter />
      <ChatBot />
    </Providers>
  </StrictMode>,
)
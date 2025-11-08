import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// TypeScript doesn't have built-in typings for CSS imports; ignore this line
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import './index.css'
import App from '././App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

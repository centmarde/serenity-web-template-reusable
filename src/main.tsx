import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Import React Dev Inspector for development
import { Inspector } from 'react-dev-inspector'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {import.meta.env.DEV && (
      <Inspector
        // Use default hotkeys: Ctrl+Shift+Alt+C on Windows/Linux, Ctrl+Shift+Cmd+C on macOS
        // Or you can specify custom keys like: keys={['alt', 'shift']}
        onHoverElement={(params) => {
          console.log('Inspector hover:', params.name, params.codeInfo)
        }}
        onClickElement={(params) => {
          console.log('Inspector click:', params.name, params.codeInfo)
        }}
      />
    )}
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initLenis } from './hooks/useLenis'
import { ThemeProvider } from './contexts/ThemeContext'

// Initialize smooth scrolling
initLenis();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

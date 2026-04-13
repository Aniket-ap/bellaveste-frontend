import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/globals.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store'

try {
  const saved = localStorage.getItem('bv_theme')
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
  const theme = saved === 'dark' || saved === 'light' ? saved : prefersDark ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme
} catch (e) {
  void e
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)

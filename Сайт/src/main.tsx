import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ContentGate } from './lib/content'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ContentGate>
      <App />
    </ContentGate>
  </React.StrictMode>,
)

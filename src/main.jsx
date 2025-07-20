import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'; // NEW: Import Toaster

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    {/* NEW: Add Toaster for notifications */}
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: '#1e293b',
          color: '#e2e8f0',
        },
      }}
    />
  </React.StrictMode>,
)
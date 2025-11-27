import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

/**
 * Application Entry Point
 * With React 18 concurrent features
 */

// Create root and render app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Log app startup (development only)
if (import.meta.env.DEV) {
  console.log('🚀 CoreHive Frontend Started');
  console.log('🌐 Environment:', import.meta.env.MODE);
  console.log('📡 API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api');
}
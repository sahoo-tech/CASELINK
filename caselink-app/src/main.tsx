import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { getApiBaseUrl } from './services/apiClient';

// Instant Proactive Pre-Warm (starts waking Render/backend in the first 50ms of page load)
try {
  const root = getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
  fetch(`${root}/ping`, { keepalive: true, mode: 'cors' })
    .catch(() => fetch(`${root}/health`, { keepalive: true, mode: 'cors' }).catch(() => {}));
} catch {
  // Silent fail
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

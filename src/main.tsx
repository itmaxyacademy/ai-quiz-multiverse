import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA support with auto-update detection
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registered for AI Quiz Multiverse:', reg.scope);
        (window as any).pwaRegistration = reg;

        if (reg.waiting) {
          console.log('[PWA] Update already waiting on load');
          window.dispatchEvent(new CustomEvent('pwa-update-available', { detail: { registration: reg } }));
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New version installed and waiting activation');
                window.dispatchEvent(new CustomEvent('pwa-update-available', { detail: { registration: reg } }));
              }
            });
          }
        });

        // Check for updates when device goes online
        window.addEventListener('online', () => {
          console.log('[PWA] Device went online, checking SW updates...');
          reg.update().catch((err) => console.debug('[PWA] Update check failed:', err));
        });

        // Check when returning to active tab and online
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && navigator.onLine) {
            reg.update().catch((err) => console.debug('[PWA] Visibility check failed:', err));
          }
        });
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err);
      });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('[PWA] New controller active, reloading page...');
        window.location.reload();
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Fix for environment issue where some scripts try to assign to getter-only window.fetch
(() => {
  try {
    let currentFetch = window.fetch;
    const patchFetch = (obj: any) => {
      if (!obj) return;
      const desc = Object.getOwnPropertyDescriptor(obj, 'fetch');
      if (!desc || desc.configurable) {
        Object.defineProperty(obj, 'fetch', {
          configurable: true,
          enumerable: true,
          get() {
            return currentFetch;
          },
          set(val) {
            currentFetch = val;
          }
        });
      }
    };
    patchFetch(window);
    if (typeof globalThis !== 'undefined') {
      patchFetch(globalThis);
    }
  } catch (err) {
    console.warn('Failed to configure writable fetch in main.tsx:', err);
  }
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

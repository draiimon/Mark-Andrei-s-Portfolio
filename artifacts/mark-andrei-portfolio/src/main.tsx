import { createRoot } from 'react-dom/client';

import App from './App';
import { getPerformanceProfile } from "@/lib/performance-profile";

import "./index.css";
import "@/app/globals.css";

document.body.className = "font-body antialiased";

const initialPerformanceProfile = getPerformanceProfile();
if (initialPerformanceProfile.android) {
  document.documentElement.dataset.android = "true";
}
if (initialPerformanceProfile.lowPower) {
  document.documentElement.dataset.mobileLite = "true";
}

createRoot(document.getElementById('root')!, {
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(<App />);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener(
    "load",
    () => {
      void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
      }).catch(() => {
        // Offline support is progressive enhancement; never block the app.
      });
    },
    { once: true },
  );
}

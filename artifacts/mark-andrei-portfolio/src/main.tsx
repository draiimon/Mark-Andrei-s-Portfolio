import { createRoot } from 'react-dom/client';

import App from './App';

import "./index.css";
import "@/app/globals.css";

document.body.className = "font-body antialiased";

createRoot(document.getElementById('root')!, {
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(<App />);

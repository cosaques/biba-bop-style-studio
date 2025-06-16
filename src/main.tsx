
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("main.tsx: Starting application");

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

console.log("main.tsx: Creating React root");
const root = createRoot(rootElement);

console.log("main.tsx: Rendering App component");
root.render(<App />);

// Add debugging for any uncaught errors
window.addEventListener('error', (event) => {
  console.error("main.tsx: Uncaught error", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString()
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error("main.tsx: Unhandled promise rejection", {
    reason: event.reason,
    timestamp: new Date().toISOString()
  });
});

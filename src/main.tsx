import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Global safety guard: Prevent "Failed to execute 'json' on 'Response': Unexpected end of JSON input"
// when API responses, 204s, or proxy timeouts return empty or non-JSON bodies.
if (typeof Response !== 'undefined' && Response.prototype) {
  const originalJson = Response.prototype.json;
  Response.prototype.json = async function () {
    try {
      const text = await this.text();
      if (!text || !text.trim()) {
        return {};
      }
      return JSON.parse(text);
    } catch {
      return {};
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

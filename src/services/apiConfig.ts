import { Capacitor } from '@capacitor/core';

export const PRODUCTION_API_URL = 'https://news-app-backend-mathis-projects-a3546874.vercel.app/api';

/**
 * Dynamically resolves the API base URL.
 * - Inside native Android/iOS (Capacitor) or standalone webview: uses full production backend URL.
 * - In local browser dev (Vite proxy port 5173): uses '/api' proxy.
 * - In production web (Vercel): uses '/api' rewrite.
 */
export function getApiBase(): string {
  try {
    if (Capacitor.isNativePlatform()) {
      return PRODUCTION_API_URL;
    }
    if (typeof window !== 'undefined') {
      const isCapacitorScheme = window.location.protocol === 'capacitor:' || window.location.protocol === 'file:';
      const isPortlessLocalhost = window.location.hostname === 'localhost' && !window.location.port;
      if (isCapacitorScheme || isPortlessLocalhost) {
        return PRODUCTION_API_URL;
      }
    }
  } catch {
    // Fallback if Capacitor is not present
  }

  const envBase = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_BASE) as string | undefined;
  if (envBase && envBase !== '/api') {
    return envBase;
  }

  return '/api';
}

export const API_BASE = getApiBase();


/**
 * MONEA Dynamic API URL Resolver
 * 
 * Handles environment-aware URL resolution:
 * 1. Uses relative path for Vite dev proxy during local development.
 * 2. Uses VITE_API_URL / VITE_API_BASE_URL for production builds (Cloudflare Pages -> Worker).
 */

const FALLBACK_WORKER_URL = "https://monea-api.seabkoeurn64.workers.dev";

export function getApiUrl(path: string): string {
  // Clean double slashes and leading slash
  let cleanPath = path.trim().replace(/^\/+/, '');
  
  if (!cleanPath.startsWith('api/') && cleanPath !== 'api') {
    cleanPath = `api/${cleanPath}`;
  }

  // Safe access to import.meta.env for TypeScript environments without vite/client types
  const env = (import.meta as any).env || {};

  // In local browser development, use relative path so Vite proxy handles CORS & cookies
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isDev = env.DEV;

    if (isLocal && isDev) {
      return `/${cleanPath}`;
    }
  }

  // Production: Resolve from Environment Variables with Fallback
  const rawBaseUrl = 
    env.VITE_API_URL || 
    env.VITE_API_BASE_URL || 
    FALLBACK_WORKER_URL;

  const apiBase = rawBaseUrl.replace(/\/+$/, '');
  return `${apiBase}/${cleanPath}`;
}

/**
 * Enhanced fetch wrapper that automatically applies API base URL and cross-origin credentials
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  return fetch(url, {
    ...init,
    credentials: 'include', // Crucial for cross-origin authentication cookies
  });
}
/**
 * Get the API base URL
 * In production (static export), uses VITE_API_URL
 * In development, uses Vite proxy via relative path
 */
export function getApiUrl(path: string): string {
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (!cleanPath.startsWith('api/') && cleanPath !== 'api') {
    cleanPath = `api/${cleanPath}`;
  }
  
  // Debug logging removed for production
  
  // In local browser development, use relative path so Vite proxy forwards
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isDev = import.meta.env.DEV;
    
    // Use proxy ONLY in local development
    if (isLocal && isDev) {
      return `/${cleanPath}`;
    }
  }

  // Production: use environment variable, fallback to production worker URL
  const apiBase = (import.meta.env.VITE_API_URL || 'https://monea-api.seabkoeurn64.workers.dev').replace(/\/$/, '');
  const finalUrl = `${apiBase}/${cleanPath}`;
  
  return finalUrl;
}

/**
 * Enhanced fetch that automatically uses correct API URL
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  return fetch(url, {
    ...init,
    credentials: 'include', // Important for cookies with cross-origin
  });
}

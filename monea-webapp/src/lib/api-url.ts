/**
 * Get the API base URL
 * In production (static export), uses NEXT_PUBLIC_API_URL
 * In development, uses relative /api path
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In local browser development, use relative path so Vite proxy forwards
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return `/${cleanPath}`;
    }
  }

  const rawBase = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || '';
  const apiBase = (rawBase && rawBase !== 'http://localhost:8787' ? rawBase : 'https://monea-api.seabkoeurn64.workers.dev').replace(/\/$/, '');
  
  return `${apiBase}/${cleanPath}`;
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

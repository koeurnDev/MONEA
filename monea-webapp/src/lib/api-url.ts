/**
 * Get the API base URL
 * In production (static export), uses NEXT_PUBLIC_API_URL
 * In development, uses relative /api path
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In development, ALWAYS use relative path to route through Vite proxy (/api)
  if (import.meta.env.DEV) {
    return `/${cleanPath}`;
  }

  const rawBase = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || '';
  const apiBase = rawBase.replace(/\/$/, '');
  
  // In production with external API
  if (apiBase) {
    return `${apiBase}/${cleanPath}`;
  }
  
  return `/${cleanPath}`;
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

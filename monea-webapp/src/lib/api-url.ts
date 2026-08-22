/**
 * Get the API base URL
 * In production (static export), uses NEXT_PUBLIC_API_URL
 * In development, uses relative /api path
 */
export function getApiUrl(path: string): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In production with external API
  if (apiBase) {
    return `${apiBase}/${cleanPath}`;
  }
  
  // In development with local API routes
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

/**
 * Global fetch interceptor for static export
 * Automatically redirects /api/* calls to NEXT_PUBLIC_API_URL
 */

const originalFetch = globalThis.fetch;

export function setupFetchInterceptor() {
  if (typeof window === 'undefined') return; // Only run in browser
  
  globalThis.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    // In development, keep /api/ relative so Vite proxy forwards to local worker
    if (import.meta.env.DEV) {
      return originalFetch(input, init);
    }

    // Intercept /api/* calls and redirect to Worker API in production
    if (typeof url === 'string' && url.startsWith('/api/')) {
      const rawBase = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || '';
      const apiBase = (rawBase && rawBase !== 'http://localhost:8787' ? rawBase : 'https://monea-api.seabkoeurn64.workers.dev').replace(/\/$/, '');
      url = `${apiBase}${url}`;
      
      // Ensure credentials are included for cross-origin
      init = {
        ...init,
        credentials: 'include',
      };
    }
    
    return originalFetch(url, init);
  } as typeof fetch;
}

// Auto-setup on import
if (typeof window !== 'undefined') {
  setupFetchInterceptor();
}

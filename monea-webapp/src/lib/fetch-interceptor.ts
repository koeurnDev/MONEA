/**
 * Global fetch interceptor for static export
 * Automatically redirects /api/* calls to VITE_API_URL
 */

const originalFetch = globalThis.fetch;

export function setupFetchInterceptor() {
  if (typeof window === 'undefined') return; // Only run in browser
  
  globalThis.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    // In local browser development on localhost, keep /api/ relative so Vite proxy forwards
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isLocal && import.meta.env.DEV) {
      return originalFetch(input, init);
    }

    // Intercept /api/* calls and redirect to Worker API in production
    if (typeof url === 'string' && url.startsWith('/api/')) {
      const apiBase = (import.meta.env.VITE_API_URL || 'https://monea-api.seabkoeurn64.workers.dev').replace(/\/$/, '');
      url = `${apiBase}${url}`;
      
      console.log(`[FetchInterceptor] Redirecting ${input} -> ${url}`);
      
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

/**
 * Global fetch interceptor for static export
 * Automatically redirects /api/* calls to NEXT_PUBLIC_API_URL
 */

const originalFetch = globalThis.fetch;

export function setupFetchInterceptor() {
  if (typeof window === 'undefined') return; // Only run in browser
  
  globalThis.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    // Intercept /api/* calls and redirect to Worker API
    if (url.startsWith('/api/')) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://monea-api.seabkoeurn64.workers.dev';
      url = url.replace('/api/', `${apiBase}/api/`);
      
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

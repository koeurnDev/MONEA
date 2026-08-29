/**
 * Global fetch interceptor for static export
 * Automatically redirects /api/* calls to VITE_API_URL and attaches auth tokens
 */

const originalFetch = globalThis.fetch;

export function setupFetchInterceptor() {
  if (typeof window === 'undefined') return; // Only run in browser
  
  globalThis.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const apiBase = (import.meta.env.VITE_API_URL || 'https://monea-api.seabkoeurn64.workers.dev').replace(/\/$/, '');
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const isDev = import.meta.env.DEV;

    // In local browser development on localhost in dev mode, keep /api/ relative so Vite proxy forwards
    if (isLocal && isDev) {
      return originalFetch(input, init);
    }

    let urlString = '';
    if (typeof input === 'string') {
      urlString = input;
    } else if (input instanceof URL) {
      urlString = input.href;
    } else if (input && typeof (input as Request).url === 'string') {
      urlString = (input as Request).url;
    }

    let isApiCall = false;
    let finalUrl = urlString;

    if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
      try {
        const parsed = new URL(urlString);
        const currentOrigin = window.location.origin;
        let apiOrigin = '';
        try {
          apiOrigin = new URL(apiBase).origin;
        } catch {}

        // If it's already pointing to the API worker origin
        if ((apiOrigin && parsed.origin === apiOrigin) || urlString.includes('monea-api.seabkoeurn64.workers.dev')) {
          isApiCall = true;
          finalUrl = urlString;
        } 
        // If it's a full URL to the frontend origin targeting /api/*
        else if (parsed.origin === currentOrigin && (parsed.pathname.startsWith('/api/') || parsed.pathname === '/api')) {
          isApiCall = true;
          let cleanPath = parsed.pathname.startsWith('/') ? parsed.pathname.slice(1) : parsed.pathname;
          if (!cleanPath.startsWith('api/')) cleanPath = `api/${cleanPath}`;
          finalUrl = `${apiBase}/${cleanPath}${parsed.search}${parsed.hash}`;
        }
      } catch {
        // Fallback
      }
    } else if (urlString.startsWith('/api/') || urlString.startsWith('api/') || urlString === '/api' || urlString === 'api') {
      // Relative API path
      isApiCall = true;
      let cleanPath = urlString.startsWith('/') ? urlString.slice(1) : urlString;
      if (!cleanPath.startsWith('api/')) cleanPath = `api/${cleanPath}`;
      finalUrl = `${apiBase}/${cleanPath}`;
    }

    if (isApiCall) {
      const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
      
      // Auto attach Bearer token from localStorage if present and not already set
      const token = localStorage.getItem('auth_token');
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      // Preserve method and body if input was a Request object
      const method = init?.method || (input instanceof Request ? input.method : 'GET');
      const body = init?.body || (input instanceof Request && method !== 'GET' && method !== 'HEAD' ? input.body : undefined);

      const updatedInit: RequestInit = {
        ...init,
        method,
        body,
        headers,
        credentials: 'include',
      };

      return originalFetch(finalUrl, updatedInit);
    }
    
    return originalFetch(input, init);
  } as typeof fetch;
}

// Auto-setup on import
if (typeof window !== 'undefined') {
  setupFetchInterceptor();
}


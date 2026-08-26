/**
 * Global fetch interceptor for static frontend deployments (Cloudflare Pages / Next.js Export).
 * Automatically redirects relative `/api/*` requests to the remote Cloudflare Worker API.
 */

const originalFetch = globalThis.fetch;

// Prevent infinite wrapping if imported multiple times
let isIntercepted = false;

/**
 * Safe Helper to extract API Base URL across Vite & Next.js client environments.
 */
function getApiBaseUrl(): string {
  let rawBase = "";

  if (typeof import.meta !== "undefined" && (import.meta as any).env) {
    rawBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
  }
  if (!rawBase && typeof process !== "undefined" && process.env) {
    rawBase = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || "";
  }

  if (rawBase && rawBase !== "http://localhost:8787") {
    return rawBase.replace(/\/$/, "");
  }

  // Fallback to Production Worker API Endpoint
  return "https://monea-api.seabkoeurn64.workers.dev";
}

export function setupFetchInterceptor() {
  if (typeof window === 'undefined' || isIntercepted) return;

  isIntercepted = true;

  globalThis.fetch = async function (
    input: RequestInfo | URL, 
    init?: RequestInit
  ): Promise<Response> {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // In local development, bypass interceptor so local proxy handles relative routes
    if (isLocal) {
      return originalFetch(input, init);
    }

    let urlString = "";

    if (typeof input === "string") {
      urlString = input;
    } else if (input instanceof URL) {
      urlString = input.href;
    } else if (input instanceof Request) {
      urlString = input.url;
    }

    // Intercept relative `/api/*` calls in production
    if (urlString.startsWith("/api/")) {
      const apiBase = getApiBaseUrl();
      const targetUrl = `${apiBase}${urlString}`;

      const updatedInit: RequestInit = {
        ...init,
        credentials: "include", // Essential for cross-site cookie transmission
      };

      // If input is a Request object, preserve headers, method, and body
      if (input instanceof Request) {
        return originalFetch(new Request(targetUrl, input), updatedInit);
      }

      return originalFetch(targetUrl, updatedInit);
    }

    return originalFetch(input, init);
  } as typeof fetch;
}

// Auto-setup when executing on client side
if (typeof window !== 'undefined') {
  setupFetchInterceptor();
}
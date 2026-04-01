/**
 * MONEA Centralized API Client
 * 
 * Provides a hardened fetch wrapper that handles:
 * 1. Automatic CSRF token management for mutable requests.
 * 2. Consistent error handling and normalization.
 * 3. Environment-aware configurations.
 */

let cachedCsrfToken: string | null = null;
let lastCsrfFetch: number = 0;
const CSRF_TTL = 1000 * 60 * 45; // 45 minutes

async function getCsrfToken(): Promise<string | null> {
    const now = Date.now();
    if (cachedCsrfToken && (now - lastCsrfFetch < CSRF_TTL)) {
        return cachedCsrfToken;
    }

    try {
        const res = await fetch("/api/auth/csrf");
        if (!res.ok) throw new Error("Failed to fetch CSRF token");
        const data = await res.json();
        cachedCsrfToken = data.token;
        lastCsrfFetch = now;
        return cachedCsrfToken;
    } catch (err) {
        console.error("[MoneaClient] CSRF Fetch Error:", err);
        return null;
    }
}

export type ApiResponse<T> = {
    data: T | null;
    error: string | null;
    details?: any;
    status: number;
};

async function request<T>(
    path: string, 
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const method = options.method?.toUpperCase() || "GET";
    const isMutable = ["POST", "PUT", "DELETE", "PATCH"].includes(method);
    
    // Setup headers
    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    // Attach CSRF token if mutable
    if (isMutable) {
        const token = await getCsrfToken();
        if (token) {
            headers.set("X-CSRF-Token", token);
        }
    }

    try {
        const response = await fetch(path, { ...options, headers });
        const text = await response.text();
        let data: any = null;
        
        try {
            data = text ? JSON.parse(text) : null;
        } catch (e) {
            data = { error: "Invalid JSON response from server", raw: text };
        }

        if (!response.ok) {
            // Handle specific status codes if needed
            if (response.status === 401 && !path.includes("/api/auth/signin")) {
                // Potential session expiry
                console.warn("[MoneaClient] 401 Unauthorized detected.");
                if (typeof window !== 'undefined' && 
                    !window.location.pathname.startsWith('/sign-in') && 
                    !window.location.pathname.startsWith('/sign-up')) {
                    window.location.href = '/sign-in';
                }
            }

            return {
                data: null,
                error: data?.error || `Request failed with status ${response.status}`,
                details: data?.details,
                status: response.status
            };
        }

        return {
            data: data as T,
            error: null,
            status: response.status
        };
    } catch (error: any) {
        console.error(`[MoneaClient] ${method} ${path} Error:`, error);
        return {
            data: null,
            error: error.message || "Network error or server unreachable",
            status: 503
        };
    }
}

export const moneaClient = {
    get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "GET" }),
    post: <T>(path: string, body?: any, options?: RequestInit) => 
        request<T>(path, { 
            ...options, 
            method: "POST", 
            body: body instanceof FormData ? body : JSON.stringify(body) 
        }),
    put: <T>(path: string, body?: any, options?: RequestInit) => 
        request<T>(path, { 
            ...options, 
            method: "PUT", 
            body: body instanceof FormData ? body : JSON.stringify(body) 
        }),
    delete: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "DELETE" }),
    patch: <T>(path: string, body?: any, options?: RequestInit) => 
        request<T>(path, { 
            ...options, 
            method: "PATCH", 
            body: body instanceof FormData ? body : JSON.stringify(body) 
        }),
};

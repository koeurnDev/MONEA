import { apiCache, CacheKeys, ApiCache } from './api-cache';

/**
 * Optimized API Client with smart caching and request batching
 */
export class OptimizedApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    setToken(token: string | null) {
        this.token = token;
        // Clear user-specific cache when token changes
        if (!token) {
            apiCache.clear('user:|dashboard:|wedding:');
        }
    }

    private getHeaders() {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    private async request<T>(
        endpoint: string, 
        options: RequestInit = {},
        cacheConfig?: { key: string; duration: number; bypassCache?: boolean }
    ): Promise<T> {
        // Check cache first (if enabled and not bypassed)
        if (cacheConfig && !cacheConfig.bypassCache) {
            const cached = apiCache.get(cacheConfig.key);
            if (cached) {
                console.log(`[API Cache Hit] ${cacheConfig.key}`);
                return cached;
            }
        }

        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        });

        if (!response.ok) {
            // Clear relevant cache on errors
            if (cacheConfig) {
                apiCache.invalidate(cacheConfig.key);
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache successful responses
        if (cacheConfig && response.ok) {
            apiCache.set(cacheConfig.key, data, cacheConfig.duration);
            console.log(`[API Cache Set] ${cacheConfig.key}`);
        }

        return data;
    }

    /**
     * Combined dashboard initialization - replaces multiple separate calls
     */
    async getDashboardInit(bypassCache = false): Promise<any> {
        const userId = this.token ? 'current' : 'anonymous';
        return this.request('/dashboard/init', 
            { method: 'GET' },
            { 
                key: CacheKeys.dashboardInit(userId),
                duration: ApiCache.DURATIONS.DASHBOARD,
                bypassCache
            }
        );
    }

    /**
     * Get user session with caching
     */
    async getMe(bypassCache = false): Promise<any> {
        return this.request('/auth/me', 
            { method: 'GET' },
            {
                key: CacheKeys.userSession(),
                duration: ApiCache.DURATIONS.USER_SESSION,
                bypassCache
            }
        );
    }

    /**
     * Get broadcasts with caching
     */
    async getBroadcasts(bypassCache = false): Promise<any[]> {
        return this.request('/broadcast',
            { method: 'GET' },
            {
                key: CacheKeys.broadcasts(),
                duration: ApiCache.DURATIONS.BROADCASTS,
                bypassCache
            }
        );
    }

    /**
     * Get wedding stats with caching
     */
    async getWeddingStats(weddingId: string, bypassCache = false): Promise<any> {
        return this.request(`/wedding/analytics/stats?weddingId=${weddingId}`,
            { method: 'GET' },
            {
                key: CacheKeys.weddingStats(weddingId),
                duration: ApiCache.DURATIONS.DASHBOARD,
                bypassCache
            }
        );
    }

    /**
     * Batch operations - multiple requests in parallel with individual caching
     */
    async batchRequests<T extends Record<string, any>>(
        requests: Record<keyof T, () => Promise<any>>
    ): Promise<T> {
        const results = await Promise.allSettled(
            Object.entries(requests).map(async ([key, fetcher]) => [key, await fetcher()])
        );

        const batchResult = {} as T;
        for (const result of results) {
            if (result.status === 'fulfilled') {
                const [key, data] = result.value as [string, any];
                batchResult[key as keyof T] = data;
            }
        }

        return batchResult;
    }

    /**
     * Invalidate specific cache patterns
     */
    clearCache(pattern?: string) {
        apiCache.clear(pattern);
    }

    /**
     * Force refresh - bypass cache and update it
     */
    async refresh<T>(fetcher: () => Promise<T>): Promise<T> {
        // This will bypass cache and update it with fresh data
        return fetcher();
    }
}

// Export singleton instance
export const optimizedApi = new OptimizedApiClient(
    process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8787/api' 
        : 'https://monea-api.seabkoeurn64.workers.dev/api'
);
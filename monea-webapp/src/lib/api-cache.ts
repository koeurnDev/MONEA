/**
 * Simple in-memory cache for API responses
 * កាត់បន្ថយ API calls ដោយរក្សាទុក responses ក្នុងពេលខ្លី
 */

interface CacheEntry {
    data: any;
    timestamp: number;
    expires: number;
}

export class ApiCache {
    private cache: Map<string, CacheEntry> = new Map();
    
    /**
     * Cache duration constants (in milliseconds)
     */
    static readonly DURATIONS = {
        USER_SESSION: 5 * 60 * 1000,     // 5 minutes - user info
        DASHBOARD: 2 * 60 * 1000,        // 2 minutes - dashboard data  
        BROADCASTS: 10 * 60 * 1000,      // 10 minutes - announcements
        STATIC_DATA: 30 * 60 * 1000,     // 30 minutes - templates, etc.
        SHORT: 30 * 1000,                // 30 seconds - frequently changing
    } as const;

    set(key: string, data: any, duration: number = ApiCache.DURATIONS.DASHBOARD): void {
        const now = Date.now();
        this.cache.set(key, {
            data,
            timestamp: now,
            expires: now + duration
        });
    }

    get(key: string): any | null {
        const entry = this.cache.get(key);
        
        if (!entry) return null;
        
        const now = Date.now();
        if (now > entry.expires) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.data;
    }

    clear(keyPattern?: string): void {
        if (keyPattern) {
            // Clear keys matching pattern
            const regex = new RegExp(keyPattern);
            for (const [key] of this.cache) {
                if (regex.test(key)) {
                    this.cache.delete(key);
                }
            }
        } else {
            // Clear all
            this.cache.clear();
        }
    }

    invalidate(key: string): void {
        this.cache.delete(key);
    }

    // Helper methods for common cache patterns
    cacheOrFetch<T>(key: string, fetcher: () => Promise<T>, duration?: number): Promise<T> {
        const cached = this.get(key);
        if (cached) {
            return Promise.resolve(cached);
        }
        
        return fetcher().then(data => {
            this.set(key, data, duration);
            return data;
        });
    }

    // Clean up expired entries periodically
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache) {
            if (now > entry.expires) {
                this.cache.delete(key);
            }
        }
    }
}

// Global cache instance
export const apiCache = new ApiCache();

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
    setInterval(() => apiCache.cleanup(), 5 * 60 * 1000);
}

// Cache key generators
export const CacheKeys = {
    userSession: () => 'user:session',
    dashboardInit: (userId: string) => `dashboard:init:${userId}`,
    broadcasts: () => 'broadcasts:active',
    weddingStats: (weddingId: string) => `wedding:stats:${weddingId}`,
    guestList: (weddingId: string) => `guests:${weddingId}`,
    guestbook: (weddingId: string) => `guestbook:${weddingId}`,
} as const;
import { SWRConfig } from "swr";
import { ReactNode, useState, useEffect, useRef } from "react";

// Optimized cache provider for mobile
function mobileOptimizedProvider() {
    if (typeof window === "undefined") return new Map();

    // Simple in-memory cache for mobile performance
    const cache = new Map();
    
    // Throttled localStorage sync to prevent blocking
    const syncRef = { current: null as any };
    const syncToStorage = () => {
        if (syncRef.current) clearTimeout(syncRef.current);
        syncRef.current = setTimeout(() => {
            try {
                const appCache = JSON.stringify(Array.from(cache.entries()).slice(0, 20)); // Limit cache size
                localStorage.setItem("app-cache", appCache);
            } catch (e) {
                console.warn('[Cache] Failed to sync to localStorage:', e);
            }
        }, 1000);
    };

    // Load from localStorage once on init
    try {
        const saved = localStorage.getItem("app-cache");
        if (saved) {
            const entries = JSON.parse(saved);
            entries.forEach(([key, value]: [string, any]) => cache.set(key, value));
        }
    } catch (e) {
        console.warn('[Cache] Failed to load from localStorage:', e);
    }

    // Light sync on visibility change (mobile-friendly)
    if ('visibilitychange' in document) {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) syncToStorage();
        });
    }

    return cache;
}

const mobileOptimizedConfig = {
    fetcher: async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `HTTP error ${res.status}`);
        }
        return res.json();
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: false, // Disable for mobile performance
    dedupingInterval: 120000, // Longer dedup for mobile
    shouldRetryOnError: false,
    errorRetryCount: 1, // Limit retries
    errorRetryInterval: 3000, // Longer intervals
    focusThrottleInterval: 300000, // 5 minutes
};

export const SWRProvider = ({ children }: { children: ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Delay mount for better mobile startup
        const timer = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <SWRConfig value={{
            ...mobileOptimizedConfig,
            provider: mobileOptimizedProvider,
        }}>
            {children}
        </SWRConfig>
    );
};

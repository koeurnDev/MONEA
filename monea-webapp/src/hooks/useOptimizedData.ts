import { useState, useEffect, useCallback, useRef } from 'react';
import { optimizedApi } from '@/lib/api-client-optimized';

interface UseOptimizedDataOptions {
    refreshInterval?: number;
    enabled?: boolean;
    onError?: (error: Error) => void;
}

/**
 * Smart hook ដែលកាត់បន្ថយ API calls ដោយប្រើ:
 * - Intelligent caching
 * - Request deduplication  
 * - Background refresh
 * - Error retry logic
 */
export function useOptimizedDashboard(options: UseOptimizedDataOptions = {}) {
    const { refreshInterval = 5 * 60 * 1000, enabled = true, onError } = options; // Default 5 min
    
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [lastFetch, setLastFetch] = useState<number>(0);
    
    const fetchPromiseRef = useRef<Promise<any> | null>(null);
    const mountedRef = useRef(true);

    // Request deduplication - ទប់ស្កាត់ requests ធ្វើច្រើនដង
    const fetchData = useCallback(async (bypassCache = false) => {
        if (!enabled) return;

        // Return existing promise if already fetching
        if (fetchPromiseRef.current && !bypassCache) {
            return fetchPromiseRef.current;
        }

        const fetchPromise = optimizedApi.getDashboardInit(bypassCache);
        fetchPromiseRef.current = fetchPromise;

        try {
            const result = await fetchPromise;
            
            if (!mountedRef.current) return;
            
            setData(result);
            setError(null);
            setLastFetch(Date.now());
        } catch (err) {
            if (!mountedRef.current) return;
            
            const error = err instanceof Error ? err : new Error('Fetch failed');
            setError(error);
            onError?.(error);
            
            // Exponential backoff retry logic
            setTimeout(() => {
                if (mountedRef.current) {
                    fetchData(false); // Retry without bypassing cache
                }
            }, Math.min(1000 * Math.pow(2, (error.message.match(/retry/g) || []).length), 30000));
            
        } finally {
            if (mountedRef.current) {
                setLoading(false);
                fetchPromiseRef.current = null;
            }
        }

        return fetchPromise;
    }, [enabled, onError]);

    // Initial fetch
    useEffect(() => {
        mountedRef.current = true;
        fetchData();
        
        return () => {
            mountedRef.current = false;
        };
    }, [fetchData]);

    // Background refresh interval
    useEffect(() => {
        if (!enabled || !refreshInterval) return;

        const interval = setInterval(() => {
            const timeSinceLastFetch = Date.now() - lastFetch;
            
            // Only refresh if data is older than half the refresh interval
            if (timeSinceLastFetch > refreshInterval / 2) {
                fetchData(true); // Background refresh bypasses cache
            }
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [refreshInterval, lastFetch, fetchData, enabled]);

    // Manual refresh
    const refresh = useCallback(() => {
        setLoading(true);
        return fetchData(true);
    }, [fetchData]);

    // Cleanup
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return {
        data,
        loading,
        error,
        refresh,
        lastFetch: new Date(lastFetch),
        // Convenience getters
        user: data?.user,
        wedding: data?.user?.wedding,
        broadcasts: data?.broadcasts || [],
        stats: data?.stats || {},
    };
}

/**
 * Hook សម្រាប់ data ដែលមិនសូវប្រែប្រួល
 */
export function useStaticData<T>(
    fetcher: () => Promise<T>,
    cacheKey: string,
    options: UseOptimizedDataOptions = {}
) {
    const { enabled = true, onError } = options;
    
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const fetchWithCache = async () => {
            try {
                const result = await fetcher();
                setData(result);
                setError(null);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Fetch failed');
                setError(error);
                onError?.(error);
            } finally {
                setLoading(false);
            }
        };

        fetchWithCache();
    }, [enabled, cacheKey, fetcher, onError]);

    const refresh = useCallback(() => {
        setLoading(true);
        return fetcher().then(result => {
            setData(result);
            setError(null);
            setLoading(false);
            return result;
        });
    }, [fetcher]);

    return { data, loading, error, refresh };
}
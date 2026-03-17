"use client";

import useSWR from "swr";
import { useState, useEffect, useCallback } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UseGiftsDataOptions {
    refreshInterval?: number;
    limit?: number;
}

export function useGiftsData(options: UseGiftsDataOptions = {}) {
    const { refreshInterval = 30000, limit } = options;
    const [now, setNow] = useState(Date.now());

    // Wedding data for branding (used in both pages)
    const { data: wedding, mutate: mutateWedding } = useSWR(
        `/api/wedding?t=${now}`,
        fetcher,
        { refreshInterval: refreshInterval }
    );

    // Gifts data fetching
    const giftsUrl = limit ? `/api/gifts?limit=${limit}` : "/api/gifts";
    const { data: giftsData, error, isLoading, mutate: mutateGifts } = useSWR(
        giftsUrl,
        fetcher,
        { refreshInterval: refreshInterval, keepPreviousData: true }
    );

    // Stats fetching
    const { data: statsData, mutate: mutateStats } = useSWR(
        "/api/gifts/stats",
        fetcher,
        { refreshInterval: refreshInterval }
    );

    const gifts = giftsData?.gifts || (Array.isArray(giftsData) ? giftsData : []);
    const userRole = giftsData?.role || null;

    // Derived totals (if stats API is not used or to verify)
    const totals = gifts.reduce(
        (acc: any, g: any) => {
            if (g.currency === "USD") acc.usd += Number(g.amount || 0);
            if (g.currency === "KHR") acc.khr += Number(g.amount || 0);
            return acc;
        },
        { usd: 0, khr: 0 }
    );

    const refresh = useCallback(() => {
        setNow(Date.now());
        mutateWedding();
        mutateGifts();
        mutateStats();
    }, [mutateWedding, mutateGifts, mutateStats]);

    return {
        wedding,
        gifts,
        stats: statsData,
        userRole,
        isLoading,
        error,
        totals,
        refresh,
        mutateWedding,
        mutateGifts
    };
}

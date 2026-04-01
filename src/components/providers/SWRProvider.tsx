"use client";

import { SWRConfig } from "swr";
import { ReactNode, useState, useEffect } from "react";

function localStorageProvider() {
    if (typeof window === "undefined") return new Map();

    // When initializing, we restore the data from `localStorage` into a map.
    const map = new Map(JSON.parse(localStorage.getItem("app-cache") || "[]"));

    // Before unloading the app, we write back all the data into `localStorage`.
    window.addEventListener("beforeunload", () => {
        const appCache = JSON.stringify(Array.from(map.entries()));
        localStorage.setItem("app-cache", appCache);
    });

    // We still use the map for write & read for performance.
    return map as any;
}

const swrDefaultConfig = {
    fetcher: (url: string) => fetch(url).then((res) => res.json()),
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    shouldRetryOnError: false,
};

export const SWRProvider = ({ children }: { children: ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <SWRConfig
            value={{
                ...swrDefaultConfig,
                provider: mounted ? localStorageProvider : undefined,
            }}
        >
            {children}
        </SWRConfig>
    );
};

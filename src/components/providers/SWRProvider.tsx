"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";

function localStorageProvider() {
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

export const SWRProvider = ({ children }: { children: ReactNode }) => {
    return (
        <SWRConfig
            value={{
                fetcher: (url: string) => fetch(url).then((res) => res.json()),
                provider: typeof window !== "undefined" ? localStorageProvider : undefined,
                revalidateOnFocus: false,
                dedupingInterval: 10000, // Default 10s deduping
            }}
        >
            {children}
        </SWRConfig>
    );
};

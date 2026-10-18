import { SWRConfig } from "swr";
import { ReactNode } from "react";
import { isNetworkError, NETWORK_ERROR_MESSAGE, notifyNetworkError } from "@/lib/network-errors";

const isMobileDevice = typeof window !== "undefined" && window.innerWidth <= 768;

const swrConfig = {
    fetcher: async (url: string) => {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP error ${res.status}`);
            }
            return await res.json();
        } catch (error) {
            if (isNetworkError(error)) {
                notifyNetworkError(error);
                throw new Error(NETWORK_ERROR_MESSAGE);
            }
            throw error;
        }
    },
    // Mobile-optimized configuration to conserve cellular data and battery
    mobileOptimized: isMobileDevice,
    revalidateOnFocus: !isMobileDevice,
    revalidateOnReconnect: true,
    dedupingInterval: isMobileDevice ? 20000 : 10000,
    shouldRetryOnError: false,
};

export const SWRProvider = ({ children }: { children: ReactNode }) => {
    return (
        <SWRConfig value={{
            ...swrConfig,
            provider: () => new Map(),
        }}>
            {children}
        </SWRConfig>
    );
};

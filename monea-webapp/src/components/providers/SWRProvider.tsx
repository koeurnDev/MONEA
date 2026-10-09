import { SWRConfig } from "swr";
import { ReactNode } from "react";

const swrConfig = {
    fetcher: async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `HTTP error ${res.status}`);
        }
        return res.json();
    },
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
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

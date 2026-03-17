"use client";
import * as React from "react";
import { usePathname } from "next/navigation";

interface LoadingContextType {
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
}

const LoadingContext = React.createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = React.useState(false);
    const pathname = usePathname();

    const startLoading = React.useCallback(() => {
        setIsLoading(true);
    }, []);

    const stopLoading = React.useCallback(() => {
        setIsLoading(false);
    }, []);

    // Stop loading when the pathname changes (navigation complete)
    React.useEffect(() => {
        stopLoading();
    }, [pathname, stopLoading]);

    return (
        <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = React.useContext(LoadingContext);
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
}

import * as React from "react";
import { useLocation } from 'react-router-dom';
import { useMobileDetection } from '../../hooks/useMobileDetection';

interface LoadingContextType {
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
}

const LoadingContext = React.createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = React.useState(false);
    const { pathname } = useLocation();
    const { isMobile } = useMobileDetection();
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const startLoading = React.useCallback(() => {
        setIsLoading(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        // Shorter timeout for mobile to prevent freezing
        const timeout = isMobile ? 4000 : 6000;
        timeoutRef.current = setTimeout(() => {
            setIsLoading(false);
        }, timeout);
    }, [isMobile]);

    const stopLoading = React.useCallback(() => {
        setIsLoading(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    // Stop loading when pathname changes (navigation complete)
    React.useEffect(() => {
        // Debounce for mobile performance
        const timer = setTimeout(stopLoading, isMobile ? 100 : 0);
        return () => clearTimeout(timer);
    }, [pathname, stopLoading, isMobile]);

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

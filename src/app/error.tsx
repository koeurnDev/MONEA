'use client';

import { useEffect, useMemo } from 'react';
import ErrorState from '@/components/common/ErrorState';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    const errorType = useMemo(() => {
        const msg = error.message?.toLowerCase() || '';
        const name = error.name?.toLowerCase() || '';
        
        if (msg.includes('connection') || msg.includes('network') || msg.includes('fetch')) {
            return 'connection';
        }
        if (msg.includes('prisma') || msg.includes('database') || msg.includes('db') || name.includes('prisma')) {
            return 'database';
        }
        return 'generic';
    }, [error]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-black">
            {/* Premium Glow Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 blur-[150px] rounded-full" />
            </div>

            <ErrorState 
                type={errorType as any}
                onRetry={() => reset()}
                className="max-w-md w-full"
            />
        </div>
    );
}



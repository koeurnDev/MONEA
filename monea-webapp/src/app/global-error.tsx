'use client';

import { useMemo } from "react";
import { AnimationProvider } from "@/components/providers/AnimationProvider";
import ErrorState from "@/components/common/ErrorState";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
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
        <html>
            <body className="bg-black font-kantumruy">
                <AnimationProvider>
                    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
                        {/* Premium Glow Background */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 blur-[180px] rounded-full" />
                        </div>

                        <ErrorState 
                            type={errorType as any}
                            onRetry={() => reset()}
                            className="max-w-lg w-full"
                        />
                    </div>
                </AnimationProvider>
            </body>
        </html>
    );
}



import { Skeleton } from "@/components/ui/skeleton";

export function WeddingSkeleton() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col relative overflow-hidden">
            {/* Hero Skeleton (Cinematic Style) */}
            <div className="relative h-screen w-full flex flex-col justify-end p-6 md:p-16">
                {/* Background Pulse */}
                <div className="absolute inset-0 bg-slate-900/40 animate-pulse" />

                {/* Content Overlay */}
                <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center space-y-8 pb-12">
                    <div className="w-full bg-slate-800/20 backdrop-blur-xl border border-white/5 rounded-[2rem] p-10 md:p-16 flex flex-col items-center space-y-6">
                        {/* Decorative Icon */}
                        <Skeleton className="w-12 h-12 rounded-full bg-slate-700/30" />

                        {/* Subtitle */}
                        <Skeleton className="h-4 w-32 rounded-full bg-slate-700/30" />

                        {/* Names */}
                        <div className="space-y-4 w-full flex flex-col items-center">
                            <Skeleton className="h-12 md:h-20 w-3/4 max-w-md rounded-xl bg-slate-700/30" />
                            <Skeleton className="h-6 w-12 rounded-full bg-slate-700/30" />
                            <Skeleton className="h-12 md:h-20 w-3/4 max-w-md rounded-xl bg-slate-700/30" />
                        </div>

                        {/* Date */}
                        <Skeleton className="h-4 w-48 rounded-full bg-slate-700/30 mt-4" />
                    </div>
                </div>
            </div>

            {/* Float Action Placeholder */}
            <div className="fixed top-6 right-6 z-50">
                <Skeleton className="w-12 h-12 rounded-full bg-slate-800/50 backdrop-blur-md" />
            </div>
        </div>
    );
}

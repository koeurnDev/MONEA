import { Skeleton } from "@/components/ui/skeleton";

export function WeddingSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
            {/* Header / Nav Area */}
            <div className="absolute top-0 w-full h-20 bg-white/50 backdrop-blur-md border-b border-slate-100 flex items-center justify-center">
                <Skeleton className="h-6 w-32 rounded-md" />
            </div>

            {/* Hero Main */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-6 py-20 mt-10 space-y-8">
                {/* Rings / Decorative Element */}
                <Skeleton className="w-16 h-16 rounded-full" />

                {/* Save the date text */}
                <Skeleton className="h-4 w-48 rounded-full" />

                {/* Names */}
                <Skeleton className="h-16 w-3/4 max-w-sm rounded-[2rem]" />
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-16 w-3/4 max-w-sm rounded-[2rem]" />

                {/* Timer Area */}
                <div className="flex gap-4 mt-8 pt-8">
                    <Skeleton className="w-20 h-24 rounded-2xl" />
                    <Skeleton className="w-20 h-24 rounded-2xl" />
                    <Skeleton className="w-20 h-24 rounded-2xl" />
                    <Skeleton className="w-20 h-24 rounded-2xl" />
                </div>
            </div>

            {/* Bottom Quick Actions Nav Area Fallback */}
            <div className="fixed bottom-0 w-full h-24 bg-white/50 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-4 pb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
        </div>
    );
}

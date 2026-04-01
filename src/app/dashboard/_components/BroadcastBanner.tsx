"use client";
import * as React from "react";
import { Megaphone, X, ExternalLink } from "lucide-react";
import { m, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json());

export function BroadcastBanner({ isAuthenticated = true }: { isAuthenticated?: boolean }) {
    const [dismissed, setDismissed] = React.useState<string[]>([]);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        try {
            const stored = localStorage.getItem("monea_dismissed_banners");
            if (stored) setDismissed(JSON.parse(stored));
        } catch (e) { }
    }, []);

    const handleDismiss = (id: string) => {
        const newDismissed = [...dismissed, id];
        setDismissed(newDismissed);
        localStorage.setItem("monea_dismissed_banners", JSON.stringify(newDismissed));
    };

    const { data: rawData } = useSWR(isAuthenticated ? "/api/broadcast" : null, fetcher, {
        refreshInterval: 5000, // Poll every 5s for near-instant delivery
        revalidateOnFocus: true
    });

    const broadcasts = React.useMemo(() => {
        return Array.isArray(rawData) ? rawData.filter((b: any) => b.active) : [];
    }, [rawData]);

    const activeBroadcasts = broadcasts.filter(b => !dismissed.includes(b.id));

    if (!mounted || activeBroadcasts.length === 0) return null;

    // Detect mobile for zero-animation mode - guarded by mount
    const isMobile = mounted ? (typeof window !== "undefined" && (window.innerWidth < 768 || navigator.maxTouchPoints > 0)) : false;

    return (
        <div className="space-y-4 mb-6 min-h-[1px]">
            <AnimatePresence>
                {activeBroadcasts.map((b) => (
                    <m.div
                        key={b.id}
                        initial={(!mounted || isMobile) ? false : { opacity: 0, scale: 0.95 }}
                        animate={(!mounted || isMobile) ? false : { opacity: 1, scale: 1 }}
                        className={cn(
                            "relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-colors",
                            b.type === 'WARNING' ? 'bg-amber-50 border-amber-100 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200' :
                                b.type === 'SUCCESS' ? 'bg-green-50 border-green-100 text-green-900 dark:bg-green-950/30 dark:border-green-900/50 dark:text-green-200' :
                                    'bg-blue-50 border-blue-100 text-blue-900 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-200'
                        )}
                    >
                        <div className="flex items-start gap-4 pr-10">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                b.type === 'WARNING' ? 'bg-amber-100 dark:bg-amber-900/40' :
                                    b.type === 'SUCCESS' ? 'bg-green-100 dark:bg-green-900/40' :
                                        'bg-blue-100 dark:bg-blue-900/40'
                            )}>
                                <Megaphone size={18} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black uppercase tracking-tight">{b.title}</h4>
                                <p className="text-xs font-medium leading-relaxed opacity-80">{b.message}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDismiss(b.id)}
                            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </m.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

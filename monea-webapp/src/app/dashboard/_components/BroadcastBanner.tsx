import * as React from "react";
import { Megaphone, X, ExternalLink } from "lucide-react";
import { m, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

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
        refreshInterval: 60000,
        dedupingInterval: 60000,
        revalidateOnFocus: false
    });

    const broadcasts = React.useMemo(() => {
        return Array.isArray(rawData) ? rawData.filter((b: any) => b.active) : [];
    }, [rawData]);

    const activeBroadcasts = broadcasts.filter(b => !dismissed.includes(b.id));

    if (!mounted || activeBroadcasts.length === 0) return null;

    // Optimized mobile check (only screen width based to avoid touch devices acting weird)
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    return (
        <div className="space-y-3 mb-5 min-h-[1px]">
            <AnimatePresence>
                {activeBroadcasts.map((b) => (
                    <m.div
                        key={b.id}
                        initial={isMobile ? false : { opacity: 0, y: -10 }}
                        animate={isMobile ? false : { opacity: 1, y: 0 }}
                        exit={isMobile ? undefined : { opacity: 0, scale: 0.95 }}
                        className={cn(
                            "relative overflow-hidden rounded-2xl border p-4 shadow-xs transition-colors",
                            b.type === 'WARNING' ? 'bg-amber-50/90 border-amber-200/60 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200' :
                                b.type === 'SUCCESS' ? 'bg-emerald-50/90 border-emerald-200/60 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-200' :
                                    'bg-blue-50/90 border-blue-200/60 text-blue-900 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-200'
                        )}
                    >
                        <div className="flex items-start gap-3.5 pr-8">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                b.type === 'WARNING' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' :
                                    b.type === 'SUCCESS' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' :
                                        'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
                            )}>
                                <Megaphone size={18} />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                                <h4 className="text-xs md:text-sm font-black uppercase tracking-tight truncate">{b.title}</h4>
                                <p className="text-xs font-medium leading-relaxed opacity-90">{b.message}</p>

                                {b.link && (
                                    <div className="pt-1">
                                        <a
                                            href={b.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-bold underline underline-offset-4 hover:opacity-80 transition-opacity"
                                        >
                                            <span>{b.linkText || "មើលព័ត៌មានលម្អិត"}</span>
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleDismiss(b.id)}
                            aria-label="Close notification"
                            className="absolute top-3.5 right-3.5 p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all text-muted-foreground hover:text-foreground"
                        >
                            <X size={16} />
                        </button>
                    </m.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
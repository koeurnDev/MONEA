import * as React from "react";
import { AlertCircle, Bell, BellOff, CheckCheck, Loader2, Megaphone, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/i18n/LanguageProvider";
import useSWR from "swr";

interface Broadcast {
    id: string;
    active: boolean;
    type?: string;
    title: string;
    message: string;
    createdAt: string;
}

const fetcher = async (url: string): Promise<Broadcast[]> => {
    const response = await fetch(url);
    const data: unknown = await response.json();

    if (!response.ok) {
        const message = typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
            ? data.error
            : `Failed to load notifications (${response.status})`;
        throw new Error(message);
    }
    if (!Array.isArray(data)) {
        throw new Error("Invalid notifications response");
    }
    return data;
};

export function NotificationBell({ isAuthenticated = true }: { isAuthenticated?: boolean }) {
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';
    const [mounted, setMounted] = React.useState(false);

    const { data: rawData, error, isLoading, mutate } = useSWR<Broadcast[], Error>(isAuthenticated ? "/api/broadcast" : null, fetcher, {
        refreshInterval: 60000,
        dedupingInterval: 60000,
        revalidateOnFocus: false
    });

    const broadcasts = React.useMemo(() => {
        return rawData?.filter((broadcast) => broadcast.active) ?? [];
    }, [rawData]);

    const [dismissed, setDismissed] = React.useState<string[]>([]);
    
    React.useEffect(() => {
        setMounted(true);
        try {
            const stored: unknown = JSON.parse(localStorage.getItem("monea_dismissed_broadcasts") || "[]");
            if (Array.isArray(stored) && stored.every((id): id is string => typeof id === "string")) {
                setDismissed(stored);
            }
        } catch (e) {
            console.warn("[NotificationBell] Could not load dismissed notification preferences:", e);
        }
    }, []);

    const handleDismiss = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const newDismissed = [...dismissed, id];
        setDismissed(newDismissed);
        localStorage.setItem("monea_dismissed_broadcasts", JSON.stringify(newDismissed));
    };

    const handleClearAll = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const allIds = broadcasts.map((b: any) => b.id);
        const newDismissed = Array.from(new Set([...dismissed, ...allIds]));
        setDismissed(newDismissed);
        localStorage.setItem("monea_dismissed_broadcasts", JSON.stringify(newDismissed));
    };

    const activeBroadcasts = broadcasts.filter((b: any) => !dismissed.includes(b.id));

    if (!mounted) return (
        <button
            type="button"
            aria-label={isKm ? "ការជូនដំណឹង" : "Notifications"}
            disabled
            className="h-11 w-11 md:h-10 md:w-10 rounded-xl flex items-center justify-center bg-muted/50 text-muted-foreground opacity-50"
        >
            <Bell size={18} aria-hidden="true" />
        </button>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label={isKm ? "បើកការជូនដំណឹង" : "Open notifications"}
                    className="relative h-11 w-11 md:h-10 md:w-10 rounded-xl flex items-center justify-center bg-muted hover:bg-accent hover:text-accent-foreground transition-all text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                >
                    <Bell size={18} aria-hidden="true" />
                    {activeBroadcasts.length > 0 && (
                        <span aria-hidden="true" className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse ring-2 ring-background" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                side="bottom"
                sideOffset={8}
                collisionPadding={12}
                className="w-[min(20rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] p-0 rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden z-50"
                align="end"
            >
                {/* Header */}
                <div className="bg-muted/50 border-b border-border p-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-bold font-kantumruy text-foreground">
                            {t("dashboard.notifications.title", { defaultValue: isKm ? "ការជូនដំណឹង" : "Notifications" })}
                        </h3>
                        <p className="text-xs text-muted-foreground font-kantumruy">
                            {t("dashboard.notifications.subtitle", { defaultValue: isKm ? "ការផ្សព្វផ្សាយពីប្រព័ន្ធ" : "System Broadcasts" })}
                        </p>
                    </div>
                    {activeBroadcasts.length > 0 && (
                        <button 
                            onClick={handleClearAll}
                            className="flex min-h-11 items-center gap-1 text-xs text-primary font-bold hover:underline py-1 px-2 rounded-lg bg-accent font-kantumruy"
                        >
                            <CheckCheck size={13} />
                            <span>{t("dashboard.notifications.clear", { defaultValue: isKm ? "សម្អាត" : "Clear" })}</span>
                        </button>
                    )}
                </div>
                
                {/* Content List */}
                <div className="max-h-[60vh] overflow-y-auto w-full">
                    {error ? (
                        <div className="flex flex-col items-center gap-3 p-6 text-center" role="alert">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                                <AlertCircle aria-hidden="true" size={22} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground font-kantumruy">
                                    {t("dashboard.notifications.loadError", {
                                        defaultValue: isKm ? "មិនអាចទាញយកការជូនដំណឹងបានទេ" : "Couldn't load notifications"
                                    })}
                                </p>
                                <p className="text-xs text-muted-foreground font-kantumruy">
                                    {t("dashboard.notifications.retryHint", {
                                        defaultValue: isKm ? "សូមពិនិត្យការតភ្ជាប់ ហើយព្យាយាមម្ដងទៀត។" : "Check your connection and try again."
                                    })}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => void mutate()}
                                disabled={isLoading}
                                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-xs font-bold text-rose-600 outline-none transition hover:bg-rose-500/15 focus-visible:ring-2 focus-visible:ring-rose-500/60 disabled:opacity-60 dark:text-rose-400"
                            >
                                <RefreshCw aria-hidden="true" className="h-4 w-4" />
                                {t("dashboard.notifications.retry", { defaultValue: isKm ? "ព្យាយាមម្ដងទៀត" : "Try again" })}
                            </button>
                        </div>
                    ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center" aria-live="polite">
                            <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-xs text-muted-foreground font-kantumruy">
                                {t("dashboard.notifications.loading", { defaultValue: isKm ? "កំពុងទាញយកការជូនដំណឹង..." : "Loading notifications..." })}
                            </p>
                        </div>
                    ) : activeBroadcasts.length === 0 ? (
                        <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-accent text-primary flex items-center justify-center">
                                <BellOff size={22} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold text-foreground font-kantumruy">
                                    {t("dashboard.notifications.emptyTitle", { defaultValue: isKm ? "មិនមានការជូនដំណឹងទេ" : "No Notifications" })}
                                </p>
                                <p className="text-xs text-muted-foreground font-kantumruy">
                                    {t("dashboard.notifications.emptyDescription", { defaultValue: isKm ? "មិនទាន់មានសេចក្តីប្រកាសថ្មីឡើយ" : "No pending broadcasts" })}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {activeBroadcasts.map((b) => (
                                <div 
                                    key={b.id} 
                                    className="p-4 flex gap-3.5 hover:bg-muted/50 transition-colors relative group"
                                >
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                        b.type === 'WARNING' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                                        b.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                                        'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                                    )}>
                                        <Megaphone size={16} />
                                    </div>
                                    <div className="space-y-1 pr-5 flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-foreground font-kantumruy leading-snug">
                                            {b.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground font-kantumruy leading-relaxed">
                                            {b.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground/60 font-mono pt-0.5">
                                            {new Date(b.createdAt).toLocaleDateString(locale === "km" ? "km-KH" : "en-US")}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={(e) => handleDismiss(b.id, e)}
                                        aria-label={isKm ? `បិទការជូនដំណឹង៖ ${b.title}` : `Dismiss notification: ${b.title}`}
                                        className="absolute top-2 right-2 flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-opacity hover:bg-accent"
                                        title={isKm ? "លុប" : "Dismiss"}
                                    >
                                        <X size={16} aria-hidden="true" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

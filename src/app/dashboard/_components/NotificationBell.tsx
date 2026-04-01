"use client";
import * as React from "react";
import { Bell, Megaphone, X, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/i18n/LanguageProvider";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json());

export function NotificationBell({ isAuthenticated = true }: { isAuthenticated?: boolean }) {
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';
    const [mounted, setMounted] = React.useState(false);

    const { data: rawData } = useSWR(isAuthenticated ? "/api/broadcast" : null, fetcher, {
        refreshInterval: 5000, // Poll every 5s for near-instant delivery
        revalidateOnFocus: true
    });

    const broadcasts = React.useMemo(() => {
        return Array.isArray(rawData) ? rawData.filter((b: any) => b.active) : [];
    }, [rawData]);

    const [dismissed, setDismissed] = React.useState<string[]>([]);
    
    React.useEffect(() => {
        setMounted(true);
        try {
            const stored = localStorage.getItem("monea_dismissed_broadcasts");
            if (stored) setDismissed(JSON.parse(stored));
        } catch (e) { }
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
        <button className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-white/5 opacity-50">
            <Bell size={18} className="text-zinc-400" />
        </button>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors group outline-none">
                    <Bell size={18} className="text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                    {activeBroadcasts.length > 0 && (
                        <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 animate-pulse ring-2 ring-white dark:ring-slate-950" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 mt-2 p-0 rounded-2xl border-none shadow-2xl overflow-hidden" align="end">
                <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-start">
                    <div>
                        <h3 className="text-white font-black tracking-tight">{isKm ? "ការជូនដំណឹង" : "Notifications"}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{isKm ? "ការផ្សព្វផ្សាយពីប្រព័ន្ធ" : "System Broadcasts"}</p>
                    </div>
                    {activeBroadcasts.length > 0 && (
                        <button 
                            onClick={handleClearAll}
                            className="flex items-center gap-1.5 text-xs text-sky-400 font-bold hover:text-white transition-colors py-1 px-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/30"
                        >
                            <CheckCheck size={14} />
                            <span>{isKm ? "លុបទាំងអស់" : "Clear All"}</span>
                        </button>
                    )}
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto w-full bg-white dark:bg-slate-950 custom-scrollbar">
                    {activeBroadcasts.length === 0 ? (
                        <div className="p-10 flex flex-col items-center justify-center text-center opacity-50">
                            <Bell size={32} className="text-zinc-300 mb-3" />
                            <p className="text-sm font-bold tracking-tight">{isKm ? "មិនមានការជូនដំណឹងទេ" : "No Notifications"}</p>
                            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">{isKm ? "មិនទាន់មានសេចក្តីប្រកាសថ្មីទេ" : "No pending platform broadcasts"}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {activeBroadcasts.map((b: any, i: number) => (
                                <div key={b.id} className={cn(
                                    "p-4 flex gap-4 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5 cursor-default relative group",
                                    i !== activeBroadcasts.length - 1 && "border-b border-zinc-100 dark:border-white/5",
                                    "bg-blue-50/50 dark:bg-blue-900/10"
                                )}>
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                        b.type === 'WARNING' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40' :
                                            b.type === 'SUCCESS' ? 'bg-green-100 text-green-600 dark:bg-green-900/40' :
                                                'bg-blue-100 text-blue-600 dark:bg-blue-900/40'
                                    )}>
                                        <Megaphone size={18} />
                                    </div>
                                    <div className="space-y-1 pr-4">
                                        <h4 className="text-sm font-black tracking-tight leading-tight">{b.title}</h4>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{b.message}</p>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">{new Date(b.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button 
                                        onClick={(e) => handleDismiss(b.id, e)}
                                        className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-900 rounded-full p-1"
                                        title={isKm ? "លាក់សារនេះ" : "Dismiss"}
                                    >
                                        <X size={14} />
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

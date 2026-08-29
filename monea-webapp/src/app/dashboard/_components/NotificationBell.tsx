import * as React from "react";
import { Bell, Megaphone, X, CheckCheck, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/i18n/LanguageProvider";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function NotificationBell({ isAuthenticated = true }: { isAuthenticated?: boolean }) {
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';
    const [mounted, setMounted] = React.useState(false);

    const { data: rawData } = useSWR(isAuthenticated ? "/api/broadcast" : null, fetcher, {
        refreshInterval: 60000,
        dedupingInterval: 60000,
        revalidateOnFocus: false
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
        <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50 text-muted-foreground opacity-50">
            <Bell size={18} />
        </button>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 transition-all text-slate-700 dark:text-slate-200 outline-none active:scale-95">
                    <Bell size={18} />
                    {activeBroadcasts.length > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse ring-2 ring-white dark:ring-[#121217]" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                className="w-[calc(100vw-2rem)] sm:w-80 sm:max-w-sm mt-2 p-0 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141419] shadow-2xl overflow-hidden z-50" 
                align="end"
            >
                {/* Header */}
                <div className="bg-slate-50/80 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 p-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-bold font-kantumruy text-foreground">
                            {isKm ? "ការជូនដំណឹង" : "Notifications"}
                        </h3>
                        <p className="text-[11px] text-muted-foreground font-kantumruy">
                            {isKm ? "ការផ្សព្វផ្សាយពីប្រព័ន្ធ" : "System Broadcasts"}
                        </p>
                    </div>
                    {activeBroadcasts.length > 0 && (
                        <button 
                            onClick={handleClearAll}
                            className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline py-1 px-2 rounded-lg bg-rose-500/10 font-kantumruy"
                        >
                            <CheckCheck size={13} />
                            <span>{isKm ? "សម្អាត" : "Clear"}</span>
                        </button>
                    )}
                </div>
                
                {/* Content List */}
                <div className="max-h-[60vh] overflow-y-auto w-full">
                    {activeBroadcasts.length === 0 ? (
                        <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                <BellOff size={22} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold text-foreground font-kantumruy">
                                    {isKm ? "មិនមានការជូនដំណឹងទេ" : "No Notifications"}
                                </p>
                                <p className="text-xs text-muted-foreground font-kantumruy">
                                    {isKm ? "មិនទាន់មានសេចក្តីប្រកាសថ្មីឡើយ" : "No pending broadcasts"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                            {activeBroadcasts.map((b: any) => (
                                <div 
                                    key={b.id} 
                                    className="p-4 flex gap-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors relative group"
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
                                        <p className="text-[11px] text-muted-foreground font-kantumruy leading-relaxed">
                                            {b.message}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground/60 font-mono pt-0.5">
                                            {new Date(b.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={(e) => handleDismiss(b.id, e)}
                                        className="absolute top-3 right-3 text-muted-foreground hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                                        title={isKm ? "លុប" : "Dismiss"}
                                    >
                                        <X size={13} />
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

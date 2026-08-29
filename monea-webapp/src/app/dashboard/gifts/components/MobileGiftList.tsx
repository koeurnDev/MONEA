import { Gift, Plus, Clock, CreditCard, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageProvider";

interface MobileGiftListProps {
    gifts: any[];
    loading: boolean;
    visibleCount: number;
    setVisibleCount: (count: number | ((prev: number) => number)) => void;
    showGiftAmounts?: boolean;
}

export function MobileGiftList({ gifts, loading, visibleCount, setVisibleCount, showGiftAmounts = true }: MobileGiftListProps) {
    const { t } = useTranslation();
    return (
        <div className="md:hidden p-3 space-y-2.5 print:hidden">
            {loading ? (
                <div className="p-16 text-center">
                    <div className="w-8 h-8 border-4 border-rose-600/20 border-t-rose-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("common.loading.fetching")}</p>
                </div>
            ) : gifts.length === 0 ? (
                <div className="p-16 text-center opacity-40 space-y-2">
                    <Gift size={40} className="mx-auto text-rose-400" />
                    <p className="font-kantumruy font-bold text-sm text-foreground">{t("gifts.empty")}</p>
                </div>
            ) : (
                gifts.slice(0, visibleCount).map((g) => {
                    const isUSD = g.currency === "USD";
                    const isCash = g.method === "CASH" || !g.method;
                    const groupLabel = g.guest?.group && g.guest.group !== "None" 
                        ? g.guest.group 
                        : (g.guest?.source && g.guest.source !== "GIFT_ENTRY" && g.guest.source !== "None" 
                            ? g.guest.source 
                            : null);

                    return (
                        <div 
                            key={g.id} 
                            className="bg-card rounded-2xl p-3.5 shadow-xs border border-slate-200/70 dark:border-white/5 flex items-center justify-between gap-3 active:scale-[0.99] transition-transform"
                        >
                            {/* Left: Sequence + Guest Info */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-none font-mono text-xs font-bold text-muted-foreground">
                                    #{g.sequenceNumber || "•"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-sm text-foreground font-kantumruy truncate leading-snug">
                                        {g.guest?.name || <span className="text-muted-foreground/40 italic">{t("gifts.table.unknown")}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground font-kantumruy">
                                        {groupLabel && (
                                            <span className="px-1.5 py-0.2 rounded bg-muted font-semibold text-[10px] truncate max-w-[110px]">
                                                {groupLabel}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 opacity-70">
                                            <Clock size={10} />
                                            {new Date(g.createdAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Amount & Method Badge */}
                            <div className="flex flex-col items-end gap-1 flex-none">
                                <span className={cn(
                                    "px-2.5 py-1 rounded-xl text-xs font-bold tracking-tight font-kantumruy shadow-xs whitespace-nowrap",
                                    isUSD
                                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                                        : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                                )}>
                                    {isUSD ? "$" : "៛"} {showGiftAmounts ? g.amount.toLocaleString() : "****"}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-tight flex items-center gap-0.5">
                                    {isCash ? <Banknote size={10} /> : <CreditCard size={10} />}
                                    {isCash ? t("gifts.table.cash") : (g.method || t("gifts.table.cash"))}
                                </span>
                            </div>
                        </div>
                    );
                })
            )}

            {!loading && gifts.length > visibleCount && (
                <div className="pt-3 flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => setVisibleCount(prev => prev + 50)}
                        className="w-full h-11 rounded-2xl border-dashed border border-border text-muted-foreground font-kantumruy font-bold hover:bg-muted/50 text-xs active:scale-95"
                    >
                        <Plus size={14} className="mr-1.5" /> {t("gifts.viewMore")} ({gifts.length - visibleCount})
                    </Button>
                </div>
            )}
        </div>
    );
}


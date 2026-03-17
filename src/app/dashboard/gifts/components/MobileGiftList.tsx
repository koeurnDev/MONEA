"use client";

import { Gift, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileGiftListProps {
    gifts: any[];
    loading: boolean;
    visibleCount: number;
    setVisibleCount: (count: number | ((prev: number) => number)) => void;
    showGiftAmounts?: boolean;
}

export function MobileGiftList({ gifts, loading, visibleCount, setVisibleCount, showGiftAmounts = true }: MobileGiftListProps) {
    return (
        <div className="md:hidden p-3 space-y-2 print:hidden">
            {/* Mobile Column Headers */}
            <div className="grid px-4 pb-1.5 opacity-50 gap-2 items-center" style={{ gridTemplateColumns: '24px 1.2fr 0.8fr 1fr auto 60px' }}>
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">ល.រ</span>
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">ឈ្មោះ</span>
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">មកពីណា</span>
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest text-center">ទឹកប្រាក់</span>
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest text-right">វិធីសាស្ត្រ</span>
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest text-right">ម៉ោង</span>
            </div>

            {loading ? (
                <div className="p-20 text-center">
                    <div className="w-8 h-8 border-4 border-rose-600/20 border-t-rose-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">កំពុងផ្ទុក...</p>
                </div>
            ) : gifts.length === 0 ? (
                <div className="p-20 text-center opacity-30">
                    <Gift size={40} className="mx-auto mb-2" />
                    <p className="font-kantumruy font-bold">មិនមានទិន្នន័យឡើយ</p>
                </div>
            ) : (
                gifts.slice(0, visibleCount).map((g) => (
                    <div key={g.id} className="bg-background rounded-2xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] grid items-center min-h-[52px] gap-2" style={{ gridTemplateColumns: '24px 1.2fr 0.8fr 1fr auto 60px' }}>
                        <div className="flex items-center">
                            <span className="text-xs font-bold text-muted-foreground/50 font-kantumruy">
                                {g.sequenceNumber || "#"}
                            </span>
                        </div>

                            <div className="min-w-0 pr-2">
                                <span className="font-bold text-sm text-foreground font-kantumruy leading-tight block truncate">
                                    {g.guest?.name || <span className="text-muted-foreground/30 italic">មិនស្គាល់</span>}
                                </span>
                            </div>

                            <div className="min-w-0">
                                <span className="text-xs text-muted-foreground font-medium font-kantumruy block opacity-70 italic truncate">
                                    {g.guest?.group && g.guest.group !== "None" ? g.guest.group : (g.guest?.source && g.guest.source !== "GIFT_ENTRY" && g.guest.source !== "None" ? g.guest.source : "មិនបានបញ្ជាក់")}
                                </span>
                            </div>

                            <div className="flex justify-center flex-col items-center">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-md text-xs font-bold tracking-tight shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none font-kantumruy whitespace-nowrap",
                                    g.currency === "USD"
                                        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                                        : "bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-400"
                                )}>
                                    {g.currency === "USD" ? "$" : "៛"} {showGiftAmounts ? g.amount.toLocaleString() : "****"}
                                </span>
                            </div>

                            <div className="flex items-center justify-end">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight bg-muted px-2 py-1 rounded-lg">
                                    {g.method || "សាច់ប្រាក់"}
                                </span>
                            </div>

                            <div className="flex justify-end items-center">
                                <span className="text-xs font-bold text-muted-foreground font-kantumruy uppercase">
                                    {new Date(g.createdAt).toLocaleTimeString("km-KH", { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Phnom_Penh' })}
                                </span>
                            </div>
                        </div>
                ))
            )}

            {!loading && gifts.length > visibleCount && (
                <div className="pt-4 flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => setVisibleCount(prev => prev + 50)}
                        className="w-full h-12 rounded-2xl border-dashed border-2 border-border text-muted-foreground font-kantumruy font-bold hover:bg-muted/50"
                    >
                        <Plus size={16} className="mr-2" /> បង្ហាញបន្ថែម ({gifts.length - visibleCount})
                    </Button>
                </div>
            )}
        </div>
    );
}

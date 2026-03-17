"use client";
import * as React from 'react';

import { AnimatePresence, m } from 'framer-motion';
import { Users, Activity, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveRecentGiftsProps {
    recentGifts: any[];
    guestCount: number;
    totalGuests: number;
    showAmounts: boolean;
    listRef: React.RefObject<HTMLDivElement>;
    onInteraction: (interacting: boolean) => void;
}

const LiveRecentGiftsComponent = ({
    recentGifts,
    guestCount,
    totalGuests,
    showAmounts,
    listRef,
    onInteraction
}: LiveRecentGiftsProps) => {
    return (
        <div className="w-full landscape:lg:w-[400px] landscape:xl:w-[450px] flex flex-col h-[400px] portrait:flex-1 portrait:min-h-0 landscape:lg:h-full bg-neutral-900/50 backdrop-blur-lg rounded-[3rem] md:rounded-[4rem] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_20px_40px_rgba(0,0,0,0.3)] p-6 md:p-8 relative overflow-hidden group shrink-0">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle,rgba(245,158,11,0.1)_0%,transparent_70%)] rounded-full group-hover:opacity-100 opacity-50 transition-opacity duration-1000" />

            <div className="mb-8 p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-2xl">
                        <Users className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider leading-none block mb-1.5 opacity-60 font-kantumruy">GUESTS ARRIVED</span>
                        <div translate="no" className="text-2xl font-black text-white leading-none tracking-tighter flex items-baseline gap-2 tabular-nums notranslate">
                            {guestCount} <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">/ {totalGuests}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider leading-none mb-1.5 opacity-60 font-kantumruy">STATUS</span>
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-white tracking-widest">LIVE</span>
                    </div>
                </div>
            </div>

            <div className="mb-6 flex items-center justify-between px-2 relative z-10">
                <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">បញ្ជីភ្ញៀវ</h3>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-wider opacity-60">RECENT GUESTS</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl">
                    <TrendingUp className="w-4 h-4 text-white/40" />
                </div>
            </div>

            <div
                ref={listRef}
                onMouseEnter={() => onInteraction(true)}
                onMouseLeave={() => onInteraction(false)}
                className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar mask-gradient-v relative z-10"
            >
                <AnimatePresence initial={false}>
                    {recentGifts.map((gift: any) => (
                        <m.div
                            key={gift.id}
                            layout
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-5 rounded-[2rem] bg-gradient-to-r from-neutral-800/40 to-neutral-800/10 border border-white/5 hover:border-amber-500/30 hover:bg-neutral-800/80 transition-all duration-500 group/item flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-center text-xl group-hover/item:border-amber-500/50 group-hover/item:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-500 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                                    <span className="relative z-10 group-hover/item:scale-110 group-hover/item:rotate-12 transition-transform duration-500">🧧</span>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-white mb-0.5 tracking-tight font-kantumruy group-hover/item:text-amber-400 transition-colors">
                                        {gift.guest?.name || "ភ្ញៀវកិត្តិយស"}
                                    </div>
                                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 opacity-80 mt-1">
                                        <Clock size={10} className="text-amber-500/50" />
                                        <span>{new Date(gift.createdAt).toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Phnom_Penh' })}</span>
                                        {gift.guest?.source && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                <span className="text-amber-500/80 font-kantumruy">{gift.guest.source}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div translate="no" className={cn(
                                "text-2xl font-black font-kantumruy tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 transition-all duration-1000 notranslate",
                                !showAmounts && "blur-xl opacity-20"
                            )}>
                                {gift.currency === "USD" && <span className="text-amber-500">$</span>}
                                {showAmounts ? (Number(gift.amount) || 0).toLocaleString() : "****"}
                                {gift.currency === "KHR" && <span className="text-[0.4em] ml-1 font-kantumruy text-amber-500">៛</span>}
                            </div>
                        </m.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export const LiveRecentGifts = React.memo(LiveRecentGiftsComponent);

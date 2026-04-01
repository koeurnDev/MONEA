"use client";
import * as React from 'react';

import { m } from 'framer-motion';
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { CinematicText } from "./CinematicText";
import { useTranslation } from "@/i18n/LanguageProvider";

interface MainGiftCardProps {
    latestGift: any;
    showAmounts: boolean;
}

const MainGiftCardComponent = ({ latestGift, showAmounts }: MainGiftCardProps) => {
    const { t } = useTranslation();

    if (!latestGift) {
        return (
            <div className="flex flex-col items-center gap-6 opacity-40">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center animate-pulse">
                    <span className="text-white/20">🎁</span>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] font-kantumruy">{t("gifts.live.waitingForFlow")}</span>
            </div>
        );
    }

    return (
        <m.div
            key={latestGift.id}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -30 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-4xl"
        >
            <div className="relative group perspective-1000">
                <div className="absolute -inset-[3px] bg-gradient-to-br from-amber-500/20 via-transparent to-orange-500/20 rounded-[3.5rem] md:rounded-[4.5rem] blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="relative p-[1px] rounded-[3.5rem] md:rounded-[4.5rem] bg-gradient-to-b from-white/20 via-transparent to-white/5 overflow-hidden">
                    <div className="relative bg-[#080808]/80 backdrop-blur-3xl rounded-[calc(3.5rem-1px)] md:rounded-[calc(4.5rem-1px)] p-6 md:p-16 text-center border border-white/5 shadow-[inset_0_0_100px_rgba(245,158,11,0.03),0_40px_80px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center min-h-[300px] portrait:min-h-[35vh] landscape:min-h-[400px] overflow-hidden shrink-0 w-full portrait:max-w-3xl">

                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(212,175,55,0.1),transparent_50%)]" />
                        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

                        <div className="space-y-12 w-full">
                            <div className="space-y-4">
                                <span className="text-amber-500 font-bold tracking-widest uppercase text-[10px] md:text-xs opacity-80 font-kantumruy drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">{t("gifts.live.giftReceivedFrom")}</span>
                                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/70 leading-tight font-kantumruy tracking-tighter pb-1 drop-shadow-lg">
                                    <CinematicText text={latestGift.guest?.name || t("gifts.live.guestOfHonor")} />
                                </div>
                            </div>

                            <m.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 }}
                                className={cn(
                                    "relative inline-flex flex-col items-center justify-center px-6 py-4 md:px-10 md:py-6 rounded-[2.5rem] transition-all duration-1000",
                                    "bg-gradient-to-b from-white/10 to-transparent border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]",
                                    !showAmounts && "bg-neutral-900/50"
                                )}
                            >
                                <div className="text-sm md:text-base text-white/40 font-bold uppercase tracking-widest mb-2 md:mb-4 font-kantumruy">{t("gifts.live.giftAmount")}</div>
                                <div translate="no" className={cn(
                                    "flex items-end gap-2 md:gap-4 text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 transition-all duration-700 notranslate",
                                    !showAmounts && "blur-2xl opacity-20 scale-95"
                                )}>
                                    {latestGift.currency === "USD" && <span className="text-2xl md:text-3xl lg:text-4xl font-black mb-1 md:mb-3 text-amber-500">$</span>}
                                    <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-kantumruy tracking-tighter tabular-nums drop-shadow-[0_10px_30px_rgba(245,158,11,0.3)] translate-y-1 md:translate-y-2">
                                        {showAmounts ? (Number(latestGift.amount) || 0).toLocaleString() : "****"}
                                    </span>
                                    {latestGift.currency === "KHR" && <span className="text-2xl md:text-3xl lg:text-4xl font-black mb-1 md:mb-3 ml-2 font-kantumruy">៛</span>}
                                </div>
                                {!showAmounts && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="px-6 py-2 bg-amber-500/20 rounded-full border border-amber-500/30 text-amber-500 font-black text-xs uppercase tracking-widest">
                                            {t("gifts.live.private")}
                                        </div>
                                    </div>
                                )}
                            </m.div>
                        </div>

                        {latestGift.guest?.source && (
                            <div className="mt-16 flex items-center gap-3 px-8 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold tracking-[0.3em] text-[10px] uppercase font-kantumruy shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-md">
                                <Heart size={14} className="text-rose-400 fill-rose-400 animate-pulse" />
                                {latestGift.guest.source}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </m.div>
    );
}
export const MainGiftCard = React.memo(MainGiftCardComponent);

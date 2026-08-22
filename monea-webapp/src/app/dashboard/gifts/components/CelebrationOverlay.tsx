"use client";

import { AnimatePresence, m } from 'framer-motion';
import { Sparkles, Star } from "lucide-react";
import { CinematicText } from "./CinematicText";
import { useTranslation } from "@/i18n/LanguageProvider";

interface CelebrationOverlayProps {
    show: boolean;
    latestGift: any;
}

export function CelebrationOverlay({ show, latestGift }: CelebrationOverlayProps) {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {show && latestGift && (
                <m.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6"
                >
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: 0, ease: "easeInOut" }}
                        className="absolute inset-0 bg-amber-500/20 z-0 pointer-events-none"
                    />

                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(245,158,11,0.05)_20deg,transparent_40deg)] animate-spin-slow opacity-60" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] bg-[conic-gradient(from_180deg,transparent_0deg,rgba(212,175,55,0.05)_20deg,transparent_40deg)] animate-spin-slow opacity-40" style={{ animationDirection: 'reverse', animationDuration: '20s' }} />
                    </div>

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,2,2,0.6)_100%)] pointer-events-none z-0" />

                    <m.div
                        initial={{ scale: 0.8, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.4 } }}
                        className="relative flex flex-col items-center gap-12 text-center"
                    >
                        <div className="relative mb-8">
                            <m.div
                                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                                className="text-9xl drop-shadow-[0_0_80px_rgba(245,158,11,0.8)] relative z-10"
                            >
                                🧧
                            </m.div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 to-amber-300 blur-[80px] rounded-full opacity-40 animate-pulse z-0" />
                            <Sparkles className="absolute -top-12 -right-12 text-amber-300 animate-spin-slow" size={72} />
                            <Star className="absolute -bottom-12 -left-12 text-amber-500 animate-pulse" size={56} />
                        </div>

                        <div className="space-y-8 relative z-20">
                            <div className="bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 bg-[length:200%_auto] text-black px-8 py-3 rounded-full font-black tracking-[0.3em] text-[14px] uppercase font-kantumruy animate-pulse w-fit mx-auto shadow-[0_0_30px_rgba(245,158,11,0.5)]">{t("gifts.live.newGift")}</div>
                            <div className="text-6xl md:text-[6rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 leading-none font-kantumruy tracking-tighter drop-shadow-[0_20px_50px_rgba(255,255,255,0.15)]">
                                <CinematicText text={latestGift.guest?.name || t("gifts.live.guestOfHonor")} />
                            </div>
                            <p className="text-amber-500/80 font-black tracking-[0.3em] uppercase text-sm drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">{t("gifts.live.thankYouCelebration")}</p>
                        </div>
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>
    );
}

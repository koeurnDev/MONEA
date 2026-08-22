"use client";

import { LazyMotion, domMax, m } from 'framer-motion';
import { Sparkles, Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

// Extracted Components
import { LiveHeader } from "../components/LiveHeader";
import { MainGiftCard } from "../components/MainGiftCard";
import { LiveRecentGifts } from "../components/LiveRecentGifts";
import { CelebrationOverlay } from "../components/CelebrationOverlay";
import { LiveStartScreen } from "../components/LiveStartScreen";

// Extracted Hook
import { useLiveGifts } from "../hooks/useLiveGifts";

export default function LiveDisplayPage() {
    const { t } = useTranslation();
    const {
        wedding,
        latestGift,
        recentGifts,
        stats,
        loading,
        error,
        isFullscreen,
        soundEnabled,
        setSoundEnabled,
        hasStarted,
        showNewGiftFlash,
        listRef,
        setUserInteracting,
        toggleFullscreen,
        startPresentation
    } = useLiveGifts();

    const showAmounts = wedding?.themeSettings?.showGiftAmounts !== false;
    const guestCount = stats?.guests?.arrived || 0;
    const totalGuests = stats?.guests?.total || 0;

    if (loading && !recentGifts.length) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#050505] space-y-6">
                <div className="relative">
                    <Loader2 className="animate-spin text-amber-500" size={64} />
                    <Sparkles className="absolute -top-4 -right-4 text-amber-400 animate-pulse" size={24} />
                </div>
                <div className="text-amber-500/30 text-xs font-black uppercase tracking-[0.5em] animate-pulse font-kantumruy">{t("gifts.live.syncingFeed")}</div>
            </div>
        );
    }

    if (!hasStarted) {
        return <LiveStartScreen onStart={startPresentation} />;
    }

    return (
        <LazyMotion features={domMax}>
            <div className="relative w-full h-screen h-[100dvh] bg-[#020202] text-white overflow-hidden flex flex-col font-kantumruy select-none">

                {/* Background Layer - Radiant Mesh Design */}
                <div className="absolute inset-0 z-0 bg-[#020202] overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] rounded-full animate-mesh-1 will-change-transform" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] rounded-full animate-mesh-2 will-change-transform" />
                    <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] rounded-full animate-mesh-3 will-change-transform" />

                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
                </div>

                <LiveHeader
                    soundEnabled={soundEnabled}
                    setSoundEnabled={setSoundEnabled}
                    isFullscreen={isFullscreen}
                    toggleFullscreen={toggleFullscreen}
                />

                <main className="relative z-10 flex-1 flex flex-col landscape:lg:flex-row items-stretch gap-8 md:gap-12 max-w-[2000px] mx-auto w-full px-6 md:px-16 py-8 portrait:py-10 landscape:lg:overflow-hidden portrait:overflow-hidden">

                    {/* Left Section - Main Feature Card */}
                    <div className="flex-1 portrait:min-h-0 flex flex-col items-center pt-2 pb-6 portrait:pb-2 landscape:lg:pb-32 overflow-y-auto custom-scrollbar landscape:lg:my-auto portrait:my-auto">
                        <m.div
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}
                            className="text-center mb-8 md:mb-12 mt-4 lg:mt-0 space-y-4 shrink-0"
                        >
                            <h2 className="text-white text-5xl md:text-7xl font-black leading-none tracking-tighter uppercase font-kantumruy drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                {t("gifts.live.thankYou")}
                            </h2>
                            <div className="flex items-center justify-center gap-6">
                                <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                                <p className="text-amber-500 text-lg font-black uppercase tracking-widest opacity-80">
                                    {t("gifts.live.guestOfHonor")}
                                </p>
                                <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                            </div>
                        </m.div>

                        <MainGiftCard latestGift={latestGift} showAmounts={showAmounts} />
                    </div>

                    {/* Right Section - Sidebar Grid */}
                    <LiveRecentGifts
                        recentGifts={recentGifts}
                        guestCount={guestCount}
                        totalGuests={totalGuests}
                        showAmounts={showAmounts}
                        listRef={listRef}
                        onInteraction={setUserInteracting}
                    />
                </main>

                <CelebrationOverlay show={showNewGiftFlash} latestGift={latestGift} />

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 0px; }
                    .mask-gradient-v {
                        mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
                    }
                    @keyframes mesh-1 {
                        0%, 100% { transform: translate(0, 0) scale(1); }
                        33% { transform: translate(10%, 10%) scale(1.1); }
                        66% { transform: translate(-5%, 15%) scale(0.9); }
                    }
                    @keyframes mesh-2 {
                        0%, 100% { transform: translate(0, 0) scale(1); }
                        33% { transform: translate(-15%, -5%) scale(1.15); }
                        66% { transform: translate(10%, -15%) scale(0.95); }
                    }
                    @keyframes mesh-3 {
                        0% { transform: translate(0, 0); opacity: 0.3; }
                        50% { transform: translate(-20%, 20%); opacity: 0.1; }
                        100% { transform: translate(0, 0); opacity: 0.3; }
                    }
                    .animate-mesh-1 { animation: mesh-1 25s infinite alternate ease-in-out; }
                    .animate-mesh-2 { animation: mesh-2 30s infinite alternate ease-in-out; }
                    .animate-mesh-3 { animation: mesh-3 20s infinite alternate ease-in-out; }
                    
                    @keyframes spin-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .animate-spin-slow {
                        animation: spin-slow 15s linear infinite;
                    }
                `}</style>
            </div>
        </LazyMotion>
    );
}

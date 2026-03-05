"use client";

import useSWR from "swr";
import { useEffect, useState, useRef, useCallback } from "react";
import { m, AnimatePresence, LazyMotion, domMax } from 'framer-motion';
import { Maximize, Minimize, Volume2, VolumeX, Users, Gift, Sparkles, Trophy, Heart, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Cinematic Text Reveal Component for Khmer
 * Uses Intl.Segmenter to ensure Khmer graphemes (consonants + subscripts) 
 * are kept together as "orderly" units.
 */
const CinematicText = ({ text, className = "" }: { text: string, className?: string }) => {
    let characters: string[] = [];
    try {
        const segmenter = new Intl.Segmenter('km', { granularity: 'grapheme' });
        characters = Array.from(segmenter.segment(text)).map(s => s.segment);
    } catch (e) {
        characters = text.split("");
    }

    return (
        <m.div className={`flex flex-wrap justify-center items-center ${className}`}>
            {characters.map((char, index) => (
                <m.span
                    key={`${index}-${char}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: index * 0.04,
                        duration: 0.6,
                        ease: "easeOut"
                    }}
                    className={cn(char === " " ? "w-[0.3em]" : "", "will-change-transform pb-1")}
                >
                    {char}
                </m.span>
            ))}
        </m.div>
    );
};

export default function LiveDisplayPage() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lastGiftId, setLastGiftId] = useState<string | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    // Poll for the latest 50 gifts
    const { data: serverData, error } = useSWR("/api/gifts?limit=50", fetcher, {
        refreshInterval: 3000,
        keepPreviousData: true,
    });

    const { data: statsData } = useSWR("/api/gifts/stats", fetcher, {
        refreshInterval: 10000,
        revalidateOnFocus: false
    });

    const [cachedGifts, setCachedGifts] = useState<any[]>([]);
    const listRef = useRef<HTMLDivElement>(null);
    const [isScrolling, setIsScrolling] = useState(true);
    const [userInteracting, setUserInteracting] = useState(false);

    const gifts = serverData?.gifts || cachedGifts || [];
    const latestGift = gifts[0];
    const recentGifts = gifts.slice(1);

    const guestCount = statsData?.guests?.arrived || 0;
    const totalGuests = statsData?.guests?.total || 0;

    useEffect(() => {
        const saved = localStorage.getItem("live_gifts_cache");
        if (saved) {
            try { setCachedGifts(JSON.parse(saved)); } catch (e) { }
        }
    }, []);

    const playNotificationSound = useCallback(() => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 2.0);
        } catch (e) {
            console.error("Sound play failed", e);
        }
    }, [soundEnabled]);

    useEffect(() => {
        if (serverData?.gifts && serverData.gifts.length > 0) {
            localStorage.setItem("live_gifts_cache", JSON.stringify(serverData.gifts));
            setCachedGifts(serverData.gifts);

            const newLatest = serverData.gifts[0];
            if (newLatest?.id !== lastGiftId) {
                if (listRef.current) listRef.current.scrollTop = 0;
                setIsScrolling(false);
                setTimeout(() => setIsScrolling(true), 12000); // Give plenty of time for main text
            }
        }
    }, [serverData, lastGiftId]);

    useEffect(() => {
        let animationFrameId: number;
        const scrollAmount = 0.25;

        const scroll = () => {
            if (listRef.current && isScrolling && !userInteracting && gifts.length > 5) {
                if (listRef.current.scrollTop + listRef.current.clientHeight >= listRef.current.scrollHeight - 1) {
                    listRef.current.scrollTop = 0;
                } else {
                    listRef.current.scrollTop += scrollAmount;
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isScrolling, userInteracting, gifts.length]);

    const [showNewGiftFlash, setShowNewGiftFlash] = useState(false);

    useEffect(() => {
        if (latestGift?.id && latestGift.id !== lastGiftId) {
            setLastGiftId(latestGift.id);
            if (lastGiftId !== null) {
                triggerPremiumConfetti();
                playNotificationSound();
                setShowNewGiftFlash(true);
                setTimeout(() => setShowNewGiftFlash(false), 7000);
            }
        }
    }, [latestGift, lastGiftId, playNotificationSound]);

    const triggerPremiumConfetti = () => {
        const duration = 5000;
        const animationEnd = Date.now() + duration;
        const defaults = {
            startVelocity: 50,
            spread: 360,
            ticks: 120,
            zIndex: 0,
            colors: ['#D4AF37', '#FFD700', '#FFFFFF']
        };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 80 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 300);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const startPresentation = () => {
        setHasStarted(true);
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
            setIsFullscreen(true);
        }
        setSoundEnabled(true);
    };

    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 10000);
        return () => clearInterval(interval);
    }, []);

    const shouldShowAmount = (dateString: string) => {
        const diff = now - new Date(dateString).getTime();
        return diff < 120000;
    };

    const getAmountStyle = (amount: number) => {
        const len = amount.toLocaleString().length;
        if (len >= 12) return { fontSize: "text-4xl md:text-5xl lg:text-7xl" };
        if (len >= 9) return { fontSize: "text-5xl md:text-6xl lg:text-8xl" };
        if (len >= 6) return { fontSize: "text-6xl md:text-8xl lg:text-9xl" };
        return { fontSize: "text-[5rem] md:text-[7rem] lg:text-[10rem]" };
    };

    if (!serverData && !error) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0A0500] space-y-4">
            <Loader2 className="animate-spin text-amber-500" size={48} />
            <div className="text-amber-500/50 text-xl font-kantumruy font-black uppercase tracking-[0.3em] animate-pulse">កំពុងភ្ជាប់ទិន្នន័យ...</div>
        </div>
    );

    const style = getAmountStyle(latestGift?.amount || 0);
    const amountVisible = latestGift ? shouldShowAmount(latestGift.createdAt) : false;

    if (!hasStarted && serverData) {
        return (
            <div className="relative w-full h-screen bg-[#0A0500] overflow-hidden flex items-center justify-center font-kantumruy text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-[#0A0500] to-black" />
                <m.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 px-8"
                >
                    <div className="w-20 h-20 bg-amber-500/10 rounded-3xl border-2 border-amber-500/20 flex items-center justify-center mx-auto mb-10">
                        <Trophy className="w-10 h-10 text-amber-500" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">MONEA បង្ហាញកាដូ</h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium mb-12 max-w-lg mx-auto">
                        សូមចុចប៊ូតុងខាងក្រោមដើម្បីចាប់ផ្តើម <br /> បង្ហាញកាដូ និង ភ្ញៀវកិត្តិយស
                    </p>
                    <button
                        onClick={startPresentation}
                        className="group relative px-16 py-6 bg-amber-500 text-slate-900 font-black text-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(245,158,11,0.25)] transition-all hover:scale-[1.05] active:scale-95 overflow-hidden"
                    >
                        ចាប់ផ្តើមដំណើរការ
                    </button>
                </m.div>
            </div>
        );
    }

    return (
        <LazyMotion features={domMax}>
            <div className="relative w-full min-h-screen lg:h-screen bg-[#0A0500] text-white overflow-hidden flex flex-col font-kantumruy">

                {/* Background elements - Clean & Minimal */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[#0A0500]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                </div>

                {/* Header - Neat & Informative */}
                <header className="relative z-50 h-24 px-12 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/5">
                    <div className="flex gap-8 items-center">
                        <div className="flex items-center gap-4">
                            <Users className="w-6 h-6 text-amber-500" />
                            <div>
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none block mb-1">ភ្ញៀវដែលបានមកដល់</span>
                                <div className="text-2xl font-black text-white leading-none font-mono">
                                    {guestCount} <span className="text-sm text-slate-600 font-bold">/ {totalGuests}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={cn(
                                "w-12 h-12 rounded-2xl transition-all flex items-center justify-center border",
                                soundEnabled ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "bg-white/5 border-white/5 text-slate-600 hover:text-slate-400"
                            )}
                        >
                            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl transition-all text-slate-600 hover:text-white flex items-center justify-center"
                        >
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                    </div>
                </header>

                <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 max-w-[1900px] mx-auto px-12 lg:px-24 py-12">

                    {/* Main Feature - Centered & Orderly */}
                    <div className="w-full lg:w-[65%] flex flex-col items-center justify-center">
                        <m.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center mb-16 space-y-4"
                        >
                            <h2 className="text-white text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight font-kantumruy">
                                សូមអរគុណ
                            </h2>
                            <div className="flex items-center justify-center gap-4">
                                <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                                <p className="text-amber-500 text-xl font-bold uppercase tracking-[0.4em] font-kantumruy">
                                    ភ្ញៀវកិត្តិយសទាំងអស់
                                </p>
                                <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                            </div>
                            <p className="text-slate-400 text-lg md:text-xl font-medium font-kantumruy leading-relaxed max-w-xl mx-auto pt-4">
                                សូមគោរពជូនពរ បវរសួស្ដី ជ័យមង្គល វិបុលសុខ មហាប្រសើរ <br /> ដល់លោកអ្នក និងក្រុមគ្រួសារ ជួបតែសំណាងល្អជានិច្ច!
                            </p>
                        </m.div>

                        <AnimatePresence mode="wait">
                            {latestGift ? (
                                <m.div
                                    key={latestGift.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.8 }}
                                    className="w-full max-w-3xl"
                                >
                                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 md:p-20 text-center relative shadow-2xl overflow-hidden min-h-[480px] flex flex-col justify-center">
                                        <m.div
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                            className="text-amber-500/50 font-black tracking-[0.5em] uppercase text-xs mb-8"
                                        >
                                            កាដូថ្មីទទួលបានពី
                                        </m.div>

                                        <div className="text-5xl md:text-7xl lg:text-[6rem] font-black text-white leading-[1.1] mb-12 font-kantumruy tracking-tight">
                                            <CinematicText text={latestGift.guest?.name || "ភ្ញៀវកិត្តិយស"} />
                                        </div>

                                        <div className={cn(
                                            "relative flex flex-col items-center justify-center transition-all duration-1000",
                                            !amountVisible && "blur-2xl opacity-5"
                                        )}>
                                            <div className="w-full h-px bg-white/10 mb-12" />
                                            <m.div
                                                className={cn("font-mono font-black tracking-tighter leading-none flex items-center justify-center gap-4 text-amber-500", style.fontSize)}
                                            >
                                                {latestGift.currency === "USD" && <span className="text-[0.6em]">$</span>}
                                                <span className="drop-shadow-[0_10px_40px_rgba(245,158,11,0.3)]">
                                                    {latestGift.amount.toLocaleString()}
                                                </span>
                                                {latestGift.currency === "KHR" && <span className="text-[0.4em] font-kantumruy font-black">៛</span>}
                                            </m.div>
                                            <div className="w-full h-px bg-white/10 mt-12" />
                                        </div>

                                        {latestGift.guest?.source && (
                                            <m.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                                                className="mt-12 flex items-center gap-3 px-8 py-3 rounded-full bg-white/5 border border-white/5 text-slate-400 font-bold font-kantumruy w-fit mx-auto"
                                            >
                                                <Heart size={16} className="text-amber-500" fill="currentColor" />
                                                {latestGift.guest.source}
                                            </m.div>
                                        )}
                                    </div>
                                </m.div>
                            ) : (
                                <div className="text-slate-700 text-xl font-black uppercase tracking-[0.5em] animate-pulse font-kantumruy">រង់ចាំកាដូថ្មី...</div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Vertical Guest List - Orderly & Clean */}
                    <div className="w-full lg:w-[35%] h-[75vh] flex flex-col">
                        <div className="mb-8 flex items-center gap-6 px-4">
                            <h3 className="text-2xl font-black text-white uppercase font-kantumruy tracking-tight">បញ្ជីភ្ញៀវកិត្តិយស</h3>
                            <div className="flex-1 h-px bg-white/10" />
                            <Gift className="text-amber-500/50" size={24} />
                        </div>

                        <div
                            ref={listRef}
                            onMouseEnter={() => setUserInteracting(true)}
                            onMouseLeave={() => setUserInteracting(false)}
                            className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar mask-gradient-v"
                        >
                            <AnimatePresence initial={false}>
                                {recentGifts.map((gift, idx) => (
                                    <m.div
                                        key={gift.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-6 rounded-3xl bg-white/[0.04] border border-white/[0.04] flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-xl">
                                                🧧
                                            </div>
                                            <div>
                                                <div className="text-xl font-bold text-white font-kantumruy leading-none mb-2">
                                                    {gift.guest?.name || "ភ្ញៀវកិត្តិយស"}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <Clock size={10} /> {new Date(gift.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "text-2xl font-black font-mono tracking-tighter text-amber-500/80 transition-all duration-1000",
                                            !shouldShowAmount(gift.createdAt) && "blur-xl"
                                        )}>
                                            {gift.currency === "USD" && "$"}
                                            {gift.amount.toLocaleString()}
                                            {gift.currency === "KHR" && <span className="text-sm ml-0.5 font-kantumruy">៛</span>}
                                        </div>
                                    </m.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </main>

                {/* Notification Flash - Neater Design */}
                <AnimatePresence>
                    {showNewGiftFlash && latestGift && (
                        <m.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
                        >
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                            <m.div
                                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 1.1, opacity: 0 }}
                                className="bg-[#0D0700] p-24 rounded-[5rem] flex flex-col items-center gap-10 border border-white/5 text-center"
                            >
                                <m.div
                                    animate={{ y: [0, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}
                                    className="text-8xl drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                                >
                                    🎁
                                </m.div>
                                <div className="space-y-4">
                                    <div className="text-amber-500 font-black tracking-[0.5em] uppercase text-sm font-kantumruy">កាដូថ្មីទទួលបាន!</div>
                                    <div className="text-6xl md:text-8xl font-black text-white font-kantumruy leading-tight">
                                        {latestGift.guest?.name || "ភ្ញៀវកិត្តិយស"}
                                    </div>
                                </div>
                            </m.div>
                        </m.div>
                    )}
                </AnimatePresence>

                <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 0px; }
                .mask-gradient-v {
                    mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
                }
            `}</style>
            </div>
        </LazyMotion>
    );
}

"use client";

import useSWR from "swr";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize, Minimize } from "lucide-react";
import confetti from "canvas-confetti";

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LiveDisplayPage() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lastGiftId, setLastGiftId] = useState<string | null>(null);

    // Poll for the latest 50 gifts (increased history)
    const { data: serverData, error } = useSWR("/api/gifts?limit=50", fetcher, {
        refreshInterval: 3000, // Slower poll to allow scrolling
        keepPreviousData: true,
    });

    const [cachedGifts, setCachedGifts] = useState<any[]>([]);
    const listRef = useRef<HTMLDivElement>(null);
    const [isScrolling, setIsScrolling] = useState(true);
    const [userInteracting, setUserInteracting] = useState(false);

    const isOffline = !!error;
    // Use server data if available, otherwise use cache
    const gifts = serverData?.gifts || cachedGifts || [];
    const latestGift = gifts[0];
    const recentGifts = gifts.slice(1);

    useEffect(() => {
        // Load cache on mount
        const saved = localStorage.getItem("live_gifts_cache");
        if (saved) {
            try {
                setCachedGifts(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse cache", e);
            }
        }
    }, []);

    useEffect(() => {
        // Update cache when new data arrives
        if (serverData?.gifts && serverData.gifts.length > 0) {
            localStorage.setItem("live_gifts_cache", JSON.stringify(serverData.gifts));
            setCachedGifts(serverData.gifts);

            // Check if truly new gift
            const newLatest = serverData.gifts[0];
            if (newLatest?.id !== lastGiftId) {
                // New gift! Scroll to top immediately
                if (listRef.current) {
                    listRef.current.scrollTop = 0;
                }
                setIsScrolling(false); // Pause scroll briefly
                setTimeout(() => setIsScrolling(true), 5000); // Resume after 5s
            }
        }
    }, [serverData, lastGiftId]);

    // Auto-Scroll Effect
    useEffect(() => {
        let animationFrameId: number;
        const scrollAmount = 0.5; // Speed

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

    // Detect new gift and trigger effects
    useEffect(() => {
        if (latestGift?.id && latestGift.id !== lastGiftId) {
            setLastGiftId(latestGift.id);
            triggerConfetti();
            setShowNewGiftFlash(true);
            setTimeout(() => setShowNewGiftFlash(false), 5000);
        }
    }, [latestGift, lastGiftId]);

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const [now, setNow] = useState(Date.now());

    // Update 'now' every 10 seconds to trigger privacy blur checks
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 10000);
        return () => clearInterval(interval);
    }, []);

    // Helper to check if gift is new enough (< 60 seconds)
    const shouldShowAmount = (dateString: string) => {
        const diff = now - new Date(dateString).getTime();
        return diff < 60000; // 60 seconds
    };

    // Helper to get font size and padding based on amount length
    const getAmountStyle = (amount: number) => {
        const len = amount.toLocaleString().length;
        if (len >= 9) return {
            fontSize: "text-3xl md:text-5xl lg:text-6xl xl:text-7xl",
            padding: "py-2 md:py-4"
        }; // Millions
        if (len >= 6) return {
            fontSize: "text-4xl md:text-6xl lg:text-7xl xl:text-8xl",
            padding: "py-2 md:py-6"
        }; // 10,000+
        return {
            fontSize: "text-5xl md:text-7xl lg:text-8xl xl:text-9xl",
            padding: "py-1 md:py-2"
        }; // Default
    };

    if (!serverData && !error) return <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-400 text-4xl font-bold animate-pulse">កំពុងផ្ទុក...</div>;

    const style = getAmountStyle(latestGift?.amount || 0);
    const amountVisible = latestGift ? shouldShowAmount(latestGift.createdAt) : false;

    return (
        <div className="relative w-full min-h-screen lg:h-screen bg-[#F8FAFC] text-slate-900 overflow-y-auto lg:overflow-hidden flex flex-col font-kantumruy">

            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-50/40 via-transparent to-transparent pointer-events-none fixed" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50/40 via-transparent to-transparent pointer-events-none fixed" />

            {/* Control Bar */}
            <div className="absolute top-4 right-4 z-50 flex gap-2 items-center">
                {isOffline && (
                    <div className="px-3 py-1.5 bg-red-100/80 backdrop-blur-md rounded-full text-red-600 text-xs font-bold border border-red-200 animate-pulse flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        ដាច់អ៊ីនធឺណិត / កំពុងភ្ជាប់...
                    </div>
                )}
                <button
                    onClick={toggleFullscreen}
                    className="p-3 bg-white/80 hover:bg-white backdrop-blur-md rounded-full transition-all shadow-sm border border-slate-200/60 text-slate-500 hover:text-slate-800"
                >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
            </div>

            <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-start lg:justify-center h-auto lg:h-full relative z-10 pt-20 pb-12 md:pt-24 lg:py-0">

                {/* Left Side: Highlight (Latest Gift) */}
                <div className="w-full lg:w-5/12 flex flex-col items-center justify-center space-y-12 lg:space-y-16 shrink-0">
                    <div className="text-center space-y-6 md:space-y-8">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-sm font-medium mb-2">
                            🎉 សូមស្វាគមន៍ (Welcome)
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent drop-shadow-sm leading-[1.6] md:leading-[1.8]">
                            សូមអរគុណភ្ញៀវកិត្តិយស
                        </h1>
                        <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed max-w-lg mx-auto">
                            ទាំងអស់ដែលបានចូលរួមក្នុងកម្មវិធីរៀបអាពាហ៏ពិពាហ៍របស់យើងខ្ញុំ សូមអោយលោកអ្នកធ្វើដំនើរត្រឡប់ទៅគេហដ្ខានវីញ ប្រកបដោយសុខសុវត្ថិភាព
                        </p>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {latestGift ? (
                            <motion.div
                                key={latestGift.id}
                                layout
                                initial={{ scale: 0.8, opacity: 0, y: 40, rotateX: 10 }}
                                animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                                className="w-full relative perspective-1000"
                            >
                                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-14 border border-white/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] text-center relative overflow-hidden ring-1 ring-slate-100 flex flex-col justify-center min-h-[300px]">
                                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-50" />

                                    <div className="text-slate-400 font-medium mb-2 md:mb-4 text-sm sm:text-lg">ទើបទទួលបានពី (Received From)</div>
                                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-slate-800 mb-4 md:mb-8 leading-tight drop-shadow-sm break-words hyphens-auto">
                                        {latestGift.guest?.name || "ភ្ញៀវកិត្តិយស"}
                                    </h2>

                                    <div className={`border-y border-dashed border-slate-200 my-2 md:my-8 relative px-2 transition-all duration-1000 ${style.padding} ${!amountVisible ? 'bg-slate-50/50' : ''}`}>
                                        <div className="absolute inset-0 bg-amber-50/30 rounded-lg -m-2 opacity-50" />

                                        <div className={`relative ${style.fontSize} font-bold text-amber-500 leading-tight tracking-tighter transition-all duration-1000 whitespace-nowrap flex items-center justify-center gap-2 ${!amountVisible ? 'blur-lg opacity-40 select-none pointer-events-none' : ''}`}>
                                            <span className="flex items-center">
                                                {latestGift.currency === "USD" ? "$" : ""}
                                                {latestGift.amount.toLocaleString()}
                                            </span>
                                            <span className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl opacity-60 flex items-center">
                                                {latestGift.currency === "KHR" ? "៛" : ""}
                                            </span>
                                        </div>
                                    </div>

                                    {latestGift.guest?.source && (
                                        <div className="inline-flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 mx-auto">
                                            <span className="text-xl">📍</span>
                                            <span className="font-bold text-slate-700 text-lg">{latestGift.guest.source}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="text-slate-400 text-xl animate-pulse font-medium bg-white/50 px-8 py-4 rounded-full">
                                ... កំពុងរង់ចាំទិន្នន័យ (Waiting) ...
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Side: Recent List */}
                <div className="w-full lg:w-5/12 h-auto min-h-[400px] lg:h-[80vh] flex flex-col relative shrink-0">
                    <div className="mb-6 flex items-center justify-between px-2">
                        <h3 className="text-slate-500 font-bold text-lg uppercase tracking-wider">បញ្ជីភ្ញៀវថ្មីៗ (Recent)</h3>
                        <div className="h-px bg-slate-200 flex-1 ml-6" />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar mask-gradient" ref={listRef}
                        onMouseEnter={() => setUserInteracting(true)}
                        onMouseLeave={() => setUserInteracting(false)}
                        onTouchStart={() => setUserInteracting(true)}
                        onTouchEnd={() => setUserInteracting(false)}
                    >
                        <AnimatePresence initial={false}>
                            {recentGifts.map((gift: any, index: number) => (
                                <motion.div
                                    key={gift.id}
                                    layout
                                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100/80 shadow-sm hover:shadow-md hover:border-amber-100 hover:bg-amber-50/30 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center text-2xl shadow-inner border border-white">
                                            🎁
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-slate-700 group-hover:text-amber-800 transition-colors">
                                                {gift.guest?.name || "ភ្ញៀវកិត្តិយស"}
                                            </div>
                                            {gift.guest?.source && (
                                                <div className="text-sm font-medium text-slate-400 group-hover:text-amber-600/80 transition-colors flex items-center gap-1 mt-0.5">
                                                    <span>📍</span>
                                                    {gift.guest.source}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className={`font-bold font-mono text-amber-600 text-xl transition-all duration-700 relative ${!shouldShowAmount(gift.createdAt) ? 'blur-md opacity-40 select-none' : ''}`}>
                                            {gift.currency === "USD" ? "$" : ""}
                                            {gift.amount.toLocaleString()}
                                            {gift.currency === "KHR" ? "៛" : ""}
                                        </div>
                                        <div className="text-xs text-slate-300 font-mono mt-1 group-hover:text-slate-400">
                                            {new Date(gift.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {recentGifts.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-300 gap-2 border-2 border-dashed border-slate-100 rounded-3xl">
                                <span className="text-4xl opacity-20">📭</span>
                                <span>គ្មានទិន្នន័យ (Empty)</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Gift Flash Overlay */}
            <AnimatePresence>
                {showNewGiftFlash && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
                    >
                        <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[2px]" />
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-white/95 border-b-8 border-amber-400 px-12 py-8 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col items-center gap-4 text-center ring-1 ring-amber-100"
                        >
                            <div className="text-6xl mb-2">🎁</div>
                            <div className="text-amber-600 font-bold uppercase tracking-[0.3em] text-sm">កាដូថ្មីទើបទទួលបាន (New Gift!)</div>
                            <div className="text-4xl md:text-6xl font-black text-slate-900 font-kantumruy">
                                {latestGift?.guest?.name || "ភ្ញៀវកិត្តិយស"}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 0px;
                    background: transparent;
                }
                .mask-gradient {
                    mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
                }
            `}</style>
        </div>
    );
}

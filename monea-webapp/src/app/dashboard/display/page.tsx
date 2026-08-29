import { useEffect, useState, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import confetti from "canvas-confetti";
import { Sparkles, Heart, ArrowLeft } from "lucide-react";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { Link } from "react-router-dom";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DisplayPage() {
    const { data } = useSWR("/api/guests/latest", fetcher, { refreshInterval: 2000 });
    const [displayGuest, setDisplayGuest] = useState<any>(null);
    
    // We only want to trigger the animation ONCE per guest scan
    const lastTriggeredId = useRef<string | null>(null);

    useEffect(() => {
        if (data?.latestGuest) {
            const guest = data.latestGuest;
            // Check if this is a newly arrived guest within the last 30 seconds
            // and we haven't already triggered their celebration
            const arrivedAt = new Date(guest.arrivedAt).getTime();
            const now = Date.now();
            const isRecent = (now - arrivedAt) < 30000; // 30 seconds threshold

            if (isRecent && guest.id !== lastTriggeredId.current) {
                lastTriggeredId.current = guest.id;
                setDisplayGuest(guest);
                
                // Fire massive confetti
                const duration = 5 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 1000, colors: ['#D4AF37', '#ffffff', '#FFD700'] };

                const interval: any = setInterval(function() {
                    const timeLeft = animationEnd - Date.now();
                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }
                    const particleCount = 70 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
                }, 250);

                // Auto-hide the guest celebration after 12 seconds
                setTimeout(() => {
                    setDisplayGuest(null);
                }, 12000);
            }
        }
    }, [data]);

    const isAnniversary = data?.wedding?.eventType === 'anniversary';

    return (
        <div className="fixed inset-0 bg-black overflow-hidden flex flex-col items-center justify-center font-kantumruy z-[100]">
            {/* Top Back Button */}
            <div className="absolute top-4 left-4 z-50">
                <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white backdrop-blur-md transition-all text-xs font-bold font-kantumruy border border-white/10"
                >
                    <ArrowLeft size={14} />
                    <span>Dashboard</span>
                </Link>
            </div>
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.15)_0%,_transparent_60%)]" />
                {/* Slow moving particles or blur blobs */}
                <m.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gold-main/10 rounded-full blur-[120px]"
                />
                <m.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gold-main/5 rounded-full blur-[150px]"
                />
            </div>

            <div className="relative z-10 w-full px-8 text-center flex flex-col items-center justify-center h-full">
                <AnimatePresence mode="wait">
                    {displayGuest ? (
                        <m.div
                            key="celebration"
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 1.1, opacity: 0, filter: "blur(20px)" }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="flex flex-col items-center space-y-8 md:space-y-12"
                        >
                            <m.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-gold-main/10 border border-gold-main/30"
                            >
                                <Sparkles className="w-6 h-6 text-gold-main" />
                                <span className="text-xl md:text-3xl font-black text-gold-main tracking-widest uppercase">
                                    សូមស្វាគមន៍យ៉ាងកក់ក្តៅ
                                </span>
                                <Sparkles className="w-6 h-6 text-gold-main" />
                            </m.div>

                            <m.h1 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8, type: "spring" }}
                                className="text-6xl md:text-[8rem] lg:text-[10rem] font-khmer-moul text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gold-main/50 drop-shadow-[0_0_40px_rgba(212,175,55,0.4)] leading-tight max-w-[90vw] truncate"
                            >
                                {displayGuest.name}
                            </m.h1>

                            {displayGuest.group && displayGuest.group !== "None" && (
                                <m.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.5 }}
                                    className="text-2xl md:text-4xl text-white/60 font-bold bg-white/5 px-10 py-4 rounded-3xl backdrop-blur-md"
                                >
                                    {displayGuest.group}
                                </m.div>
                            )}
                        </m.div>
                    ) : (
                        <m.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 1.5 }}
                            className="flex flex-col items-center space-y-16"
                        >
                            <div className="flex justify-center scale-150 mb-10">
                                <MoneaLogo showText size="lg" variant="dark" />
                            </div>
                            
                            {data?.wedding ? (
                                <div className="space-y-8">
                                    <h2 className="text-4xl md:text-6xl font-khmer-content text-gold-main/80 italic font-black">
                                        {isAnniversary ? "កម្មវិធីភ្ជាប់ពាក្យ" : "កម្មវិធីមង្គលការរបស់យើងខ្ញុំ"}
                                    </h2>
                                    <div className="flex items-center justify-center gap-8 text-5xl md:text-8xl font-khmer-moul text-white drop-shadow-2xl">
                                        <span>{data.wedding.groomName}</span>
                                        <Heart className="w-16 h-16 md:w-24 md:h-24 text-rose-500 animate-pulse fill-rose-500/20" />
                                        <span>{data.wedding.brideName}</span>
                                    </div>
                                    <p className="text-xl md:text-3xl text-white/40 tracking-[0.5em] uppercase font-black pt-12 animate-pulse">
                                        សូមអញ្ជើញចូលរួម
                                    </p>
                                </div>
                            ) : (
                                <div className="text-gold-main text-2xl font-bold animate-pulse">
                                    កំពុងរង់ចាំទិន្នន័យ...
                                </div>
                            )}
                        </m.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

import React, { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import type { TemplateProps } from './types';
import { Volume2, VolumeX } from 'lucide-react';

import { AnniversaryHero } from './anniversary-elegant/AnniversaryHero';
import { AnniversaryInvitation } from './anniversary-elegant/AnniversaryInvitation';
import { AnniversaryStory } from './anniversary-elegant/AnniversaryStory';
import { AnniversaryCountdown } from './anniversary-elegant/AnniversaryCountdown';
import AnniversaryVows from './anniversary-elegant/AnniversaryVows';
import AnniversarySchedule from './anniversary-elegant/AnniversarySchedule';
import AnniversaryGallery from './anniversary-elegant/AnniversaryGallery';
import AnniversaryLocation from './anniversary-elegant/AnniversaryLocation';
import { AnniversaryGift } from './anniversary-elegant/AnniversaryGift';
import { AnniversaryThankYou } from './anniversary-elegant/AnniversaryThankYou';

export default function AnniversaryElegant({ wedding, guestName }: TemplateProps) {
    const { groomName, brideName } = wedding;
    const [revealed, setRevealed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const primaryColor = wedding.themeSettings?.primaryColor || "#3B0764";
    const musicUrl = wedding.themeSettings?.musicUrl;

    const isWedding = wedding.eventType === 'wedding';

    const entranceHeader = isWedding 
        ? "— សិរីមង្គលអាពាហ៍ពិពាហ៍ —" 
        : "— សិរីមង្គលភ្ជាប់ពាក្យ —";

    const coverPhoto = wedding.themeSettings?.coverImageUrl || 
                       wedding.themeSettings?.heroImage || 
                       wedding.galleryItems?.[0]?.url || 
                       '/assets/anniversary-elegant/anniversary-elegant-bg.webp';

    // Support for dashboard force reveal
    useEffect(() => {
        const handleForceReveal = () => setRevealed(true);
        window.addEventListener('FORCE_REVEAL', handleForceReveal);
        return () => window.removeEventListener('FORCE_REVEAL', handleForceReveal);
    }, []);

    // Direct User Gesture Audio Playback (iOS Safari & Android Chrome Autoplay policy)
    const handleOpenEnvelope = () => {
        setRevealed(true);
        setIsPlaying(true);
        if (musicUrl && audioRef.current) {
            audioRef.current.play().catch((err) => {
                console.log("Autoplay blocked by browser policy:", err);
            });
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    };

    return (
        <div 
            style={{ "--primary": primaryColor } as React.CSSProperties}
            className="w-full bg-[#FAF7F2] font-kantumruy text-slate-800 relative min-h-screen selection:bg-[var(--primary)] selection:text-white"
        >
            {/* Background Audio */}
            {musicUrl && (
                <audio ref={audioRef} id="bg-music" src={musicUrl} loop preload="auto" />
            )}

            {/* Entrance Cover / Reveal Screen */}
            <AnimatePresence>
                {!revealed && (
                    <m.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                        onClick={handleOpenEnvelope}
                        className="fixed inset-0 z-[100] flex flex-col justify-between items-center p-6 py-10 text-center select-none overflow-hidden bg-[#FBF6F3] cursor-pointer"
                        style={{ isolation: 'isolate' }}
                    >
                        {/* Romantic Blush Pink Envelope Background */}
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <img
                                src="/assets/anniversary-elegant/envelope-cover.jpg" 
                                className="w-full h-full object-cover transform scale-100 transition-transform duration-1000"
                                alt="Romantic Envelope Cover"
                            />
                            {/* Soft Warm Ambient Lighting */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#FBF6F3]/50 via-transparent to-[#FBF6F3]/40 pointer-events-none" />
                        </div>

                        {/* Top: Header & Couple Names in Sky Area */}
                        <m.div 
                            initial={{ opacity: 0, y: -15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 pt-8 sm:pt-10 space-y-1.5 max-w-xs mx-auto"
                        >
                            <p className="font-khmer-moul text-xs sm:text-sm text-[#4A154B] tracking-wider drop-shadow-xs">
                                {entranceHeader}
                            </p>

                            <h2 className="font-khmer-moul text-lg sm:text-xl text-[#3B0764] leading-relaxed">
                                {groomName || "សុវណ្ណរាជ"} & {brideName || "ចាន់មានណា"}
                            </h2>
                        </m.div>

                        {/* Middle: Clear view of the vintage envelope flap & wax seal (Interactive click target) */}
                        <div 
                            onClick={handleOpenEnvelope}
                            className="flex-1 w-full cursor-pointer"
                            title="សូមចុចបើកធៀប"
                        />

                        {/* Bottom Area: Romantic Glassmorphic Guest Honorific Card & Open Action */}
                        <m.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            onClick={handleOpenEnvelope}
                            className="relative z-10 pb-6 sm:pb-8 w-full max-w-xs mx-auto text-center cursor-pointer space-y-3"
                        >
                            <div className="bg-white/85 backdrop-blur-md border border-rose-200/90 rounded-2xl px-5 py-2.5 shadow-[0_4px_20px_rgba(244,114,182,0.18)] inline-block max-w-[92%] space-y-0.5 hover:scale-105 active:scale-95 transition-transform duration-300">
                                <p className="text-[10px] text-rose-700 font-bold font-kantumruy">
                                    — សូមគោរពអញ្ជើញ —
                                </p>
                                <h4 className="font-khmer-moul text-xs sm:text-sm text-[#4A154B] leading-relaxed">
                                    {guestName || "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី"}
                                </h4>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEnvelope();
                                }}
                                className="w-full py-3.5 px-6 rounded-2xl font-khmer-moul text-white bg-gradient-to-r from-purple-700 via-pink-700 to-purple-700 hover:from-purple-600 hover:to-pink-600 active:scale-95 transition-all text-xs sm:text-sm tracking-wider shadow-[0_4px_25px_rgba(147,51,234,0.35)] flex items-center justify-center gap-2 border border-purple-300/40 animate-pulse"
                            >
                                <span>✨ សូមចុចបើកធៀប</span>
                            </button>

                            <p className="text-[10px] text-purple-900/70 font-kantumruy tracking-wider">
                                (ចុចត្រង់ណាក៏បាន ឬ អូសឡើងលើដើម្បីបើក)
                            </p>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* Main Stage Canvas */}
            <main className="relative max-w-[540px] mx-auto min-h-screen shadow-2xl bg-white flex flex-col overflow-hidden">
                <AnniversaryHero wedding={wedding} />
                <AnniversaryInvitation wedding={wedding} />
                <AnniversaryStory wedding={wedding} />
                <AnniversaryCountdown wedding={wedding} />
                <AnniversaryVows wedding={wedding} />
                <AnniversarySchedule wedding={wedding} />
                <AnniversaryGallery wedding={wedding} />
                <AnniversaryLocation wedding={wedding} />
                <AnniversaryGift wedding={wedding} />
                <AnniversaryThankYou wedding={wedding} />
            </main>

            {/* Floating Music Button */}
            {musicUrl && (
                <div className="fixed bottom-6 right-6 z-40">
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-[#3B0764] text-amber-200 border-2 border-amber-300/50 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                        aria-label="Toggle Music"
                    >
                        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                </div>
            )}
        </div>
    );
}

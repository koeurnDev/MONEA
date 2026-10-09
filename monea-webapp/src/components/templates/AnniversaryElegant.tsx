import React, { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import type { TemplateProps } from './types';
import { Volume2, VolumeX } from 'lucide-react';

import { AnniversaryHero } from './anniversary-elegant/AnniversaryHero';
import { AnniversaryInvitation } from './anniversary-elegant/AnniversaryInvitation';
import { AnniversaryStory } from './anniversary-elegant/AnniversaryStory';
import { AnniversaryCountdown } from './anniversary-elegant/AnniversaryCountdown';
import AnniversarySchedule from './anniversary-elegant/AnniversarySchedule';
import AnniversaryGallery from './anniversary-elegant/AnniversaryGallery';
import AnniversaryLocation from './anniversary-elegant/AnniversaryLocation';
import { AnniversaryGift } from './anniversary-elegant/AnniversaryGift';
import { AnniversaryThankYou } from './anniversary-elegant/AnniversaryThankYou';
import { getTemplatePaletteStyles } from "@/lib/template-color-palette";
import { isSectionVisible } from "./shared/template-settings";
import { GuestbookSection } from "./shared/GuestbookSection";

export default function AnniversaryElegant({ wedding, guestName, config }: TemplateProps) {
    const { groomName, brideName } = wedding;
    const [revealed, setRevealed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const primaryColor = wedding.themeSettings?.primaryColor || "#8B4B55";
    const musicUrl = wedding.themeSettings?.musicUrl;
    const isWedding = wedding.eventType === 'wedding';

    const entranceHeader = isWedding 
        ? "— សិរីមង្គលអាពាហ៍ពិពាហ៍ —" 
        : "— សិរីមង្គលភ្ជាប់ពាក្យ —";

    const coverPhoto = wedding.themeSettings?.heroImage ||
                       wedding.themeSettings?.coverImageUrl ||
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
        window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
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
            style={getTemplatePaletteStyles(wedding.themeSettings, "#8B4B55")}
            className="monea-full-palette w-full bg-[#F1ECE5] font-kantumruy text-[#2D2928] relative min-h-screen selection:bg-[var(--primary)] selection:text-white"
        >
            {/* Background Audio */}
            {musicUrl && (
                <audio ref={audioRef} id="bg-music" src={musicUrl} loop preload="none" />
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
                        {/* User-selected cover image with a readable invitation overlay */}
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <img
                                src={coverPhoto}
                                className="absolute inset-0 z-0 w-full h-full object-cover scale-110 blur-2xl opacity-70"
                                alt=""
                                aria-hidden="true"
                            />
                            <img
                                src={coverPhoto}
                                className="absolute inset-0 z-0 w-full h-full object-cover transition-transform duration-1000"
                                alt="Invitation Cover"
                                loading="eager"
                                fetchPriority="high"
                                decoding="async"
                            />
                            <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#171316]/70 via-[#171316]/10 to-[#24191B]/95 pointer-events-none" />
                        </div>

                        {/* Top: Header & Couple Names in Sky Area */}
                        <m.div 
                            initial={{ opacity: 1, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-20 pt-8 sm:pt-10 space-y-1.5 max-w-xs mx-auto"
                        >
                            <p className="font-khmer-moul text-xs sm:text-sm text-amber-100 tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                                {entranceHeader}
                            </p>

                            {(groomName || brideName) && <h2 className="font-khmer-moul text-lg sm:text-xl text-white leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                                {groomName}{groomName && brideName ? " & " : ""}{brideName}
                            </h2>}
                        </m.div>

                        {/* Middle: Clear view of the vintage envelope flap & wax seal (Interactive click target) */}
                        <div 
                            onClick={handleOpenEnvelope}
                            className="flex-1 w-full cursor-pointer"
                            title="សូមចុចបើកធៀប"
                        />

                        {/* Bottom Area: Romantic Glassmorphic Guest Honorific Card & Open Action */}
                        <m.div
                            initial={{ opacity: 1, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            onClick={handleOpenEnvelope}
                            className="relative z-20 pb-6 sm:pb-8 w-full max-w-xs mx-auto text-center cursor-pointer space-y-3"
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
                                className="w-full py-3.5 px-6 rounded-xl font-khmer-moul text-[#2D2020] bg-[#E7C783] hover:bg-[#F0D69A] active:scale-95 transition-all text-xs sm:text-sm tracking-wider shadow-[0_10px_30px_rgba(231,199,131,0.25)] flex items-center justify-center gap-2 border border-[#F7E7B5]/70"
                            >
                                <span>✨ សូមចុចបើកធៀប</span>
                            </button>

                            <p className="text-[10px] text-white/70 font-kantumruy tracking-wider">
                                (ចុចត្រង់ណាក៏បាន ឬ អូសឡើងលើដើម្បីបើក)
                            </p>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* Main Stage Canvas */}
            {revealed && (
            <main className="relative w-full max-w-3xl mx-auto min-h-screen shadow-[0_0_60px_rgba(45,34,30,0.12)] bg-[#F8F5EF] flex flex-col overflow-hidden overflow-x-hidden">
                <AnniversaryHero wedding={wedding} />
                <AnniversaryInvitation wedding={wedding} guestName={guestName} />
                {isSectionVisible(config, "story") && <AnniversaryStory wedding={wedding} />}
                <AnniversaryCountdown wedding={wedding} />
                {isSectionVisible(config, "timeline") && <AnniversarySchedule wedding={wedding} title={config.labels.scheduleTitle} />}
                {isSectionVisible(config, "gallery") && <AnniversaryGallery wedding={wedding} />}
                {isSectionVisible(config, "map") && <AnniversaryLocation wedding={wedding} />}
                {isSectionVisible(config, "gift") && <AnniversaryGift wedding={wedding} />}
                {isSectionVisible(config, "guestbook") && <GuestbookSection wedding={wedding} />}
                <AnniversaryThankYou wedding={wedding} />
            </main>
            )}

            {/* Floating Music Button */}
            {musicUrl && (
                <div className="fixed bottom-6 right-6 z-40">
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-[#2D2928] text-[#E7C783] border border-[#E7C783]/70 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                        aria-label="Toggle Music"
                    >
                        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                </div>
            )}
        </div>
    );
}

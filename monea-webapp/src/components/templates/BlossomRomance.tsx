import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { WeddingData, TemplateProps } from './types';
import { EntranceEnvelope } from './blossom-romance/EntranceEnvelope';
import { HeroSection } from './blossom-romance/HeroSection';
import { ParentsSection } from './blossom-romance/ParentsSection';
import { ScheduleSection } from './blossom-romance/ScheduleSection';
import { LocationSection } from './blossom-romance/LocationSection';
import { GallerySection } from './blossom-romance/GallerySection';
import { GiftSection } from './blossom-romance/GiftSection';
import { ThankYouSection } from './blossom-romance/ThankYouSection';

export const BlossomRomance: React.FC<TemplateProps> = ({ wedding, guestName }) => {
    const [revealed, setRevealed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const handleForceReveal = () => setRevealed(true);
        window.addEventListener('FORCE_REVEAL', handleForceReveal);
        return () => window.removeEventListener('FORCE_REVEAL', handleForceReveal);
    }, []);

    const primaryColor = wedding.themeSettings?.primaryColor || "#B45309";
    const musicUrl = wedding.themeSettings?.musicUrl;
    const visibility = wedding.themeSettings?.visibility as any;

    const handleOpenEnvelope = () => {
        setRevealed(true);
        if (audioRef.current && musicUrl) {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch((e) => console.log("Audio autoplay prevented:", e));
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
            className="w-full bg-[#F5EBE6] font-kantumruy text-slate-800 relative min-h-screen selection:bg-rose-500 selection:text-white"
        >
            {/* Background Audio */}
            {musicUrl && (
                <audio ref={audioRef} id="bg-music" src={musicUrl} loop preload="auto" />
            )}

            {/* Entrance Envelope Overlay */}
            <EntranceEnvelope
                wedding={wedding}
                guestName={guestName}
                revealed={revealed}
                onOpen={handleOpenEnvelope}
                primaryColor={primaryColor}
            />

            {/* Floating Music Control Button */}
            {revealed && musicUrl && (
                <button
                    onClick={togglePlay}
                    className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md border border-rose-200 text-rose-600 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    aria-label="Toggle Music"
                >
                    {isPlaying ? <Volume2 size={18} className="animate-pulse" /> : <VolumeX size={18} />}
                </button>
            )}

            {/* Mobile Canvas Stage */}
            <main className="relative max-w-[540px] mx-auto min-h-screen shadow-2xl bg-white flex flex-col">
                {/* 1. Hero Section */}
                <HeroSection wedding={wedding} primaryColor={primaryColor} />

                {/* 2. Parents Formal Invitation Section */}
                <ParentsSection wedding={wedding} primaryColor={primaryColor} />

                {/* 3. Schedule & Timeline Section */}
                {visibility?.showSchedule !== false && (
                    <ScheduleSection wedding={wedding} primaryColor={primaryColor} />
                )}

                {/* 4. Location & Map Section */}
                {visibility?.showMap !== false && (
                    <LocationSection wedding={wedding} primaryColor={primaryColor} />
                )}

                {/* 5. Memory Photo Gallery */}
                {visibility?.showGallery !== false && (
                    <GallerySection wedding={wedding} primaryColor={primaryColor} />
                )}

                {/* 6. Gift & Bank Accounts */}
                {visibility?.showGift !== false && (
                    <GiftSection wedding={wedding} primaryColor={primaryColor} />
                )}

                {/* 7. Thank You & Blessings */}
                <ThankYouSection wedding={wedding} primaryColor={primaryColor} />
            </main>
        </div>
    );
};

export default BlossomRomance;

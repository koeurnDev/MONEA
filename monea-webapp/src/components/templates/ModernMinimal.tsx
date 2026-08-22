"use client";
import * as React from "react";
import dynamic from 'next/dynamic';
import { m, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { WeddingData } from "./types";
import { useTranslation } from "@/i18n/LanguageProvider";

// Static Imports for Fast Load and SSR
import { HeroSection } from './modern-minimal/HeroSection';
import { ScheduleSection } from './modern-minimal/ScheduleSection';
import { GallerySection } from './modern-minimal/GallerySection';
import { CountdownSection } from './modern-minimal/CountdownSection';
import { LetterSection } from './modern-minimal/LetterSection';
import { LocationSection } from './modern-minimal/LocationSection';
import { GiftSection } from './modern-minimal/GiftSection';
import { ThankYouSection } from './modern-minimal/ThankYouSection';
import { LoveStorySection } from './modern-minimal/LoveStorySection';
import { VideoSection } from './modern-minimal/VideoSection';

import { EntranceEnvelope } from './modern-minimal/EntranceEnvelope';
import { ParallaxDivider } from './modern-minimal/ParallaxDivider';

import { BackgroundMusic } from './modern-minimal/BackgroundMusic';
import { GuestbookSection } from './modern-minimal/GuestbookSection';

export default function ModernMinimal({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const { t } = useTranslation();
    const [revealed, setRevealed] = React.useState(false);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const audioRef = React.useRef<HTMLAudioElement>(null);

    // Support for Preview Dashboard scrolling
    React.useEffect(() => {
        const handleForceReveal = () => setRevealed(true);
        window.addEventListener('FORCE_REVEAL', handleForceReveal);
        return () => window.removeEventListener('FORCE_REVEAL', handleForceReveal);
    }, []);

    return (
        <div className="bg-white min-h-screen font-inter text-slate-900 selection:bg-slate-900 selection:text-white">
            {!revealed && (
                <EntranceEnvelope 
                    wedding={wedding} 
                    guestName={guestName}
                    onReveal={() => {
                        setRevealed(true);
                        setIsPlaying(true);
                    }} 
                />
            )}

            <m.main
                initial={{ opacity: 0 }}
                animate={{ opacity: revealed ? 1 : 0 }}
                transition={{ duration: 1.5 }}
                className="relative z-10"
            >
                <HeroSection wedding={wedding} />
                <CountdownSection wedding={wedding} />
                
                <LetterSection wedding={wedding} />
                <LoveStorySection wedding={wedding} />

                <ParallaxDivider 
                    imageUrl={wedding.galleryItems?.[0]?.url || wedding.themeSettings?.heroImage || '/images/templates/modern-minimal/hero.jpg'} 
                    text="FOREVER & ALWAYS"
                />

                <ScheduleSection wedding={wedding} />

                <ParallaxDivider 
                    imageUrl={wedding.galleryItems?.[1]?.url || wedding.themeSettings?.heroImage || '/images/templates/modern-minimal/hero.jpg'} 
                    text="THE BEGINNING"
                />

                <LocationSection wedding={wedding} />
                <VideoSection wedding={wedding} />
                <GallerySection wedding={{...wedding, galleryItems: wedding.galleryItems?.slice(2) || []}} />
                
                <GuestbookSection wedding={wedding} guestName={guestName} />
                <GiftSection wedding={wedding} />
                <ThankYouSection wedding={wedding} />

                <footer className="py-24 text-center border-t border-slate-100 bg-slate-900">
                    <p className="text-xs uppercase tracking-[0.4em] font-bold text-slate-500">Powered by MONEA</p>
                </footer>
            </m.main>

            {/* Audio Element */}
            {wedding.themeSettings?.musicUrl && (
                <audio 
                    ref={audioRef} 
                    src={wedding.themeSettings.musicUrl} 
                    loop 
                    preload="auto"
                />
            )}

            <BackgroundMusic 
                wedding={wedding} 
                isPlaying={isPlaying} 
                setIsPlaying={setIsPlaying} 
                audioRef={audioRef} 
            />
        </div>
    );
}

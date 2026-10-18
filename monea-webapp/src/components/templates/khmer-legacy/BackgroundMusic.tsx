import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Music2, Volume2 } from 'lucide-react';
import { WeddingData } from '../types';
import { useTranslation } from '@/i18n/LanguageProvider';

interface BackgroundMusicProps {
    wedding: WeddingData;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    audioRef: React.RefObject<HTMLAudioElement>;
}

export function BackgroundMusic({ wedding, isPlaying, setIsPlaying, audioRef }: BackgroundMusicProps) {
    const { t } = useTranslation();
    const audioUrl = wedding.themeSettings?.musicUrl;
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setPortalTarget(document.body);
    }, []);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    // Sync audio state with props
    useEffect(() => {
        if (!audioRef.current || !audioUrl) return;

        const audio = audioRef.current;
        
        if (isPlaying) {
            audio.volume = 0.6;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Playback failed:", error);
                    setIsPlaying(false);
                });
            }
        } else {
            audio.pause();
        }
    }, [isPlaying, audioUrl, setIsPlaying, audioRef]);

    // Only show if audio URL exists
    if (!audioUrl) return null;

    return (
        <>
            {portalTarget && createPortal(
                <div className="invitation-floating-control fixed top-8 z-[100]">
                    <m.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        <m.button
                            type="button"
                            onClick={togglePlay}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            aria-label={isPlaying
                                ? (wedding.themeSettings?.customLabels?.musicPauseLabel || t("template.khmerLegacy.musicPauseLabel"))
                                : (wedding.themeSettings?.customLabels?.musicPlayLabel || t("template.khmerLegacy.musicPlayLabel"))}
                            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#C5A027]/35 bg-[#fffdf8]/90 text-[#9A741C] shadow-[0_2px_10px_rgba(75,57,24,0.12)] backdrop-blur-sm transition-colors hover:border-[#C5A027]/60 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A027]/50 focus-visible:ring-offset-2"
                        >
                            <AnimatePresence mode="wait">
                                {isPlaying ? (
                                    <m.div
                                        key="playing"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                    >
                                        <Volume2 size={18} strokeWidth={1.7} />
                                    </m.div>
                                ) : (
                                    <m.div
                                        key="paused"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                    >
                                        <Music2 size={18} strokeWidth={1.7} />
                                    </m.div>
                                )}
                            </AnimatePresence>
                        </m.button>
                    </m.div>
                </div>,
                portalTarget,
            )}
            <audio
                key={audioUrl}
                ref={audioRef}
                src={audioUrl}
                loop
                preload="none"
                crossOrigin="anonymous"
            />
        </>
    );
}

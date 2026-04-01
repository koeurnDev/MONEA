"use client";
import React, { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Music2, Volume2, VolumeX, Disc } from 'lucide-react';
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

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    // Sync audio state with props
    useEffect(() => {
        if (!audioRef.current || !audioUrl) return;

        const audio = audioRef.current;
        
        // When URL changes, we should load it
        audio.load();

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
        <div className="fixed top-8 right-8 z-[100]">
            <m.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative group"
            >
                {/* Visualizer Waves */}
                {isPlaying && (
                    <div className="absolute inset-0 -z-10 flex items-center justify-center gap-[2px]">
                        {[...Array(4)].map((_, i) => (
                            <m.div
                                key={i}
                                animate={{ height: [40, 60, 40] }}
                                transition={{ duration: 0.5 + i * 0.1, repeat: Infinity }}
                                className="w-1 bg-gold/20 rounded-full"
                            />
                        ))}
                    </div>
                )}

                <m.button
                    onClick={togglePlay}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 bg-stone-900 border border-gold/30 rounded-full flex items-center justify-center text-gold shadow-2xl relative overflow-hidden group/btn"
                >
                    <AnimatePresence mode="wait">
                        {isPlaying ? (
                            <m.div
                                key="playing"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            >
                                <Disc size={28} />
                            </m.div>
                        ) : (
                            <m.div
                                key="paused"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                <Music2 size={24} />
                            </m.div>
                        )}
                    </AnimatePresence>
                    
                    {/* Hover Tooltip */}
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-stone-900 text-gold text-[10px] font-black tracking-widest uppercase rounded-full border border-gold/20 opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        {isPlaying 
                            ? (wedding.themeSettings?.customLabels?.musicPauseLabel || t("template.khmerLegacy.musicPauseLabel")) 
                            : (wedding.themeSettings?.customLabels?.musicPlayLabel || t("template.khmerLegacy.musicPlayLabel"))}
                    </div>
                </m.button>

                <audio 
                    key={audioUrl}
                    ref={audioRef}
                    src={audioUrl}
                    loop
                    preload="auto"
                    crossOrigin="anonymous"
                />
            </m.div>
        </div>
    );
}

import React, { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { WeddingData } from '../types';

interface BackgroundMusicProps {
    wedding: WeddingData;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    audioRef: React.RefObject<HTMLAudioElement>;
}

export function BackgroundMusic({ wedding, isPlaying, setIsPlaying, audioRef }: BackgroundMusicProps) {
    const audioUrl = wedding.themeSettings?.musicUrl;

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    // Sync audio state with props
    useEffect(() => {
        if (!audioRef.current || !audioUrl) return;

        const audio = audioRef.current;
        
        // When URL changes, load it
        audio.load();

        if (isPlaying) {
            audio.volume = 0.5;
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

    if (!audioUrl) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <m.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg border backdrop-blur-md transition-all ${
                    isPlaying 
                        ? "bg-slate-900 text-white border-slate-900" 
                        : "bg-white/80 text-slate-500 border-slate-200"
                }`}
            >
                {/* Minimal pulse ring when playing */}
                <AnimatePresence>
                    {isPlaying && (
                        <m.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                            className="absolute inset-0 rounded-full border border-slate-900/30"
                        />
                    )}
                </AnimatePresence>

                {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </m.button>
        </div>
    );
}

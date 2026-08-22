"use client";

import { Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveHeaderProps {
    soundEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;
    isFullscreen: boolean;
    toggleFullscreen: () => void;
}

export function LiveHeader({ soundEnabled, setSoundEnabled, isFullscreen, toggleFullscreen }: LiveHeaderProps) {
    return (
        <header className="relative z-40 h-24 px-8 md:px-16 flex justify-between items-center bg-black/40 backdrop-blur-2xl border-b border-white/5">
            <div className="flex items-center gap-10">
                <div className="flex items-center gap-12">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase font-kantumruy leading-none mb-1">MONEA</h1>
                        <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 to-transparent opacity-50" />
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={cn(
                        "w-12 h-12 rounded-2xl transition-all flex items-center justify-center border",
                        soundEnabled ? "bg-amber-500/20 border-amber-500/50 text-amber-500" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                    )}
                >
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
                <button
                    onClick={toggleFullscreen}
                    className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white/40 hover:text-white flex items-center justify-center border border-white/5"
                >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
            </div>
        </header>
    );
}

"use client";

import { m } from 'framer-motion';
import { Trophy, Gift } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

interface LiveStartScreenProps {
    onStart: () => void;
}

export function LiveStartScreen({ onStart }: LiveStartScreenProps) {
    const { t } = useTranslation();

    return (
        <div className="relative w-full h-screen bg-[#050505] overflow-hidden flex items-center justify-center font-kantumruy text-center p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-50" />
            <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 max-w-2xl"
            >
                <div className="w-24 h-24 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                    <Gift className="w-12 h-12 text-amber-500" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter">MONEA <span className="text-amber-500">LIVE</span></h1>
                <p 
                    className="text-zinc-400 text-lg md:text-xl font-bold mb-12 leading-relaxed opacity-60"
                    dangerouslySetInnerHTML={{ __html: t("gifts.live.clickToStart") }}
                />
                <button
                    onClick={onStart}
                    className="group relative px-16 py-7 bg-amber-500 text-black font-black text-2xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95 overflow-hidden active:shadow-none"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        {t("gifts.live.start")} <Trophy className="w-6 h-6" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
            </m.div>
        </div>
    );
}

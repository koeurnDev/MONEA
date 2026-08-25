import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { WeddingData } from "../types";
import { useTranslation } from "@/i18n/LanguageProvider";

interface EntranceEnvelopeProps {
    wedding: WeddingData;
    guestName?: string;
    onReveal: () => void;
    onStartOpen?: () => void;
    audioRef?: React.RefObject<HTMLAudioElement | null>;
}

export const EntranceEnvelope = ({ wedding, guestName, onReveal, onStartOpen, audioRef }: EntranceEnvelopeProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
    const heroImage = wedding.themeSettings?.heroImage || wedding.galleryItems?.[0]?.url || '/images/bg_tunnel.webp';
    const isEngagement = wedding.eventType === 'anniversary';

    const handleOpen = () => {
        if (audioRef?.current && wedding.themeSettings?.musicUrl) {
            audioRef.current.play().catch((err) => {
                console.log("Autoplay blocked:", err);
            });
        }
        if (onStartOpen) {
            onStartOpen();
        }
        setIsOpen(true);
        setTimeout(() => {
            onReveal();
        }, 800);
    };

    return (
        <AnimatePresence>
            {!isOpen && (
                <m.div
                    key="envelope"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    className="fixed inset-0 z-[100] flex flex-col justify-between items-center p-6 py-10 text-center select-none overflow-hidden bg-[#0A0D14]"
                    style={{ isolation: 'isolate' }}
                >
                    {/* Full-bleed Pre-Wedding Photo Background */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                            src={heroImage} 
                            className="w-full h-full object-cover transform scale-100 filter brightness-[0.92] transition-transform duration-1000"
                            alt="Pre-wedding Cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />
                    </div>
                    
                    {/* Top: Minimalist Header */}
                    <m.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 pt-2"
                    >
                        <h1 className="font-kantumruy font-bold text-base sm:text-lg text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wider">
                            {isEngagement ? "សិរីមង្គលពិធីភ្ជាប់ពាក្យ" : "សិរីមង្គលអាពាហ៍ពិពាហ៍"}
                        </h1>
                    </m.div>

                    {/* Middle: Open for couple photo */}
                    <div className="flex-1" />

                    {/* Bottom: Names + Clean Guest Pill + Sleek Button */}
                    <m.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 w-full max-w-xs space-y-4 pb-2"
                    >
                        {/* Couple Names */}
                        <div className="space-y-1">
                            <h2 className="font-kantumruy font-black text-2xl sm:text-3xl text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] tracking-tight">
                                {wedding.groomName}
                            </h2>
                            <p className="text-xs text-white/60 font-serif italic">&</p>
                            <h2 className="font-kantumruy font-black text-2xl sm:text-3xl text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] tracking-tight">
                                {wedding.brideName}
                            </h2>
                        </div>

                        {/* Clean One-Line Guest Pill */}
                        <div className="text-xs sm:text-sm text-white/90 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full font-kantumruy shadow-lg drop-shadow-md">
                            <span className="text-white/60 mr-1.5 font-light">សូមគោរពអញ្ជើញ៖</span>
                            <span className="font-bold text-white">{guestName || "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី"}</span>
                        </div>
                            
                        {/* Ultra Clean Sleek Button */}
                        <button
                            onClick={handleOpen}
                            className="w-full py-3.5 px-6 rounded-full font-bold font-kantumruy text-slate-950 bg-white hover:bg-slate-100 active:scale-95 transition-all text-sm shadow-[0_4px_25px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2"
                        >
                            <span>សូមចុចបើកធៀប</span>
                            <ArrowRight size={15} />
                        </button>
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>
    );
};

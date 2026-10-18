import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';
import { WeddingData } from "../types";
import { useTranslation } from "@/i18n/LanguageProvider";
import { getWeddingHeroImage } from "../shared/weddingPhotos";
import { OneLineName } from "../shared/OneLineName";

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
    const heroImage = getWeddingHeroImage(wedding, '/images/bg_tunnel.webp');
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
                    onClick={handleOpen}
                    className="fixed inset-0 z-[100] flex flex-col justify-between items-center p-6 py-10 text-center select-none overflow-hidden bg-[#0A0D14] cursor-pointer"
                    style={{
                        isolation: 'isolate',
                        paddingTop: 'max(2.5rem, env(safe-area-inset-top))',
                        paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))',
                    }}
                >
                    {/* Full-bleed Pre-Wedding Photo Background */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                            src={heroImage}
                            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.98] transition-transform duration-1000"
                            style={{ objectPosition: 'center 20%' }}
                            loading="eager"
                            fetchPriority="high"
                            decoding="async"
                            alt="Pre-wedding Cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
                    </div>
                    
                    {/* Top: Minimalist Header */}
                    <m.div 
                        initial={{ opacity: 1, y: 0 }}
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
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 w-full max-w-xs space-y-4 pb-2"
                    >
                        <div className="flex max-w-full flex-col items-center gap-1.5 text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
                            <OneLineName name={wedding.groomName} className="m05-font-name text-2xl sm:text-3xl" />
                            <Heart size={16} className="fill-rose-200 text-rose-200" aria-hidden="true" />
                            <OneLineName name={wedding.brideName} className="m05-font-name text-2xl sm:text-3xl" />
                        </div>

                        {/* Clean One-Line Guest Pill */}
                        <div className="text-xs sm:text-sm text-white/90 font-kantumruy drop-shadow-md">
                            <span className="text-white/60 mr-1.5 font-light">សូមគោរពអញ្ជើញ៖</span>
                            <span className="font-bold text-white">{guestName || "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី"}</span>
                        </div>
                            
                        {/* Ultra Clean Sleek Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpen();
                            }}
                            className="w-full py-3.5 px-6 rounded-full font-bold font-kantumruy text-slate-950 bg-white hover:bg-slate-100 active:scale-95 transition-all text-sm shadow-[0_4px_25px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 animate-pulse"
                        >
                            <span>✨ សូមចុចបើកធៀប</span>
                            <ArrowRight size={15} />
                        </button>

                        <p className="text-[10px] text-white/60 font-kantumruy tracking-wider">
                            (ចុចត្រង់ណាក៏បាន ឬ អូសឡើងលើដើម្បីបើក)
                        </p>
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>
    );
};

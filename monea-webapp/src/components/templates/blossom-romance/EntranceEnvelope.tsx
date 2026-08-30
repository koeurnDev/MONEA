import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { WeddingData } from '../types';

interface EntranceEnvelopeProps {
    wedding: WeddingData;
    guestName?: string;
    revealed: boolean;
    onOpen: () => void;
    primaryColor: string;
}

export const EntranceEnvelope: React.FC<EntranceEnvelopeProps> = ({
    wedding,
    guestName,
    revealed,
    onOpen,
    primaryColor
}) => {
    const isEngagement = wedding.eventType === 'anniversary';
    const groomName = wedding.groomName || "កូនកំលោះ";
    const brideName = wedding.brideName || "កូនក្រមុំ";
    const heroImage = wedding.themeSettings?.heroImage || wedding.galleryItems?.[0]?.url || '/assets/blossom-romance/blossom-arch-bg.jpg';

    return (
        <AnimatePresence>
            {!revealed && (
                <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    onClick={onOpen}
                    onTouchEnd={onOpen}
                    className="fixed inset-0 z-[100] flex flex-col justify-between items-center p-6 py-10 text-center select-none overflow-hidden bg-[#2D0A14] cursor-pointer"
                    style={{ isolation: 'isolate' }}
                >
                    {/* Full-bleed Pre-Wedding Photo Background */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                            src={heroImage} 
                            className="w-full h-full object-cover transform scale-100 filter brightness-[0.92] transition-transform duration-1000"
                            style={{ objectPosition: 'center 20%' }}
                            alt="Pre-wedding Cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />
                    </div>

                    {/* Top: Delicate Title */}
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 pt-2"
                    >
                        <h1 className="font-khmer-moul text-base sm:text-lg text-rose-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wider">
                            {isEngagement ? "សិរីមង្គលពិធីភ្ជាប់ពាក្យ" : "សិរីមង្គលអាពាហ៍ពិពាហ៍"}
                        </h1>
                    </motion.div>

                    {/* Middle: Open for couple photo */}
                    <div className="flex-1" />

                    {/* Bottom: Names + Clean Guest Pill + Sleek Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 w-full max-w-xs space-y-4 pb-2"
                    >
                        {/* Couple Names */}
                        <div className="space-y-1">
                            <h2 className="font-khmer-moul text-2xl sm:text-3xl text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] tracking-wide">
                                {groomName}
                            </h2>
                            <p className="text-xs text-rose-300 font-bold font-kantumruy drop-shadow-md">&</p>
                            <h2 className="font-khmer-moul text-2xl sm:text-3xl text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] tracking-wide">
                                {brideName}
                            </h2>
                        </div>

                        {/* Clean One-Line Guest Pill */}
                        <div className="text-xs sm:text-sm text-white/95 bg-[#380C1B]/80 backdrop-blur-xl border border-rose-300/30 px-4 py-2 rounded-full font-kantumruy shadow-lg drop-shadow-md">
                            <span className="text-rose-200/80 mr-1.5 font-light">សូមគោរពអញ្ជើញ៖</span>
                            <span className="font-bold text-white">{guestName || "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី"}</span>
                        </div>

                        {/* Ultra Clean Sleek Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpen();
                            }}
                            className="w-full py-3.5 px-6 rounded-full font-bold font-kantumruy text-white bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-400 hover:to-pink-400 active:scale-95 transition-all text-sm shadow-[0_4px_25px_rgba(244,63,94,0.35)] flex items-center justify-center gap-2 animate-pulse"
                        >
                            <span>✨ សូមចុចបើកធៀប</span>
                        </button>

                        <p className="text-[10px] text-rose-200/70 font-kantumruy tracking-wider">
                            (ចុចត្រង់ណាក៏បាន ឬ អូសឡើងលើដើម្បីបើក)
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

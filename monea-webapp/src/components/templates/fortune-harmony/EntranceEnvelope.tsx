import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const heroImage = wedding.themeSettings?.heroImage || wedding.galleryItems?.[0]?.url || '/assets/fortune-harmony/fortune-crimson-bg.jpg';

    return (
        <AnimatePresence>
            {!revealed && (
                <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    onClick={onOpen}
                    onTouchEnd={onOpen}
                    className="fixed inset-0 z-[100] flex flex-col justify-between items-center p-6 py-10 text-center select-none overflow-hidden bg-[#3B070E] cursor-pointer"
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
                        className="relative z-10 pt-2 flex items-center justify-center gap-2"
                    >
                        <span className="text-amber-300 text-xs font-bold font-serif">囍</span>
                        <h1 className="font-khmer-moul text-base sm:text-lg text-amber-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wider">
                            {isEngagement ? "សិរីមង្គលពិធីភ្ជាប់ពាក្យ" : "សិរីមង្គលអាពាហ៍ពិពាហ៍"}
                        </h1>
                        <span className="text-amber-300 text-xs font-bold font-serif">囍</span>
                    </motion.div>

                    {/* Middle: Open for couple photo */}
                    <div className="flex-1" />

                    {/* Bottom: Names + Khmer Moul Guest Pill + Imperial Gold Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 w-full max-w-xs space-y-4 pb-2"
                    >
                        {/* Couple Names in pure Khmer Moul */}
                        <div className="space-y-0.5">
                            <h2 className="font-khmer-moul text-2xl sm:text-3xl text-amber-100 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] tracking-wide">
                                {groomName}
                            </h2>
                            <p className="text-xs text-amber-300 font-khmer-moul drop-shadow-md">និង</p>
                            <h2 className="font-khmer-moul text-2xl sm:text-3xl text-amber-100 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] tracking-wide">
                                {brideName}
                            </h2>
                        </div>

                        {/* Clean One-Line Guest Pill in Khmer Moul */}
                        <div className="text-xs text-amber-100 bg-[#540913]/85 backdrop-blur-xl border border-amber-300/40 px-4 py-2.5 rounded-2xl font-khmer-moul shadow-lg drop-shadow-md">
                            <span className="text-amber-300/80 mr-1.5">សូមគោរពអញ្ជើញ៖</span>
                            <span className="text-amber-100">{guestName || "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី"}</span>
                        </div>

                        {/* Imperial Gold Ingot Button in Khmer Moul */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpen();
                            }}
                            className="w-full py-4 px-6 rounded-2xl font-khmer-moul text-[#540913] bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 hover:from-amber-200 hover:to-yellow-200 active:scale-95 transition-all text-xs sm:text-sm tracking-wider shadow-[0_4px_25px_rgba(217,119,6,0.45)] flex items-center justify-center gap-2 border-2 border-amber-200 animate-pulse"
                        >
                            <span>✨ សូមចុចបើកធៀប</span>
                        </button>

                        <p className="text-[10px] text-amber-200/70 font-kantumruy tracking-wider">
                            (ចុចត្រង់ណាក៏បាន ឬ អូសឡើងលើដើម្បីបើក)
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

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
    const heroImage = wedding.themeSettings?.heroImage || wedding.galleryItems?.[0]?.url || '/assets/emerald-garden/emerald-garden-bg.jpg';

    return (
        <AnimatePresence>
            {!revealed && (
                <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    className="fixed inset-0 z-[100] flex flex-col justify-between items-center p-6 py-10 text-center select-none overflow-hidden bg-[#071710]"
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

                    {/* Top: Delicate Title */}
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 pt-2"
                    >
                        <h1 className="font-khmer-moul text-base sm:text-lg text-emerald-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wider">
                            {isEngagement ? "សិរីមង្គលពិធីភ្ជាប់ពាក្យ" : "សិរីមង្គលអាពាហ៍ពិពាហ៍"}
                        </h1>
                    </motion.div>

                    {/* Middle: Open for couple photo */}
                    <div className="flex-1" />

                    {/* Bottom: Names + Khmer Moul Guest Pill + Emerald Jade Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 w-full max-w-xs space-y-4 pb-2"
                    >
                        {/* Couple Names in Khmer Moul */}
                        <div className="space-y-0.5">
                            <h2 className="font-khmer-moul text-2xl sm:text-3xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] tracking-wide">
                                {groomName}
                            </h2>
                            <p className="text-xs text-emerald-300 font-khmer-moul drop-shadow-md">និង</p>
                            <h2 className="font-khmer-moul text-2xl sm:text-3xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] tracking-wide">
                                {brideName}
                            </h2>
                        </div>

                        {/* Clean One-Line Guest Pill in Khmer Moul */}
                        <div className="text-xs text-emerald-100 bg-[#0B251B]/85 backdrop-blur-xl border border-emerald-300/40 px-4 py-2.5 rounded-2xl font-khmer-moul shadow-lg drop-shadow-md">
                            <span className="text-emerald-300/80 mr-1.5">សូមគោរពអញ្ជើញ៖</span>
                            <span className="text-white">{guestName || "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី"}</span>
                        </div>

                        {/* Emerald Jade Button */}
                        <button
                            onClick={onOpen}
                            className="w-full py-4 px-6 rounded-2xl font-khmer-moul text-white bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-700 hover:from-emerald-600 hover:to-teal-600 active:scale-95 transition-all text-xs sm:text-sm tracking-wider shadow-[0_4px_25px_rgba(5,150,105,0.4)] flex items-center justify-center gap-2 border border-emerald-400/50"
                        >
                            <span>✨ សូមចុចបើកធៀប</span>
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

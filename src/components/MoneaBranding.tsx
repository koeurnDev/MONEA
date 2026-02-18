"use client";
import { motion } from 'framer-motion';

export const MoneaBranding = () => (
    <div className="flex flex-col items-center group cursor-default">
        {/* Animated Icon */}
        <motion.div
            className="relative w-16 h-16 flex items-center justify-center"
            initial="initial"
            whileHover="hover"
        >
            {/* Background Decorative Ring */}
            <motion.div
                variants={{
                    initial: { rotate: 0, opacity: 0.3, scale: 0.8 },
                    hover: { rotate: 180, opacity: 0.6, scale: 1.1 }
                }}
                className="absolute inset-0 border-2 border-dashed border-amber-400 rounded-full"
            />

            {/* Main Circle */}
            <div className="relative w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border border-amber-100">
                <span className="text-2xl font-serif italic font-bold bg-clip-text text-transparent bg-gradient-to-br from-amber-500 to-amber-700">
                    M
                </span>
            </div>

            {/* Floating Sparkles */}
            <motion.div
                animate={{ y: [0, -5, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 right-2 text-amber-500 text-xs"
            >
                ✦
            </motion.div>
        </motion.div>

        {/* Text Section */}
        <div className="mt-2 text-center">
            <h2 className="text-xl font-light tracking-[0.4em] text-slate-800 font-serif ml-[0.4em]">
                MONEA
            </h2>
            <div className="flex items-center gap-2 mt-1 justify-center">
                <div className="h-[0.5px] w-8 bg-slate-300" />
                <span className="text-[10px] font-medium text-amber-600 tracking-[0.2em] uppercase">
                    Wedding Digital
                </span>
                <div className="h-[0.5px] w-8 bg-slate-300" />
            </div>

            <p className="text-[9px] font-moul text-slate-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                មនោសញ្ចេតនាឌីជីថល
            </p>
        </div>
    </div>
);
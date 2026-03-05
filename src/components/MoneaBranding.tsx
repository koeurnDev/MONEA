"use client";
import { m } from 'framer-motion';

export const MoneaBranding = () => (
    <div className="flex flex-col items-center group cursor-default">
        {/* Animated Icon / Logo Container */}
        <m.div
            className="relative w-24 h-24 flex items-center justify-center"
            initial="initial"
            whileHover="hover"
        >
            {/* Background Decorative Ring */}
            <m.div
                variants={{
                    initial: { rotate: 0, opacity: 0.1, scale: 0.9 },
                    hover: { rotate: 180, opacity: 0.3, scale: 1.1 }
                }}
                className="absolute inset-0 border-2 border-dashed border-sage-200 rounded-full"
            />

            {/* Main Logo Image */}
            <div className="relative w-20 h-20 flex items-center justify-center p-2">
                <img
                    src="/logo.png"
                    alt="MONEA Logo"
                    className="w-full h-full object-contain drop-shadow-sm"
                />
            </div>

            {/* Floating Sparkles */}
            <m.div
                animate={{ y: [0, -5, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-2 right-4 text-peach-400 text-xs"
            >
                ✦
            </m.div>
        </m.div>

        {/* Tagline Section */}
        <div className="mt-1 text-center">
            <div className="flex items-center gap-3 justify-center">
                <div className="h-[0.5px] w-10 bg-slate-200" />
                <span className="text-[11px] font-medium text-slate-500 tracking-[0.3em] uppercase">
                    Digital Experience
                </span>
                <div className="h-[0.5px] w-10 bg-slate-200" />
            </div>

            <p className="text-[10px] font-moul text-slate-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                មនោសញ្ចេតនាឌីជីថល
            </p>
        </div>
    </div>
);

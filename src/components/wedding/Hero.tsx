"use client";
import { AnimatePresence, m } from "framer-motion";

import * as React from "react";

interface HeroProps {
    groomName: string;
    brideName: string;
    weddingDate: Date | string;
}

export default function Hero({ groomName, brideName, weddingDate }: HeroProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <section className="relative h-screen flex flex-col items-center justify-center text-white overflow-hidden">
            {/* Background Image Placeholder - In real app, this should come from DB or default */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat will-change-transform"
                style={{ backgroundImage: "url('/wedding-bg-dark.jpg')" }} // Ensure this image exists or fallback
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            </div>

            <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="z-20 text-center px-4"
            >
                <h2 className="text-pink-400 text-lg sm:text-xl mb-4 font-kantumruy tracking-wide drop-shadow-md text-wedding-title">
                    សិរីសួស្តីអាពាហ៍ពិពាហ៍
                </h2>

                <div className="flex flex-col items-center gap-2 mb-6">
                    <h1 className="text-5xl sm:text-7xl font-kantumruy text-white drop-shadow-lg leading-tight text-wedding-title">
                        {groomName}
                    </h1>
                    <span className="text-4xl font-serif text-pink-500 italic">&</span>
                    <h1 className="text-5xl sm:text-7xl font-kantumruy text-white drop-shadow-lg leading-tight text-wedding-title">
                        {brideName}
                    </h1>
                </div>

                <div className="inline-block border-t border-b border-pink-500/50 py-2 px-8">
                    <p className="uppercase tracking-[0.3em] text-xs sm:text-sm text-gray-300 font-siemreap">
                        {mounted ? new Date(weddingDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            timeZone: 'Asia/Phnom_Penh'
                        }) : '...'}
                    </p>
                </div>
            </m.div>

            {/* Scroll Indicator */}
            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 z-20 animate-bounce"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-pink-500 to-transparent mx-auto"></div>
            </m.div>
        </section>
    );
}

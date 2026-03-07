"use client";
import React from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { CldImage } from 'next-cloudinary';
import { WeddingData } from "../types";

export default function Hero({ wedding }: { wedding: WeddingData }) {
    const { scrollY } = useScroll();
    const yParallax = useTransform(scrollY, [0, 500], [0, 200]);
    const opacityParallax = useTransform(scrollY, [0, 300], [1, 0]);

    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    const y = isMobile ? 0 : yParallax;
    const opacity = isMobile ? 1 : opacityParallax;

    return (
        <section className="relative h-screen overflow-hidden flex items-center justify-center text-center">
            {/* Parallax Background */}
            <m.div
                style={{ y }}
                className="absolute inset-0 z-0"
            >
                <div className="absolute inset-0 bg-black/40 z-10" />
                {wedding.themeSettings?.heroImage?.startsWith('http') ? (
                    <img src={wedding.themeSettings.heroImage} alt="Couple" className="w-full h-full object-cover" />
                ) : wedding.themeSettings?.heroImage ? (
                    <CldImage src={wedding.themeSettings.heroImage} alt="Couple" fill className="object-cover" sizes="100vw" priority />
                ) : (
                    <Image
                        src="/templates/enchanted/bg-main.jpg"
                        alt="Enchanted Forest"
                        fill
                        priority
                        className="object-cover"
                    />
                )}
            </m.div>

            {/* Content */}
            <m.div
                style={{ opacity }}
                className="relative z-10 px-6 max-w-4xl mx-auto"
            >
                <m.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="font-vibes text-[#D4AF37] text-3xl md:text-5xl mb-6 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                >
                    Save The Date
                </m.p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-10 md:mb-8">
                    <m.h1
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="font-cinzel text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white font-bold tracking-widest drop-shadow-lg"
                    >
                        {wedding.groomName}
                    </m.h1>
                    <m.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 1 }}
                        className="font-vibes text-3xl md:text-4xl text-[#D4AF37]"
                    >
                        &
                    </m.span>
                    <m.h1
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="font-cinzel text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white font-bold tracking-widest drop-shadow-lg"
                    >
                        {wedding.brideName}
                    </m.h1>
                </div>

                <m.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="inline-block border-y border-[#D4AF37]/50 py-2 px-8"
                >
                    <p className="font-cormorant text-xl md:text-2xl text-gray-200 tracking-[0.3em] uppercase">
                        {new Date(wedding.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </m.div>

                <h2 className="text-lg md:text-xl text-white/90 mt-8 drop-shadow-md text-wedding-title">
                    កូនប្រុស និង កូនស្រី
                </h2>
            </m.div>

            {/* Scroll Indicator */}
            <m.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-10 z-10 text-white/50"
            >
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent mx-auto"></div>
            </m.div>
        </section>
    );
}

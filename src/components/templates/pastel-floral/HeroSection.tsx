import React from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { WeddingData } from "../types";
import { THEME } from './shared';

interface HeroSectionProps {
    wedding: WeddingData;
    labels: any;
}

export default function HeroSection({ wedding, labels }: HeroSectionProps) {
    const heroImage = wedding.themeSettings?.heroImage;

    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-stone-50">
            {/* Creative Background Image with Mask/Clip-path */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.div
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="w-full h-full relative"
                >
                    {heroImage ? (
                        heroImage.startsWith('http') ? (
                            <img
                                src={heroImage}
                                alt="Hero"
                                className="w-full h-full object-cover"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)' }}
                            />
                        ) : (
                            <div className="w-full h-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)' }}>
                                <CldImage src={heroImage} alt="Hero" fill className="object-cover" priority sizes="100vw" />
                            </div>
                        )
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)' }}></div>
                </motion.div>
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-[url('/wedding_assets/floral-corner-tl.png')] bg-contain bg-no-repeat opacity-40 pointer-events-none z-10 animate-pulse"></div>

            {/* Content with Glass Effect and Staggered Reveal */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative z-20 text-center text-white px-6 w-full max-w-2xl mx-auto"
            >
                <div className="bg-black/10 backdrop-blur-[2px] p-10 md:p-16 rounded-full inline-block border border-white/10 shadow-2xl">
                    <motion.h2
                        initial={{ opacity: 0, letterSpacing: '0.1em' }}
                        animate={{ opacity: 1, letterSpacing: '0.4em' }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="tracking-[0.4em] uppercase mb-6 text-xs md:text-sm font-bold text-[#FFE4E1] drop-shadow-lg"
                    >
                        {labels.invite_title}
                    </motion.h2>

                    <div className="mb-10">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1 }}
                            className="text-6xl md:text-8xl font-script mb-2 drop-shadow-2xl leading-tight"
                        >
                            {wedding.groomName}
                        </motion.h1>
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 1.5 }}
                            className="text-4xl md:text-5xl font-serif italic text-[#D4AF37] block my-4"
                        >
                            &
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1.2 }}
                            className="text-6xl md:text-8xl font-script mt-2 drop-shadow-2xl leading-tight"
                        >
                            {wedding.brideName}
                        </motion.h1>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 1, delay: 1.8 }}
                        className="inline-block border-y border-white/40 py-3 px-10"
                    >
                        <p className="tracking-[0.2em] text-sm md:text-lg font-serif uppercase text-white/90">
                            {new Date(wedding.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 flex flex-col items-center gap-3"
                animate={{ y: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Discover</span>
                <div className="w-px h-16 bg-gradient-to-b from-[#D4AF37] via-white to-transparent"></div>
            </motion.div>
        </section>
    );
}

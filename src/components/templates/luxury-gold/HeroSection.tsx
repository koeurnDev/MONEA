import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { WeddingData } from "../types";

interface HeroSectionProps {
    wedding: WeddingData;
    labels: any;
    addToCalendarUrl: string;
}

export default function HeroSection({ wedding, labels, addToCalendarUrl }: HeroSectionProps) {
    const { scrollYProgress } = useScroll();
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    const fadeInUp = {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.8, ease: "easeOut" as any }
    };

    const heroImage = wedding.themeSettings?.heroImage;

    return (
        <motion.section style={{ opacity: opacityHero }} className="relative h-screen flex flex-col items-center justify-end pb-24 text-center overflow-hidden">
            <div className="absolute inset-0 bg-black/40 z-10 transition-opacity duration-1000"></div>
            {heroImage && (
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 20 }} // Subtle zoom out
                    className="absolute inset-0 z-0"
                >
                    {heroImage.startsWith('http') ? (
                        <img src={heroImage} alt="Couple" className="w-full h-full object-cover" />
                    ) : (
                        <CldImage src={heroImage} alt="Couple" fill className="object-cover" sizes="100vw" config={{ url: { analytics: false } }} />
                    )}
                </motion.div>
            )}

            <div className="relative z-20 p-6 w-full pt-32 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent">
                <motion.div {...fadeInUp}>
                    <h2 className="text-[#D4AF37] tracking-[0.3em] text-sm uppercase mb-4 font-header drop-shadow-md">{labels.invite_main}</h2>

                    <div className="relative inline-block mb-8">
                        {/* Gold Gradient Text Effect */}
                        <h1 className="text-5xl md:text-6xl text-wedding-title mb-3 leading-relaxed drop-shadow-sm animate-shine">
                            {wedding.groomName}
                        </h1>
                        <span className="text-5xl font-greatvibes text-[#D4AF37] block my-1">&</span>
                        <h1 className="text-5xl md:text-6xl text-wedding-title leading-relaxed drop-shadow-sm animate-shine">
                            {wedding.brideName}
                        </h1>
                    </div>

                    <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent mx-auto my-6 opacity-50"></div>

                    <div className="flex flex-col gap-2 font-khmer text-[#F3E5AB]/90">
                        <p className="text-xl tracking-wide font-medium">
                            {new Date(wedding.date).toLocaleDateString('km-KH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-sm opacity-80 font-light border-y border-[#D4AF37]/30 py-2 inline-block mx-auto px-6 mt-2 tracking-wider">
                            {wedding.themeSettings?.lunarDate || "១២កើត ខែផល្គុន ឆ្នាំរោង ឆស័ក ព.ស. ២៥៦៩"}
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-10 px-8 py-3 bg-gradient-to-r from-[#BF953F] to-[#b38728] text-white text-xs font-bold uppercase tracking-[0.2em] hover:brightness-110 transition-all rounded-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] font-header"
                        onClick={() => window.open(addToCalendarUrl, '_blank')}
                    >
                        រក្សាទុកកាលបរិច្ឆេទ
                    </motion.button>
                </motion.div>
            </div>
        </motion.section>
    );
}

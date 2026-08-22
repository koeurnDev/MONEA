"use client";
import React from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import { WeddingData } from "../types";
import Image from 'next/image';

export const ThankYouSection = ({ wedding }: { wedding: WeddingData }) => {
    const ref = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    
    // Parallax effect for the thank you image
    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    // Try to get a nice image for the thank you section (prefer the last gallery item, or fallback)
    const images = wedding.galleryItems || [];
    const imageUrl = images.length > 0 ? images[images.length - 1].url : (wedding.themeSettings?.heroImage || '/images/templates/modern-minimal/hero.jpg');

    return (
        <section ref={ref} className="relative h-screen min-h-[600px] w-full overflow-hidden flex items-center justify-center">
            {/* Background Parallax Image */}
            <m.div style={{ y }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
                <Image 
                    src={imageUrl}
                    alt="Thank You"
                    fill
                    className="object-cover object-center filter grayscale-[40%] brightness-75"
                />
            </m.div>

            {/* Dark Overlay for Text Readability */}
            <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />

            {/* Content */}
            <m.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="relative z-10 text-center px-6 max-w-3xl flex flex-col items-center"
            >
                <div className="w-px h-16 md:h-24 bg-white/30 mb-8" />
                
                <h2 className="text-4xl md:text-6xl font-khmer-moul text-[#D4AF37] leading-tight mb-6 drop-shadow-lg">
                    សូមអំណរគុណ
                </h2>
                
                <p className="text-[13px] md:text-base font-kantumruy text-white/90 tracking-wide font-light max-w-2xl leading-relaxed md:leading-loose">
                    យើងខ្ញុំសូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅបំផុតចំពោះវត្តមានរបស់អ្នកក្នុងពិធីនេះ និងសូមជូនពរឱ្យទទួលបាននូវពុទ្ធពរទាំងបួនប្រការគឺ៖ អាយុ វណ្ណៈ សុខៈ ពលៈ កុំបីឃ្លៀងឃ្លាតឡើយ។
                </p>
                <p className="text-sm font-kantumruy text-white/50 mt-4 tracking-widest uppercase">
                    Thank You
                </p>

                <div className="w-px h-16 md:h-24 bg-white/30 mt-12" />
            </m.div>
        </section>
    );
};

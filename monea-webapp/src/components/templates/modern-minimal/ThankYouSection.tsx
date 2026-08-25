import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";

export const ThankYouSection = ({ wedding }: { wedding: WeddingData }) => {
    const images = (wedding.galleryItems || []).filter(i => i?.url);
    const imageUrl = images.length > 0 
        ? images[images.length - 1].url 
        : (wedding.themeSettings?.heroImage || "/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg");

    return (
        <section className="relative h-screen min-h-[550px] w-full overflow-hidden flex items-center justify-center bg-slate-950">
            {/* Background Image with Zoom In Transition */}
            <m.div 
                initial={{ scale: 1.08, opacity: 0.8 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full"
            >
                <img 
                    src={imageUrl}
                    alt="Thank You" 
                    className="w-full h-full object-cover object-center filter grayscale-[30%] brightness-75"
                />
            </m.div>

            {/* Dark Overlay for Text Readability */}
            <div className="absolute inset-0 bg-slate-950/60" />
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-slate-950/80 to-transparent" />

            {/* Content */}
            <m.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="relative z-10 text-center px-6 max-w-3xl flex flex-col items-center w-full"
            >
                <div className="w-px h-16 md:h-20 bg-white/30 mb-6" />
                
                <h2 className="text-3xl md:text-5xl font-khmer-moul text-[#D4AF37] leading-tight mb-6 drop-shadow-md">
                    សូមអំណរគុណ
                </h2>
                
                <p className="text-xs md:text-sm font-kantumruy text-white/90 tracking-wide font-light max-w-2xl leading-relaxed md:leading-loose">
                    យើងខ្ញុំសូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅបំផុតចំពោះវត្តមានរបស់អ្នកក្នុងពិធីនេះ និងសូមជូនពរឱ្យទទួលបាននូវពុទ្ធពរទាំងបួនប្រការគឺ៖ អាយុ វណ្ណៈ សុខៈ ពលៈ កុំបីឃ្លៀងឃ្លាតឡើយ។
                </p>

                <div className="mt-8 pt-6 border-t border-white/20 flex flex-col items-center">
                    <span className="font-playfair text-xl md:text-2xl text-white font-bold tracking-widest uppercase">
                        {wedding.groomName} &amp; {wedding.brideName}
                    </span>
                </div>
            </m.div>
        </section>
    );
};

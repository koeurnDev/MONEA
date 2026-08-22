"use client";
import React from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

export const ParallaxDivider = ({ imageUrl, text }: { imageUrl: string, text?: string }) => {
    const ref = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    
    // Move the image slightly slower than the scroll to create parallax
    const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

    if (!imageUrl) return null;

    return (
        <section ref={ref} className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden flex items-center justify-center">
            <m.div style={{ y }} className="absolute inset-0 w-full h-[130%] -top-[15%]">
                <Image 
                    src={imageUrl}
                    alt="Divider"
                    fill
                    className="object-cover object-center filter grayscale-[30%] brightness-[0.8]"
                />
            </m.div>
            <div className="absolute inset-0 bg-slate-900/20" />
            
            {text && (
                <m.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="relative z-10"
                >
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-[0.3em] uppercase drop-shadow-xl">
                        {text}
                    </h2>
                </m.div>
            )}
        </section>
    );
};

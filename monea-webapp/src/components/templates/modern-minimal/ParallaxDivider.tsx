import React from 'react';
import { m } from 'framer-motion';

export const ParallaxDivider = ({ imageUrl, text }: { imageUrl: string, text?: string }) => {
    return (
        <section className="relative h-[35vh] md:h-[50vh] w-full overflow-hidden flex items-center justify-center bg-slate-900">
            {imageUrl && (
                <m.div 
                    initial={{ scale: 1.06 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 1.2 }}
                    className="absolute inset-0 w-full h-full"
                >
                    <img 
                        src={imageUrl}
                        alt="Divider" 
                        className="w-full h-full object-cover object-center filter grayscale-[25%] brightness-[0.75]"
                    />
                </m.div>
            )}
            <div className="absolute inset-0 bg-slate-900/30" />
            
            {text && (
                <m.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="relative z-10 text-center px-4 w-full flex items-center justify-center"
                >
                    <h2 className="text-base sm:text-2xl md:text-4xl font-black text-white tracking-[0.15em] sm:tracking-[0.25em] md:tracking-[0.3em] uppercase drop-shadow-2xl font-playfair whitespace-nowrap">
                        {text}
                    </h2>
                </m.div>
            )}
        </section>
    );
};

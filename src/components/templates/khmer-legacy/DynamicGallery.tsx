"use client";

import { m, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { WeddingData } from '../types';
import { RevealSection, CinematicPlaceholder } from '../shared/CinematicComponents';

interface DynamicGalleryProps {
    wedding: WeddingData;
    galleryImages: string[];
    dynamicPool: string[];
    preWeddingPan1: any;
    preWeddingPan2: any;
    preWeddingPan3: any;
    preWeddingPan4: any;
    preWeddingPan5: any;
    preWeddingPan6: any;
}

export function DynamicGallery({ 
    wedding, 
    galleryImages,
    dynamicPool,
    preWeddingPan1,
    preWeddingPan2,
    preWeddingPan3,
    preWeddingPan4,
    preWeddingPan5,
    preWeddingPan6
}: DynamicGalleryProps) {
    const containerRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const yLeft = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const yRight = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const yCenter = useTransform(scrollYProgress, [0, 1], [0, -50]);

    const pans = [preWeddingPan1, preWeddingPan2, preWeddingPan3, preWeddingPan4, preWeddingPan5, preWeddingPan6];
    
    if (wedding.themeSettings?.galleryStyle === 'slider') {
        // ... [Slider logic remains the same]
        return (
            <section id="gallery-sections" className="py-32 md:py-64 px-6 md:px-12 bg-white relative">
                <div className="max-w-7xl mx-auto space-y-32 md:space-y-48">
                    <RevealSection>
                        <div className="text-center space-y-8">
                            <div className="h-[1px] w-24 bg-gold/10 mx-auto" />
                            <h2 className="font-playfair text-4xl md:text-6xl font-black italic text-gray-800 tracking-tighter">Golden Memories</h2>
                            <p className="font-serif-elegant text-sm text-gold/40 tracking-[0.5em] uppercase">Private Gallery</p>
                        </div>
                    </RevealSection>
                    <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-12 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                        {dynamicPool.map((img, idx) => (
                            <m.div
                                key={idx}
                                className="flex-shrink-0 w-[85%] md:w-[450px] aspect-[3/4] snap-center rounded-sm overflow-hidden border-lux shadow-2xl bg-white relative"
                            >
                                <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} loading="eager" />
                            </m.div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (wedding.themeSettings?.galleryStyle === 'polaroid') {
        // ... [Polaroid logic remains the same]
        return (
            <section id="gallery-sections" className="py-32 md:py-64 px-6 md:px-12 bg-white relative">
                <div className="max-w-7xl mx-auto space-y-32 md:space-y-48">
                    <RevealSection>
                        <div className="text-center space-y-8">
                            <div className="h-[1px] w-24 bg-gold/10 mx-auto" />
                            <h2 className="font-khmer-moul text-3xl md:text-5xl text-gold-gradient leading-relaxed">រូបភាពអនុស្សាវរីយ៍</h2>
                            <p className="font-khmer text-[10px] md:text-xs text-gold/40 tracking-[0.4em] uppercase font-bold">អនុស្សាវរីយ៍ផ្អែមល្ហែម</p>
                        </div>
                    </RevealSection>
                    <div className="space-y-32 flex flex-col items-center">
                        {dynamicPool.length > 0 && (
                            <div className="w-full">
                                <div className="text-center mb-16">
                                    <h3 className="font-playfair text-3xl italic text-gray-700">The Pre-Wedding</h3>
                                    <div className="w-12 h-[1px] bg-gold/10 mx-auto mt-6" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 px-2 pb-10">
                                    {dynamicPool.map((img, idx) => (
                                        <m.div
                                            key={idx}
                                            initial={{ rotate: idx % 2 === 0 ? -3 : 3 }}
                                            whileInView={{ rotate: idx % 2 === 0 ? -1 : 1 }}
                                            className="bg-white p-2 md:p-4 pt-2 md:pt-4 pb-8 md:pb-16 shadow-xl md:shadow-2xl border border-gray-100 rounded-sm relative min-h-[100px] flex items-center justify-center bg-gold/5 overflow-hidden"
                                        >
                                            <img 
                                                src={img} 
                                                className={`w-full h-48 md:h-80 object-cover ${pans[idx % pans.length]?.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-105 transition-all'}`} 
                                                style={{ 
                                                    objectPosition: `${pans[idx % pans.length]?.localX} ${pans[idx % pans.length]?.localY}`,
                                                    userSelect: 'none',
                                                    touchAction: 'none'
                                                }}
                                                onMouseDown={pans[idx % pans.length]?.onStart}
                                                onTouchStart={pans[idx % pans.length]?.onStart}
                                                draggable={false}
                                                alt={`Gallery ${idx}`} 
                                            />
                                        </m.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    // Default Editorial Style with PARALLAX
    return (
        <section ref={containerRef} id="gallery-sections" className="py-32 md:py-64 px-6 md:px-12 bg-white relative overflow-hidden">
            {/* LUXURY OVERLAYS */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 blur-[150px] pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-32 md:space-y-48 relative z-10">
                <RevealSection>
                    <div className="text-center space-y-8">
                        <div className="h-[1px] w-24 bg-gold/10 mx-auto" />
                        <h2 className="font-khmer-moul text-4xl md:text-6xl text-gold-gradient drop-shadow-sm leading-relaxed">កម្រងរូបភាពអនុស្សាវរីយ៍</h2>
                        <p className="font-khmer text-xs md:text-sm text-gold/40 tracking-[0.4em] uppercase font-bold">រូបភាពដែលមិនអាចបំភ្លេចបាន</p>
                    </div>
                </RevealSection>

                <div className="space-y-24 md:space-y-48">
                    {/* Render images in blocks of 6 to maintain the masonry pattern */}
                    {Array.from({ length: Math.ceil(dynamicPool.length / 6) }).map((_, blockIdx) => {
                        const startIndex = blockIdx * 6;
                        const blockImages = dynamicPool.slice(startIndex, startIndex + 6);
                        
                        return (
                            <div key={blockIdx} className="space-y-16 md:space-y-24">
                                <div className="text-center mb-16 md:mb-24 px-4">
                                    <h3 className="font-khmer-moul text-xl md:text-3xl text-gray-700 font-light tracking-wide">
                                        {blockIdx === 0 ? "រូបថតមុនអាពាហ៍ពិពាហ៍" : blockIdx === 1 ? "រូបភាពអនុស្សាវរីយ៍" : "ជំពូកទី " + (blockIdx + 1)}
                                    </h3>
                                    <div className="w-12 md:w-16 h-[1px] bg-gold/20 mx-auto mt-6 md:mt-8" />
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-16 px-4 md:px-1">
                                    {blockImages.map((img, idx) => {
                                        const globalIdx = startIndex + idx;
                                        let spanClass = "col-span-1 aspect-[3/4]";
                                        let yOffset = yCenter;
                                        
                                        // Pattern applies within each block of 6
                                        if (idx === 0) {
                                            spanClass = "col-span-2 md:col-span-2 aspect-[4/3] md:aspect-video";
                                            yOffset = yLeft;
                                        } else if (idx === 1) {
                                            yOffset = yRight;
                                            spanClass = "col-span-1 aspect-[3/4]";
                                        } else if (idx === 2) {
                                            yOffset = yCenter;
                                            spanClass = "col-span-1 aspect-[3/4]";
                                        } else if (idx === 3) {
                                            yOffset = yLeft;
                                            spanClass = "col-span-1 aspect-[3/4]";
                                        } else if (idx === 4) {
                                            yOffset = yRight;
                                            spanClass = "col-span-1 md:col-span-1 aspect-[3/4]";
                                        } else if (idx === 5) {
                                            spanClass = "col-span-2 md:col-span-3 aspect-[16/9] md:aspect-[21/9]";
                                            yOffset = yCenter;
                                        }

                                        return (
                                            <m.div
                                                key={globalIdx}
                                                style={{ y: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : yOffset }}
                                                className={`relative z-10 ${spanClass}`}
                                            >
                                                <RevealSection
                                                    delay={0.1 + (idx % 3) * 0.1}
                                                    className="w-full h-full border-lux bg-white shadow-xl md:shadow-2xl relative overflow-hidden rounded-sm"
                                                >
                                                    <m.img
                                                        src={img}
                                                        whileHover={{ scale: 1.05 }}
                                                        transition={{ duration: 0.8 }}
                                                        className={`w-full h-full object-cover ${pans[globalIdx % pans.length]?.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} 
                                                        style={{ 
                                                            objectPosition: `${pans[globalIdx % pans.length]?.localX} ${pans[globalIdx % pans.length]?.localY}`,
                                                            userSelect: 'none',
                                                            touchAction: 'none'
                                                        }}
                                                        onMouseDown={pans[globalIdx % pans.length]?.onStart}
                                                        onTouchStart={pans[globalIdx % pans.length]?.onStart}
                                                        draggable={false}
                                                        alt={`Gallery ${globalIdx}`}
                                                    />
                                                </RevealSection>
                                            </m.div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

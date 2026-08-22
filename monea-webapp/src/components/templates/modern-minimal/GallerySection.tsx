"use client";
import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import Image from "next/image";

export const GallerySection = ({ wedding }: { wedding: WeddingData }) => {
    const images = wedding.galleryItems || [];

    if (images.length === 0) return null;

    return (
        <section className="py-24 md:py-32 bg-slate-50 relative">
            <div className="max-w-7xl mx-auto px-2 md:px-8">
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-24 text-center flex flex-col items-center"
                >
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 uppercase">
                        The Gallery
                    </h2>
                    <div className="w-12 h-1 bg-slate-900 mt-6" />
                </m.div>

                <div className="columns-2 md:columns-3 lg:columns-4 gap-2 md:gap-6 space-y-2 md:space-y-6">
                    {images.map((image, idx) => {
                        // Vary the aspect ratio based on index to create a masonry effect
                        const aspectClass = idx % 5 === 0 ? "aspect-[3/5]" 
                                          : idx % 3 === 0 ? "aspect-square" 
                                          : idx % 2 === 0 ? "aspect-[4/5]" 
                                          : "aspect-[3/4]";
                        
                        return (
                            <m.div
                                key={image.publicId || idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: (idx % 3) * 0.1 }}
                                viewport={{ once: true }}
                                className={`relative w-full overflow-hidden group bg-slate-200 break-inside-avoid ${aspectClass}`}
                            >
                                <Image
                                    src={image.url}
                                    alt="Gallery"
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105 filter grayscale-[20%]"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                            </m.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

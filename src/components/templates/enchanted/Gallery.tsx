import React from 'react';
import { motion } from 'framer-motion';
import { WeddingData } from "../types";
import { CldImage } from 'next-cloudinary';
import { ZoomIn } from 'lucide-react';
import { cn } from "@/lib/utils";

interface GalleryProps {
    wedding: WeddingData;
    onImageClick?: (index: number) => void;
}

export default function Gallery({ wedding, onImageClick }: GalleryProps) {
    // Mock data if no real data
    const galleryItems = wedding?.galleryItems?.filter(i => i.type === 'IMAGE').map(i => i.url) || [
        "/images/couple.jpg", "/images/gallery1.jpg", "/images/gallery2.jpg", "/images/cover.jpg",
        "/images/bg_enchanted.jpg", "/images/bg_staircase.jpg"
    ];

    return (
        <section className="py-24 relative overflow-hidden" id="gallery">
            {/* Background */}
            <div className="absolute inset-0 bg-[#050A08] opacity-95 z-0"></div>
            <img src="/images/bg_enchanted.jpg" className="absolute inset-0 w-full h-full object-cover opacity-10 z-0 blur-sm" />

            <div className="relative z-10 container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <p className="font-vibes text-[#D4AF37] text-3xl md:text-4xl">Shared Moments</p>
                        <h3 className="font-cinzel text-4xl md:text-5xl text-white mt-2 drop-shadow-md">Our Gallery</h3>
                    </motion.div>
                </div>

                {/* Masonry Grid */}
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {galleryItems.map((src, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="break-inside-avoid relative group rounded-xl overflow-hidden border border-white/10 bg-white/5 cursor-pointer shadow-lg hover:shadow-[#D4AF37]/20 transition-all duration-300"
                            onClick={() => onImageClick?.(idx)}
                        >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all z-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <ZoomIn className="text-white drop-shadow-md w-8 h-8" />
                            </div>

                            {src.startsWith('/') ? (
                                <img src={src} alt={`Gallery ${idx}`} className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                            ) : (
                                <CldImage
                                    src={src}
                                    width={600}
                                    height={800}
                                    alt={`Gallery ${idx}`}
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

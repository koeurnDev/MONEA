import React from 'react';
import { motion } from 'framer-motion';
import { WeddingData } from "../types";
import { CldImage } from 'next-cloudinary';
import { cn } from './shared';

interface ThreePhotoSectionProps {
    wedding: WeddingData;
    imageOffset?: number;
    className?: string;
}

export default function ThreePhotoSection({ wedding, imageOffset = 0, className }: ThreePhotoSectionProps) {
    // Get all images
    const allImages = wedding.galleryItems?.filter(i => i.type === 'IMAGE').map(i => i.url) || [];

    // Default fallbacks if not enough images
    const defaultImages = [
        "/images/couple.jpg",
        "/images/gallery1.jpg",
        "/images/gallery2.jpg"
    ];

    // Get the specific 3 images based on offset
    // If not enough real images, fill with defaults
    const selectedImages = [
        allImages[imageOffset] || defaultImages[0],
        allImages[imageOffset + 1] || defaultImages[1],
        allImages[imageOffset + 2] || defaultImages[2]
    ];

    return (
        <section className={cn("py-16 relative", className)}>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {selectedImages.map((src, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: idx * 0.2 }}
                            viewport={{ once: true }}
                            className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-lg group"
                        >
                            {/* Frame / Border effect */}
                            <div className="absolute inset-0 border-[8px] border-white/20 z-10 pointer-events-none transition-colors group-hover:border-white/40"></div>

                            {src.startsWith('/') ? (
                                <img
                                    src={src}
                                    alt={`Gallery ${idx}`}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                            ) : (
                                <CldImage
                                    src={src}
                                    width={600}
                                    height={800}
                                    alt={`Gallery ${idx}`}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                            )}

                            {/* Subtle Overlay */}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

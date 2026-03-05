import React from 'react';
import { m } from 'framer-motion';
import { CldImage } from 'next-cloudinary';

interface GallerySectionProps {
    labels: any;
    galleryImages: string[];
    setSelectedImg: (index: number) => void;
}

export default function GallerySection({ labels, galleryImages, setSelectedImg }: GallerySectionProps) {
    return (
        <section className="py-24 px-0 md:px-4 bg-[#0a0a0a]">
            <div className="text-center mb-12">
                <h3 className="text-3xl font-header text-[#D4AF37] uppercase tracking-widest inline-block border-b-2 border-[#D4AF37] pb-2">{labels.gallery_title}</h3>
            </div>

            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-6 px-8 md:px-0 no-scrollbar pb-8 md:pb-0">
                {galleryImages.map((src, idx) => (
                    <m.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        className="snap-center shrink-0 w-[85vw] md:w-auto relative aspect-[3/4] border border-[#D4AF37]/20 p-1 bg-[#1a1a1a] will-change-transform"
                        onClick={() => setSelectedImg(idx)}
                    >
                        <div className="w-full h-full relative overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer">
                            <CldImage
                                src={src}
                                alt="Gallery"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                                config={{ url: { analytics: false } }}
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                        </div>
                    </m.div>
                ))}
            </div>
        </section>
    );
}

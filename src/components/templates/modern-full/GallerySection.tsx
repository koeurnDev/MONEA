import React from 'react';
import { m } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { cn } from './shared';

interface GallerySectionProps {
    galleryImages: string[];
    setSelectedImg: (index: number) => void;
}

export default function GallerySection({ galleryImages, setSelectedImg }: GallerySectionProps) {
    return (
        <section className="p-0 md:p-4">
            <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar px-4 md:px-0">
                {galleryImages.map((src, idx) => (
                    <m.div
                        key={idx}
                        whileHover={{ scale: 0.98 }}
                        onClick={() => setSelectedImg(idx)}
                        className={cn(
                            "shrink-0 w-[85vw] md:w-auto snap-center rounded-lg overflow-hidden shadow-md cursor-pointer aspect-[3/4] relative group transition-transform duration-500"
                        )}
                    >
                        {src.startsWith('http') || src.startsWith('/') ? (
                            <Image
                                src={src}
                                alt="Gallery"
                                fill
                                sizes="(max-width: 768px) 85vw, 33vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <CldImage
                                src={src}
                                alt="Gallery"
                                fill
                                sizes="(max-width: 768px) 85vw, 33vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                config={{ url: { analytics: false } }}
                            />
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </m.div>
                ))}
            </div>
        </section>
    );
}

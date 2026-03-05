import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { Heart } from 'lucide-react';

interface SweetMomentsSectionProps {
    wedding: WeddingData;
    imageOffset?: number;
    reverse?: boolean;
}

export default function SweetMomentsSection({ wedding, imageOffset = 0, reverse = false }: SweetMomentsSectionProps) {
    // Grid images (Need 6)
    const availableRaw = wedding.galleryItems?.filter(i => i.type === 'IMAGE').map(i => i.url) || [];
    const defaultImages = [
        "/images/gallery1.jpg", "/images/gallery2.jpg", "/images/cover.jpg",
        "/images/bg_enchanted.jpg", "/images/bg_staircase.jpg", "/images/gallery1.jpg"
    ];

    // Combine real + default to ensure we have at least 6
    // Apply Offset
    const rawImages = availableRaw.length > imageOffset ? availableRaw.slice(imageOffset) : [];

    const gridImages = [...rawImages, ...defaultImages].slice(0, 6);

    // Fallback hero if needed
    const heroImage = rawImages[0] || "/images/couple.jpg";

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">

                {/* 1. Header with Circle Image & Hearts */}
                <div className="flex justify-center items-center gap-4 md:gap-12 mb-12">
                    <m.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="hidden md:block"
                    >
                        <HeartSwirlLeft />
                    </m.div>

                    <m.div
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.3)] z-10"
                    >
                        {heroImage.startsWith('/') ? (
                            <Image src={heroImage} alt="Sweet Moment" fill className="object-cover" sizes="(max-width: 768px) 192px, 256px" />
                        ) : (
                            <CldImage src={heroImage} width={400} height={400} alt="Sweet Moment" className="w-full h-full object-cover" />
                        )}
                    </m.div>

                    <m.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="hidden md:block"
                    >
                        <HeartSwirlRight />
                    </m.div>
                </div>

                {/* 2. Floral Divider (Lavender Style) */}
                <div className="w-full h-12 mb-16 relative overflow-hidden opacity-80">
                    <div className="absolute inset-0 flex items-center justify-center space-x-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="relative h-full w-4" style={{ transform: `rotate(${i % 2 === 0 ? 10 : -10}deg)` }}>
                                <Image src="/images/lavender_sprig.png" alt="Lavender" fill className="object-contain opacity-60" />
                            </div>
                        ))}
                        {/* Fallback divider if image fails */}
                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent absolute top-1/2"></div>
                    </div>
                </div>

                {/* 3. Grid Layout: 3 Left | Heart | 3 Right */}
                <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center justify-center gap-8 md:gap-16`}>

                    {/* Left Column */}
                    <div className="space-y-6 flex flex-col items-center">
                        {gridImages.slice(0, 3).map((img, idx) => (
                            <PhotoFrame key={idx} src={img} rotate={idx % 2 === 0 ? -2 : 2} />
                        ))}
                    </div>

                    {/* Center Heart */}
                    <m.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative w-40 h-40 md:w-64 md:h-64 flex items-center justify-center"
                    >
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                            <path d="M50 30 C 20 0, 0 30, 50 90 C 100 30, 80 0, 50 30" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" className="animate-draw" />
                            {/* Sketchy Heart Effect */}
                            <path d="M52 32 C 25 5, 5 35, 50 88 C 95 35, 75 5, 52 32" fill="none" stroke="#ec4899" strokeWidth="1" strokeLinecap="round" strokeDasharray="5,5" className="opacity-70" />
                        </svg>
                    </m.div>

                    {/* Right Column */}
                    <div className="space-y-6 flex flex-col items-center">
                        {gridImages.slice(3, 6).map((img, idx) => (
                            <PhotoFrame key={idx + 3} src={img} rotate={idx % 2 === 0 ? 2 : -2} />
                        ))}
                    </div>

                </div>

            </div>
        </section>
    );
}

// Sub-components
const PhotoFrame = ({ src, rotate }: { src: string, rotate: number }) => (
    <m.div
        whileHover={{ scale: 1.05, rotate: 0 }}
        className="relative bg-white/5 backdrop-blur-sm p-2 pb-8 border border-white/20 shadow-lg w-48 md:w-56 will-change-transform"
        style={{ transform: `rotate(${rotate}deg)` }}
    >
        <div className="aspect-[3/4] overflow-hidden relative">
            {src.startsWith('/') ? (
                <Image src={src} alt="Sweet Moment" fill className="object-cover" sizes="224px" />
            ) : (
                <CldImage src={src} width={300} height={400} alt="Sweet Moment" className="w-full h-full object-cover" />
            )}
        </div>
        {/* Bow Decoration at bottom corners */}
        <div className="absolute -bottom-3 -left-3 text-pink-300 drop-shadow-md rotate-[-15deg]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C10 2 8 4 8 6C8 8 10 10 12 10C14 10 16 8 16 6C16 4 14 2 12 2ZM6 8C4 8 2 10 2 12C2 14 4 16 6 16C8 16 10 14 10 12C10 10 8 8 6 8ZM18 8C16 8 14 10 14 12C14 14 16 16 18 16C20 16 22 14 22 12C22 10 20 8 18 8ZM12 12C10 12 8 14 8 16C8 18 10 20 12 20C14 20 16 18 16 16C16 14 14 12 12 12Z" /></svg>
        </div>
        <div className="absolute -bottom-3 -right-3 text-pink-300 drop-shadow-md rotate-[15deg]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C10 2 8 4 8 6C8 8 10 10 12 10C14 10 16 8 16 6C16 4 14 2 12 2ZM6 8C4 8 2 10 2 12C2 14 4 16 6 16C8 16 10 14 10 12C10 10 8 8 6 8ZM18 8C16 8 14 10 14 12C14 14 16 16 18 16C20 16 22 14 22 12C22 10 20 8 18 8ZM12 12C10 12 8 14 8 16C8 18 10 20 12 20C14 20 16 18 16 16C16 14 14 12 12 12Z" /></svg>
        </div>
    </m.div>
);

const HeartSwirlLeft = () => (
    <svg width="100" height="60" viewBox="0 0 100 60" className="text-pink-300/80 drop-shadow-md">
        <path d="M90 30 C 70 30, 60 10, 40 10 C 20 10, 10 30, 30 50 C 50 70, 80 40, 90 30" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M30 10 Q 10 10, 10 30 Q 10 50, 30 50" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
);

const HeartSwirlRight = () => (
    <svg width="100" height="60" viewBox="0 0 100 60" className="text-pink-300/80 drop-shadow-md transform scale-x-[-1]">
        <path d="M90 30 C 70 30, 60 10, 40 10 C 20 10, 10 30, 30 50 C 50 70, 80 40, 90 30" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M30 10 Q 10 10, 10 30 Q 10 50, 30 50" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
);

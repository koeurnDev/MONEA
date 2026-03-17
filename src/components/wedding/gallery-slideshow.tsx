"use client";

import * as React from "react";
import { AnimatePresence, m } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface GallerySlideshowProps {
    images: string[];
}

export const GallerySlideshow = ({ images }: GallerySlideshowProps) => {
    const [index, setIndex] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 4000); // Change every 4 seconds
        return () => clearInterval(timer);
    }, [images.length]);

    const nextSlide = () => setIndex((prev) => (prev + 1) % images.length);
    const prevSlide = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

    if (!images || images.length === 0) return null;

    return (
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl group bg-black/5">
            <AnimatePresence mode="wait">
                <m.div
                    key={index}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    <Image
                        src={images[index]}
                        alt={`Gallery ${index + 1}`}
                        fill
                        className={`object-cover transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                        priority={index === 0}
                        onLoadingComplete={() => setIsLoading(false)}
                    />
                    {isLoading && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-white border-t-pink-400 rounded-full animate-spin"></div>
                        </div>
                    )}
                </m.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/50 transition-colors opacity-0 group-hover:opacity-100"
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/50 transition-colors opacity-0 group-hover:opacity-100"
            >
                <ChevronRight size={20} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === index ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

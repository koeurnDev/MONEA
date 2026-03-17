"use client";

import * as React from "react";
import { AnimatePresence, m } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { CldImage } from 'next-cloudinary';

interface LightboxProps {
    images: string[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function Lightbox({ images, initialIndex, isOpen, onClose }: LightboxProps) {
    const [index, setIndex] = React.useState(initialIndex);

    const nextImage = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const prevImage = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    // Update index when initialIndex changes (e.g., opening a new image)
    React.useEffect(() => {
        setIndex(initialIndex);
    }, [initialIndex]);

    // Handle Keyboard Navigation
    React.useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") prevImage();
            if (e.key === "ArrowRight") nextImage();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, nextImage, prevImage]);

    // Prevent scrolling when lightbox is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => { document.body.style.overflow = "auto"; };
    }, [isOpen]);

    const currentSrc = images[index];
    const isCloudinary = !currentSrc?.startsWith("/") && !currentSrc?.startsWith("http");

    return (
        <AnimatePresence>
            {isOpen && (
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    role="dialog"
                    aria-label="Image Lightbox"
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-50"
                        title="Close (Esc)"
                    >
                        <X size={24} />
                    </button>

                    {/* Left Arrow */}
                    {images.length > 1 && (
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-50 hidden md:block"
                            title="Previous Image"
                        >
                            <ChevronLeft size={32} />
                        </button>
                    )}

                    {/* Image Container */}
                    <m.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center pointer-events-none"
                    >
                        <div className="relative w-full h-full pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                            {isCloudinary ? (
                                <CldImage
                                    src={currentSrc}
                                    alt={`Gallery Image ${index + 1}`}
                                    width={1920}
                                    height={1080}
                                    className="object-contain w-full h-full"
                                    preserveTransformations
                                />
                            ) : (
                                <Image
                                    src={currentSrc}
                                    alt={`Gallery Image ${index + 1}`}
                                    fill
                                    className="object-contain w-full h-full"
                                    sizes="100vw"
                                    quality={100}
                                />
                            )}
                        </div>
                    </m.div>

                    {/* Right Arrow */}
                    {images.length > 1 && (
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-50 hidden md:block"
                            title="Next Image"
                        >
                            <ChevronRight size={32} />
                        </button>
                    )}

                    {/* Mobile Navigation Hits */}
                    <div className="absolute inset-y-0 left-0 w-1/4 z-40 md:hidden" onClick={prevImage} />
                    <div className="absolute inset-y-0 right-0 w-1/4 z-40 md:hidden" onClick={nextImage} />

                    {/* Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm font-mono tracking-widest bg-black/50 px-3 py-1 rounded-full border border-white/10">
                        {index + 1} / {images.length}
                    </div>
                </m.div>
            )}
        </AnimatePresence>
    );
}

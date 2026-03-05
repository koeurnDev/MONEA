import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CldImage } from 'next-cloudinary';

interface FullscreenOverlayProps {
    selectedImg: number | null;
    setSelectedImg: (index: number | null) => void;
    galleryImages: string[];
}

export default function FullscreenOverlay({ selectedImg, setSelectedImg, galleryImages }: FullscreenOverlayProps) {
    return (
        <AnimatePresence>
            {selectedImg !== null && (
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-0 backdrop-blur-md"
                    onClick={() => setSelectedImg(null)}
                >
                    <button className="absolute top-6 right-6 text-[#D4AF37] z-50 p-2 hover:rotate-90 transition-transform" onClick={() => setSelectedImg(null)}><X size={32} /></button>
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        {galleryImages[selectedImg].startsWith('/') || galleryImages[selectedImg].startsWith('http') ? (
                            <img
                                src={galleryImages[selectedImg]}
                                alt="Gallery Fullscreen"
                                className="object-contain w-full h-full max-h-[90vh] shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                            />
                        ) : (
                            <CldImage
                                src={galleryImages[selectedImg]}
                                alt="Gallery Fullscreen"
                                width={1000}
                                height={1400}
                                className="object-contain w-full h-full max-h-[90vh] shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                                config={{ url: { analytics: false } }}
                            />
                        )}
                    </div>
                </m.div>
            )}
        </AnimatePresence>
    );
}

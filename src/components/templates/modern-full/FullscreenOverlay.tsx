import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { CldImage } from 'next-cloudinary';

interface FullscreenOverlayProps {
    selectedIndex: number | null;
    items: string[];
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function FullscreenOverlay({ selectedIndex, items, onClose, onNext, onPrev }: FullscreenOverlayProps) {

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return;
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft') onPrev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, onNext, onPrev, onClose]);

    return (
        <AnimatePresence>
            {selectedIndex !== null && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center"
                    onClick={onClose}
                >
                    {/* Close Button */}
                    <button className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-50">
                        <X size={24} />
                    </button>

                    {/* Valid Image Check */}
                    {items[selectedIndex] && (
                        <motion.div
                            key={selectedIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center p-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {items[selectedIndex].startsWith('/') ? (
                                <img
                                    src={items[selectedIndex]}
                                    className="max-h-[85vh] max-w-full object-contain rounded-sm shadow-2xl border border-white/10"
                                />
                            ) : (
                                <CldImage
                                    src={items[selectedIndex]}
                                    width={1200}
                                    height={1200}
                                    alt="Fullscreen"
                                    className="max-h-[85vh] max-w-full object-contain rounded-sm shadow-2xl border border-white/10"
                                />
                            )}
                        </motion.div>
                    )}

                    {/* Navigation Buttons */}
                    <button
                        className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md z-50"
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md z-50"
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                    >
                        <ChevronRight size={32} />
                    </button>

                    {/* Counter */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 font-mono text-sm tracking-widest">
                        {selectedIndex + 1} / {items.length}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

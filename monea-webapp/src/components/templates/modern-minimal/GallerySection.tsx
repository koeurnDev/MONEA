import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { WeddingData } from "../types";
import { getWeddingPhotos } from "../shared/weddingPhotos";
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export const GallerySection = ({ wedding }: { wedding: WeddingData }) => {
    const validImages = getWeddingPhotos(wedding).map((item) => item.url.trim());

    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    const titleText = wedding.themeSettings?.customLabels?.galleryTitle || "វិចិត្រសាល";

    if (validImages.length === 0) return null;

    return (
        <section className="py-20 md:py-32 bg-white relative overflow-hidden" id="gallery-modern">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Header */}
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-12 text-center flex flex-col items-center space-y-2.5"
                >
                    <h2 className="text-2xl md:text-3xl font-khmer-moul text-slate-900 tracking-tight leading-relaxed">
                        {titleText}
                    </h2>
                    <div className="w-12 h-1 bg-slate-900/80 rounded-full mx-auto" />
                </m.div>

                {/* Clean Masonry Collage Grid without blank grey boxes */}
                <div className="columns-2 md:columns-3 gap-3 md:gap-5 space-y-3 md:space-y-5">
                    {validImages.map((url, idx) => {
                        const aspectClass = idx % 3 === 0 ? "aspect-[3/4]" 
                                          : idx % 2 === 0 ? "aspect-[4/5]" 
                                          : "aspect-square";
                        
                        return (
                            <m.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: (idx % 4) * 0.08 }}
                                viewport={{ once: true }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedIdx(idx)}
                                className={`relative w-full overflow-hidden rounded-2xl cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300 break-inside-avoid ${aspectClass}`}
                            >
                                <img
                                    src={url}
                                    alt={`Gallery ${idx + 1}`} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </m.div>
                        );
                    })}
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedIdx !== null && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedIdx(null)}
                            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Navigation Previous */}
                        {validImages.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIdx((selectedIdx - 1 + validImages.length) % validImages.length);
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        {/* Navigation Next */}
                        {validImages.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIdx((selectedIdx + 1) % validImages.length);
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <ChevronRight size={24} />
                            </button>
                        )}

                        {/* Active Image */}
                        <m.div
                            key={selectedIdx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                            className="max-w-5xl max-h-[85vh] w-full flex items-center justify-center p-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={validImages[selectedIdx]}
                                alt="Full preview"
                                className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl"
                            />
                        </m.div>

                        {/* Image Counter */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs font-mono tracking-widest font-bold">
                            {selectedIdx + 1} / {validImages.length}
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { WeddingData } from '../types';

const DEFAULT_GALLERY = [
    { url: "/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg" },
    { url: "/assets/khmer-legacy/621811002_905396558712142_5126771807004187076_n.jpg" },
    { url: "/assets/khmer-legacy/621811942_905392918712506_8600818650624857202_n.jpg" },
    { url: "/assets/khmer-legacy/621813168_905393265379138_2356104923368506186_n.jpg" },
    { url: "/assets/khmer-legacy/622279784_905392782045853_1189842078802821714_n.jpg" },
    { url: "/assets/khmer-legacy/622374686_905392995379165_1001573724208229331_n.jpg" }
];

export default function AnniversaryGallery({ wedding }: { wedding: WeddingData }) {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    const rawItems = (wedding.galleryItems || []).filter(i => i && typeof i.url === 'string' && i.url.trim() !== '');
    const validItems = rawItems.length > 0 ? rawItems : DEFAULT_GALLERY;
    
    const settings = wedding.themeSettings as any;
    const title = settings?.customLabels?.galleryTitle || "វិចិត្រសាល";

    const openLightbox = (idx: number) => setSelectedIdx(idx);
    const closeLightbox = () => setSelectedIdx(null);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedIdx === null) return;
        setSelectedIdx((selectedIdx + 1) % validItems.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedIdx === null) return;
        setSelectedIdx((selectedIdx - 1 + validItems.length) % validItems.length);
    };

    return (
        <section className="py-16 px-4 bg-[#FAF7F2] font-kantumruy relative overflow-hidden" id="gallery">
            <div className="max-w-xl mx-auto space-y-8">
                
                {/* Section Header */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mb-1 shadow-sm">
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-khmer-moul text-[#3B0764] leading-relaxed">
                        {title}
                    </h2>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-1" />
                </div>

                {/* 2-Column Responsive Masonry Collage */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {validItems.map((item, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.06 }}
                            onClick={() => openLightbox(idx)}
                            className={`relative rounded-2xl overflow-hidden shadow-sm cursor-pointer group border-2 border-white hover:border-amber-300 transition-all ${
                                idx % 3 === 0 ? 'aspect-[3/4]' : idx % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]'
                            }`}
                        >
                            <img
                                src={item.url}
                                alt={`Gallery item ${idx + 1}`}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                        </m.div>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedIdx !== null && (
                    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                        {/* Close button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors z-10"
                        >
                            <X size={24} />
                        </button>

                        {/* Navigation Previous */}
                        {validItems.length > 1 && (
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors z-10"
                            >
                                <ChevronLeft size={28} />
                            </button>
                        )}

                        {/* Navigation Next */}
                        {validItems.length > 1 && (
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors z-10"
                            >
                                <ChevronRight size={28} />
                            </button>
                        )}

                        {/* Active Image */}
                        <m.div
                            key={selectedIdx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="relative max-w-lg max-h-[80vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={validItems[selectedIdx].url}
                                alt={`Gallery expanded ${selectedIdx + 1}`}
                                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                            />
                        </m.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}

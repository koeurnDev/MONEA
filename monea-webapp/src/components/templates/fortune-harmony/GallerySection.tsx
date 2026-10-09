import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { WeddingData } from '../types';
import { getWeddingPhotos } from "../shared/weddingPhotos";

interface GallerySectionProps {
    wedding: WeddingData;
    primaryColor: string;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ wedding, primaryColor }) => {
    const photos = getWeddingPhotos(wedding);
    const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

    if (photos.length === 0) return null;

    return (
        <section className="py-14 px-4 sm:px-6 bg-transparent text-[#2d352b] font-kantumruy relative overflow-hidden">
            <div className="max-w-md mx-auto space-y-6 relative z-10">
                <div className="text-center space-y-1">
                    <span className="text-xl sm:text-2xl font-khmer-moul text-[#4d5649] block">
                        កម្រងរូបភាពអនុស្សាវរីយ៍
                    </span>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#8ea07a] to-transparent mx-auto" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {photos.map((photo, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedPhoto(idx)}
                            className={`relative rounded-2xl overflow-hidden cursor-pointer shadow-md border-2 border-amber-400/40 ${
                                idx % 3 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
                            }`}
                        >
                            <img
                                src={photo.url}
                                alt={`Photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2.5">
                                <span className="text-[11px] text-amber-200 font-bold truncate">
                                    អនុស្សាវរីយ៍
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedPhoto !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
                        >
                            <X size={20} />
                        </button>
                        <div 
                            className="max-w-lg w-full max-h-[80vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={photos[selectedPhoto].url}
                                alt="Enlarged moment"
                                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-amber-400/40"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

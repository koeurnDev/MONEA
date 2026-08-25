import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { WeddingData } from '../types';

interface GallerySectionProps {
    wedding: WeddingData;
    primaryColor: string;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ wedding, primaryColor }) => {
    const rawGallery = wedding.galleryItems || [];
    const photos = rawGallery.filter(item => item.url && item.type !== 'VIDEO');
    const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

    const defaultPhotos = [
        { url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop", caption: "Sweet Memories" },
        { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop", caption: "Eternal Love" },
        { url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&auto=format&fit=crop", caption: "Together Forever" },
        { url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800&auto=format&fit=crop", caption: "Our Journey" },
    ];

    const displayPhotos = photos.length > 0 ? photos : defaultPhotos;
    const galleryStyle = (wedding.themeSettings as any)?.galleryStyle || 'masonry';

    return (
        <section className="py-14 px-4 sm:px-6 bg-white font-kantumruy relative overflow-hidden">
            <div className="max-w-md mx-auto space-y-6 relative z-10">
                <div className="text-center space-y-1">
                    <span className="text-xl sm:text-2xl font-khmer-moul text-[#B45309] block">
                        កម្រងរូបភាពអនុស្សាវរីយ៍
                    </span>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
                </div>

                {/* Grid Display */}
                <div className="grid grid-cols-2 gap-3">
                    {displayPhotos.map((photo, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedPhoto(idx)}
                            className={`relative rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-rose-100 ${
                                idx % 3 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
                            }`}
                        >
                            <img
                                src={photo.url}
                                alt={(photo as any).caption || `Photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2.5">
                                <span className="text-[11px] text-white font-bold truncate">
                                    {(photo as any).caption || "អនុស្សាវរីយ៍"}
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
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
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
                                src={displayPhotos[selectedPhoto].url}
                                alt="Enlarged moment"
                                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

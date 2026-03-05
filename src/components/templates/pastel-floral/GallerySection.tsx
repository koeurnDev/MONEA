import React from 'react';
import { m } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { THEME, GlassCard, FloatingPetals } from './shared';

interface GallerySectionProps {
    galleryImages: string[];
    setSelectedImg: (index: number) => void;
    labels: any;
}

export default function GallerySection({ galleryImages, setSelectedImg, labels }: GallerySectionProps) {
    if (!galleryImages || galleryImages.length === 0) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: '#FDFBF7' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[url('/wedding_assets/floral-corner-tl.png')] bg-contain bg-no-repeat opacity-5 rotate-180 pointer-events-none"></div>

            <div className="text-center mb-16 relative z-10">
                <m.p
                    initial={{ opacity: 0, letterSpacing: '0.1em' }}
                    whileInView={{ opacity: 1, letterSpacing: '0.3em' }}
                    className="uppercase text-gray-400 text-xs mb-3 font-header"
                >
                    Our Memories
                </m.p>
                <m.h3
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-5xl font-script text-[#D4AF37] drop-shadow-sm"
                >
                    {labels.gallery_title}
                </m.h3>
            </div>

            <m.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 max-w-6xl mx-auto"
            >
                {galleryImages.map((src, idx) => (
                    <m.div
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ y: -10, rotate: idx % 2 === 0 ? 1 : -1 }}
                        onClick={() => setSelectedImg(idx)}
                        className="group relative cursor-pointer"
                    >
                        <GlassCard className="p-3 bg-white/60 hover:bg-white/80 transition-all duration-500 shadow-lg hover:shadow-2xl">
                            <div className="aspect-[3/4] overflow-hidden rounded-lg relative">
                                {src.startsWith('http') ? (
                                    <Image
                                        src={src}
                                        alt="Gallery"
                                        fill
                                        className="object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <CldImage
                                        src={src}
                                        alt="Gallery"
                                        fill
                                        className="object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        config={{ url: { analytics: false } }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                                    <span className="text-white text-xs tracking-widest uppercase font-serif">View Full Size</span>
                                </div>
                            </div>
                        </GlassCard>
                        {/* Polaroid-style shadow base */}
                        <div className="absolute -bottom-2 -right-2 -z-10 w-full h-full bg-gray-200/50 rounded-lg blur-sm group-hover:bg-[#D4AF37]/10 transition-colors"></div>
                    </m.div>
                ))}
            </m.div>
        </section>
    );
}

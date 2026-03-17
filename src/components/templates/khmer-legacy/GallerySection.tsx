import * as React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { WeddingData } from '../types';
import { RevealSection, CinematicPlaceholder } from '../shared/CinematicComponents';

interface GallerySectionProps {
    wedding: WeddingData;
    galleryImages: string[];
    groomPan: any;
    bridePan: any;
    galleryPan: any;
    smartColors: { primary: string; secondary: string; dark: string };
}

export function GallerySection({ wedding, galleryImages, groomPan, bridePan, galleryPan, smartColors }: GallerySectionProps) {
    const [index, setIndex] = React.useState(0);
    const [dragX, setDragX] = React.useState(0);

    const onNext = () => setIndex((prev) => (prev + 1) % galleryImages.length);
    const onPrev = () => setIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);


    return (
        <section id="gallery" className="py-32 md:py-64 bg-[#FAF9F6]/30 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/30 via-transparent to-transparent" />

            <div className="max-w-7xl mx-auto px-8">
                <RevealSection>
                    <div className="text-center space-y-16 mb-24">
                        <div className="space-y-4">
                            <p className="font-playfair text-xs tracking-[0.5em] text-gray-600 uppercase font-black">
                                {wedding.eventType === 'anniversary' ? 'គូស្វាមីភរិយា' : 'កូនកំលោះ & កូនក្រមុំ'}
                            </p>
                            <h3 className="font-khmer-moul text-base md:text-2xl text-gold-gradient text-gold-embossed">កម្រងរូបភាពអនុស្សាវរីយ៍</h3>
                        </div>
                    </div>
                </RevealSection>

                {galleryImages.length > 0 && (
                    <div className="relative group">
                        <m.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            style={{ x: dragX }}
                            onDragEnd={(_, info) => {
                                if (info.offset.x < -50) onNext();
                                else if (info.offset.x > 50) onPrev();
                            }}
                            className="relative aspect-[16/10] md:aspect-[21/9] rounded-[2rem] md:rounded-[4rem] overflow-hidden border-lux bg-white shadow-2xl"
                        >
                            <AnimatePresence mode="wait">
                                    <m.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.8, ease: "circOut" }}
                                        className="absolute inset-0"
                                    >
                                    {galleryImages[index] ? (
                                        <Image 
                                            src={galleryImages[index]} 
                                            fill 
                                            sizes="100vw" 
                                            className={`object-cover ${galleryPan.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} 
                                            style={{ 
                                                objectPosition: `${galleryPan.localX} ${galleryPan.localY}`,
                                                userSelect: 'none',
                                                touchAction: 'none'
                                            }}
                                            onMouseDown={galleryPan.onStart}
                                            onTouchStart={galleryPan.onStart}
                                            draggable={false}
                                            alt={`Gallery ${index}`} 
                                            priority={index === 0}
                                        />
                                    ) : (
                                        <CinematicPlaceholder label="Our Story" />
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                                </m.div>
                            </AnimatePresence>
                        </m.div>

                        {/* Navigation */}
                        <button 
                            onClick={onPrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-gold/80 transition-all z-20"
                        >
                            <m.span whileHover={{ x: -2 }}>←</m.span>
                        </button>
                        <button 
                            onClick={onNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-gold/80 transition-all z-20"
                        >
                            <m.span whileHover={{ x: 2 }}>→</m.span>
                        </button>

                        {/* Progress Dots */}
                        <div className="flex justify-center gap-3 mt-12">
                            {galleryImages.slice(0, 10).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setIndex(i)}
                                    className={`h-1.5 transition-all duration-500 rounded-full ${index === i ? 'w-8 bg-gold' : 'w-2 bg-gold/20'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 md:gap-40 pt-16 md:pt-40 relative px-4 md:px-0">
                    <div className="absolute left-1/2 -top-10 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-gold/5 to-transparent -translate-x-1/2 hidden md:block" />

                    {/* Groom */}
                    <div className="flex flex-col items-center relative z-10 flex-1 text-center">
                            <m.div
                                whileInView={{ y: [20, 0], opacity: [0, 1] }}
                                className="w-full max-w-[280px] md:max-w-none aspect-[3/4] rounded-[2rem] md:rounded-[4rem] border-8 md:border-[16px] border-white shadow-2xl overflow-hidden mb-8 ring-1 ring-gold/10 relative bg-gold/5"
                            >
                            {galleryImages[3 % galleryImages.length] ? (
                                <Image 
                                    src={galleryImages[3 % galleryImages.length]} 
                                    fill 
                                    sizes="(max-width: 768px) 80vw, 33vw" 
                                    alt="Groom" 
                                    className={`object-cover ${groomPan.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-105'} transition-all duration-700`} 
                                    style={{
                                        objectPosition: `${groomPan.localX} ${groomPan.localY}`,
                                        transform: `scale(${wedding.themeSettings?.groomImageScale || 1})`,
                                        userSelect: 'none',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={groomPan.onStart}
                                    onTouchStart={groomPan.onStart}
                                    draggable={false}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-10">
                                    <span className="w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center text-xl font-black italic">M</span>
                                </div>
                            )}
                        </m.div>
                        <h4 style={{ color: smartColors.primary }} className="font-khmer-moul text-lg md:text-2xl tracking-widest drop-shadow-sm">កូនកំលោះ៖ {wedding.groomName}</h4>
                    </div>

                    {/* Bride */}
                    <div className="flex flex-col items-center relative z-10 flex-1 text-center">
                            <m.div
                                whileInView={{ y: [20, 0], opacity: [0, 1] }}
                                className="w-full max-w-[280px] md:max-w-none aspect-[3/4] rounded-[2rem] md:rounded-[4rem] border-8 md:border-[16px] border-white shadow-2xl overflow-hidden mb-8 ring-1 ring-gold/10 relative bg-gold/5"
                            >
                            {galleryImages[4 % galleryImages.length] ? (
                                <Image 
                                    src={galleryImages[4 % galleryImages.length]} 
                                    fill 
                                    sizes="(max-width: 768px) 80vw, 33vw" 
                                    alt="Bride" 
                                    className={`object-cover ${bridePan.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-105'} transition-all duration-700`} 
                                    style={{
                                        objectPosition: `${bridePan.localX} ${bridePan.localY}`,
                                        transform: `scale(${wedding.themeSettings?.brideImageScale || 1})`,
                                        userSelect: 'none',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={bridePan.onStart}
                                    onTouchStart={bridePan.onStart}
                                    draggable={false}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-10">
                                    <span className="w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center text-xl font-black italic">M</span>
                                </div>
                            )}
                        </m.div>
                        <h4 style={{ color: smartColors.primary }} className="font-khmer-moul text-lg md:text-2xl tracking-widest drop-shadow-sm">កូនក្រមុំ៖ {wedding.brideName}</h4>
                    </div>
                </div>
            </div>
        </section>
    );
}

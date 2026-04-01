import * as React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { WeddingData } from '../types';
import { RevealSection, CinematicPlaceholder } from '../shared/CinematicComponents';
import { useTranslation } from '@/i18n/LanguageProvider';

interface GallerySectionProps {
    wedding: WeddingData;
    galleryImages: string[];
    groomPan: any;
    bridePan: any;
    galleryPan: any;
    smartColors: { primary: string; secondary: string; dark: string };
}

export function GallerySection({ wedding, galleryImages, groomPan, bridePan, galleryPan, smartColors }: GallerySectionProps) {
    const { t } = useTranslation();
    const [index, setIndex] = React.useState(0);
    const [dragX, setDragX] = React.useState(0);
    const isAnniversary = wedding.eventType === 'anniversary';

    const onNext = () => setIndex((prev) => (prev + 1) % galleryImages.length);
    const onPrev = () => setIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);


    return (
        <section id="gallery" className="py-32 md:py-64 bg-[#FAF9F6]/30 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/30 via-transparent to-transparent" />

            <div className="max-w-7xl mx-auto px-8">
                <RevealSection>
                    <div className="text-center space-y-20 mb-32">
                        <div className="flex flex-col items-center space-y-6">
                            <p className="font-playfair text-[10px] md:text-xs tracking-[0.8em] text-gold-main/60 uppercase font-black italic">
                                {t("template.khmerLegacy.gallerySubtitle")}
                            </p>
                            <h3 className="font-khmer-moul text-4xl md:text-6xl text-gold-gradient text-gold-embossed tracking-wider leading-relaxed">
                                {t("template.khmerLegacy.galleryTitle")}
                            </h3>
                            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-main/20 to-transparent" />
                        </div>
                    </div>
                </RevealSection>

                {galleryImages.length > 0 && (
                    <div className="relative group max-w-6xl mx-auto">
                        <m.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            style={{ x: dragX }}
                            onDragEnd={(_, info) => {
                                if (info.offset.x < -50) onNext();
                                else if (info.offset.x > 50) onPrev();
                            }}
                            className="relative aspect-[16/10] md:aspect-[21/9] rounded-[3rem] md:rounded-[5rem] overflow-hidden border border-white/60 bg-white/40 backdrop-blur-sm shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)]"
                        >
                            <AnimatePresence mode="wait">
                                    <m.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 1.2, ease: "circOut" }}
                                        className="absolute inset-0"
                                    >
                                    {galleryImages[index] ? (
                                        <Image 
                                            src={galleryImages[index]} 
                                            fill 
                                            sizes="100vw" 
                                            className={`object-cover transition-transform duration-1000 ${galleryPan.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} 
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                                </m.div>
                            </AnimatePresence>
                        </m.div>

                        {/* Navigation */}
                        <div className="hidden md:block">
                            <button 
                                onClick={onPrev}
                                className="absolute -left-12 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/80 backdrop-blur-xl border border-white shadow-xl flex items-center justify-center text-gold-main hover:bg-gold-main hover:text-white transition-all duration-500 z-20 group/btn"
                            >
                                <m.span whileHover={{ x: -2 }} className="text-2xl font-light">←</m.span>
                            </button>
                            <button 
                                onClick={onNext}
                                className="absolute -right-12 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/80 backdrop-blur-xl border border-white shadow-xl flex items-center justify-center text-gold-main hover:bg-gold-main hover:text-white transition-all duration-500 z-20 group/btn"
                            >
                                <m.span whileHover={{ x: 2 }} className="text-2xl font-light">→</m.span>
                            </button>
                        </div>

                        {/* Progress Dots */}
                        <div className="flex justify-center gap-4 mt-16">
                            {galleryImages.slice(0, 10).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setIndex(i)}
                                    className={`h-1.5 transition-all duration-700 rounded-full ${index === i ? 'w-12 bg-gold-main shadow-[0_0_15px_rgba(177,147,86,0.3)]' : 'w-2 bg-gold-main/20'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-20 md:gap-40 pt-32 md:pt-56 relative px-4 md:px-0">
                    <div className="absolute left-1/2 -top-10 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-gold-main/10 to-transparent -translate-x-1/2 hidden md:block" />

                    {/* Groom */}
                    <div className="flex flex-col items-center relative z-10 flex-1 text-center">
                            <m.div
                                whileInView={{ y: [40, 0], opacity: [0, 1] }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="w-full max-w-[280px] md:max-w-none aspect-[3/4] rounded-[4rem] md:rounded-[6rem] border-[12px] md:border-[24px] border-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden mb-12 ring-1 ring-gold-main/10 relative bg-gold-main/5 group"
                            >
                            <m.div 
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                            >
                                <div className="absolute inset-0 ring-[40px] ring-gold-main/20 rounded-full blur-3xl" />
                            </m.div>
                            {galleryImages[3 % galleryImages.length] ? (
                                <Image 
                                    src={galleryImages[3 % galleryImages.length]} 
                                    fill 
                                    sizes="(max-width: 768px) 80vw, 33vw" 
                                    alt="Groom" 
                                    className={`object-cover ${groomPan.isDragging ? 'cursor-grabbing' : 'cursor-grab group-hover:scale-110'} transition-all duration-1500 ease-out`} 
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
                                    <span className="w-12 h-12 rounded-full border-2 border-gold-main flex items-center justify-center text-xl font-black italic text-gold-main">M</span>
                                </div>
                            )}
                        </m.div>
                        <h4 className="font-khmer-moul text-2xl md:text-3xl tracking-[0.2em] text-gold-gradient text-gold-embossed drop-shadow-sm">
                            {t("template.khmerLegacy.groomTitle")}៖ {wedding.groomName}
                        </h4>
                    </div>

                    {/* Bride */}
                    <div className="flex flex-col items-center relative z-10 flex-1 text-center">
                            <m.div
                                whileInView={{ y: [40, 0], opacity: [0, 1] }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                className="w-full max-w-[280px] md:max-w-none aspect-[3/4] rounded-[4rem] md:rounded-[6rem] border-[12px] md:border-[24px] border-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden mb-12 ring-1 ring-gold-main/10 relative bg-gold-main/5 group"
                            >
                            <m.div 
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 1 }}
                                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                            >
                                <div className="absolute inset-0 ring-[40px] ring-gold-main/20 rounded-full blur-3xl" />
                            </m.div>
                            {galleryImages[4 % galleryImages.length] ? (
                                <Image 
                                    src={galleryImages[4 % galleryImages.length]} 
                                    fill 
                                    sizes="(max-width: 768px) 80vw, 33vw" 
                                    alt="Bride" 
                                    className={`object-cover ${bridePan.isDragging ? 'cursor-grabbing' : 'cursor-grab group-hover:scale-110'} transition-all duration-1500 ease-out`} 
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
                                    <span className="w-12 h-12 rounded-full border-2 border-gold-main flex items-center justify-center text-xl font-black italic text-gold-main">M</span>
                                </div>
                            )}
                        </m.div>
                        <h4 className="font-khmer-moul text-2xl md:text-3xl tracking-[0.2em] text-gold-gradient text-gold-embossed drop-shadow-sm">
                            {t("template.khmerLegacy.brideTitle")}៖ {wedding.brideName}
                        </h4>
                    </div>
                </div>
            </div>
        </section>
    );
}

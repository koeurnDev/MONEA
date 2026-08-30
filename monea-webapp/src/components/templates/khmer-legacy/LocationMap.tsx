import * as React from 'react';
import { m } from 'framer-motion';
import { QrCode, MapPin } from 'lucide-react';
import { RevealSection } from '../shared/CinematicComponents';
import { WeddingData, GiftRegistryItem } from '../types';
import { useTranslation } from '@/i18n/LanguageProvider';

interface LocationMapProps {
    wedding: WeddingData;
    galleryImages: string[];
    mapPan: any;
}

export function LocationMap({ wedding, galleryImages, mapPan }: LocationMapProps) {
    const { t } = useTranslation();
    const locationQr = wedding.themeSettings?.customLabels?.locationQrUrl || wedding.themeSettings?.giftRegistry?.find((r: GiftRegistryItem) => r.type === 'CASH')?.qrCodeUrl;

    // Use Slot 2 (Location Photo) with fallbacks
    const portraitImage = galleryImages[2] || galleryImages[1] || galleryImages[0] || "/assets/khmer-legacy/621811942_905392918712506_8600818650624857202_n.jpg";

    return (
        <section id="location" className="py-10 md:py-16 px-4 sm:px-8 md:px-12 bg-white relative overflow-hidden font-kantumruy">
            {/* Background subtle luxury glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] md:w-[1000px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.04)_0%,_transparent_70%)] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <RevealSection>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-center">
                        {/* Left: Portrait Photo */}
                        <div className="w-full max-w-[280px] sm:max-w-none mx-auto aspect-[3/4] sm:aspect-[4/5] bg-white p-2 shadow-[0_15px_40px_rgba(212,175,55,0.1)] border border-[#D4AF37]/25 relative overflow-hidden rounded-2xl sm:rounded-3xl group">
                            {portraitImage ? (
                                <img 
                                    src={portraitImage} 
                                    className={`w-full h-full object-cover rounded-xl sm:rounded-2xl transition-all duration-1000 ${mapPan.isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'}`} 
                                    style={{ 
                                        objectPosition: `${mapPan.localX} ${mapPan.localY}`,
                                        userSelect: 'none',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={mapPan.onStart}
                                    onTouchStart={mapPan.onStart}
                                    draggable={false}
                                    alt="Location Portrait" 
                                />
                            ) : (
                                <div className="w-full h-full bg-amber-50 rounded-xl sm:rounded-2xl flex items-center justify-center">
                                    <MapPin className="w-12 h-12 text-[#9C7A3C]/40" />
                                </div>
                            )}
                        </div>

                        {/* Right: Location & QR Block */}
                        <div className="flex flex-col items-center justify-center space-y-3.5 sm:space-y-4 text-center">
                            {/* Cursive Gold Title with proper padding to prevent right clipping */}
                            <div className="px-3 pr-5 py-1">
                                <h3 className="font-playfair italic text-3xl sm:text-4xl md:text-5xl text-gold-gradient font-bold leading-tight drop-shadow-sm inline-block">
                                    Location
                                </h3>
                            </div>

                            {/* Interactive QR Code Container */}
                            <m.div
                                whileHover={{ scale: 1.03, y: -4 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => wedding.themeSettings?.mapLink && window.open(wedding.themeSettings.mapLink, '_blank')}
                                className="w-44 h-44 sm:w-56 sm:h-56 p-3 sm:p-4 bg-white rounded-3xl border-2 border-[#D4AF37]/35 shadow-[0_12px_36px_rgba(212,175,55,0.12)] flex flex-col items-center justify-center relative cursor-pointer group"
                            >
                                {locationQr ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <img 
                                            src={locationQr} 
                                            className="w-full h-full object-contain" 
                                            alt="Location QR" 
                                        />
                                        {/* Center Google Maps Pin Badge */}
                                        <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-white shadow-md border border-[#D4AF37]/30 flex items-center justify-center pointer-events-none">
                                            <MapPin size={20} className="text-red-500 fill-red-500" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative w-full h-full flex flex-col items-center justify-center text-[#805C00]">
                                        <QrCode size={96} className="text-[#C5A027]/90" />
                                        <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-white shadow-md border border-[#D4AF37]/30 flex items-center justify-center pointer-events-none">
                                            <MapPin size={20} className="text-red-500 fill-red-500" />
                                        </div>
                                    </div>
                                )}
                            </m.div>

                            {/* Scan or Click Here Subtitle */}
                            <div 
                                onClick={() => wedding.themeSettings?.mapLink && window.open(wedding.themeSettings.mapLink, '_blank')}
                                className="cursor-pointer space-y-1 pt-1"
                            >
                                <p className="font-playfair font-black text-xs sm:text-sm tracking-[0.2em] text-[#805C00] uppercase hover:text-[#684a00] transition-colors">
                                    SCAN OR CLICK HERE
                                </p>
                                <p className="font-kantumruy text-[11px] sm:text-xs text-stone-600 font-medium max-w-xs mx-auto">
                                    {wedding.location || "ចុចទីនេះដើម្បីបើកផែនទី Google Maps"}
                                </p>
                            </div>
                        </div>
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}

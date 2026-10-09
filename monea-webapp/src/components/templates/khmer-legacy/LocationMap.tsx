import * as React from 'react';
import { m } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { RevealSection } from '../shared/CinematicComponents';
import { WeddingData } from '../types';
import { getDirectMapUrl } from '../shared/mapUtils';

interface LocationMapProps {
    wedding: WeddingData;
    galleryImages: string[];
    mapPan: any;
}

export function LocationMap({ wedding, galleryImages, mapPan }: LocationMapProps) {
    const mapLink = wedding.themeSettings?.mapLink || wedding.mapUrl || "";
    const locationText = wedding.location || "";
    if (!mapLink && !locationText) return null;

    const portraitImage = galleryImages[2] || galleryImages[1] || galleryImages[0];
    const directMapUrl = getDirectMapUrl(mapLink, locationText);

    return (
        <section id="location" className="py-10 md:py-16 px-4 sm:px-8 md:px-12 bg-white relative overflow-hidden font-kantumruy">
            {/* Background subtle luxury glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] md:w-[1000px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.04)_0%,_transparent_70%)] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <RevealSection>
                    <div className={`grid ${portraitImage ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6 sm:gap-10 items-center`}>
                        {/* Left: Portrait Photo */}
                        {portraitImage && <div className="w-full max-w-[280px] sm:max-w-none mx-auto aspect-[3/4] sm:aspect-[4/5] bg-white p-2 shadow-[0_15px_40px_rgba(212,175,55,0.1)] border border-[#D4AF37]/25 relative overflow-hidden rounded-2xl sm:rounded-3xl group">
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
                        </div>}

                        {/* Right: Location & QR Block */}
                        <div className="flex flex-col items-center justify-center space-y-3.5 sm:space-y-4 text-center">
                            {/* Cursive Gold Title with proper padding to prevent right clipping */}
                            <div className="px-3 pr-5 py-1">
                                <h3 className="font-playfair italic text-3xl sm:text-4xl md:text-5xl text-gold-gradient font-bold leading-tight drop-shadow-sm inline-block">
                                    Location
                                </h3>
                            </div>

                            {/* Interactive QR Code Container */}
                            <m.a
                                href={directMapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.03, y: -4 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full max-w-sm min-h-36 p-5 sm:p-7 bg-white rounded-3xl border-2 border-[#D4AF37]/35 shadow-[0_12px_36px_rgba(212,175,55,0.12)] flex flex-col items-center justify-center gap-3 cursor-pointer group text-center"
                            >
                                <MapPin size={34} className="text-red-500" />
                                <span className="inline-flex items-center gap-2 font-kantumruy text-sm font-bold text-[#805C00]">
                                    <Navigation size={15} />
                                    Open in Google Maps
                                </span>
                            </m.a>

                            {/* Scan or Click Here Subtitle */}
                            <div className="space-y-1 pt-1">
                                <p className="font-playfair font-black text-xs sm:text-sm tracking-[0.2em] text-[#805C00] uppercase hover:text-[#684a00] transition-colors">
                                    OPEN MAP
                                </p>
                                {locationText && <p className="font-kantumruy text-[11px] sm:text-xs text-stone-600 font-medium max-w-xs mx-auto">
                                    {locationText}
                                </p>}
                            </div>
                        </div>
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}

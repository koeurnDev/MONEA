import * as React from "react";
import { m } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { RevealSection } from '../shared/CinematicComponents';
import { WeddingData } from "../types";
import { useTranslation } from "@/i18n/LanguageProvider";

export function EventCountdown({
    wedding,
    galleryImages,
    mounted,
    timeLeft,
    hubPan
}: {
    wedding: WeddingData;
    galleryImages: string[];
    mounted: boolean;
    timeLeft: { days: number; hours: number; minutes: number; seconds: number };
    hubPan: any;
}) {
    const { t } = useTranslation();
    const daysStr = mounted ? String(timeLeft.days).padStart(2, '0') : '--';
    const hoursStr = mounted ? String(timeLeft.hours).padStart(2, '0') : '--';
    const minsStr = mounted ? String(timeLeft.minutes).padStart(2, '0') : '--';

    return (
        <section id="countdown" className="py-10 md:py-16 px-4 sm:px-8 md:px-12 bg-white text-center relative overflow-hidden font-kantumruy">
            {/* Background subtle luxury glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] md:w-[1000px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.04)_0%,_transparent_70%)] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <RevealSection>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-center">
                        {/* Left: Countdown Block */}
                        <div className="flex flex-col items-center md:items-start justify-center space-y-3 md:pl-6">
                            {/* Cursive Gold Title with proper padding to prevent right clipping */}
                            <div className="px-3 pr-5 py-1">
                                <h3 className="font-playfair italic text-3xl sm:text-4xl md:text-5xl text-gold-gradient font-bold leading-tight drop-shadow-sm inline-block">
                                    Countdown
                                </h3>
                            </div>

                            {/* Digits 25 : 12 : 52 */}
                            <div className="flex items-center gap-1.5 sm:gap-2 pt-2">
                                <span className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black text-[#805C00] tracking-tight">
                                    {daysStr}
                                </span>
                                <span className="font-playfair text-2xl sm:text-3xl font-black text-[#805C00]/60 pb-1">:</span>
                                <span className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black text-[#805C00] tracking-tight">
                                    {hoursStr}
                                </span>
                                <span className="font-playfair text-2xl sm:text-3xl font-black text-[#805C00]/60 pb-1">:</span>
                                <span className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black text-[#805C00] tracking-tight">
                                    {minsStr}
                                </span>
                            </div>

                            {/* Labels Below Digits */}
                            <div className="flex items-center justify-between w-full max-w-[220px] sm:max-w-[260px] pt-1 px-1">
                                <span className="font-playfair font-black text-[10px] sm:text-xs text-[#805C00]/80 tracking-[0.2em] uppercase">
                                    DAYS
                                </span>
                                <span className="font-playfair font-black text-[10px] sm:text-xs text-[#805C00]/80 tracking-[0.2em] uppercase">
                                    HOURS
                                </span>
                                <span className="font-playfair font-black text-[10px] sm:text-xs text-[#805C00]/80 tracking-[0.2em] uppercase">
                                    MINUTES
                                </span>
                            </div>

                            {/* Khmer Subtitle Badge */}
                            <p className="font-kantumruy text-xs text-[#805C00]/90 font-bold pt-2">
                                {wedding.themeSettings?.customLabels?.countdownLabel || "រាប់ថយក្រោយដល់ថ្ងៃសិរីមង្គល"}
                            </p>
                        </div>

                        {/* Right: Landscape Photo (Slot 1: Countdown) */}
                        <div className="w-full aspect-[4/3] sm:aspect-[16/11] bg-white p-2 shadow-[0_15px_40px_rgba(212,175,55,0.1)] border border-[#D4AF37]/25 relative overflow-hidden rounded-2xl sm:rounded-3xl group">
                            {(galleryImages[1] || galleryImages[0]) ? (
                                <img 
                                    src={galleryImages[1] || galleryImages[0]} 
                                    className={`w-full h-full object-cover rounded-xl sm:rounded-2xl transition-all duration-1000 ${hubPan.isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'}`} 
                                    style={{ 
                                        objectPosition: `${hubPan.localX || '50%'} ${hubPan.localY || '50%'}`,
                                        userSelect: 'none',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={hubPan.onStart}
                                    onTouchStart={hubPan.onStart}
                                    draggable={false}
                                    alt="Wedding Countdown" 
                                />
                            ) : (
                                <div className="w-full h-full bg-amber-50 rounded-xl sm:rounded-2xl flex items-center justify-center">
                                    <Calendar className="w-12 h-12 text-[#9C7A3C]/40" />
                                </div>
                            )}
                        </div>
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}

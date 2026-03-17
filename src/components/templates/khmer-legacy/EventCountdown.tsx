import * as React from "react";
import { m } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { RevealSection } from '../shared/CinematicComponents';
import { WeddingData } from "../types";

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
    return (
        <section id="event-info" className="py-24 md:py-64 px-8 md:px-12 bg-[#FAF9F6]/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.03] pointer-events-none bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_rgba(184,134,11,0.2)_360deg)]" />

            <div className="max-w-4xl mx-auto relative z-10">
                <RevealSection>
                    <div className="flex flex-col items-center space-y-24">
                        {/* Section Header */}
                        <div className="text-center space-y-6">
                            <div className="flex items-center justify-center gap-6">
                                <div className="w-8 h-[1px] bg-gold/20" />
                                <p className="font-khmer text-[10px] md:text-sm tracking-[0.4em] text-gold/60 uppercase font-black">
                                    {wedding.themeSettings?.customLabels?.infoSubtitle || (wedding.eventType === 'anniversary' ? 'ព័ត៌មានកម្មវិធីខួប' : 'ព័ត៌មានកម្មវិធីមង្គល')}
                                </p>
                                <div className="w-8 h-[1px] bg-gold/20" />
                            </div>
                        </div>

                        {/* Centered Image Card */}
                        <m.div
                            whileHover={{ scale: 1.02 }}
                            className="w-full max-w-sm aspect-[4/5] bg-white p-2 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border-lux relative overflow-hidden rounded-2xl mx-auto"
                        >
                            {galleryImages[0] ? (
                                <img 
                                    src={galleryImages[0]} 
                                    className={`w-full h-full object-cover transition-all duration-1000 ${hubPan.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-105'}`} 
                                    style={{ 
                                        objectPosition: `${hubPan.localX} ${hubPan.localY}`,
                                        userSelect: 'none',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={hubPan.onStart}
                                    onTouchStart={hubPan.onStart}
                                    draggable={false}
                                    alt="Wedding Hub" 
                                />
                            ) : (
                                <div className="w-full h-full bg-gold/5 flex items-center justify-center">
                                    <Calendar className="w-1/3 h-1/3 text-gold/20" />
                                </div>
                            )}
                            {/* Floating Date Badge */}
                            <div className="absolute top-6 left-6 w-16 h-16 bg-white/90 backdrop-blur-md rounded-xl flex flex-col items-center justify-center border border-gold/10 shadow-lg">
                                <span className="font-playfair text-2xl font-black text-gray-800">
                                    {mounted ? new Date(wedding.date).getDate().toString().padStart(2, '0') : '..'}
                                </span>
                                <span className="font-khmer text-[8px] text-gold font-bold uppercase tracking-widest leading-none">
                                    {mounted ? new Date(wedding.date).toLocaleDateString('en-US', { month: 'short' }) : '...'}
                                </span>
                            </div>
                        </m.div>

                        {/* Spaced Calendar & Countdown Info */}
                        <div className="w-full space-y-16 text-center">
                            {/* Calendar Text */}
                            <div className="space-y-4">
                                <p className="font-khmer-moul text-[10px] md:text-sm text-gold/80 tracking-widest">{wedding.themeSettings?.customLabels?.calendarLabel || "ប្រក្រតិទិន"}</p>
                                <div className="space-y-2">
                                    <p className="font-playfair text-4xl md:text-8xl font-black text-gray-800 tracking-tighter">
                                        {mounted ? `${new Date(wedding.date).getDate().toString().padStart(2, '0')}.${(new Date(wedding.date).getMonth() + 1).toString().padStart(2, '0')}.${new Date(wedding.date).getFullYear()}` : '--.--.----'}
                                    </p>
                                    <p className="font-khmer text-[8px] md:text-[14px] tracking-[0.3em] text-gray-400 font-bold uppercase">
                                        {mounted ? new Date(wedding.date).toLocaleDateString('km-KH', { month: 'long', year: 'numeric' }) : '...'}
                                    </p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-24 h-[1px] bg-gold/10 mx-auto" />

                            {/* Premium Spaced Countdown */}
                            <div className="space-y-10">
                                <p className="font-khmer text-[8px] md:text-[12px] tracking-[0.5em] text-gold font-black uppercase">
                                    {wedding.themeSettings?.customLabels?.countdownLabel || "រាប់ថយក្រោយ"}
                                </p>
                                
                                <div className="grid grid-cols-4 gap-4 md:gap-12 max-w-2xl mx-auto">
                                    {[
                                        { val: timeLeft.days, label: wedding.themeSettings?.customLabels?.daysLabel || "DAYS" },
                                        { val: timeLeft.hours, label: wedding.themeSettings?.customLabels?.hoursLabel || "HOURS" },
                                        { val: timeLeft.minutes, label: wedding.themeSettings?.customLabels?.minsLabel || "MINS" },
                                        { val: timeLeft.seconds, label: wedding.themeSettings?.customLabels?.secsLabel || "SECS" }
                                    ].map((unit, idx) => (
                                        <div key={idx} className="flex flex-col items-center space-y-2 group">
                                            <span className="font-playfair text-3xl md:text-6xl font-black text-gray-800 tracking-tighter group-hover:text-gold transition-colors duration-500">
                                                {mounted ? String(unit.val).padStart(2, '0') : '--'}
                                            </span>
                                            <span className="font-khmer text-[7px] md:text-[10px] text-gold/40 font-black uppercase tracking-[0.2em]">
                                                {unit.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}

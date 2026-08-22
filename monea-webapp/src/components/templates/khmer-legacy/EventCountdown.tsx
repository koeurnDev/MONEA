"use client";

import * as React from "react";
import { m } from 'framer-motion';
import Image from 'next/image';
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
    const { t, locale } = useTranslation();
    return (
        <section id="event-info" className="py-32 md:py-64 px-8 md:px-12 bg-[#FDFBF7] relative overflow-hidden">
             {/* Studio Atmosphere */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none premium-texture" />
            <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-main/20 to-transparent" />

            <div className="max-w-5xl mx-auto relative z-10">
                <RevealSection>
                    <div className="flex flex-col items-center space-y-24">
                        {/* Section Header */}
                        <div className="text-center space-y-6">
                            <div className="flex items-center justify-center gap-6">
                                <div className="w-12 h-[1px] bg-gold-main/20" />
                                <p className="font-playfair text-[10px] md:text-sm tracking-[0.2em] md:tracking-[0.8em] text-gold-main/60 uppercase font-black italic leading-relaxed">
                                    {wedding.themeSettings?.customLabels?.infoSubtitle || t("template.khmerLegacy.familySubtitle")}
                                </p>
                                <div className="w-12 h-[1px] bg-gold-main/20" />
                            </div>
                            <h3 className="font-khmer-moul text-3xl md:text-5xl text-gold-gradient text-gold-embossed tracking-wider leading-relaxed">
                                {t("template.khmerLegacy.familyTitle")}
                            </h3>
                        </div>

                        {/* Centered Image Card - Redesigned to floating studio style */}
                        <m.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full max-w-sm aspect-[4/5] bg-white p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-[12px] border-white relative overflow-hidden rounded-[2.5rem] mx-auto ring-1 ring-gold-main/10 group"
                        >
                            {galleryImages[0] ? (
                                <Image 
                                    src={galleryImages[0]} 
                                    fill
                                    className={`object-cover transition-all duration-2000 ${hubPan.isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab group-hover:scale-110'}`} 
                                    style={{ 
                                        objectPosition: `${hubPan.localX} ${hubPan.localY}`,
                                        userSelect: 'none',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={hubPan.onStart}
                                    onTouchStart={hubPan.onStart}
                                    draggable={false}
                                    alt="Wedding Hub" 
                                    sizes="400px"
                                />
                            ) : (
                                <div className="w-full h-full bg-gold-main/5 flex items-center justify-center">
                                    <Calendar className="w-1/3 h-1/3 text-gold-main/20" />
                                </div>
                            )}
                            {/* Floating Date Badge - Glassmorphic */}
                            <div className="absolute top-6 left-6 w-20 h-20 bg-white/40 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center border border-white/50 shadow-xl ring-1 ring-gold-main/20">
                                <span className="font-serif-elegant text-3xl font-black text-slate-800">
                                    {mounted ? new Date(wedding.date).getDate().toString().padStart(2, '0') : '..'}
                                </span>
                                <span className="font-playfair text-[9px] text-gold-main font-black uppercase tracking-widest leading-none">
                                    {mounted ? new Date(wedding.date).toLocaleDateString('en-US', { month: 'short' }) : '...'}
                                </span>
                            </div>
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                        </m.div>

                        {/* Spaced Calendar & Countdown Info */}
                        <div className="w-full space-y-24 text-center">
                            {/* Calendar Text */}
                            <div className="space-y-8">
                                <p className="font-playfair italic text-gold-main/60 text-lg md:text-2xl tracking-widest">{wedding.themeSettings?.customLabels?.calendarLabel || t("invitation.calendar.saveTheDate")}</p>
                                <div className="space-y-4">
                                    <p className="font-playfair text-5xl md:text-9xl font-black text-slate-800 tracking-tighter drop-shadow-sm">
                                        {mounted ? `${new Date(wedding.date).getDate().toString().padStart(2, '0')}.${(new Date(wedding.date).getMonth() + 1).toString().padStart(2, '0')}.${new Date(wedding.date).getFullYear()}` : '--.--.----'}
                                    </p>
                                    <p className="font-khmer text-[10px] md:text-[16px] tracking-[0.5em] text-gold-main/40 font-black uppercase">
                                        {mounted ? new Date(wedding.date).toLocaleDateString(locale === 'km' ? 'km-KH' : 'en-US', { month: 'long', year: 'numeric' }) : '...'}
                                    </p>
                                </div>
                            </div>

                            {/* Divider - Cinematic */}
                            <div className="flex justify-center">
                                <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-gold-main/20 to-transparent" />
                            </div>

                            {/* Premium Spaced Countdown */}
                            <div className="space-y-12">
                                <p className="font-playfair text-[10px] md:text-xs tracking-[0.8em] text-gold-main/60 uppercase font-black italic">
                                    {wedding.themeSettings?.customLabels?.countdownLabel || t("invitation.countdown.title")}
                                </p>
                                
                                <div className="grid grid-cols-4 gap-6 md:gap-16 max-w-3xl mx-auto">
                                    {[
                                        { val: timeLeft.days, label: wedding.themeSettings?.customLabels?.daysLabel || t("invitation.countdown.days") },
                                        { val: timeLeft.hours, label: wedding.themeSettings?.customLabels?.hoursLabel || t("invitation.countdown.hours") },
                                        { val: timeLeft.minutes, label: wedding.themeSettings?.customLabels?.minsLabel || t("invitation.countdown.minutes") },
                                        { val: timeLeft.seconds, label: wedding.themeSettings?.customLabels?.secsLabel || t("invitation.countdown.seconds") }
                                    ].map((unit, idx) => (
                                        <div key={idx} className="flex flex-col items-center space-y-4 group">
                                    <m.span 
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: idx * 0.2 }}
                                    className="font-playfair text-4xl sm:text-6xl md:text-8xl font-black text-slate-800 tracking-tighter group-hover:text-gold-main transition-colors duration-700 drop-shadow-sm leading-tight"
                                >
                                    {mounted ? String(unit.val).padStart(2, '0') : '--'}
                                </m.span>
                                <span className="font-khmer text-[8px] md:text-[12px] text-gold-main/40 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] leading-relaxed">
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

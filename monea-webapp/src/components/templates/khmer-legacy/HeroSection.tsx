"use client";

import { m } from 'framer-motion';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { WeddingData } from '../types';
import { useTranslation } from '@/i18n/LanguageProvider';
import { useState, useEffect } from 'react';

interface HeroSectionProps {
    wedding: WeddingData;
    heroImage: string;
    smartColors: { primary: string; secondary: string; dark: string };
    heroPan: any;
    formattedDateHero: string;
    isMobile?: boolean;
}

export function HeroSection({ wedding, heroImage, smartColors, heroPan, formattedDateHero, isMobile }: HeroSectionProps) {
    const { t, locale } = useTranslation();
    const isAnniversary = wedding.eventType === 'anniversary';
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <section id="hero" className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center overflow-hidden pt-24 pb-16 bg-[#FAFAFA]">
            <m.div
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0"
            >
                {wedding.themeSettings?.videoUrl && !isMobile ? (
                    <div className="w-full h-full relative">
                        <iframe
                            src={`https://www.youtube.com/embed/${wedding.themeSettings.videoUrl.split('v=')[1] || wedding.themeSettings.videoUrl.split('/').pop()}?autoplay=1&mute=1&loop=1&playlist=${wedding.themeSettings.videoUrl.split('v=')[1] || wedding.themeSettings.videoUrl.split('/').pop()}&controls=0&showinfo=0&rel=0&modestbranding=1`}
                            className="absolute inset-0 w-full h-full pointer-events-none scale-[1.5]"
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                        />
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm pointer-events-none" />
                    </div>
                ) : (
                    <>
                        {heroImage && (
                            <div className="absolute inset-0 pointer-events-auto">
                                <Image
                                    src={heroImage}
                                    fill
                                    sizes="100vw"
                                    className={`object-cover transition-none ${heroPan.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                    style={{
                                        objectPosition: `${heroPan.localX} ${heroPan.localY}`,
                                        transform: `scale(${wedding.themeSettings?.heroImageScale || 1})`,
                                        filter: `brightness(${wedding.themeSettings?.heroImageBrightness || 100}%) contrast(${wedding.themeSettings?.heroImageContrast || 100}%) opacity(30%) grayscale(100%)`,
                                        userSelect: 'none',
                                        touchAction: 'none',
                                        willChange: 'object-position, transform'
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        heroPan.onStart(e);
                                    }}
                                    onTouchStart={(e) => {
                                        e.stopPropagation();
                                        heroPan.onStart(e);
                                    }}
                                    priority
                                    draggable={false}
                                    alt="Wedding Hero"
                                    quality={100}
                                />
                            </div>
                        )}
                        {!heroImage && (
                             <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA] to-white" />
                        )}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/40 via-transparent to-white/80" />
                    </>
                )}
            </m.div>

            <div className="relative z-10 px-8 space-y-12 md:space-y-16 pointer-events-none w-full max-w-5xl mx-auto">
                <div className="space-y-10 md:space-y-12">
                    <m.div
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="font-playfair tracking-[0.4em] md:tracking-[0.8em] text-[10px] md:text-xs uppercase font-light text-slate-500"
                    >
                        {wedding.themeSettings?.customLabels?.heroSubtitle || t("template.khmerLegacy.heroSubtitle")}
                    </m.div>

                    <div className="flex flex-col items-center justify-center">
                        <m.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center gap-6 md:gap-8 w-full"
                        >
                            <span className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-normal tracking-wide font-serif-kh-bold text-slate-800 leading-tight">
                                {wedding.groomName}
                            </span>
                            
                            <m.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 1.2, duration: 1 }}
                                className="relative py-4 md:py-8 flex items-center justify-center w-full max-w-[200px]"
                            >
                                <div className="absolute left-0 right-0 h-[1px] bg-slate-200" />
                                <span className="relative px-6 py-2 bg-[#FAFAFA] font-playfair italic text-slate-400 text-lg md:text-2xl font-light">
                                    {wedding.themeSettings?.customLabels?.andLabel || "&"}
                                </span>
                            </m.div>

                            <span className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-normal tracking-wide font-serif-kh-bold text-slate-800 leading-tight">
                                {wedding.brideName}
                            </span>
                        </m.div>
                    </div>
                </div>

                <m.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1.2 }}
                    className="space-y-12 pt-8"
                >
                    <div className="inline-block px-12 py-4 border border-slate-200 rounded-full bg-white/50 backdrop-blur-sm">
                        <span className="text-slate-600 font-sans text-sm md:text-base tracking-[0.3em] uppercase font-medium">
                            {formattedDateHero}
                        </span>
                    </div>

                    <div className="flex justify-center pt-2">
                        <m.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                const type = isAnniversary ? t("common.anniversary") : t("common.wedding");
                                const title = t("invitation.calendar.eventTitle", { groom: wedding.groomName, bride: wedding.brideName });
                                const details = t("invitation.calendar.eventDetails", { groom: wedding.groomName, bride: wedding.brideName });
                                const location = wedding.location || (locale === 'km' ? `កម្មវិធី${type}` : `${type} Event`);
                                const start = new Date(wedding.date).toISOString().replace(/-|:|\.\d\d\d/g, "");
                                const end = new Date(new Date(wedding.date).getTime() + 6*60*60*1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
                                
                                const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
                                window.open(url, '_blank');
                            }}
                            className="group flex items-center gap-4 px-8 md:px-10 py-3 md:py-4 bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-800 hover:text-white hover:border-slate-800 rounded-full text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 pointer-events-auto shadow-sm"
                        >
                            <span>{wedding.themeSettings?.customLabels?.heroButton || t("template.khmerLegacy.heroButton")}</span>
                            <Clock size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                        </m.button>
                    </div>
                </m.div>
            </div>
        </section>
    );
}


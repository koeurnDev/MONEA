"use client";

import { m } from 'framer-motion';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { WeddingData } from '../types';
import { useTranslation } from '@/i18n/LanguageProvider';

interface HeroSectionProps {
    wedding: WeddingData;
    heroImage: string;
    smartColors: { primary: string; secondary: string; dark: string };
    heroPan: any;
    formattedDateHero: string;
}

export function HeroSection({ wedding, heroImage, smartColors, heroPan, formattedDateHero }: HeroSectionProps) {
    const { t, locale } = useTranslation();
    const isAnniversary = wedding.eventType === 'anniversary';

    return (
        <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-24 pb-16" style={{ background: '#1c1917' }}>
            <m.div
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute inset-0"
            >
                {wedding.themeSettings?.videoUrl ? (
                    <div className="w-full h-full relative">
                        <iframe
                            src={`https://www.youtube.com/embed/${wedding.themeSettings.videoUrl.split('v=')[1] || wedding.themeSettings.videoUrl.split('/').pop()}?autoplay=1&mute=1&loop=1&playlist=${wedding.themeSettings.videoUrl.split('v=')[1] || wedding.themeSettings.videoUrl.split('/').pop()}&controls=0&showinfo=0&rel=0&modestbranding=1`}
                            className="absolute inset-0 w-full h-full pointer-events-none scale-[1.5]"
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                        />
                        <div className="absolute inset-0 bg-black/50 pointer-events-none" />
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
                                        filter: `brightness(${wedding.themeSettings?.heroImageBrightness || 100}%) contrast(${wedding.themeSettings?.heroImageContrast || 100}%)`,
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
                             <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-800 to-black" />
                        )}
                        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%)' }} />
                    </>
                )}
            </m.div>

            {/* GOLD DUST PARTICLES - ENHANCED */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(40)].map((_, i) => (
                    <m.div
                        key={i}
                        initial={{ 
                            opacity: 0, 
                            x: Math.random() * 100 + '%', 
                            y: Math.random() * 100 + '%',
                            scale: Math.random() * 0.4 + 0.2
                        }}
                        animate={{ 
                            opacity: [0, 0.5, 0],
                            y: ['-10%', '110%'],
                            x: (Math.random() * 100 - 10) + '%'
                        }}
                        transition={{ 
                            duration: 15 + Math.random() * 25, 
                            repeat: Infinity,
                            delay: Math.random() * 15,
                            ease: "linear"
                        }}
                        className={clsx(
                            "absolute rounded-full",
                            i % 3 === 0 ? "w-1.5 h-1.5 bg-gold-main/60 blur-[2px]" : 
                            i % 2 === 0 ? "w-1 h-1 bg-white/40 blur-[1px]" : 
                            "w-0.5 h-0.5 bg-gold-light/40"
                        )}
                    />
                ))}
            </div>

            <div className="relative z-10 px-8 space-y-8 md:space-y-10 pointer-events-none">
                <div className="space-y-8">
                    <m.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1, duration: 1.2 }}
                        style={{ color: smartColors.primary, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
                        className="font-playfair tracking-[1em] text-[10px] md:text-sm uppercase font-black opacity-80"
                    >
                        {wedding.themeSettings?.customLabels?.heroSubtitle || t("template.khmerLegacy.heroSubtitle")}
                    </m.div>

                    <div className="flex flex-col items-center justify-center">
                        <m.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.2, duration: 2, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center gap-4 md:gap-6"
                        >
                            <span className="text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-[13rem] font-bold tracking-[0.05em] md:tracking-[0.15em] font-serif-kh-bold text-gold-gradient text-gold-embossed leading-[1.2] md:leading-[0.8] filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                                {wedding.groomName}
                            </span>
                            
                            <m.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 2, duration: 1.2 }}
                                className="relative py-6 md:py-16 flex items-center justify-center w-full"
                            >
                                <div className="absolute left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-gold-main/30 to-transparent" />
                                <span className="relative px-8 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 font-playfair italic text-gold-main/70 text-sm md:text-3xl tracking-[0.3em] md:tracking-[0.6em] uppercase font-light shadow-2xl">
                                    {wedding.themeSettings?.customLabels?.andLabel || "&"}
                                </span>
                            </m.div>

                            <span className="text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-[13rem] font-bold tracking-[0.05em] md:tracking-[0.15em] font-serif-kh-bold text-gold-gradient text-gold-embossed leading-[1.2] md:leading-[0.75] filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                                {wedding.brideName}
                            </span>
                        </m.div>
                    </div>
                </div>

                <m.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 2.5, duration: 1.5 }}
                    className="space-y-10"
                >
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-10 md:px-16 py-5 md:py-8 rounded-3xl inline-block shadow-[0_40px_80px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-700 ring-1 ring-gold-main/20">
                        <span className="text-white font-serif-elegant text-lg md:text-3xl tracking-[0.15em] md:tracking-[0.4em] uppercase font-black" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
                            {formattedDateHero}
                        </span>
                    </div>

                    <div className="flex justify-center pt-4">
                        <m.button
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 3 }}
                            whileTap={{ scale: 0.95 }}
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
                            className="group flex items-center gap-4 px-10 md:px-14 py-4 md:py-6 bg-white text-[#1c1917] hover:bg-gold-main hover:text-white rounded-full text-[10px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase transition-all duration-500 hover:scale-110 active:scale-95 pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-gold-main/40"
                        >
                            <span className="leading-none">{wedding.themeSettings?.customLabels?.heroButton || t("template.khmerLegacy.heroButton")}</span>
                            <div className="w-10 h-10 rounded-full bg-[#1c1917]/5 flex items-center justify-center group-hover:bg-white group-hover:text-gold-main transition-colors">
                                <Clock size={18} />
                            </div>
                        </m.button>
                    </div>
                </m.div>
            </div>

            <m.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: [0, 1, 0], y: 0 }}
                transition={{ duration: 2, repeat: Infinity, delay: 3 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 text-gold/60 pointer-events-none"
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-gold to-transparent" />
            </m.div>
        </section>
    );
}

"use client";

import { m } from 'framer-motion';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { WeddingData } from '../types';

interface HeroSectionProps {
    wedding: WeddingData;
    heroImage: string;
    smartColors: { primary: string; secondary: string; dark: string };
    heroPan: any;
    formattedDateHero: string;
}

export function HeroSection({ wedding, heroImage, smartColors, heroPan, formattedDateHero }: HeroSectionProps) {
    const isAnniversary = wedding.eventType === 'anniversary';

    return (
        <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden py-20" style={{ background: '#1c1917' }}>
            <m.div
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute inset-0"
            >
                {/* [Existing video/image logic here - omitting for brevity in TargetContent matching, but I will include it in ReplacementContent] */}
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

            {/* GOLD DUST PARTICLES */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(30)].map((_, i) => (
                    <m.div
                        key={i}
                        initial={{ 
                            opacity: 0, 
                            x: Math.random() * 100 + '%', 
                            y: Math.random() * 100 + '%',
                            scale: Math.random() * 0.5 + 0.5
                        }}
                        animate={{ 
                            opacity: [0, 0.4, 0],
                            y: ['-10%', '110%'],
                            x: (Math.random() * 100 - 10) + '%'
                        }}
                        transition={{ 
                            duration: 10 + Math.random() * 20, 
                            repeat: Infinity,
                            delay: Math.random() * 10
                        }}
                        className="absolute w-1 h-1 bg-gold rounded-full blur-[1px]"
                    />
                ))}
            </div>

            <div className="relative z-10 px-8 space-y-10 pointer-events-none">
                <div className="space-y-6">
                    <m.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        style={{ color: smartColors.primary, textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
                        className="font-playfair tracking-[0.8em] text-[10px] md:text-xs uppercase font-black"
                    >
                        {wedding.themeSettings?.customLabels?.heroSubtitle || (isAnniversary ? "ខួបអាពាហ៍ពិពាហ៍របស់" : "កម្មវិធីអាពាហ៍ពិពាហ៍របស់")}
                    </m.div>

                    <div className="flex flex-col items-center justify-center">
                        <m.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center"
                        >
                            <span className="text-5xl xs:text-6xl sm:text-7xl md:text-[11rem] font-bold tracking-[0.1em] md:tracking-[0.2em] font-serif-kh-bold text-gold-gradient text-gold-embossed leading-[0.8]">
                                {wedding.groomName}
                            </span>
                            
                            <m.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 1.8, duration: 1 }}
                                className="relative py-4 md:py-12 flex items-center justify-center w-full"
                            >
                                <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                                <span className="relative px-6 bg-[#1c1917]/20 backdrop-blur-sm font-playfair italic text-white/40 text-sm md:text-2xl tracking-[0.5em] uppercase font-light">
                                    {wedding.themeSettings?.customLabels?.andLabel || "និង"}
                                </span>
                            </m.div>

                            <span className="text-5xl xs:text-6xl sm:text-7xl md:text-[11rem] font-bold tracking-[0.1em] md:tracking-[0.2em] font-serif-kh-bold text-gold-gradient text-gold-embossed leading-[0.8]">
                                {wedding.brideName}
                            </span>
                        </m.div>
                    </div>
                </div>

                <m.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.8, duration: 1 }}
                    className="space-y-8"
                >
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 px-10 py-5 rounded-full inline-block group" style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        <span className="text-white font-serif-elegant text-lg md:text-2xl tracking-[0.3em] uppercase" style={{ textShadow: '0 2px 20px rgba(0,0,0,1)' }}>
                            {formattedDateHero}
                        </span>
                    </div>

                    <div className="flex justify-center pt-8">
                        <m.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 2.2 }}
                            onClick={() => {
                                const type = isAnniversary ? 'ខួបអាពាហ៍ពិពាហ៍' : 'មង្គលការ';
                                const title = `${type}៖ ${wedding.groomName} & ${wedding.brideName}`;
                                const details = `${type}របស់ ${wedding.groomName} និង ${wedding.brideName}`;
                                const location = wedding.location || `កម្មវិធី${type}`;
                                const start = new Date(wedding.date).toISOString().replace(/-|:|\.\d\d\d/g, "");
                                const end = new Date(new Date(wedding.date).getTime() + 6*60*60*1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
                                
                                const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
                                window.open(url, '_blank');
                            }}
                            className="group flex items-center gap-6 px-10 py-4 bg-white/5 hover:bg-white text-white hover:text-stone-900 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black tracking-[0.3em] uppercase transition-all hover:scale-105 active:scale-95 pointer-events-auto shadow-2xl"
                        >
                            <span>{wedding.themeSettings?.customLabels?.heroButton || "កត់ចំណាំថ្ងៃមង្គល"}</span>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-gold transition-colors">
                                <Clock size={16} />
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

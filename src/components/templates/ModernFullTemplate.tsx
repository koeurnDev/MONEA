"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Music, Music2, ChevronDown, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { WeddingData } from "./types";
import { CldImage } from 'next-cloudinary';

import dynamic from 'next/dynamic';

// Import Components
const TimelineSection = dynamic(() => import('./modern-full/TimelineSection'), { ssr: false });
const EventInfoSection = dynamic(() => import('./modern-full/EventInfoSection'), { ssr: false });
const LoveStorySection = dynamic(() => import('./modern-full/LoveStorySection'), { ssr: false });
const CinematicStoryGallery = dynamic(() => import('./shared/CinematicStoryGallery'), { ssr: false });
const GuestbookSection = dynamic(() => import('./modern-full/GuestbookSection'), { ssr: false });
const GiftSection = dynamic(() => import('./modern-full/GiftSection'), { ssr: false });
const ContactSection = dynamic(() => import('./modern-full/ContactSection'), { ssr: false });
const WishesWall = dynamic(() => import('./shared/WishesWall'), { ssr: false });

import SplashScreen from './modern-full/SplashScreen';
import ParentsSection from './modern-full/ParentsSection';
import CountdownSection from './modern-full/CountdownSection';
import FloatingElements from './FloatingElements';
import { MoneaBranding } from '@/components/MoneaBranding';

// Import Shared Cinematic Components
import { PremiumHeading, RevealSection, LuxurySection, useImagePan } from './shared/CinematicComponents';


export default function ModernFullTemplate({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const [showContent, setShowContent] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [wishTrigger, setWishTrigger] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { scrollY } = useScroll();

    // Parallax Effects
    const textY = useTransform(scrollY, [0, 500], [0, 200]);

    const primaryColor = wedding.themeSettings?.primaryColor || "#8E5A5A";
    const musicUrl = wedding.themeSettings?.musicUrl;

    // Sanitize Hero Image
    let heroImage = wedding.themeSettings?.heroImage || "/images/bg_staircase.jpg";
    if (heroImage && typeof heroImage === 'string') {
        heroImage = heroImage.trim();
        if (heroImage.startsWith('/') && !heroImage.startsWith('/images')) {
            heroImage = heroImage.substring(1);
        }
    }
    if (heroImage.includes("/preview")) heroImage = "/images/bg_staircase.jpg";

    // Cinematic Adjustments
    const heroPan = useImagePan(wedding.themeSettings?.heroImageX || '50%', wedding.themeSettings?.heroImagePosition || '50%', 'heroImageX', 'heroImagePosition');
    const heroScale = wedding.themeSettings?.heroImageScale || 1;
    const heroBrightness = wedding.themeSettings?.heroImageBrightness || 100;
    const heroContrast = wedding.themeSettings?.heroImageContrast || 100;
    const videoUrl = wedding.themeSettings?.videoUrl;

    const labels = wedding.themeSettings?.customLabels || {};

    const validGalleryImages = (wedding.galleryItems || [])
        .map((i: any) => {
            let url = i.url;
            if (!url || typeof url !== 'string') return "";
            url = url.trim();
            if (url.startsWith('/') && !url.startsWith('/images')) {
                url = url.substring(1);
            }
            return url;
        })
        .filter((url: string) => url && !url.includes("/preview") && url !== "");

    // Audio Fade Logic
    useEffect(() => {
        if (!musicUrl || !audioRef.current) return;

        if (isPlaying) {
            audioRef.current.volume = 0;
            audioRef.current.play().then(() => {
                let vol = 0;
                const interval = setInterval(() => {
                    if (vol < 0.6) {
                        vol += 0.05;
                        if (audioRef.current) audioRef.current.volume = vol;
                    } else {
                        clearInterval(interval);
                    }
                }, 100);
            }).catch((err) => console.error("Audio play failed:", err));
        } else {
            let vol = audioRef.current.volume;
            const interval = setInterval(() => {
                if (vol > 0.05) {
                    vol -= 0.05;
                    if (audioRef.current) audioRef.current.volume = vol;
                } else {
                    if (audioRef.current) audioRef.current.pause();
                    clearInterval(interval);
                }
            }, 50);
        }
    }, [isPlaying, musicUrl]);

    const handleDirections = () => {
        if (!wedding.location) return;
        const encodedLocation = encodeURIComponent(wedding.location);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const url = isIOS
            ? `maps://maps.apple.com/?q=${encodedLocation}`
            : `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
        window.open(url, '_blank');
    };

    const handleCalendar = () => {
        const start = new Date(wedding.date).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const end = new Date(new Date(wedding.date).getTime() + 4 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const title = encodeURIComponent(`Wedding: ${wedding.groomName} & ${wedding.brideName}`);
        const location = encodeURIComponent(wedding.location || "");

        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}`;
        window.open(googleUrl, '_blank');
    };

    return (
        <div className="min-h-screen w-full relative font-sans text-slate-800 overflow-x-hidden bg-[#F2F0E9]">
            <style jsx global>{`:root { --primary-color: ${primaryColor}; }`}</style>

            {/* Interactive Wishes Wall */}
            <WishesWall trigger={wishTrigger} />

            {/* 1. SPLASH SCREEN */}
            <SplashScreen
                wedding={wedding}
                guestName={guestName}
                labels={labels}
                primaryColor={primaryColor}
                heroImage={heroImage}
                isOpen={showContent}
                setIsOpen={setShowContent}
                onStartMusic={() => setIsPlaying(true)}
            />

            {/* 2. MAIN CONTENT */}
            {showContent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>

                    {/* FIXED BACKGROUND */}
                    <div className="fixed inset-0 z-0 h-screen">
                        <motion.div
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full h-full cursor-move active:cursor-grabbing"
                            onMouseDown={heroPan.onStart}
                            onTouchStart={heroPan.onStart}
                        >
                            {videoUrl ? (
                                <div className="absolute inset-0 w-full h-full pointer-events-none">
                                    <iframe
                                        className="w-full h-full scale-[1.5]"
                                        src={`https://www.youtube.com/embed/${videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()}?autoplay=1&mute=1&loop=1&playlist=${videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()}&controls=0&showinfo=0&rel=0&modestbranding=1`}
                                        allow="autoplay; encrypted-media"
                                        frameBorder="0"
                                    />
                                </div>
                            ) : (
                                heroImage.startsWith('http') || heroImage.startsWith('/') ? (
                                    <Image
                                        src={heroImage}
                                        alt="Background"
                                        fill
                                        className="object-cover"
                                        style={{
                                            objectPosition: `${heroPan.localX} ${heroPan.localY}`,
                                            transform: `scale(${heroScale})`,
                                            filter: `brightness(${heroBrightness}%) contrast(${heroContrast}%)`,
                                            transition: heroPan.isDragging ? 'none' : 'object-position 0.2s ease-out, transform 0.2s ease-out, filter 0.2s ease-out'
                                        }}
                                        priority
                                        sizes="100vw"
                                    />
                                ) : (
                                    <CldImage
                                        src={heroImage}
                                        alt="Background"
                                        fill
                                        className="object-cover"
                                        style={{
                                            objectPosition: `${heroPan.localX} ${heroPan.localY}`,
                                            transform: `scale(${heroScale})`,
                                            filter: `brightness(${heroBrightness}%) contrast(${heroContrast}%)`,
                                            transition: heroPan.isDragging ? 'none' : 'object-position 0.2s ease-out, transform 0.2s ease-out, filter 0.2s ease-out'
                                        }}
                                        priority
                                        sizes="100vw"
                                    />
                                )
                            )}
                        </motion.div>
                        <div className="absolute inset-0 bg-black/60" />
                        <FloatingElements type={wedding.eventType === 'anniversary' ? 'stars' : 'hearts'} />
                    </div>

                    {/* MUSIC CONTROL */}
                    {musicUrl && (
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="fixed top-5 right-5 z-[60] bg-black/40 backdrop-blur-xl p-3 rounded-full text-white border border-white/20 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
                        >
                            {isPlaying ? (
                                <div className="flex items-center gap-0.5 h-4 px-0.5">
                                    {[1, 2, 3, 4].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [4, 12, 6, 14, 4] }}
                                            transition={{ duration: 0.8 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                                            className="w-0.5 bg-[#D4AF37] rounded-full"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <Music2 size={20} className="text-white/40" />
                            )}
                        </button>
                    )}

                    {/* CONTENT */}
                    <div className="relative z-10 w-full flex flex-col items-center">
                        {/* HERO */}
                        <section id="hero" className="h-screen w-full flex flex-col items-center justify-center text-center px-4 relative">
                            <motion.div style={{ y: textY }} className="space-y-6">
                                <motion.p
                                    initial={{ opacity: 0, letterSpacing: "0.2em" }}
                                    animate={{ opacity: 1, letterSpacing: "0.5em" }}
                                    transition={{ duration: 2, delay: 0.5 }}
                                    className="text-[#D4AF37] text-xs md:text-sm uppercase font-bold drop-shadow-md font-kantumruy"
                                >
                                    {wedding.themeSettings?.welcomeMessage || labels.hero_title || (wedding.eventType === 'anniversary' ? "HAPPY ANNIVERSARY" : "SAVE THE DATE")}
                                </motion.p>

                                <div className="space-y-2">
                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 1.2, delay: 0.8 }}
                                        className="text-4xl sm:text-5xl md:text-9xl text-white font-moul bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60 drop-shadow-2xl leading-tight"
                                    >
                                        {wedding.groomName}
                                    </motion.h1>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 1, delay: 1 }}
                                        className="flex items-center justify-center gap-4"
                                    >
                                        <div className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent to-[#D4AF37]" />
                                        <span className="text-4xl md:text-6xl text-[#D4AF37] font-vibes">&</span>
                                        <div className="h-[1px] w-12 md:w-20 bg-gradient-to-l from-transparent to-[#D4AF37]" />
                                    </motion.div>
                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 1.2, delay: 1.2 }}
                                        className="text-4xl sm:text-5xl md:text-9xl text-white font-moul bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60 drop-shadow-2xl leading-tight"
                                    >
                                        {wedding.brideName}
                                    </motion.h1>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1, delay: 1.5 }}
                                    className="inline-block border-y border-[#D4AF37]/50 px-10 py-3 mt-6"
                                >
                                    <p className="text-[#D4AF37] text-xl md:text-2xl font-khmer tracking-widest">{new Date(wedding.date).toLocaleDateString('en-GB')}</p>
                                </motion.div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3, duration: 1 }} className="absolute bottom-24 text-white/40 animate-bounce flex flex-col items-center">
                                <span className="text-[10px] uppercase mb-1 tracking-widest">Scroll</span>
                                <ChevronDown size={20} />
                            </motion.div>
                        </section>

                        <div className="w-full -mt-10 pt-10 pb-32 space-y-16 relative z-20">
                            {(() => {
                                const visibility = wedding.themeSettings?.visibility || {};
                                return (
                                    <>
                                        {visibility.showEventInfo !== false && <CountdownSection targetDate={wedding.date} eventType={wedding.eventType} />}

                                        <div id="event-info" className="space-y-16">
                                            {wedding.eventType !== 'anniversary' && (
                                                <RevealSection>
                                                    <LuxurySection>
                                                        <h2 className="text-center font-moul text-xl text-[#D4AF37] mb-8">{labels.invite_title}</h2>
                                                        <ParentsSection wedding={wedding} labels={labels} />
                                                    </LuxurySection>
                                                </RevealSection>
                                            )}

                                            {visibility.showTimeline !== false && (
                                                <RevealSection>
                                                    <LuxurySection>
                                                        <PremiumHeading className="text-xl md:text-2xl mb-8">
                                                            កម្មវិធីមង្គល
                                                        </PremiumHeading>
                                                        <TimelineSection wedding={wedding} labels={labels} primaryColor={primaryColor} />
                                                    </LuxurySection>
                                                </RevealSection>
                                            )}
                                        </div>

                                        {visibility.showStory !== false && (
                                            <RevealSection>
                                                <LuxurySection id="lovestory">
                                                    <PremiumHeading className="text-xl md:text-2xl mb-8">{labels.storyTitle || (wedding.eventType === 'anniversary' ? "ដំណើរជីវិតរបស់យើង" : "Our Journey")}</PremiumHeading>
                                                    <LoveStorySection
                                                        galleryImages={validGalleryImages}
                                                        storyImages={wedding.themeSettings?.storyImages || []}
                                                        year={new Date(wedding.date).getFullYear()}
                                                        eventType={wedding.eventType}
                                                    />
                                                </LuxurySection>
                                            </RevealSection>
                                        )}

                                        {visibility.showEventInfo !== false && (
                                            <RevealSection>
                                                <LuxurySection id="location">
                                                    <PremiumHeading className="text-xl md:text-2xl mb-8">{labels.location_label}</PremiumHeading>
                                                    <EventInfoSection wedding={wedding} labels={labels} primaryColor={primaryColor} />
                                                    <div className="flex flex-wrap gap-4 justify-center mt-12">
                                                        <button onClick={handleDirections} className="px-8 py-3 bg-[#D4AF37] text-black rounded-full font-bold text-sm shadow-xl shadow-[#D4AF37]/20 hover:scale-105 transition-transform flex items-center gap-2">
                                                            <MapPin size={18} /> {labels.directions_btn || "GET DIRECTIONS"}
                                                        </button>
                                                        <button onClick={handleCalendar} className="px-8 py-3 border border-[#D4AF37] text-[#D4AF37] rounded-full font-bold text-sm hover:bg-[#D4AF37]/5 transition-colors flex items-center gap-2">
                                                            <Calendar size={18} /> {labels.calendar_btn || "ADD TO CALENDAR"}
                                                        </button>
                                                    </div>
                                                </LuxurySection>
                                            </RevealSection>
                                        )}

                                        {visibility.showGallery !== false && validGalleryImages.length > 0 && (
                                            <RevealSection>
                                                <div id="gallery" className="p-6 md:p-10 mx-auto w-full md:max-w-[95vw] mb-16 relative z-10">
                                                    <PremiumHeading>{labels.gallery_title}</PremiumHeading>
                                                    <CinematicStoryGallery items={wedding.galleryItems} labels={wedding.themeSettings?.customLabels} />
                                                </div>
                                            </RevealSection>
                                        )}

                                        {visibility.showGuestbook !== false && (
                                            <RevealSection>
                                                <div id="guestbook" className="max-w-2xl mx-auto px-4 space-y-16 mb-20 relative z-10">
                                                    <PremiumHeading>{labels.guestbook_title || "Guestbook"}</PremiumHeading>
                                                    <GuestbookSection
                                                        guestName={guestName}
                                                        primaryColor={primaryColor}
                                                        wedding={wedding}
                                                        onNewWish={() => setWishTrigger(prev => prev + 1)}
                                                    />
                                                    <GiftSection wedding={wedding} />
                                                </div>
                                            </RevealSection>
                                        )}

                                        {visibility.showContact !== false && (
                                            <RevealSection>
                                                <div className="mb-20">
                                                    <ContactSection wedding={wedding} />
                                                </div>
                                            </RevealSection>
                                        )}
                                    </>
                                );
                            })()}

                            <div className="flex flex-col items-center gap-8 pt-10 pb-20">
                                <p className="text-center text-white/60 text-xs font-khmer">
                                    សូមអរគុណ | {wedding.groomName} & {wedding.brideName}
                                </p>
                                <MoneaBranding />
                            </div>
                        </div>
                    </div>

                    {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="auto" style={{ display: 'none' }} />}
                </motion.div>
            )
            }
        </div >
    );
}

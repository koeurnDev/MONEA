"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { WeddingData } from "./types";
import { Heart, MapPin, Music, Music2, Clock, Calendar, Flower, Sparkles, Send } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { MoneaBranding } from '@/components/MoneaBranding';
import GuestbookSection from './modern-full/GuestbookSection';
import WishesWall from './shared/WishesWall';
import { PremiumHeading, RevealSection, LuxurySection, useImagePan } from './shared/CinematicComponents';
import CinematicStoryGallery from './shared/CinematicStoryGallery';
import { CinematicTimeline } from './shared/CinematicTimeline';

const KbachOrnament = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center justify-center gap-4 py-8 pointer-events-none ${className}`}>
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#B8860B] to-transparent" />
        <svg viewBox="0 0 100 100" className="w-12 h-12 fill-[#B8860B] opacity-60">
            <path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" />
            <circle cx="50" cy="50" r="10" stroke="#B8860B" strokeWidth="2" fill="none" />
        </svg>
        <div className="h-px w-20 bg-gradient-to-l from-transparent via-[#B8860B] to-transparent" />
    </div>
);

const Parchment = ({ children, className = "", scrollYProgress }: { children: React.ReactNode; className?: string; scrollYProgress?: any }) => {
    const rollerRotation = useTransform(scrollYProgress || 0, [0, 1], [0, 1080]);

    return (
        <div className={`relative ${className}`}>
            {/* Top Roller */}
            <motion.div
                style={{ rotateX: rollerRotation }}
                className="sticky top-0 z-30 h-10 w-full bg-gradient-to-b from-[#8B4513] via-[#D4AF37] to-[#8B4513] shadow-xl rounded-t-full border-b border-black/20 flex items-center justify-center overflow-hidden"
            >
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
                <div className="w-full h-[2px] bg-white/20" />
            </motion.div>

            <div className="relative border-x-[12px] border-[#D4AF37]/10 shadow-2xl">
                <div className="absolute inset-0 bg-[#F4E4BC] shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]" />
                <div className="absolute inset-0 opacity-[0.25] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]" />
                <div className="absolute inset-0 opacity-[0.1] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/weathered-paper.png')]" />
                <div className="relative z-10 p-12 md:p-24">
                    {children}
                </div>
            </div>

            {/* Bottom Roller */}
            <motion.div
                style={{ rotateX: rollerRotation }}
                className="h-10 w-full bg-gradient-to-b from-[#8B4513] via-[#D4AF37] to-[#8B4513] shadow-2xl rounded-b-full border-t border-black/20 relative z-30 flex items-center justify-center overflow-hidden"
            >
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
                <div className="w-full h-[2px] bg-white/20" />
            </motion.div>
        </div>
    );
};

export default function CanvaInvitation({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [wishTrigger, setWishTrigger] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { scrollY, scrollYProgress } = useScroll();

    // Cinematic Effects
    const yHero = useTransform(scrollY, [0, 500], [0, 200]);
    const textY = useTransform(scrollY, [0, 500], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1.1, 1]);

    const musicUrl = wedding.themeSettings?.musicUrl;
    const heroImage = wedding.themeSettings?.heroImage || wedding.galleryItems[0]?.url || "/images/bg_staircase.jpg";

    // Cinematic Adjustments
    const heroPan = useImagePan(wedding.themeSettings?.heroImageX || '50%', wedding.themeSettings?.heroImagePosition || '50%', 'heroImageX', 'heroImagePosition');
    const heroAdjustScale = wedding.themeSettings?.heroImageScale || 1;
    const heroBrightness = wedding.themeSettings?.heroImageBrightness || 100;
    const heroContrast = wedding.themeSettings?.heroImageContrast || 100;
    const videoUrl = wedding.themeSettings?.videoUrl;

    // Audio Fade Logic
    useEffect(() => {
        if (!musicUrl || !audioRef.current) return;
        if (isPlaying) {
            audioRef.current.volume = 0;
            audioRef.current.play().then(() => {
                let vol = 0;
                const interval = setInterval(() => {
                    if (vol < 0.6) { vol += 0.05; if (audioRef.current) audioRef.current.volume = vol; }
                    else { clearInterval(interval); }
                }, 100);
            }).catch(e => console.log(e));
        } else {
            let vol = audioRef.current.volume;
            const interval = setInterval(() => {
                if (vol > 0.05) { vol -= 0.05; if (audioRef.current) audioRef.current.volume = vol; }
                else { if (audioRef.current) audioRef.current.pause(); clearInterval(interval); }
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
        const details = encodeURIComponent("Thank you for joining our special day!");

        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
        window.open(googleUrl, '_blank');
    };

    return (
        <div className="min-h-screen font-sans selection:bg-rose-100 text-stone-800 bg-[#FDFBF7] overflow-x-hidden relative">
            <style jsx global>{`
                .font-moul { font-family: var(--font-moul), serif; }
                .font-khmer { font-family: var(--font-kantumruy), sans-serif; }
                .parchment-text {
                    color: #3E2723;
                    text-shadow: 0.5px 0.5px 0px rgba(255,255,255,0.5);
                }
                .sepia-filter {
                    filter: sepia(0.6) contrast(1.1) brightness(0.9);
                }
            `}</style>

            <WishesWall trigger={wishTrigger} />


            {/* Global Background Effect */}
            <div className="fixed inset-0 z-0 bg-[#E8D5B5]">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/weathered-paper.png')]" />
            </div>

            <div className="relative z-10">
                {/* Music Sidebar (Cinematic style) */}
                {musicUrl && (
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-stone-200 p-3 rounded-full shadow-lg hover:scale-110 transition-all group"
                    >
                        {isPlaying ? <Music className="w-5 h-5 text-rose-400 animate-spin-slow" /> : <Music2 className="w-5 h-5 text-stone-400" />}
                    </button>
                )}

                {/* HERO SECTION */}
                <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
                    <motion.div
                        style={{ opacity: heroOpacity, scale: heroScale, y: yHero }}
                        className="absolute inset-0 z-0 cursor-move active:cursor-grabbing"
                        onMouseDown={heroPan.onStart}
                        onTouchStart={heroPan.onStart}
                    >
                        {videoUrl ? (
                            <div className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                                <iframe
                                    className="w-full h-full scale-[1.5]"
                                    src={`https://www.youtube.com/embed/${videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()}?autoplay=1&mute=1&loop=1&playlist=${videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()}&controls=0&showinfo=0&rel=0&modestbranding=1`}
                                    allow="autoplay; encrypted-media"
                                    frameBorder="0"
                                />
                            </div>
                        ) : (
                            heroImage.startsWith('http') || heroImage.startsWith('/') ? (
                                <img
                                    src={heroImage}
                                    alt="Hero"
                                    className="w-full h-full object-cover"
                                    style={{
                                        objectPosition: `${heroPan.localX} ${heroPan.localY}`,
                                        transform: `scale(${heroAdjustScale})`,
                                        filter: `brightness(${heroBrightness}%) contrast(${heroContrast}%)`,
                                        transition: heroPan.isDragging ? 'none' : 'object-position 0.2s ease-out, transform 0.2s ease-out, filter 0.2s ease-out'
                                    }}
                                />
                            ) : (
                                <CldImage
                                    src={heroImage}
                                    alt="Hero"
                                    fill
                                    className="object-cover"
                                    style={{
                                        objectPosition: `${heroPan.localX} ${heroPan.localY}`,
                                        transform: `scale(${heroAdjustScale})`,
                                        filter: `brightness(${heroBrightness}%) contrast(${heroContrast}%)`,
                                        transition: heroPan.isDragging ? 'none' : 'object-position 0.2s ease-out, transform 0.2s ease-out, filter 0.2s ease-out'
                                    }}
                                    priority
                                />
                            )
                        )}
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FDFBF7]" />
                    </motion.div>

                    <div className="relative z-10 text-center px-6">
                        <motion.div style={{ y: textY }} className="space-y-6">
                            <RevealSection>
                                <p className="font-body text-xs tracking-[0.5em] uppercase text-white/90 drop-shadow-md mb-4 bg-black/10 backdrop-blur-sm inline-block px-6 py-2 rounded-full">
                                    The Wedding of
                                </p>
                                <h1 className="font-moul text-5xl md:text-8xl text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] leading-tight">
                                    {wedding.groomName} <br />
                                    <span className="font-script text-4xl text-rose-200 my-4 block">&</span>
                                    {wedding.brideName}
                                </h1>
                                <div className="mt-8 border-y border-white/40 inline-block py-3 px-12">
                                    <p className="font-khmer text-2xl italic text-white tracking-widest">
                                        {new Date(wedding.date).toLocaleDateString('km-KH', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </RevealSection>
                        </motion.div>
                    </div>

                    <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 flex flex-col items-center gap-2 opacity-60">
                        <div className="w-px h-12 bg-white" />
                        <span className="text-[10px] tracking-widest uppercase text-white font-bold">Scroll</span>
                    </motion.div>
                </section>

                {/* Welcome Parchment */}
                <section className="py-24 px-4 md:px-0">
                    <div className="max-w-4xl mx-auto">
                        <Parchment scrollYProgress={scrollYProgress}>
                            <div className="flex flex-col items-center text-center space-y-12 parchment-text">
                                <KbachOrnament />
                                <h2 className="font-moul text-4xl leading-relaxed">
                                    "មរតកនៃក្តីស្រលាញ់"
                                </h2>
                                <p className="font-khmer text-xl leading-loose text-stone-600 max-w-2xl italic">
                                    "Love is the only treasure that grows when it's shared."
                                </p>
                                {guestName && (
                                    <div className="w-full space-y-4 pt-10 border-t border-[#D4AF37]/20">
                                        <p className="font-khmer text-sm tracking-[0.4em] uppercase text-[#B8860B] font-bold">គោរពអញ្ជើញលោកអ្នក</p>
                                        <p className="font-moul text-3xl">{guestName}</p>
                                    </div>
                                )}
                                <KbachOrnament className="rotate-180" />
                            </div>
                        </Parchment>
                    </div>
                </section>

                {/* Cinematic Story Gallery */}
                <div id="gallery">
                    <CinematicStoryGallery items={wedding.galleryItems} labels={wedding.themeSettings?.customLabels} />
                </div>

                {/* Details Scroll */}
                <section id="event-info" className="py-24">
                    <div className="max-w-4xl mx-auto px-4 md:px-0">
                        <Parchment scrollYProgress={scrollYProgress} className="rotate-[0.5deg]">
                            <div className="space-y-20 parchment-text">
                                <div className="text-center">
                                    <h2 className="font-moul text-4xl mb-4">កម្មវិធីមង្គល</h2>
                                    <div className="h-px w-32 mx-auto bg-[#B8860B] opacity-30" />
                                </div>
                                {/* ... existing content ... */}
                                <div className="grid md:grid-cols-2 gap-20">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 text-[#B8860B]">
                                            <MapPin size={24} />
                                            <h3 className="font-moul text-xl">ទីតាំង</h3>
                                        </div>
                                        <p className="font-khmer text-lg leading-relaxed">{wedding.location}</p>
                                        <div className="flex flex-wrap gap-4 pt-4">
                                            <button onClick={handleDirections} className="px-6 py-2 bg-[#B8860B] text-white rounded-full font-bold text-sm shadow-lg shadow-[#B8860B]/20 hover:scale-105 transition-transform">
                                                នាំផ្លូវ
                                            </button>
                                            <button onClick={handleCalendar} className="px-6 py-2 border border-[#B8860B] text-[#B8860B] rounded-full font-bold text-sm hover:bg-[#B8860B]/5 transition-colors">
                                                ដាក់ក្នុងប្រតិទិន
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <CinematicTimeline items={wedding.activities.map(a => ({
                                            time: a.time,
                                            description: a.description || ""
                                        }))} />
                                    </div>
                                </div>

                                <div id="guestbook" className="pt-20 border-t border-[#D4AF37]/20">
                                    <h3 className="font-moul text-2xl text-center mb-12">ពាក្យជូនពរ</h3>
                                    <GuestbookSection wedding={wedding} onNewWish={() => setWishTrigger(t => t + 1)} />
                                </div>
                            </div>
                        </Parchment>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-32 flex flex-col items-center gap-12 text-center opacity-40">
                    <KbachOrnament />
                    <div>
                        <h3 className="font-moul text-3xl text-stone-800 mb-4">{wedding.groomName} & {wedding.brideName}</h3>
                        <p className="font-khmer text-[10px] tracking-[0.5em] uppercase opacity-60">Heritage . Anniversary . 2024</p>
                    </div>
                    <MoneaBranding />
                </footer>
            </div>

            {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="auto" style={{ display: 'none' }} />}
        </div>
    );
}

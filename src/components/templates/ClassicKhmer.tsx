"use client";
import React, { useState, useEffect, useRef } from 'react';
import { WeddingData } from "./types";
import { CldImage } from 'next-cloudinary';
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Clock, ArrowRight, Music, Music2, Heart } from 'lucide-react';
import Countdown from './classic-khmer/Countdown';
import { MoneaBranding } from '@/components/MoneaBranding';
import WishesWall from './shared/WishesWall';
import GuestbookSection from './modern-full/GuestbookSection';

// Import Shared Cinematic Components
import { PremiumHeading, RevealSection, LuxurySection, useImagePan } from './shared/CinematicComponents';
import CinematicStoryGallery from './shared/CinematicStoryGallery';

// Floating Flower Component
const FloatingFlower = ({ src, className, duration = 20, delay = 0 }: { src: string; className: string; duration?: number; delay?: number }) => (
    <motion.img
        src={src}
        className={`pointer-events-none absolute ${className}`}
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: [-20, 20, -20], opacity: 0.15 }}
        transition={{
            y: { duration, repeat: Infinity, ease: "easeInOut", delay },
            opacity: { duration: 2, delay }
        }}
        alt=""
    />
);

export default function ClassicKhmer({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const [wishTrigger, setWishTrigger] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const heroImage = wedding.themeSettings?.heroImage || "/images/bg_staircase.jpg";
    const musicUrl = wedding.themeSettings?.musicUrl;
    const galleryImages = wedding.galleryItems?.filter(i => i.type === 'IMAGE').map(i => i.url) || [];

    // Cinematic Adjustments
    const heroPan = useImagePan(wedding.themeSettings?.heroImageX || '50%', wedding.themeSettings?.heroImagePosition || '50%', 'heroImageX', 'heroImagePosition');
    const heroAdjustScale = wedding.themeSettings?.heroImageScale || 1;
    const heroBrightness = wedding.themeSettings?.heroImageBrightness || 100;
    const heroContrast = wedding.themeSettings?.heroImageContrast || 100;
    const videoUrl = wedding.themeSettings?.videoUrl;
    const displayGallery = galleryImages.length > 0 ? galleryImages : [
        "/images/bg_staircase.jpg", "/images/bg_tunnel.jpg", "/images/bg_enchanted.jpg"
    ];

    const { scrollY, scrollYProgress } = useScroll();

    // Cinematic Effects
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1.1, 1]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const textY = useTransform(scrollY, [0, 500], [0, 200]);

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

    return (
        <main className="min-h-screen bg-[#FDFBF7] text-[#2C2C2C] overflow-hidden selection:bg-[#F3EAF6] selection:text-[#8E5A5A]">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,700;1,400;1,700&display=swap');
                .font-editorial { font-family: var(--font-playfair), serif; font-weight: 700; }
                .font-serif-refined { font-family: 'Cormorant Garamond', serif; }
                .font-khmer-moul { font-family: var(--font-moul), serif; }
                .font-body { font-family: var(--font-kantumruy), sans-serif; }
                .font-script { font-family: var(--font-great-vibes), cursive; }
                
                .glass-card {
                    background: rgba(255, 255, 255, 0.5);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .mag-border { border: 1px solid rgba(212, 175, 55, 0.2); }
            `}</style>

            <WishesWall trigger={wishTrigger} />

            {/* MUSIC CONTROL */}
            {musicUrl && (
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="fixed top-5 right-5 z-[60] bg-white/40 backdrop-blur-xl p-3 rounded-full text-[#D4AF37] border border-[#D4AF37]/20 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
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
                        <Music2 size={20} className="text-[#D4AF37]/40" />
                    )}
                </button>
            )}

            {/* FIXED TEXTURE BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.04]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* HERO SECTION - MAGAZINE COVER */}
            <section id="hero" className="relative h-screen w-full flex flex-col justify-between p-8 md:p-16 z-10 overflow-hidden">
                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale }}
                    className="absolute inset-0 z-0 cursor-move active:cursor-grabbing"
                    onMouseDown={heroPan.onStart}
                    onTouchStart={heroPan.onStart}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#FDFBF7]" />
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
                            <img
                                src={heroImage}
                                alt="Cover"
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
                                alt="Cover"
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
                </motion.div>

                {/* Navbar Area */}
                <nav className="relative z-10 flex justify-between items-center text-[#2C2C2C] mix-blend-multiply">
                    <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xs tracking-[0.4em] uppercase font-bold">Volume I | No. 01</motion.span>
                    <motion.span initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-xs tracking-[0.4em] uppercase font-bold">{new Date(wedding.date).toLocaleDateString('en-GB')}</motion.span>
                </nav>

                {/* Central Title */}
                <div className="relative z-10 mt-auto mb-12 flex flex-col items-center md:items-start text-center md:text-left">
                    <motion.div
                        style={{ y: textY }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2 }}
                        className="max-w-4xl"
                    >
                        {guestName && (
                            <div className="mb-6 space-y-1">
                                <p className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-bold">Respected Guest</p>
                                <p className="font-moul text-xl md:text-2xl text-[#2C2C2C]">គោរពអញ្ជើញ {guestName}</p>
                            </div>
                        )}
                        <p className="font-script text-5xl md:text-7xl text-[#D4AF37] mb-8">{wedding.eventType === 'anniversary' ? 'The Anniversary of' : 'The Wedding of'}</p>
                        <h1 className="font-editorial text-7xl md:text-[12rem] leading-[0.75] text-[#2C2C2C] tracking-tighter uppercase">
                            {wedding.groomName} <br />
                            <div className="flex items-center gap-8 my-4">
                                <div className="h-[2px] flex-1 bg-[#D4AF37]/40" />
                                <span className="italic text-[#8E8E8E] font-extralight text-4xl md:text-6xl normal-case">and</span>
                                <div className="h-[2px] flex-1 bg-[#D4AF37]/40" />
                            </div>
                            <span className="md:ml-20">{wedding.brideName}</span>
                        </h1>
                    </motion.div>
                </div>

                <FloatingFlower src="/images/floral_corner.png" className="-top-20 -left-20 w-[400px] rotate-12" duration={25} />
                <FloatingFlower src="/images/floral_corner.png" className="-bottom-20 -right-20 w-[500px] rotate-[200deg]" duration={30} delay={2} />
            </section>

            {/* EDITORIAL STORY - MAGAZINE FEATURE */}
            <div className="relative z-10 bg-[#FDFBF7]">
                <section className="py-48 px-6 md:px-20 max-w-7xl mx-auto overflow-hidden">
                    <div className="absolute left-[-10%] top-[20%] text-[20rem] font-editorial italic opacity-[0.03] select-none pointer-events-none">
                        Legacy
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-start relative">
                        {/* Pull Quote - Floating */}
                        <motion.div
                            initial={{ x: -100, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="hidden lg:block absolute -left-12 top-1/4 z-20 w-1/3 p-12 bg-white/40 backdrop-blur-xl border-l-4 border-[#D4AF37]"
                        >
                            <p className="font-serif-refined italic text-3xl text-[#2C2C2C] leading-tight">
                                "Love is not just looking at each other, it's looking in the same direction."
                            </p>
                            <span className="block mt-4 text-[10px] tracking-widest uppercase font-bold text-[#D4AF37]">Antoine de Saint-Exupéry</span>
                        </motion.div>

                        <div className="md:col-span-5 space-y-12 relative z-10">
                            <RevealSection>
                                <div className="space-y-10">
                                    <div className="inline-block px-4 py-2 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase font-bold">
                                        Cover Story
                                    </div>
                                    <h2 className="font-editorial text-6xl md:text-7xl italic leading-[1.1] text-[#2C2C2C]">
                                        A Symphony <br />of <span className="text-[#D4AF37]">Two Souls</span>
                                    </h2>
                                    <div className="w-24 h-[1px] bg-[#D4AF37]" />
                                    <p className="font-serif-refined text-[#555] leading-relaxed text-2xl italic">
                                        {wedding.themeSettings?.groomStory || "A journey of two souls becoming one. We invite you to join us on this special day as we celebrate a love that knows no bounds."}
                                    </p>
                                    <div className="pt-8 flex flex-wrap gap-12">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">The Protagonists</span>
                                            <span className="font-editorial text-2xl">{wedding.groomName} & {wedding.brideName}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">Chronicle Date</span>
                                            <span className="font-editorial text-2xl">{new Date(wedding.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </RevealSection>
                        </div>

                        <div id="gallery" className="md:col-span-7 space-y-8">
                            {/* Cinematic Story Gallery */}
                            <CinematicStoryGallery items={wedding.galleryItems} labels={wedding.themeSettings?.customLabels} />
                        </div>
                    </div>
                </section>

                {/* DETAILS PANEL */}
                <section id="event-info" className="py-24 px-6 bg-white border-y border-gray-100">
                    <RevealSection>
                        <PremiumHeading>{wedding.eventType === 'anniversary' ? "កម្មវិធីអបអរសាទរ" : "ព័ត៌មានកម្មវិធី"}</PremiumHeading>
                    </RevealSection>

                    <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
                        {[
                            { icon: Calendar, label: "DATE", value: new Date(wedding.date).toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' }) },
                            { icon: Clock, label: "TIME", value: "07:00 AM - 10:00 PM" },
                            { icon: MapPin, label: "LOCATION", value: wedding.location }
                        ].map((item, i) => (
                            <RevealSection key={i} delay={i * 0.1}>
                                <div className="text-center space-y-4 group p-8 hover:bg-[#FDFBF7] transition-colors duration-500 rounded-2xl">
                                    <div className="mx-auto w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500">
                                        <item.icon size={20} />
                                    </div>
                                    <span className="block text-[10px] tracking-[0.3em] font-bold text-[#D4AF37]">{item.label}</span>
                                    <p className="font-editorial text-2xl text-[#2C2C2C]">{item.value}</p>
                                </div>
                            </RevealSection>
                        ))}
                    </div>

                    <RevealSection delay={0.4}>
                        <div className="mt-20 flex justify-center">
                            <div className="glass-card px-12 py-8 rounded-none border border-[#D4AF37]/20 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                                <Countdown wedding={wedding} />
                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                            </div>
                        </div>
                    </RevealSection>
                </section>

                {/* ITINERARY */}
                <section className="py-32 px-6 max-w-4xl mx-auto">
                    <RevealSection>
                        <PremiumHeading>របៀបវារៈកម្មវិធី</PremiumHeading>
                    </RevealSection>
                    <div className="space-y-12">
                        {(wedding.activities || []).map((item, idx) => (
                            <RevealSection key={idx} delay={idx * 0.1}>
                                <div className="grid grid-cols-12 gap-8 items-center border-b border-gray-100 pb-8 hover:border-[#D4AF37]/30 transition-colors group">
                                    <div className="col-span-3">
                                        <span className="font-script text-4xl text-[#D4AF37]">{item.time}</span>
                                    </div>
                                    <div className="col-span-9 space-y-2">
                                        <h3 className="font-editorial text-2xl group-hover:text-[#D4AF37] transition-colors">{item.title}</h3>
                                        <p className="font-body text-gray-500">{item.description}</p>
                                    </div>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </section>

                {/* GUESTBOOK INTEGRATION */}
                <section id="guestbook" className="py-24 px-6 bg-[#2C2C2C]/5">
                    <RevealSection>
                        <div className="max-w-4xl mx-auto glass-card p-12 rounded-[2rem]">
                            <PremiumHeading className="mb-0">សូមអរគុណសម្រាប់ពាក្យជូនពរ</PremiumHeading>
                            <GuestbookSection
                                wedding={wedding}
                                guestName={guestName}
                                onNewWish={() => setWishTrigger(prev => prev + 1)}
                            />
                        </div>
                    </RevealSection>
                </section>

                {/* DIRECTION CTA */}
                <section className="relative py-40 bg-[#2C2C2C] overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <img src={displayGallery[displayGallery.length - 1]} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-black/60" />

                    <div className="relative z-10 text-center text-white px-6">
                        <RevealSection>
                            <p className="font-script text-4xl text-[#D4AF37] mb-6 tracking-wide">Join us in paradise</p>
                            <h2 className="font-editorial text-5xl md:text-7xl mb-12 italic">Let's Celebrate Together</h2>
                            <a
                                href={wedding.themeSettings?.mapLink || "#"}
                                target="_blank"
                                className="inline-flex items-center gap-6 px-12 py-5 border border-white/30 hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-500 group"
                            >
                                <span className="uppercase tracking-[0.3em] text-xs font-bold">Get Information & Directions</span>
                                <ArrowRight className="group-hover:translate-x-2 transition-transform" size={18} />
                            </a>
                        </RevealSection>

                        <div className="mt-32 pt-20 border-t border-white/10 flex flex-col items-center gap-10">
                            <PremiumHeading className="mb-0 text-white italic opacity-80 bg-none text-white drop-shadow-none">
                                សូមអរគុណ | {wedding.groomName} & {wedding.brideName}
                            </PremiumHeading>
                            <MoneaBranding />
                        </div>
                    </div>
                </section>

                {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="auto" style={{ display: 'none' }} />}
            </div>
        </main>
    );
}

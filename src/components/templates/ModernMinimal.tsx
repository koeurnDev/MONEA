"use client";
import React, { useState, useEffect, useRef } from 'react';
import { WeddingData } from "./types";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { CldImage } from 'next-cloudinary';
import { MapPin, Music, Music2, X, Clock, Calendar, Heart, ChevronDown, ArrowRight } from "lucide-react";
import dynamic from 'next/dynamic';

// Import Components
const GuestbookSection = dynamic(() => import('./modern-full/GuestbookSection'), { ssr: false });
const WishesWall = dynamic(() => import('./shared/WishesWall'), { ssr: false });
const CinematicStoryGallery = dynamic(() => import('./shared/CinematicStoryGallery'), { ssr: false });

import CountdownSection from './modern-full/CountdownSection';
import { MoneaBranding } from '@/components/MoneaBranding';

// Import Shared Cinematic Components
import { PremiumHeading, RevealSection, LuxurySection, useImagePan } from './shared/CinematicComponents';

export default function ModernMinimal({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [wishTrigger, setWishTrigger] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { scrollY, scrollYProgress } = useScroll();

    // Parallax Effects
    const bgY = useTransform(scrollY, [0, 1000], [0, 200]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1.1, 1]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const textY = useTransform(scrollY, [0, 500], [0, 150]);

    const musicUrl = wedding.themeSettings?.musicUrl;
    const primaryColor = wedding.themeSettings?.primaryColor || "#8E5A5A";
    const labels = wedding.themeSettings?.customLabels || {};

    let heroImage = wedding.themeSettings?.heroImage || "/images/bg_staircase.jpg";
    if (heroImage?.includes("/preview")) heroImage = "/images/bg_staircase.jpg";

    const galleryImages = (wedding.galleryItems || []).map(i => i.url);

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
                    if (vol < 0.6) { vol += 0.05; if (audioRef && audioRef.current) audioRef.current.volume = vol; }
                    else { clearInterval(interval); }
                }, 100);
            }).catch(e => console.log(e));
        } else {
            let vol = audioRef.current.volume;
            const interval = setInterval(() => {
                if (vol > 0.05) { vol -= 0.05; if (audioRef && audioRef.current) audioRef.current.volume = vol; }
                else { if (audioRef && audioRef.current) audioRef.current.pause(); clearInterval(interval); }
            }, 50);
        }
    }, [isPlaying, musicUrl]);

    return (
        <div className="min-h-screen bg-[#0f172a] font-sans text-slate-300 overflow-x-hidden selection:bg-[#D4AF37] selection:text-white">
            <style jsx global>{`
                .font-moul { font-family: var(--font-moul), serif; }
                .font-khmer { font-family: var(--font-kantumruy), sans-serif; }
                .sharp-glass {
                    background: rgba(30, 41, 59, 0.4);
                    backdrop-filter: blur(40px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 20px 50px rgba(0,0,0,0.3);
                }
                .neumorphic-button {
                    background: #1e293b;
                    box-shadow: 5px 5px 10px #161e2b, -5px -5px 10px #26344b;
                    border: none;
                }
                .neumorphic-button:active {
                    box-shadow: inset 5px 5px 10px #161e2b, inset -5px -5px 10px #26344b;
                }
                .modular-border {
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
            `}</style>

            <WishesWall trigger={wishTrigger} />

            {/* SPLASH SCREEN */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-white p-6">
                        <div className="absolute inset-0 grayscale opacity-40">
                            <img src={heroImage} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-lg">
                            <p className="tracking-[0.5em] uppercase text-[10px] font-bold text-[#D4AF37]">{wedding.eventType === 'anniversary' ? "ខួបអាពាហ៍ពិពាហ៍" : "សិរីមង្គលអាពាហ៍ពិពាហ៍"}</p>
                            <h1 className="font-moul text-4xl md:text-6xl text-slate-900 leading-tight">
                                {wedding.groomName} <br />
                                <span className="font-vibes text-3xl md:text-5xl text-[#D4AF37] my-4 block">&</span>
                                {wedding.brideName}
                            </h1>
                            {guestName && (
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">គោរពអញ្ជើញ</p>
                                    <p className="font-moul text-xl text-slate-800">{guestName}</p>
                                </div>
                            )}
                            <button
                                onClick={() => { setIsOpen(true); setIsPlaying(true); }}
                                className="mt-8 px-12 py-4 bg-slate-900 text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#D4AF37] transition-all duration-500 rounded-full"
                            >
                                បើកសំបុត្រ
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT */}
            {isOpen && (
                <div className="relative z-10">
                    <motion.div
                        style={{ opacity: heroOpacity, scale: heroScale }}
                        className="fixed inset-0 z-0 cursor-move active:cursor-grabbing"
                        onMouseDown={heroPan.onStart}
                        onTouchStart={heroPan.onStart}
                    >
                        <div className="absolute inset-0 bg-[#0f172a] z-[-1]" />
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
                            <img
                                src={heroImage}
                                className="w-full h-full object-cover"
                                style={{
                                    objectPosition: `${heroPan.localX} ${heroPan.localY}`,
                                    transform: `scale(${heroAdjustScale})`,
                                    filter: `grayscale(100%) brightness(${heroBrightness * 0.3}%) contrast(${heroContrast}%)`,
                                    transition: heroPan.isDragging ? 'none' : 'object-position 0.2s ease-out, transform 0.2s ease-out, filter 0.2s ease-out'
                                }}
                                alt=""
                                sizes="100vw"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/80 via-transparent to-[#0f172a]" />
                    </motion.div>

                    {/* Music Button */}
                    {musicUrl && (
                        <div className="fixed top-6 right-6 z-[60]">
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="bg-white/40 backdrop-blur-xl p-3 rounded-full border border-white/20 shadow-xl hover:scale-110 active:scale-95 transition-all text-[#D4AF37]"
                            >
                                {isPlaying ? (
                                    <div className="flex items-center gap-0.5 h-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <motion.div key={i} animate={{ height: [4, 10, 5, 12, 4] }} transition={{ duration: 0.8 + Math.random(), repeat: Infinity }} className="w-0.5 bg-[#D4AF37] rounded-full" />
                                        ))}
                                    </div>
                                ) : <Music2 size={16} className="text-slate-400" />}
                            </button>
                        </div>
                    )}

                    <div className="relative z-10 w-full flex flex-col items-center">
                        {/* HERO */}
                        <section id="hero" className="h-screen w-full flex flex-col items-center justify-center text-center px-6 relative modular-border">
                            <div className="absolute inset-0 grid grid-cols-4 pointer-events-none">
                                <div className="border-r border-white/5 relative">
                                    <motion.div animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
                                </div>
                                <div className="border-r border-white/5 relative">
                                    <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute right-0 top-1/4 bottom-1/4 w-[1px] bg-gradient-to-b from-transparent via-white/30 to-transparent" />
                                </div>
                                <div className="border-r border-white/5 relative">
                                    <motion.div animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 4, repeat: Infinity, delay: 2 }} className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
                                </div>
                            </div>
                            <div className="absolute inset-0 grid grid-rows-4 pointer-events-none">
                                <div className="border-b border-white/5" />
                                <div className="border-b border-white/5 relative">
                                    <motion.div animate={{ opacity: [0, 1, 0], left: ["0%", "100%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute bottom-0 w-20 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                                </div>
                                <div className="border-b border-white/5" />
                            </div>
                            <motion.div style={{ y: textY }}>
                                <RevealSection>
                                    <div className="space-y-4">
                                        <p className="text-[10px] tracking-[0.8em] font-bold text-slate-400 uppercase">Modular // Standard</p>
                                        <h1 className="font-moul text-4xl sm:text-6xl md:text-9xl text-white leading-none">
                                            {wedding.groomName} <br />
                                            <span className="text-slate-500 font-sans font-light">&</span> <br />
                                            {wedding.brideName}
                                        </h1>
                                        <div className="pt-10 flex flex-col items-center gap-4">
                                            <div className="w-16 h-0.5 bg-white" />
                                            <p className="font-mono text-xl tracking-widest text-[#D4AF37]">{new Date(wedding.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' . ')}</p>
                                        </div>
                                    </div>
                                </RevealSection>
                            </motion.div>
                        </section>

                        <div className="w-full space-y-0">
                            {/* Cinematic Story Gallery */}
                            <div id="gallery">
                                <CinematicStoryGallery items={wedding.galleryItems} labels={wedding.themeSettings?.customLabels} />
                            </div>

                            {/* Modular Grid Info - Restored */}
                            <section id="event-info" className="grid grid-cols-1 md:grid-cols-2 border-y border-white/5">
                                <div className="p-12 md:p-24 space-y-12 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-center">
                                    <RevealSection>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-[#D4AF37]" />
                                                <span className="text-[10px] tracking-[0.4em] font-bold uppercase text-slate-500">Coordinate . 01</span>
                                            </div>
                                            <h2 className="font-moul text-4xl md:text-6xl text-white">The <br /> Location</h2>
                                            <p className="font-khmer text-slate-400 text-xl leading-relaxed">{wedding.location}</p>
                                            <a href={wedding.themeSettings?.mapLink} className="inline-flex items-center gap-4 group">
                                                <span className="neumorphic-button px-8 py-3 rounded-none text-[10px] tracking-widest text-white uppercase group-hover:text-[#D4AF37] transition-all">Navigation</span>
                                                <ArrowRight size={14} className="text-[#D4AF37] transition-transform group-hover:translate-x-2" />
                                            </a>
                                        </div>
                                    </RevealSection>
                                </div>
                                <div className="relative aspect-square md:aspect-auto overflow-hidden">
                                    <img src={heroImage} className="absolute inset-0 w-full h-full object-cover grayscale brightness-50" />
                                    <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay" />
                                </div>
                            </section>

                            <section className="grid grid-cols-1 md:grid-cols-2 border-b border-white/5">
                                <div className="relative aspect-square md:aspect-auto overflow-hidden order-2 md:order-1 grayscale brightness-75">
                                    <img src={galleryImages[0] || heroImage} className="absolute inset-0 w-full h-full object-cover" />
                                </div>
                                <div className="p-12 md:p-24 space-y-12 order-1 md:order-2 flex flex-col justify-center bg-[#1e293b]">
                                    <RevealSection>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-[#D4AF37]" />
                                                <span className="text-[10px] tracking-[0.4em] font-bold uppercase text-slate-500">Time . 02</span>
                                            </div>
                                            <h2 className="font-moul text-4xl md:text-6xl text-white">The <br /> Ceremony</h2>
                                            <p className="font-khmer text-slate-400 text-xl leading-relaxed">
                                                {new Date(wedding.date).toLocaleDateString('km-KH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </RevealSection>
                                </div>
                            </section>

                            {/* Guestbook in Modular Frame */}
                            <section id="guestbook" className="p-12 md:p-24 bg-white/5 backdrop-blur-3xl border-b border-white/5">
                                <div className="max-w-4xl mx-auto space-y-12">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                                        <h2 className="font-moul text-5xl md:text-7xl text-white leading-none">Wishes // <br />Blessings</h2>
                                        <div className="h-px flex-1 bg-white/10 hidden md:block mb-4" />
                                        <p className="font-khmer text-slate-500 italic max-w-xs">{labels.guestbook_title || "សូមផ្ញើពាក្យជូនពរដល់ពួកយើង"}</p>
                                    </div>
                                    <div className="sharp-glass p-8 md:p-16">
                                        <GuestbookSection
                                            wedding={wedding}
                                            guestName={guestName}
                                            primaryColor={primaryColor}
                                            onNewWish={() => setWishTrigger(prev => prev + 1)}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Final Footer */}
                            <footer className="p-20 grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-white/5 opacity-50">
                                <div className="space-y-2">
                                    <p className="font-moul text-[#D4AF37]">{wedding.groomName} & {wedding.brideName}</p>
                                    <p className="text-[10px] tracking-[0.3em] font-bold uppercase text-slate-500">2024 . Wedding Production</p>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <MoneaBranding />
                                </div>
                                <div className="text-right flex flex-col justify-end">
                                    <p className="text-[8px] tracking-[0.5em] uppercase text-slate-500">End . Signature</p>
                                </div>
                            </footer>
                        </div>
                    </div>

                    {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="auto" style={{ display: 'none' }} />}
                </div>
            )}
        </div>
    );
}

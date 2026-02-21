"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Music, Music2, ChevronDown, Calendar, MapPin, Sparkles, Star } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { WeddingData } from "./types";
import dynamic from 'next/dynamic';
import { PremiumHeading, RevealSection, LuxurySection } from './shared/CinematicComponents';
import { MoneaBranding } from '@/components/MoneaBranding';

// Shared components for structural consistency
const TimelineSection = dynamic(() => import('./modern-full/TimelineSection'), { ssr: false });
const EventInfoSection = dynamic(() => import('./modern-full/EventInfoSection'), { ssr: false });
const CinematicStoryGallery = dynamic(() => import('./shared/CinematicStoryGallery'), { ssr: false });
const GuestbookSection = dynamic(() => import('./modern-full/GuestbookSection'), { ssr: false });
const GiftSection = dynamic(() => import('./modern-full/GiftSection'), { ssr: false });

const StarField = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const stars: { x: number, y: number, size: number, speed: number, alpha: number, fadeSpeed: number }[] = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                speed: Math.random() * 0.05,
                alpha: Math.random(),
                fadeSpeed: 0.005 + Math.random() * 0.01
            });
        }

        let animationFrameId: number;
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";

            stars.forEach(star => {
                star.alpha += star.fadeSpeed;
                if (star.alpha > 1 || star.alpha < 0) star.fadeSpeed *= -1;

                ctx.globalAlpha = Math.max(0, star.alpha);
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();

                star.y -= star.speed;
                if (star.y < 0) star.y = canvas.height;
            });

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
};

export default function CelestialElegance({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const [showContent, setShowContent] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { scrollY } = useScroll();

    const primaryColor = wedding.themeSettings?.primaryColor || "#D4AF37";
    const musicUrl = wedding.themeSettings?.musicUrl;
    const heroImage = wedding.themeSettings?.heroImage || "/images/bg_tunnel.jpg";
    const labels = wedding.themeSettings?.customLabels || {};

    const textY = useTransform(scrollY, [0, 800], [0, 250]);
    const bgScale = useTransform(scrollY, [0, 1000], [1, 1.2]);

    useEffect(() => {
        if (!musicUrl || !audioRef.current) return;
        if (isPlaying) {
            audioRef.current.volume = 0;
            audioRef.current.play().then(() => {
                let vol = 0;
                const interval = setInterval(() => {
                    if (vol < 0.5) { vol += 0.05; if (audioRef.current) audioRef.current.volume = vol; }
                    else clearInterval(interval);
                }, 100);
            });
        } else {
            if (audioRef.current) audioRef.current.pause();
        }
    }, [isPlaying, musicUrl]);

    return (
        <div className="min-h-screen w-full relative bg-[#050510] text-white/90 font-sans overflow-x-hidden selection:bg-emerald-500/30">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;500;900&display=swap');
                :root { --primary-color: ${primaryColor}; }
                .font-outfit { font-family: 'Outfit', sans-serif; }
            `}</style>

            <StarField />

            {/* SPLASH SCREEN */}
            <AnimatePresence>
                {!showContent && (
                    <motion.div
                        exit={{ opacity: 0, y: -100 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050510]"
                    >
                        <div className="text-center space-y-8 px-6">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1.5 }}
                                className="relative w-48 h-48 mx-auto"
                            >
                                <div className="absolute inset-0 rounded-full border border-white/10 animate-spin-slow" />
                                <div className="absolute inset-4 rounded-full border border-white/20 animate-reverse-spin-slow" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Star className="w-12 h-12 text-[#D4AF37] fill-[#D4AF37] animate-pulse" />
                                </div>
                            </motion.div>

                            <div className="space-y-4">
                                <h2 className="text-sm tracking-[0.5em] text-white/40 uppercase font-outfit">Celestial Journey</h2>
                                <h1 className="text-3xl md:text-5xl font-moul leading-relaxed">
                                    {wedding.groomName} & {wedding.brideName}
                                </h1>
                            </div>

                            <button
                                onClick={() => { setShowContent(true); setIsPlaying(true); }}
                                className="px-12 py-4 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all duration-500 font-outfit uppercase tracking-widest text-xs group"
                            >
                                Open Invitation <Sparkles className="inline ml-2 w-4 h-4 group-hover:animate-spin" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT */}
            {showContent && (
                <main className="relative z-10">
                    {/* HERO */}
                    <section className="h-screen w-full flex items-center justify-center relative">
                        <motion.div style={{ scale: bgScale }} className="absolute inset-0 z-0">
                            <Image src={heroImage} alt="Hero" fill className="object-cover opacity-30" priority />
                            <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-transparent to-[#050510]" />
                        </motion.div>

                        <motion.div style={{ y: textY }} className="relative z-10 text-center space-y-8">
                            <motion.span
                                initial={{ opacity: 0, letterSpacing: "0.2em" }}
                                animate={{ opacity: 1, letterSpacing: "0.8em" }}
                                className="text-emerald-400 text-xs md:text-sm font-bold block"
                            >
                                {labels.hero_title || "FOREVER & ALWAYS"}
                            </motion.span>

                            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                                <h1 className="text-6xl md:text-9xl font-moul text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">{wedding.groomName}</h1>
                                <span className="text-4xl md:text-6xl text-[#D4AF37] font-outfit font-thin">&</span>
                                <h1 className="text-6xl md:text-9xl font-moul text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">{wedding.brideName}</h1>
                            </div>

                            <div className="w-px h-24 bg-gradient-to-b from-[#D4AF37] to-transparent mx-auto mt-12" />

                            <p className="text-xl md:text-3xl font-outfit font-light tracking-[0.3em]">
                                {new Date(wedding.date).toLocaleDateString('km-KH', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </motion.div>
                    </section>

                    {/* CONTENT SECTIONS */}
                    <div className="space-y-40 pb-40">
                        <RevealSection>
                            <LuxurySection className="bg-white/5 border-white/10 backdrop-blur-md">
                                <PremiumHeading className="text-emerald-400 mb-12">Event Details</PremiumHeading>
                                <EventInfoSection wedding={wedding} labels={labels} primaryColor="#10B981" />
                            </LuxurySection>
                        </RevealSection>

                        <RevealSection>
                            <div className="max-w-6xl mx-auto px-6">
                                <PremiumHeading>Our Timeline</PremiumHeading>
                                <TimelineSection wedding={wedding} labels={labels} primaryColor="#D4AF37" />
                            </div>
                        </RevealSection>

                        <RevealSection>
                            <div className="px-4">
                                <PremiumHeading>Gallery of Dreams</PremiumHeading>
                                <CinematicStoryGallery items={wedding.galleryItems} labels={labels} />
                            </div>
                        </RevealSection>

                        <RevealSection>
                            <div className="max-w-3xl mx-auto px-6">
                                <PremiumHeading>Guestbook</PremiumHeading>
                                <GuestbookSection wedding={wedding} primaryColor="#D4AF37" guestName={guestName} />
                                <div className="mt-20">
                                    <GiftSection wedding={wedding} />
                                </div>
                            </div>
                        </RevealSection>
                    </div>

                    <div className="pb-20 text-center space-y-6">
                        <p className="text-white/40 font-outfit uppercase tracking-widest text-[10px]">Eternal Celestial Wedding</p>
                        <MoneaBranding />
                    </div>
                </main>
            )}

            {musicUrl && <audio ref={audioRef} src={musicUrl} loop style={{ display: 'none' }} />}
        </div>
    );
}

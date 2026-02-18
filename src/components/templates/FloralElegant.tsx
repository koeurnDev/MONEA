"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { Heart, MapPin, Music, Music2, Flower, ArrowRight, ChevronDown, Calendar } from 'lucide-react';
import { WeddingData } from "./types";
import { MoneaBranding } from '@/components/MoneaBranding';
import GuestbookSection from './modern-full/GuestbookSection';
import WishesWall from './shared/WishesWall';

// Import Shared Cinematic Components
import { PremiumHeading, RevealSection, LuxurySection, useImagePan } from './shared/CinematicComponents';
import CinematicStoryGallery from './shared/CinematicStoryGallery';

const FallingPetals = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let petals: any[] = [];
        const petalCount = 15;

        const resize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Petal {
            x: number; y: number; w: number; h: number; opacity: number; flip: number; xSpeed: number; ySpeed: number; flipSpeed: number;
            constructor() {
                this.x = Math.random() * (canvas?.width || 1000);
                this.y = Math.random() * (canvas?.height || 1000) - (canvas?.height || 1000);
                this.w = 5 + Math.random() * 10;
                this.h = 5 + Math.random() * 10;
                this.opacity = 0.2 + Math.random() * 0.3;
                this.flip = Math.random();
                this.xSpeed = 0.5 + Math.random() * 1;
                this.ySpeed = 0.5 + Math.random() * 1.5;
                this.flipSpeed = 0.01 + Math.random() * 0.03;
            }
            update() {
                this.x += this.xSpeed;
                this.y += this.ySpeed;
                this.flip += this.flipSpeed;
                if (this.y > (canvas?.height || 1000)) {
                    this.y = -20;
                    this.x = Math.random() * (canvas?.width || 1000);
                }
            }
            draw() {
                if (!ctx) return;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.flip);
                ctx.scale(Math.sin(this.flip), 1);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(this.w, -this.h, this.w, this.h, 0, this.h);
                ctx.bezierCurveTo(-this.w, this.h, -this.w, -this.h, 0, 0);
                ctx.fillStyle = `rgba(255, 182, 193, ${this.opacity})`;
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < petalCount; i++) petals.push(new Petal());

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            petals.forEach(p => { p.update(); p.draw(); });
            animationFrameId = requestAnimationFrame(render);
        };

        window.addEventListener('resize', resize);
        resize();
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-20 opactiy-50" />;
};

const FloralDivider = () => (
    <div className="flex items-center justify-center gap-4 py-12 opacity-30">
        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-pink-300" />
        <Flower size={18} className="text-pink-400" />
        <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-pink-300" />
    </div>
);

const FloralCluster = ({ className, delay = 0, speed = 0, scrollY }: { className: string; delay?: number; speed?: number; scrollY: any }) => {
    const yParallax = useTransform(scrollY, [0, 5000], [0, speed * 1000]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            whileInView={{ opacity: 0.15, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay, ease: "easeOut" }}
            style={{ y: yParallax }}
            className={`absolute pointer-events-none select-none ${className}`}
        >
            <svg viewBox="0 0 200 200" className="w-64 h-64 fill-pink-300">
                <path d="M100,20 C120,50 180,50 180,100 C180,150 120,150 100,180 C80,150 20,150 20,100 C20,50 80,50 100,20" opacity="0.3" />
                <path d="M100,40 C115,65 160,65 160,100 C160,135 115,135 100,160 C85,135 40,135 40,100 C40,65 85,65 100,40" opacity="0.5" />
            </svg>
        </motion.div>
    );
};

export default function FloralElegant({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [wishTrigger, setWishTrigger] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { scrollY, scrollYProgress } = useScroll();

    // Cinematic Effects
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1.1, 1]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const textY = useTransform(scrollY, [0, 500], [0, 150]);

    const primaryColor = wedding.themeSettings?.primaryColor || "#D48B8B";
    const musicUrl = wedding.themeSettings?.musicUrl;
    const heroImage = wedding.themeSettings?.heroImage || "/images/bg_staircase.jpg";

    // Cinematic Adjustments
    const heroPan = useImagePan(wedding.themeSettings?.heroImageX || '50%', wedding.themeSettings?.heroImagePosition || '50%', 'heroImageX', 'heroImagePosition');
    const heroAdjustScale = wedding.themeSettings?.heroImageScale || 1;
    const heroBrightness = wedding.themeSettings?.heroImageBrightness || 100;
    const heroContrast = wedding.themeSettings?.heroImageContrast || 100;
    const videoUrl = wedding.themeSettings?.videoUrl;

    const labels = wedding.themeSettings?.customLabels || {};

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
        <div className="min-h-screen font-sans relative overflow-x-hidden bg-[#FFFAF0] text-slate-800 selection:bg-pink-100 italic-style">
            <style jsx global>{`
                .font-script { font-family: var(--font-great-vibes), cursive; }
                .watercolor-bg {
                    background: radial-gradient(circle at 20% 30%, rgba(255, 192, 203, 0.1) 0%, transparent 50%),
                                radial-gradient(circle at 80% 70%, rgba(255, 240, 245, 0.2) 0%, transparent 50%);
                }
            `}</style>

            <WishesWall trigger={wishTrigger} />

            {/* SPLASH SCREEN */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFFAF0] p-8 border-[20px] border-double border-pink-50">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <img src="/images/floral_corner.png" className="w-full h-full object-cover" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-10 text-center">
                            <p className="tracking-[0.5em] text-[10px] uppercase font-bold text-pink-400">{wedding.eventType === 'anniversary' ? 'A Celebration of Love' : 'Wedding Invitation'}</p>
                            <h1 className="font-moul text-4xl md:text-6xl text-slate-900 leading-tight">
                                {wedding.groomName} <br />
                                <span className="font-vibes text-3xl text-pink-400 my-4 block">&</span>
                                {wedding.brideName}
                            </h1>
                            {guestName && (
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-widest text-pink-300 font-bold">គោរពអញ្ជើញ</p>
                                    <p className="font-moul text-xl text-slate-800">{guestName}</p>
                                </div>
                            )}
                            <button
                                onClick={() => { setIsOpen(true); setIsPlaying(true); }}
                                className="bg-white px-10 py-4 rounded-full border border-pink-200 shadow-xl hover:bg-pink-50 transition-all font-bold tracking-widest text-[10px] uppercase"
                            >
                                Open Invitation
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT */}
            {isOpen && (
                <div className="relative z-10 watercolor-bg">
                    <motion.div
                        style={{ opacity: heroOpacity, scale: heroScale }}
                        className="fixed inset-0 z-0 cursor-move active:cursor-grabbing"
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
                            <img
                                src={heroImage}
                                className="w-full h-full object-cover"
                                style={{
                                    objectPosition: `${heroPan.localX} ${heroPan.localY}`,
                                    transform: `scale(${heroAdjustScale})`,
                                    filter: `brightness(${heroBrightness}%) contrast(${heroContrast}%)`,
                                    transition: heroPan.isDragging ? 'none' : 'object-position 0.2s ease-out, transform 0.2s ease-out, filter 0.2s ease-out'
                                }}
                                alt=""
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFAF0]/40 via-transparent to-[#FFFAF0]" />
                    </motion.div>

                    <div className="fixed top-5 right-5 z-[60]">
                        <button onClick={() => setIsPlaying(!isPlaying)} className="bg-white/60 backdrop-blur-xl p-3 rounded-full shadow-lg text-pink-400 border border-pink-100/50 hover:scale-110 transition-transform">
                            {isPlaying ? <Music className="animate-spin-slow" /> : <Music2 />}
                        </button>
                    </div>

                    <FallingPetals />

                    <div className="relative z-10 w-full flex flex-col items-center">
                        {/* HERO */}
                        <section id="hero" className="h-screen w-full flex flex-col items-center justify-center text-center px-6 relative">
                            <motion.div style={{ y: textY }}>
                                <RevealSection>
                                    <div className="space-y-8">
                                        <Flower className="mx-auto text-pink-200 animate-pulse" size={48} />
                                        <h1 className="font-moul text-5xl md:text-8xl text-slate-900 drop-shadow-sm leading-tight">
                                            {wedding.groomName} <br />
                                            <span className="font-vibes text-4xl text-pink-400 my-2 block">&</span>
                                            {wedding.brideName}
                                        </h1>
                                        <div className="inline-block border-y border-pink-200/50 px-12 py-3 mt-6">
                                            <p className="font-khmer text-xs tracking-[0.4em] text-pink-400 font-bold uppercase">{new Date(wedding.date).toLocaleDateString('km-KH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </RevealSection>
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="absolute bottom-10 animate-bounce text-pink-200">
                                <ChevronDown size={24} />
                            </motion.div>
                        </section>

                        <div className="w-full space-y-24 md:space-y-48 pb-16 md:pb-32">
                            {/* Cinematic Story Gallery */}
                            <div id="gallery">
                                <CinematicStoryGallery items={wedding.galleryItems} labels={wedding.themeSettings?.customLabels} />
                            </div>

                            {/* Event Details - Restored */}
                            <RevealSection>
                                <div id="event-info" className="max-w-4xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8 md:gap-12 text-center md:text-left bg-white/30 backdrop-blur-xl p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-pink-100">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-pink-400 justify-center md:justify-start">
                                            <MapPin size={24} />
                                            <h3 className="font-moul text-xl">ទីតាំងកម្មវិធី</h3>
                                        </div>
                                        <p className="font-khmer text-lg text-slate-600">{wedding.location}</p>
                                        {wedding.themeSettings?.mapLink && (
                                            <a href={wedding.themeSettings.mapLink} target="_blank" className="inline-block text-pink-400 font-bold border-b border-pink-200 text-sm mt-2">មើលលើផែនទី</a>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-pink-400 justify-center md:justify-start">
                                            <Calendar size={24} />
                                            <h3 className="font-moul text-xl">កាលបរិច្ឆេទ</h3>
                                        </div>
                                        <p className="font-khmer text-lg text-slate-600">
                                            {new Date(wedding.date).toLocaleDateString('km-KH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </RevealSection>

                            {/* Floating Itinerary - Asymmetrical */}
                            <section className="relative w-full max-w-5xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 text-pink-300">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-pink-200" />
                                        <p className="font-moul tracking-widest text-sm uppercase">Program</p>
                                    </div>
                                    <h2 className="font-moul text-4xl text-slate-900 leading-tight">កាលវិភាគកម្មវិធីនៃ <br /><span className="text-pink-400 font-script text-5xl italic">Our Story</span></h2>
                                    <p className="font-khmer text-slate-500 leading-relaxed text-lg italic">
                                        "Love grows best in little houses, with fewer walls and more music."
                                    </p>
                                </div>

                                <div className="space-y-12 relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-pink-100 via-pink-200 to-transparent" />
                                    {(wedding.activities || []).map((item, idx) => (
                                        <RevealSection key={idx} delay={idx * 0.1}>
                                            <div className="pl-8 relative group">
                                                <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-pink-300 group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(244,114,182,0.5)]" />
                                                <p className="text-[10px] font-bold tracking-[0.4em] text-pink-300 mb-2 uppercase">{item.time}</p>
                                                <p className="font-moul text-lg text-slate-800 mb-2">{item.title}</p>
                                                <p className="font-khmer text-slate-400 leading-relaxed">{item.description}</p>
                                            </div>
                                        </RevealSection>
                                    ))}
                                </div>
                            </section>

                            {/* Floating Blessed Wishes */}
                            <section id="guestbook" className="relative px-4 md:px-6">
                                <FloralCluster className="top-1/4 -left-32" scrollY={scrollY} speed={0.1} delay={0.8} />
                                <div className="max-w-4xl mx-auto relative">
                                    <div className="absolute -inset-20 bg-pink-50/50 rounded-full blur-3xl opacity-50" />
                                    <RevealSection>
                                        <div className="relative z-10 space-y-12">
                                            <div className="text-center">
                                                <PremiumHeading variant="floral" className="text-4xl mb-2">ផ្ញើពាក្យជូនពរ</PremiumHeading>
                                                <p className="font-khmer text-slate-400 italic">"Your blessings mean the world to us."</p>
                                            </div>
                                            <div className="bg-white/40 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] border border-white/60 shadow-xl">
                                                <GuestbookSection
                                                    wedding={wedding}
                                                    guestName={guestName}
                                                    primaryColor={primaryColor}
                                                    onNewWish={() => setWishTrigger(prev => prev + 1)}
                                                />
                                            </div>
                                        </div>
                                    </RevealSection>
                                </div>
                                <FloralCluster className="-bottom-32 -right-32" scrollY={scrollY} speed={0.05} />
                                <FloralCluster className="-bottom-64 -left-32 scale-150" scrollY={scrollY} speed={-0.2} delay={1.2} />
                            </section>

                            {/* Footer */}
                            <footer className="flex flex-col items-center gap-12 py-20 opacity-40">
                                <div className="h-px w-32 bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
                                <h3 className="font-script text-4xl text-pink-300">{wedding.groomName} & {wedding.brideName}</h3>
                                <MoneaBranding />
                            </footer>
                        </div>
                    </div>

                    {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="auto" style={{ display: 'none' }} />}
                </div>
            )}
        </div>
    );
}

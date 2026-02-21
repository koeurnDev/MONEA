"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { WeddingData } from "./types";
import { MapPin, Heart, Clock, Calendar, Sparkles, Send, Trophy, Music, Music2, Volume2, VolumeX, ArrowDown, Share2 } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { MoneaBranding } from '@/components/MoneaBranding';
import GuestbookSection from './modern-full/GuestbookSection';
import { PremiumHeading, RevealSection, LuxurySection, useImagePan } from './shared/CinematicComponents';
import CinematicStoryGallery from './shared/CinematicStoryGallery';
import { moul, kantumruyPro } from '@/lib/fonts';

// --- VISUAL COMPONENTS ---

const CosmicBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        const count = 50; // Further reduced for performance
        let lastTime = 0;
        const fpsInterval = 1000 / 60; // Increased to 60 FPS for smoother animation

        const resize = () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                // Re-initialize particles on resize if empty or count changed
                if (particles.length === 0) {
                    for (let i = 0; i < count; i++) particles.push(new Particle());
                }
            }
        };

        // Throttled resize
        let resizeTimeout: any;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resize, 200);
        };

        class Particle {
            x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; color: string;
            constructor() {
                this.x = Math.random() * window.innerWidth;
                this.y = Math.random() * window.innerHeight;
                this.size = Math.random() * 1.5;
                this.speedX = (Math.random() - 0.5) * 0.15;
                this.speedY = (Math.random() - 0.5) * 0.15;
                this.opacity = Math.random() * 0.4 + 0.1;
                this.color = Math.random() > 0.8 ? '#4FD1C5' : '#FFFFFF';
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > window.innerWidth) this.x = 0;
                if (this.x < 0) this.x = window.innerWidth;
                if (this.y > window.innerHeight) this.y = 0;
                if (this.y < 0) this.y = window.innerHeight;
            }
            draw() {
                if (!ctx) return;
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.fill();
                ctx.restore();
            }
        }

        const render = (time: number) => {
            animationFrameId = requestAnimationFrame(render);

            const elapsed = time - lastTime;
            if (elapsed > fpsInterval) {
                lastTime = time - (elapsed % fpsInterval);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => { p.update(); p.draw(); });
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrameId);
            } else {
                animationFrameId = requestAnimationFrame(render);
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        resize();
        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            cancelAnimationFrame(animationFrameId);
            clearTimeout(resizeTimeout);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 will-change-transform" />;
};

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-[3rem] p-8 md:p-16 relative overflow-hidden group will-change-transform ${className}`}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10">{children}</div>
    </motion.div>
);

const FloatingDecoration = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
        animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
            opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
            duration: 6,
            repeat: Infinity,
            delay,
            ease: "easeInOut"
        }}
        className="absolute w-64 h-64 bg-teal-500/10 blur-[60px] rounded-full will-change-[transform,opacity]"
    />
);

// --- MAIN TEMPLATE ---

export default function VisionaryModern({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const musicUrl = wedding.themeSettings?.musicUrl;
    const heroImage = wedding.themeSettings?.heroImage || (wedding.galleryItems || []).find(i => i.type === 'IMAGE')?.url || "/images/bg_staircase.jpg";

    // Simplified Parallax & Effects for better performance
    const heroScale = useTransform(smoothProgress, [0, 0.2], [1.05, 1.15]);
    const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0.4]);

    useEffect(() => {
        if (!musicUrl || !audioRef.current) return;
        if (isPlaying) {
            audioRef.current.play().catch(e => console.log(e));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, musicUrl]);

    return (
        <div className={`min-h-screen font-sans selection:bg-teal-400 selection:text-black bg-[#02040A] text-white overflow-x-hidden relative ${moul.variable} ${kantumruyPro.variable}`}>
            <style jsx global>{`
                .font-moul { font-family: var(--font-moul), serif; }
                .font-khmer { font-family: var(--font-khmer), sans-serif; }
                .glass-gradient {
                    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
                }
                .text-glow {
                    text-shadow: 0 0 20px rgba(79, 209, 197, 0.4);
                }
            `}</style>

            <CosmicBackground />

            {/* SPLASH SCREEN (Visionary Style) */}
            <AnimatePresence>
                {!showContent && (
                    <motion.div
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#02040A]"
                    >
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <motion.img
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                                src={heroImage}
                                className="w-full h-full object-cover opacity-20 blur-md"
                            />
                        </div>

                        <div className="relative z-10 text-center space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <span className="text-[10px] font-black tracking-[0.5em] text-teal-400 uppercase mb-4 block">Personal Invitation</span>
                                <h1 className="font-moul text-3xl md:text-5xl lg:text-7xl mb-12 leading-tight">
                                    {wedding.groomName} <br />
                                    <span className="font-serif italic text-teal-400 my-4 block">&</span>
                                    {wedding.brideName}
                                </h1>
                            </motion.div>

                            {guestName && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-md"
                                >
                                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest font-bold">គោរពអញ្ជើញ</p>
                                    <h2 className="text-2xl font-moul text-white">{guestName}</h2>
                                </motion.div>
                            )}

                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.5 }}
                                onClick={() => { setShowContent(true); setIsPlaying(true); }}
                                className="px-12 py-5 bg-teal-500 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-teal-400 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-teal-500/20"
                            >
                                Open Experience
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT */}
            {showContent && (
                <div className="relative z-10">
                    {/* Floating Controls */}
                    <div className="fixed top-6 right-6 z-50 flex gap-2">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white"
                        >
                            {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </button>
                    </div>

                    {/* HERO SECTION */}
                    <section id="hero" className="relative h-[120vh] flex items-center justify-center overflow-hidden">
                        <motion.div
                            style={{ scale: heroScale, opacity: heroOpacity }}
                            className="absolute inset-0 z-0 will-change-[transform,opacity]"
                        >
                            <CldImage
                                src={heroImage}
                                alt="Wedding Hero"
                                fill
                                className="object-cover"
                                priority
                                sizes="100vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#02040A] via-transparent to-transparent" />
                            <div className="absolute inset-0 bg-black/40" />
                        </motion.div>

                        <div className="relative z-10 text-center px-6">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1 }}
                            >
                                <span className="font-khmer text-xs md:text-sm font-black text-teal-400 tracking-[0.4em] uppercase mb-6 block">The Sacred Journey Begins</span>
                                <h1 className="font-moul text-5xl md:text-8xl lg:text-[10rem] leading-none mb-12 text-glow">
                                    {wedding.groomName} <br />
                                    <span className="text-2xl md:text-4xl lg:text-6xl font-serif italic text-white/50">&</span> <br />
                                    {wedding.brideName}
                                </h1>
                                <div className="flex flex-col items-center gap-8">
                                    <div className="h-px w-32 bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
                                    <p className="font-khmer text-xl md:text-3xl font-light tracking-[0.5em] text-white/80">
                                        {new Date(wedding.date).toLocaleDateString('km-KH', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <div className="h-px w-32 bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute bottom-[-20vh] left-1/2 -translate-x-1/2"
                            >
                                <ArrowDown className="text-teal-400 opacity-50" size={32} />
                            </motion.div>
                        </div>
                    </section>

                    {/* CEREMONIAL VISION SECTION */}
                    <section className="py-24 md:py-48 px-6 relative will-change-transform">
                        <FloatingDecoration delay={0} />
                        <FloatingDecoration delay={3} />

                        <div className="max-w-6xl mx-auto">
                            <GlassCard>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                    <div className="space-y-12">
                                        <div className="inline-block p-4 rounded-full bg-teal-500/10 border border-teal-500/20">
                                            <Trophy className="text-teal-400" size={32} />
                                        </div>
                                        <h2 className="font-moul text-4xl md:text-6xl text-white leading-tight">
                                            {wedding.eventType === 'anniversary' ? 'The Vision of Forever' : 'A Vision for Eternity'}
                                        </h2>
                                        <p className="font-khmer text-lg md:text-2xl leading-relaxed text-slate-300">
                                            {wedding.themeSettings?.welcomeMessage || (wedding.eventType === 'anniversary'
                                                ? "ក្តីស្រលាញ់ដែលឆ្លងកាត់ពេលវេលា នាំមកនូវអនុស្សាវរីយ៍ដ៏ផ្អែមល្ហែម។ យើងខ្ញុំសូមគោរពអញ្ជើញអ្នកទាំងអស់គ្នា ចូលរួមអបអរសាទរខួបដ៏មានអត្ថន័យនេះ។"
                                                : "ពីបេះដូងមួយទៅបេះដូងមួយ ដំណើរជីវិតថ្មីចាប់ផ្តើមពីទីនេះ។ សាក្សីនៃក្តីស្រលាញ់ និងការសន្យាដ៏អស់កល្ប។")}
                                        </p>

                                        <div className="pt-8 grid grid-cols-2 gap-8 border-t border-white/10">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Groom</p>
                                                <p className="font-moul text-xl text-white">{wedding.groomName}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Bride</p>
                                                <p className="font-moul text-xl text-white">{wedding.brideName}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                                        <CldImage
                                            src={(wedding.galleryItems || [])[0]?.url || heroImage}
                                            alt="Groom and Bride"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#02040A]/60 to-transparent" />
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </section>

                    {/* TIMELINE SECTION */}
                    <section id="event-info" className="py-24 md:py-48 bg-white/5 backdrop-blur-3xl relative overflow-hidden will-change-transform">
                        <div className="max-w-4xl mx-auto px-6">
                            <RevealSection>
                                <div className="text-center mb-24">
                                    <PremiumHeading>កាលវិភាគមង្គល</PremiumHeading>
                                    <p className="font-khmer text-xs text-slate-400 uppercase tracking-[0.3em] mt-4">Order of Events</p>
                                </div>
                            </RevealSection>

                            <div className="space-y-6">
                                {wedding.activities.map((act, i) => (
                                    <RevealSection key={i}>
                                        <motion.div
                                            whileHover={{ x: 10 }}
                                            className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-teal-500/30 transition-all flex items-center gap-8 group"
                                        >
                                            <div className="w-24 font-black text-teal-400 text-xl group-hover:scale-110 transition-transform">{act.time}</div>
                                            <div className="flex-1">
                                                <h4 className="font-moul text-xl text-white mb-2">{act.title}</h4>
                                                <p className="font-khmer text-sm text-slate-400">{act.description}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-teal-400 transition-colors">
                                                <Sparkles size={16} />
                                            </div>
                                        </motion.div>
                                    </RevealSection>
                                ))}
                            </div>

                            <RevealSection>
                                <div className="mt-24 p-12 rounded-[3rem] bg-teal-500 text-black text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="relative z-10 flex flex-col items-center gap-6"
                                    >
                                        <MapPin size={40} />
                                        <h3 className="font-moul text-3xl">ទីតាំងប្រារព្ធពិធី</h3>
                                        <p className="font-khmer text-xl font-bold">{wedding.location}</p>
                                        {wedding.themeSettings?.mapLink && (
                                            <a
                                                href={wedding.themeSettings.mapLink}
                                                target="_blank"
                                                className="px-10 py-4 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-110 transition-all flex items-center gap-2"
                                            >
                                                Get Directions <Share2 size={12} />
                                            </a>
                                        )}
                                    </motion.div>
                                </div>
                            </RevealSection>
                        </div>
                    </section>

                    {/* GALLERY SECTION */}
                    <div id="gallery">
                        <CinematicStoryGallery items={wedding.galleryItems} labels={wedding.themeSettings?.customLabels} theme="dark" />
                    </div>

                    {/* GUESTBOOK SECTION */}
                    <section id="guestbook" className="py-24 md:py-48 px-6">
                        <div className="max-w-4xl mx-auto">
                            <GlassCard className="border-teal-500/10 shadow-2xl shadow-teal-500/5">
                                <div className="text-center space-y-12">
                                    <PremiumHeading className="text-4xl text-glow">សៀវភៅជូនពរ</PremiumHeading>
                                    <GuestbookSection
                                        wedding={wedding}
                                        onNewWish={() => { }}
                                    />
                                </div>
                            </GlassCard>
                        </div>
                    </section>

                    {/* FOOTER */}
                    <footer className="py-32 flex flex-col items-center gap-16 text-center border-t border-white/5 bg-[#02040A]">
                        <div className="space-y-4">
                            <h2 className="font-moul text-2xl text-white/50">{wedding.groomName} & {wedding.brideName}</h2>
                            <p className="font-khmer text-[10px] text-slate-500 tracking-[0.4em] uppercase">Eternity Start Here</p>
                        </div>
                        <MoneaBranding />
                    </footer>

                    {musicUrl && <audio ref={audioRef} src={musicUrl} loop style={{ display: 'none' }} />}
                </div>
            )}
        </div>
    );
}

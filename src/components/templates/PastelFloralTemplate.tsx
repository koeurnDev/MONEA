"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { WeddingData } from "./types";
import { Heart, MapPin, Music, Music2, Flower, Clock, Calendar, Sparkles } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { MoneaBranding } from '@/components/MoneaBranding';
import { PremiumHeading, RevealSection, LuxurySection, useImagePan } from './shared/CinematicComponents';
import SplashScreen from './modern-full/SplashScreen';
import FullscreenOverlay from './modern-full/FullscreenOverlay';
import WishesWall from './shared/WishesWall';
import CinematicStoryGallery from './shared/CinematicStoryGallery';

const GlowSparks = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        const count = 25;

        const resize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Spark {
            x: number; y: number; size: number; speedY: number; opacity: number; phase: number;
            constructor() {
                this.x = Math.random() * (canvas?.width || 1000);
                this.y = Math.random() * (canvas?.height || 1000);
                this.size = 2 + Math.random() * 4;
                this.speedY = -0.2 - Math.random() * 0.4;
                this.opacity = 0.1 + Math.random() * 0.3;
                this.phase = Math.random() * Math.PI * 2;
            }
            update() {
                this.y += this.speedY;
                this.phase += 0.02;
                if (this.y < -20) {
                    this.y = (canvas?.height || 1000) + 20;
                    this.x = Math.random() * (canvas?.width || 1000);
                }
            }
            draw() {
                if (!ctx) return;
                const glow = Math.sin(this.phase) * 0.2 + 0.8;
                ctx.beginPath();
                const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
                grad.addColorStop(0, `rgba(255, 182, 193, ${this.opacity * glow})`);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = grad;
                ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < count; i++) particles.push(new Spark());

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
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

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-20" />;
};

const TornPaper = ({ children, className = "", color = "bg-white" }: { children: React.ReactNode; className?: string; color?: string }) => (
    <div className={`relative ${className}`}>
        <div className={`absolute -inset-1 ${color} opacity-50 blur-sm`} />
        <div className={`relative ${color} shadow-lg`} style={{ clipPath: "polygon(0% 2%, 2% 0%, 5% 3%, 10% 2%, 15% 5%, 20% 0%, 25% 4%, 30% 1%, 35% 5%, 40% 2%, 45% 6%, 50% 1%, 55% 5%, 60% 2%, 65% 5%, 70% 1%, 75% 4%, 80% 2%, 85% 6%, 90% 1%, 95% 5%, 100% 2%, 98% 50%, 100% 98%, 95% 95%, 90% 99%, 85% 94%, 80% 98%, 75% 95%, 70% 99%, 65% 94%, 60% 98%, 55% 95%, 50% 99%, 45% 94%, 40% 98%, 35% 95%, 30% 99%, 25% 94%, 20% 98%, 15% 95%, 10% 99%, 5% 94%, 2% 100%, 0% 98%)" }}>
            {children}
        </div>
    </div>
);

const WashiTape = ({ className = "", color = "bg-rose-200/40" }: { className?: string; color?: string }) => (
    <div className={`absolute w-32 h-8 z-20 ${color} backdrop-blur-sm -rotate-3 mix-blend-multiply border-l border-white/20 ${className}`} style={{ clipPath: "polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%)" }} />
);

export default function PastelFloralTemplate({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const [showContent, setShowContent] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [wishTrigger, setWishTrigger] = useState(0);
    const [selectedImg, setSelectedImg] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const sfxOpenRef = useRef<HTMLAudioElement | null>(null);
    const sfxShutterRef = useRef<HTMLAudioElement | null>(null);
    const { scrollY, scrollYProgress } = useScroll();

    // Cinematic Effects
    const yHero = useTransform(scrollY, [0, 500], [0, 200]);
    const textY = useTransform(scrollY, [0, 500], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1.1, 1]);

    const musicUrl = wedding.themeSettings?.musicUrl;
    const galleryItems = (wedding.galleryItems || []).filter(i => i.type === 'IMAGE').map(i => i.url);
    const heroImage = wedding.themeSettings?.heroImage || galleryItems[0] || "/images/bg_staircase.jpg";

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

    return (
        <div className="min-h-screen font-sans selection:bg-rose-100 bg-[#FFF9FB] text-slate-800 overflow-x-hidden relative">
            <style jsx global>{`
                .font-moul { font-family: var(--font-moul), serif; }
                .font-khmer { font-family: var(--font-kantumruy), sans-serif; }
                .font-script { font-family: var(--font-great-vibes), cursive; }
                .kraft-paper {
                    background-color: #e5d3c0;
                    background-image: url('https://www.transparenttextures.com/patterns/pinstriped-suit.png');
                    box-shadow: inset 0 0 100px rgba(139, 69, 19, 0.1);
                }
                .album-page {
                    background-color: #fcfaf0;
                    background-image: url('https://www.transparenttextures.com/patterns/notebook.png');
                }
            `}</style>

            <WishesWall trigger={wishTrigger} />

            {/* Cinematic Background */}
            <div className="fixed inset-0 z-0 kraft-paper">
                <div className="absolute inset-0 opacity-40 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]" />
            </div>

            <div className="relative z-10">
                <AnimatePresence>
                    {!showContent && (
                        <SplashScreen
                            wedding={wedding}
                            isOpen={!showContent}
                            setIsOpen={setShowContent}
                            onStartMusic={() => setIsPlaying(true)}
                            onOpening={() => sfxOpenRef.current?.play()}
                            primaryColor="#B76E79"
                            heroImage={heroImage}
                            guestName={guestName}
                            labels={wedding.themeSettings?.customLabels || {}}
                        />
                    )}
                </AnimatePresence>

                {/* Music Visualizer */}
                {musicUrl && (
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-rose-200 p-3 rounded-full hover:scale-110 transition-all shadow-lg"
                    >
                        {isPlaying ? <Music className="w-5 h-5 text-rose-400 animate-spin-slow" /> : <Music2 className="w-5 h-5 text-rose-200" />}
                    </button>
                )}

                {showContent && (
                    <main>
                        <GlowSparks />
                        <section id="hero" className="relative h-screen flex items-center justify-center text-center overflow-hidden">
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
                                    <img
                                        src={heroImage}
                                        className="w-full h-full object-cover sepia-[0.2]"
                                        style={{
                                            objectPosition: `${heroPan.localX} ${heroPan.localY}`,
                                            transform: `scale(${heroAdjustScale})`,
                                            filter: `brightness(${heroBrightness}%) contrast(${heroContrast}%) sepia(20%)`,
                                            transition: heroPan.isDragging ? 'none' : 'object-position 0.2s ease-out, transform 0.2s ease-out, filter 0.2s ease-out'
                                        }}
                                        alt=""
                                    />
                                )}
                                <div className="absolute inset-0 bg-rose-900/10 mix-blend-overlay" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f7f3f0]" />
                            </motion.div>

                            <motion.div style={{ y: textY }} className="relative z-10 space-y-8 px-6">
                                <RevealSection>
                                    <Flower className="mx-auto text-rose-300 animate-pulse mb-4" size={48} />
                                    <h1 className="font-moul text-4xl sm:text-6xl md:text-8xl text-slate-900 drop-shadow-sm leading-tight">
                                        {wedding.groomName} <br />
                                        <span className="font-script text-4xl text-rose-400 my-4 block">&</span>
                                        {wedding.brideName}
                                    </h1>
                                    <div className="mt-8 border-y border-rose-200/50 inline-block py-3 px-12">
                                        <p className="font-khmer text-xl tracking-[0.2em] font-bold text-rose-400 uppercase">
                                            {new Date(wedding.date).toLocaleDateString('km-KH', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </RevealSection>
                            </motion.div>
                        </section>

                        {/* Scrapped Invitation */}
                        <section className="py-16 md:py-32 px-4 md:px-6 flex flex-col items-center">
                            <div className="relative max-w-2xl w-full rotate-[-1deg]">
                                <WashiTape className="-top-6 left-1/2 -translate-x-1/2" />
                                <TornPaper color="bg-white">
                                    <div className="p-10 md:p-20 text-center space-y-10">
                                        <div className="flex flex-col items-center gap-4">
                                            <Flower className="text-rose-200" size={40} />
                                            <h2 className="font-moul text-4xl text-slate-900">{wedding.eventType === 'anniversary' ? 'សេចក្តីជូនដំណឹង' : 'សេចក្តីជូនដំណឹងមង្គល'}</h2>
                                        </div>
                                        <p className="font-khmer text-xl leading-relaxed text-slate-500 italic">
                                            "Every love story is beautiful, but ours is my favorite."
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 md:gap-10 pt-6 md:pt-10 border-t border-rose-50">
                                            <div className="space-y-2">
                                                <p className="font-script text-3xl text-rose-300">Groom</p>
                                                <p className="font-moul text-xl">{wedding.groomName}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="font-script text-3xl text-rose-300">Bride</p>
                                                <p className="font-moul text-xl">{wedding.brideName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </TornPaper>
                            </div>
                        </section>

                        {/* Cinematic Story Gallery */}
                        <div id="gallery">
                            <CinematicStoryGallery items={wedding.galleryItems} labels={wedding.themeSettings?.customLabels} />
                        </div>

                        {/* Journal Details */}
                        <section id="event-info" className="py-16 md:py-32 flex flex-col items-center px-4 md:px-6">
                            <div className="max-w-xl w-full rotate-[1deg]">
                                <TornPaper color="bg-rose-50/80">
                                    <div className="p-12 text-center space-y-8">
                                        <h2 className="font-moul text-3xl text-slate-800">{wedding.eventType === 'anniversary' ? 'Event Info' : 'Wedding Info'}</h2>
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-center gap-4 text-rose-400">
                                                <MapPin size={24} />
                                                <span className="font-khmer text-xl font-bold">{wedding.location}</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-4 text-rose-400">
                                                <Clock size={24} />
                                                <span className="font-khmer text-xl font-bold">{new Date(wedding.date).toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        <div className="pt-8 flex flex-col items-center gap-4">
                                            <p className="font-script text-3xl text-slate-400 underline decoration-rose-200 decoration-4 underline-offset-8">Save the Date</p>
                                        </div>
                                    </div>
                                </TornPaper>
                            </div>
                        </section>

                        {/* Footer */}
                        <footer id="guestbook" className="py-24 flex flex-col items-center gap-12 text-center opacity-40">
                            <h3 className="font-script text-4xl text-rose-400">{wedding.groomName} & {wedding.brideName}</h3>
                            <p className="font-khmer text-[10px] tracking-widest uppercase">Thank You for Celebrating With Us</p>
                            <MoneaBranding />
                        </footer>
                    </main>
                )}
            </div>

            <FullscreenOverlay
                selectedIndex={selectedImg}
                items={galleryItems}
                onClose={() => setSelectedImg(null)}
                onNext={() => setSelectedImg(prev => (prev! + 1) % galleryItems.length)}
                onPrev={() => setSelectedImg(prev => (prev! - 1 + galleryItems.length) % galleryItems.length)}
            />

            {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="auto" style={{ display: 'none' }} />}
            <audio ref={sfxOpenRef} src="https://assets.mixkit.co/sfx/preview/mixkit-paper-slide-1530.mp3" preload="auto" />
            <audio ref={sfxShutterRef} src="https://assets.mixkit.co/sfx/preview/mixkit-camera-shutter-click-1133.mp3" preload="auto" />
        </div>
    );
}

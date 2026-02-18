"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { WeddingData } from "./types";
import { MapPin, Music, Music2, Heart, Clock, Calendar, Flower, Sparkles } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { MoneaBranding } from '@/components/MoneaBranding';
import GuestbookSection from './modern-full/GuestbookSection';
import WishesWall from './shared/WishesWall';
import SplashScreen from './modern-full/SplashScreen';
import FullscreenOverlay from './modern-full/FullscreenOverlay';
import { PremiumHeading, RevealSection, LuxurySection, useImagePan } from './shared/CinematicComponents';
import CinematicStoryGallery from './shared/CinematicStoryGallery';

export default function EnchantedGarden({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const [wishTrigger, setWishTrigger] = useState(0);
    const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { scrollY, scrollYProgress } = useScroll();

    // Cinematic Effects
    const yHero = useTransform(scrollY, [0, 500], [0, 200]);
    const textY = useTransform(scrollY, [0, 500], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1.1, 1]);

    const musicUrl = wedding.themeSettings?.musicUrl;
    const galleryItems = wedding.galleryItems.filter(i => i.type === 'IMAGE').map(i => i.url);
    const heroImage = wedding.themeSettings?.heroImage || "/images/bg_enchanted.jpg";

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
        <div className="min-h-screen font-sans selection:bg-[#D4AF37] selection:text-black overflow-x-hidden relative text-[#E0E0E0] bg-[#050A08]">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,400&family=Great+Vibes&display=swap');
                .font-cinzel { font-family: 'Cinzel', var(--font-moul), serif; }
                .font-cormorant { font-family: 'Cormorant Garamond', var(--font-kantumruy), serif; }
                .font-vibes { font-family: 'Great Vibes', cursive; }
                .font-moul { font-family: var(--font-moul), serif; }
            `}</style>

            {/* Global Background */}
            <div className="fixed inset-0 z-0">
                <img src="/images/bg_enchanted.jpg" className="absolute inset-0 w-full h-full object-cover blur-[2px] scale-105" alt="Background" />
                <div className="absolute inset-0 bg-black/80" />
                <Fireflies />
            </div>

            <div className="relative z-10">
                <SplashScreen
                    wedding={wedding}
                    isOpen={!showSplash}
                    setIsOpen={(val) => setShowSplash(!val)}
                    onStartMusic={() => setIsPlaying(true)}
                    labels={wedding.themeSettings?.customLabels || {}}
                    primaryColor="#D4AF37"
                    heroImage={wedding.themeSettings?.heroImage || "/images/bg_enchanted.jpg"}
                />

                {/* Music Visualizer */}
                {musicUrl && (
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-[#D4AF37]/30 px-4 py-2 rounded-full hover:scale-105 transition-all group"
                    >
                        <div className="flex gap-1 items-end h-4">
                            {[0.6, 1, 0.8, 0.5].map((h, i) => (
                                <motion.div
                                    key={i}
                                    animate={isPlaying ? { height: ["20%", "100%", "20%"] } : { height: "30%" }}
                                    transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, ease: "easeInOut" }}
                                    className="w-1 bg-[#D4AF37]"
                                    style={{ height: `${h * 100}%` }}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] opacity-60 group-hover:opacity-100 transition-opacity uppercase">
                            {isPlaying ? "Enchanted Audio" : "Play Magic"}
                        </span>
                    </button>
                )}

                {/* Content */}
                {!showSplash && (
                    <main>
                        <section id="hero" className="relative h-screen flex items-center justify-center text-center overflow-hidden">
                            <motion.div
                                style={{ opacity: heroOpacity, scale: heroScale, y: yHero }}
                                className="absolute inset-0 z-0 cursor-move active:cursor-grabbing"
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
                                    heroImage.startsWith('/') ? (
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
                                    ) : (
                                        <CldImage
                                            src={heroImage}
                                            fill
                                            className="object-cover"
                                            style={{
                                                objectPosition: `${heroPan.localX} ${heroPan.localY}`,
                                                transform: `scale(${heroAdjustScale})`,
                                                filter: `brightness(${heroBrightness}%) contrast(${heroContrast}%)`,
                                                transition: heroPan.isDragging ? 'none' : 'object-position 0.2s ease-out, transform 0.2s ease-out, filter 0.2s ease-out'
                                            }}
                                            alt="Hero"
                                            priority
                                        />
                                    )
                                )}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#050A08]" />
                            </motion.div>

                            <motion.div style={{ y: textY }} className="relative z-10 space-y-8 px-6">
                                <RevealSection>
                                    <Sparkles className="mx-auto text-[#D4AF37] animate-pulse mb-4" size={32} />
                                    <h1 className="font-moul text-5xl md:text-8xl text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] leading-tight">
                                        {wedding.groomName} <br />
                                        <span className="font-vibes text-4xl text-[#D4AF37] my-4 block">&</span>
                                        {wedding.brideName}
                                    </h1>
                                    <div className="inline-block border-y border-[#D4AF37]/30 px-12 py-3 mt-6">
                                        <p className="font-cinzel text-xl tracking-[0.3em] font-bold text-gray-200">
                                            {new Date(wedding.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </RevealSection>
                            </motion.div>

                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40">
                                <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent" />
                                <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#D4AF37]">Enter The Dream</span>
                            </div>
                        </section>

                        {/* Our Love Story */}
                        <LuxurySection>
                            <PremiumHeading>Mystic Love Story</PremiumHeading>
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div className="space-y-6 text-center md:text-left">
                                    <p className="font-cormorant text-2xl italic text-gray-300 leading-relaxed">
                                        "In the heart of an enchanted forest, our journey began, where every leaf whispered of a love that would last forever."
                                    </p>
                                    <p className="font-sans text-sm text-gray-400 leading-loose">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                    </p>
                                </div>
                                <div className="aspect-square relative rounded-full overflow-hidden border-4 border-[#D4AF37]/20 shadow-2xl">
                                    {(galleryItems[0] || "/images/couple.jpg").startsWith('/') ? (
                                        <img src={galleryItems[0] || "/images/couple.jpg"} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <CldImage src={galleryItems[0] || "/images/couple.jpg"} fill className="object-cover" alt="Love Story" />
                                    )}
                                </div>
                            </div>
                        </LuxurySection>

                        {/* Cinematic Story Gallery */}
                        <div id="gallery">
                            <CinematicStoryGallery items={wedding.galleryItems} labels={wedding.themeSettings?.customLabels} />
                        </div>

                        {/* Event Details Overlay - Restored */}
                        <LuxurySection id="event-info">
                            <PremiumHeading>Event Details</PremiumHeading>
                            <div className="grid md:grid-cols-2 gap-12">
                                <RevealSection>
                                    <div className="space-y-6 text-center md:text-left">
                                        <div className="flex items-center gap-4 text-[#D4AF37] justify-center md:justify-start">
                                            <MapPin size={24} />
                                            <h3 className="font-moul text-xl">The Location</h3>
                                        </div>
                                        <p className="font-khmer text-lg">{wedding.location}</p>
                                        {wedding.themeSettings?.mapLink && (
                                            <a href={wedding.themeSettings.mapLink} className="inline-block text-[#D4AF37] border-b border-[#D4AF37] text-sm font-bold mt-2">Open Map</a>
                                        )}
                                    </div>
                                </RevealSection>
                                <RevealSection delay={0.2}>
                                    <div className="space-y-6 text-center md:text-left">
                                        <div className="flex items-center gap-4 text-[#D4AF37] justify-center md:justify-start">
                                            <Calendar size={24} />
                                            <h3 className="font-moul text-xl">The Day</h3>
                                        </div>
                                        <p className="font-khmer text-lg">
                                            {new Date(wedding.date).toLocaleDateString('km-KH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </RevealSection>
                            </div>
                        </LuxurySection>

                        {/* Timeline - Restored */}
                        <section className="py-24 max-w-4xl mx-auto px-6">
                            <PremiumHeading>Ceremony Journey</PremiumHeading>
                            <div className="space-y-12">
                                {wedding.activities.map((act, i) => (
                                    <RevealSection key={i} delay={i * 0.1}>
                                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start group">
                                            <div className="w-24 h-24 rounded-full border-2 border-[#D4AF37]/20 flex items-center justify-center font-cinzel text-xl text-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-colors">
                                                {act.time}
                                            </div>
                                            <div className="flex-1 text-center md:text-left pt-6">
                                                <h4 className="font-moul text-xl text-white mb-2">{act.title}</h4>
                                                <p className="font-khmer text-gray-400">{act.description}</p>
                                            </div>
                                        </div>
                                    </RevealSection>
                                ))}
                            </div>
                        </section>

                        {/* Guestbook */}
                        <RevealSection>
                            <LuxurySection id="guestbook">
                                <PremiumHeading className="text-3xl">Blessing Tree</PremiumHeading>
                                <GuestbookSection
                                    wedding={wedding}
                                    primaryColor="#D4AF37"
                                    onNewWish={() => setWishTrigger(prev => prev + 1)}
                                />
                            </LuxurySection>
                        </RevealSection>

                        {/* Footer */}
                        <footer className="py-24 flex flex-col items-center gap-12 text-center opacity-60">
                            <div>
                                <h3 className="font-vibes text-4xl text-[#D4AF37] mb-2">{wedding.groomName} & {wedding.brideName}</h3>
                                <p className="font-cinzel text-[10px] tracking-[0.3em] uppercase">The Enchantment Continues</p>
                            </div>
                            <MoneaBranding />
                        </footer>
                    </main>
                )}
            </div>

            <FullscreenOverlay
                selectedIndex={galleryIndex}
                items={galleryItems}
                onClose={() => setGalleryIndex(null)}
                onNext={() => setGalleryIndex(prev => (prev! + 1) % galleryItems.length)}
                onPrev={() => setGalleryIndex(prev => (prev! - 1 + galleryItems.length) % galleryItems.length)}
            />

            {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="auto" style={{ display: 'none' }} />}
            <WishesWall trigger={wishTrigger} />
        </div>
    );
}

function Fireflies() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        const count = 35;

        const resize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            x: number; y: number; size: number; xSpeed: number; ySpeed: number; opacity: number;
            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.size = 1 + Math.random() * 2;
                this.xSpeed = (Math.random() - 0.5) * 0.5;
                this.ySpeed = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5;
            }
            update() {
                this.x += this.xSpeed;
                this.y += this.ySpeed;
                if (this.x < 0 || this.x > canvas!.width) this.xSpeed *= -1;
                if (this.y < 0 || this.y > canvas!.height) this.ySpeed *= -1;
            }
            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
                ctx.fill();
                // Add glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#D4AF37';
            }
        }

        for (let i = 0; i < count; i++) particles.push(new Particle());

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

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-60" />;
}



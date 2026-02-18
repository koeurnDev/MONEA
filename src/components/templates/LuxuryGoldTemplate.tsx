"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { WeddingData } from "./types";
import { MapPin, Music, Music2, Heart, Clock, Calendar, Sparkles, Send, Trophy } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { MoneaBranding } from '@/components/MoneaBranding';
import GuestbookSection from './modern-full/GuestbookSection';
import { PremiumHeading, RevealSection, LuxurySection, useImagePan } from './shared/CinematicComponents';
import WishesWall from './shared/WishesWall';
import SplashScreen from './luxury-gold/SplashScreen';
import FullscreenOverlay from './luxury-gold/FullscreenOverlay';
import CinematicStoryGallery from './shared/CinematicStoryGallery';

const GoldDust = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        const count = 30;

        const resize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Spark {
            x: number; y: number; size: number; speedX: number; speedY: number; opacity: number;
            constructor() {
                this.x = Math.random() * (canvas?.width || 1000);
                this.y = Math.random() * (canvas?.height || 1000);
                this.size = Math.random() * 2;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random();
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > (canvas?.width || 1000)) this.x = 0;
                if (this.x < 0) this.x = (canvas?.width || 1000);
                if (this.y > (canvas?.height || 1000)) this.y = 0;
                if (this.y < 0) this.y = (canvas?.height || 1000);
            }
            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
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

const ImperialFrame = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative p-1 ${className}`}>
        {/* Outer Gold Border */}
        <div className="absolute inset-0 border-[3px] border-[#D4AF37]/60" />
        {/* Inner Shadow Border */}
        <div className="absolute inset-2 border border-[#D4AF37]/30 shadow-[inset_0_0_20px_rgba(139,0,0,0.4)]" />
        {/* Corner Accents */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] bg-[#0A0A0A] border-2 border-[#D4AF37] rotate-45 flex items-center justify-center">
            <div className="w-4 h-4 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]" />
        </div>
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] bg-[#0A0A0A] border-2 border-[#D4AF37] rotate-45 flex items-center justify-center">
            <div className="w-4 h-4 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]" />
        </div>
        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] bg-[#0A0A0A] border-2 border-[#D4AF37] rotate-45 flex items-center justify-center">
            <div className="w-4 h-4 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]" />
        </div>
        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] bg-[#0A0A0A] border-2 border-[#D4AF37] rotate-45 flex items-center justify-center">
            <div className="w-4 h-4 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]" />
        </div>
        <div className="relative z-10 bg-[#1a0505] p-8 md:p-16 border border-[#D4AF37]/30">
            {children}
        </div>
    </div>
);

const WaxSeal = ({ className = "" }: { className?: string }) => (
    <motion.div
        initial={{ scale: 2, opacity: 0, rotate: -20 }}
        whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.5 }}
        className={`relative w-24 h-24 flex items-center justify-center ${className}`}
    >
        <div className="absolute inset-0 bg-[#8a1a1a] rounded-full shadow-2xl border-4 border-[#6a1212] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
            <div className="w-16 h-16 border-2 border-[#D4AF37]/40 rounded-full flex items-center justify-center">
                <Heart className="text-[#D4AF37]" size={32} fill="currentColor" />
            </div>
        </div>
        <div className="absolute -inset-1 border-2 border-[#D4AF37]/20 rounded-full animate-ping-slow" />
    </motion.div>
);


export default function LuxuryGoldTemplate({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [wishTrigger, setWishTrigger] = useState(0);
    const [selectedImg, setSelectedImg] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { scrollY, scrollYProgress } = useScroll();

    // Cinematic Effects
    const yHero = useTransform(scrollY, [0, 500], [0, 200]);
    const textY = useTransform(scrollY, [0, 500], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1.1, 1]);

    const musicUrl = wedding.themeSettings?.musicUrl;
    const heroImage = wedding.themeSettings?.heroImage || (wedding.galleryItems || []).find(i => i.type === 'IMAGE')?.url || "/images/bg_staircase.jpg";
    const galleryImages = (wedding.galleryItems || []).filter(i => i.type === 'IMAGE').map(i => i.url);

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
        <div className="min-h-screen font-serif selection:bg-[#D4AF37] selection:text-black bg-[#0A0A0A] text-[#D4AF37] overflow-x-hidden relative">
            <style jsx global>{`
                .font-moul { font-family: var(--font-moul), serif; }
                .font-khmer { font-family: var(--font-kantumruy), sans-serif; }
                .hammered-gold {
                    background: linear-gradient(
                        to right,
                        #BF953F 0%,
                        #FCF6BA 15%,
                        #B38728 30%,
                        #FBF5B7 45%,
                        #AA771C 60%,
                        #BF953F 75%,
                        #FCF6BA 90%,
                        #B38728 100%
                    );
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 4px 4px rgba(0,0,0,0.8));
                    animation: shine 5s linear infinite;
                }
                @keyframes shine {
                    to { background-position: 200% center; }
                }
                .imperial-bg {
                    background: radial-gradient(circle at center, #2a0505 0%, #050000 100%);
                }
            `}</style>

            <WishesWall trigger={wishTrigger} />

            {/* Cinematic Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[#050000]" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#2a0505] via-[#050000] to-[#2a0505] opacity-50" />
                <div className="absolute inset-0 opacity-[0.1] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-linen-2.png')]" />
            </div>

            <div className="relative z-10">
                <AnimatePresence>
                    {!showContent && (
                        <SplashScreen
                            wedding={wedding}
                            isOpen={!showContent}
                            setIsOpen={setShowContent}
                            onStartMusic={() => setIsPlaying(true)}
                            labels={wedding.themeSettings?.customLabels || {}}
                        />
                    )}
                </AnimatePresence>

                {/* Music Visualizer */}
                {musicUrl && (
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-[#D4AF37]/30 px-4 py-2 rounded-full hover:scale-110 transition-all group"
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
                    </button>
                )}

                {showContent && (
                    <main>
                        <GoldDust />
                        {/* HERO */}
                        <section id="hero" className="relative h-screen flex items-center justify-center text-center overflow-hidden imperial-bg">
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
                                    <img
                                        src={heroImage}
                                        className="w-full h-full object-cover"
                                        style={{
                                            objectPosition: `${heroPan.localX} ${heroPan.localY}`,
                                            transform: `scale(${heroAdjustScale})`,
                                            filter: `grayscale(20%) brightness(${heroBrightness * 0.5}%) contrast(${heroContrast * 1.25}%)`,
                                            transition: heroPan.isDragging ? 'none' : 'object-position 0.2s ease-out, transform 0.2s ease-out, filter 0.2s ease-out'
                                        }}
                                        alt=""
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/40" />
                                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,1)]" />
                            </motion.div>

                            <motion.div style={{ y: textY }} className="relative z-10 space-y-8 px-6">
                                <RevealSection>
                                    <div className="mb-12 relative inline-block">
                                        <div className="absolute inset-0 bg-[#D4AF37] blur-2xl opacity-20 animate-pulse" />
                                        <Trophy className="relative text-[#D4AF37]" size={48} />
                                    </div>
                                    <h1 className="font-moul text-4xl sm:text-6xl md:text-9xl hammered-gold leading-none">
                                        {wedding.groomName} <br />
                                        <span className="font-script text-3xl sm:text-4xl text-white my-4 md:my-6 block">{wedding.eventType === 'anniversary' ? '&' : 'Joint with'}</span>
                                        {wedding.brideName}
                                    </h1>
                                    <div className="mt-8 md:mt-12 group cursor-default">
                                        <div className="h-px w-40 md:w-64 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                                        <p className="py-3 md:py-4 font-khmer text-base md:text-2xl tracking-[0.2em] md:tracking-[0.3em] font-bold text-white/90">
                                            {new Date(wedding.date).toLocaleDateString('km-KH', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                        <div className="h-px w-40 md:w-64 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                                    </div>
                                </RevealSection>
                            </motion.div>
                        </section>

                        {/* Our Story / Imperial Center */}
                        <section className="py-16 md:py-32 px-4 md:px-6">
                            <div className="max-w-4xl mx-auto">
                                <ImperialFrame>
                                    <div className="flex flex-col items-center text-center space-y-12">
                                        <WaxSeal className="mb-6" />
                                        <h2 className="font-moul text-4xl md:text-6xl text-white uppercase tracking-tighter">{wedding.eventType === 'anniversary' ? 'The Golden Celebration' : 'The Royal Union'}</h2>
                                        <p className="font-khmer text-base md:text-xl leading-loose text-white/80 max-w-2xl border-x border-[#D4AF37]/20 px-4 md:px-10">
                                            {wedding.eventType === 'anniversary'
                                                ? "ក្តីស្រលាញ់ដែលនៅតែរឹងមាំនិងស្រស់បំព្រង។ យើងខ្ញុំសូមគោរពអញ្ជើញលោកអ្នកចូលរួមជាអធិបតីក្នុងពិធីខួបអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ។"
                                                : "ក្តីស្រលាញ់ដែលកើតចេញពីបេះដូងពិត នាំមកនូវសុភមង្គលដ៏ឧត្តុង្គឧត្តម។ យើងខ្ញុំសូមគោរពអញ្ជើញលោកអ្នកចូលរួមជាអធិបតីក្នុងទិវាជ័យមង្គលរបស់យើងខ្ញុំ។"}
                                        </p>
                                        <div className="grid grid-cols-2 gap-6 md:gap-20 w-full pt-6 md:pt-10">
                                            <div className="space-y-4">
                                                <p className="font-moul text-[#D4AF37] text-sm italic">Groom</p>
                                                <p className="font-moul text-2xl text-white">{wedding.groomName}</p>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="font-moul text-[#D4AF37] text-sm italic">Bride</p>
                                                <p className="font-moul text-2xl text-white">{wedding.brideName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </ImperialFrame>
                            </div>
                        </section>

                        {/* Timeline - Ceremonial Style */}
                        <section id="event-info" className="py-16 md:py-32 bg-black relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/silk.png')] opacity-10" />
                            <div className="max-w-4xl mx-auto px-6 relative z-10">
                                <PremiumHeading>កាលវិភាគមង្គល</PremiumHeading>
                                <div className="space-y-0 border-y border-[#D4AF37]/30">
                                    {wedding.activities.map((act, i) => (
                                        <RevealSection key={i}>
                                            <div className="grid grid-cols-[70px_1fr] sm:grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5 transition-colors">
                                                <div className="p-3 sm:p-5 md:p-8 border-r border-[#D4AF37]/10 font-bold text-[#D4AF37] text-sm sm:text-lg md:text-2xl flex items-center justify-center text-center">
                                                    {act.time}
                                                </div>
                                                <div className="p-3 sm:p-5 md:p-8 text-white text-sm sm:text-base md:text-xl font-khmer flex items-center">
                                                    {act.title}: {act.description}
                                                </div>
                                            </div>
                                        </RevealSection>
                                    ))}
                                </div>
                                <RevealSection>
                                    <div className="mt-10 md:mt-20 p-6 md:p-12 border border-[#D4AF37]/20 bg-[#1a0505] text-center space-y-6 md:space-y-8">
                                        <div className="flex flex-col items-center gap-4">
                                            <MapPin className="text-[#D4AF37]" size={32} />
                                            <h3 className="font-moul text-2xl text-white">ទីតាំងប្រារព្ធពិធី</h3>
                                            <p className="font-khmer text-xl text-white/80 max-w-lg mx-auto">{wedding.location}</p>
                                            {wedding.themeSettings?.mapLink && (
                                                <a href={wedding.themeSettings.mapLink} target="_blank" className="mt-4 inline-flex items-center gap-3 px-8 py-3 bg-[#D4AF37] text-black font-moul text-xs hover:bg-[#FCF6BA] transition-colors">
                                                    មើលលើផែនទី
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </RevealSection>
                            </div>
                        </section>

                        {/* Cinematic Story Gallery */}
                        <div id="gallery">
                            <CinematicStoryGallery items={wedding.galleryItems} labels={wedding.themeSettings?.customLabels} theme="dark" />
                        </div>

                        {/* Blessed Guestbook */}
                        <section id="guestbook" className="py-16 md:py-32 px-4 md:px-6 shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">
                            <div className="max-w-4xl mx-auto">
                                <ImperialFrame>
                                    <div className="text-center space-y-8">
                                        <PremiumHeading className="text-3xl hammered-gold">សៀវភៅជូនពរ</PremiumHeading>
                                        <GuestbookSection
                                            wedding={wedding}
                                            onNewWish={() => setWishTrigger(t => t + 1)}
                                        />
                                    </div>
                                </ImperialFrame>
                            </div>
                        </section>

                        {/* Footer */}
                        <footer className="py-24 flex flex-col items-center gap-12 text-center opacity-40">
                            <p className="font-moul text-xs tracking-widest uppercase">Thank You | {wedding.groomName} & {wedding.brideName}</p>
                            <MoneaBranding />
                        </footer>
                    </main >
                )
                }
            </div >

            <FullscreenOverlay
                selectedImg={selectedImg}
                setSelectedImg={setSelectedImg}
                galleryImages={galleryImages}
            />

            {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="auto" style={{ display: 'none' }} />}
        </div >
    );
}

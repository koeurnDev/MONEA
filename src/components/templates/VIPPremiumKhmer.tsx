"use client";
import React, { useState, useEffect, useRef } from 'react';
import { WeddingData } from "./types";
import { CldImage } from 'next-cloudinary';
import { m, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, ArrowRight, Music2, PartyPopper } from 'lucide-react';
import dynamic from 'next/dynamic';

const Countdown = dynamic(() => import('./classic-khmer/Countdown'), { ssr: false });
const WishesWall = dynamic(() => import('./shared/WishesWall'), { ssr: false });
const GuestbookSection = dynamic(() => import('./modern-full/GuestbookSection'), { ssr: false });
const CinematicStoryGallery = dynamic(() => import('./shared/CinematicStoryGallery'), { ssr: false });
import { MoneaBranding } from '@/components/MoneaBranding';

// Import Shared Cinematic Components
import { PremiumHeading, RevealSection, LuxurySection, useImagePan } from './shared/CinematicComponents';

const Sparkle = ({ delay = 0, size = 4, top = "50%", left = "50%" }) => (
    <m.div
        className="absolute rounded-full bg-white"
        style={{ width: size, height: size, top, left }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay, ease: "easeInOut" }}
    />
);

export default function VIPPremiumKhmer({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const [wishTrigger, setWishTrigger] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sparkles, setSparkles] = useState<any[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const isMob = window.innerWidth < 768;
        setIsMobile(isMob);

        setSparkles([...Array(isMob ? 4 : 12)].map((_, i) => ({
            id: i,
            delay: Math.random() * 5,
            size: Math.random() * 2 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`
        })));
    }, []);

    const heroImage = wedding.themeSettings?.heroImage || "/images/bg_staircase.jpg";
    const musicUrl = wedding.themeSettings?.musicUrl;
    const galleryImages = wedding.galleryItems?.filter(i => i.type === 'IMAGE').map(i => i.url) || [];

    // Cinematic Adjustments
    const heroPan = useImagePan(wedding.themeSettings?.heroImageX || '50%', wedding.themeSettings?.heroImagePosition || '50%', 'heroImageX', 'heroImagePosition');
    const heroAdjustScale = wedding.themeSettings?.heroImageScale || 1.05;
    const heroBrightness = wedding.themeSettings?.heroImageBrightness || 95;
    const heroContrast = wedding.themeSettings?.heroImageContrast || 105;
    const videoUrl = wedding.themeSettings?.videoUrl;

    const displayGallery = galleryImages.length > 0 ? galleryImages : [
        "/images/bg_staircase.jpg", "/images/bg_tunnel.jpg", "/images/bg_enchanted.jpg"
    ];

    const { scrollY, scrollYProgress } = useScroll();

    // Cinematic Parallax Effects
    const heroScaleParallax = useTransform(scrollYProgress, [0, 0.2], [1.05, 1.15]);
    const heroOpacityParallax = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);
    const overlayOpacityParallax = useTransform(scrollYProgress, [0, 0.3], [0.3, 0.8]);
    const textYParallax = useTransform(scrollY, [0, 500], [0, 150]);
    const textOpacityParallax = useTransform(scrollY, [0, 300], [1, 0]);

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    const heroScale = isMobile ? 1.05 : heroScaleParallax;
    const heroOpacity = isMobile ? 0.6 : heroOpacityParallax;
    const overlayOpacity = isMobile ? 0.4 : overlayOpacityParallax;
    const textY = isMobile ? 0 : textYParallax;
    const textOpacity = isMobile ? 1 : textOpacityParallax;

    // Audio Logic - Optimized for Mobile (No heavy intervals)
    useEffect(() => {
        if (!musicUrl || !audioRef.current) return;

        if (isPlaying) {
            audioRef.current.volume = 0.6;
            audioRef.current.play().catch(() => {
                setIsPlaying(false);
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, musicUrl]);

    // Render logic for dynamic gradient mapping (VIP Colors)
    const primaryVIP = wedding.themeSettings?.primaryColor || '#D4AF37'; // Default Gold

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#D4AF37] selection:text-black font-kantumruy w-full">
            <style jsx global>{`
                :root {
                    --color-gold: #D4AF37;
                    --color-dark: #121212;
                    --color-ivory: #FFFFF0;
                }
                
                .font-vip-heading { font-family: var(--font-playfair), serif; }
                .font-vip-serif { font-family: var(--font-playfair), serif; }
                .font-khmer-moul { font-family: var(--font-moul), serif; }
                
                .vip-glass {
                    background: rgba(18, 18, 18, 0.7);
                    border: 1px solid rgba(212, 175, 55, 0.15);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
                    will-change: transform;
                }

                @media (min-width: 768px) {
                    .vip-glass {
                        background: rgba(20, 20, 20, 0.4);
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                        will-change: transform, backdrop-filter;
                    }
                }
                
                .gold-text-gradient {
                    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    color: transparent;
                }
            `}</style>

            <WishesWall trigger={wishTrigger} />

            {/* MUSIC CONTROL */}
            {musicUrl && (
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="fixed top-6 right-6 z-[60] vip-glass rounded-full w-12 h-12 flex items-center justify-center text-[#D4AF37] hover:scale-110 active:scale-95 transition-all duration-500 overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/0 via-[#D4AF37]/20 to-[#D4AF37]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {isPlaying ? (
                        <div className="flex items-center gap-0.5 h-4 px-0.5">
                            {[1.2, 0.9, 1.5, 1.1].map((duration, i) => (
                                <m.div
                                    key={i}
                                    className="w-[3px] bg-gradient-to-t from-[#B38728] to-[#FCF6BA] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"
                                    style={{ transformOrigin: "bottom" }}
                                    animate={{ scaleY: [0.3, 1, 0.5, 1.2, 0.3] }}
                                    transition={{ duration: duration, repeat: Infinity, ease: "easeInOut" }}
                                />
                            ))}
                        </div>
                    ) : (
                        <Music2 size={18} className="opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]" />
                    )}
                </button>
            )}

            {/* VIP HERO SECTION */}
            <section id="hero" className="relative min-h-screen w-full flex flex-col justify-end p-4 md:p-16 z-10 overflow-hidden py-20">
                <m.div
                    style={{ opacity: heroOpacity, scale: heroScale }}
                    className="absolute inset-0 z-0 cursor-move active:cursor-grabbing"
                    onMouseDown={heroPan.onStart}
                    onTouchStart={heroPan.onStart}
                >
                    {/* Dark gradient overlay for extreme contrast */}
                    <m.div
                        style={{ opacity: overlayOpacity }}
                        className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/20 to-[#0A0A0A]"
                    />

                    {videoUrl ? (
                        <div className="absolute inset-0 w-full h-full pointer-events-none">
                            <iframe
                                className="w-full h-full scale-[1.5]"
                                src={`https://www.youtube.com/embed/${videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()}?autoplay=1&mute=1&loop=1&playlist=${videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()}&controls=0&showinfo=0&rel=0&modestbranding=1`}
                                allow="autoplay; encrypted-media"
                                frameBorder="0"
                                loading="lazy"
                            />
                        </div>
                    ) : (
                        heroImage.startsWith('/') ? (
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
                </m.div>

                {/* Animated Particles Overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-30">
                    {sparkles.map((p) => (
                        <Sparkle
                            key={p.id}
                            delay={p.delay}
                            size={p.size}
                            top={p.top}
                            left={p.left}
                        />
                    ))}
                </div>

                {/* Central Title */}
                <m.div
                    style={{ y: textY, opacity: textOpacity }}
                    className="relative z-20 flex flex-col items-center text-center pb-12 w-full max-w-5xl mx-auto"
                >
                    <m.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        className="vip-glass px-6 py-10 md:px-16 md:py-16 rounded-[2rem] w-full"
                    >
                        {guestName && (
                            <div className="mb-8 space-y-3">
                                <m.div
                                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.5 }}
                                    className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto"
                                />
                                <p className="text-[10px] uppercase tracking-[0.6em] text-[#D4AF37]/80 font-bold">VIP Guest</p>
                                <p className="font-khmer-moul text-lg md:text-2xl text-white drop-shadow-lg">គោរពអញ្ជើញ {guestName}</p>
                            </div>
                        )}

                        <p className="font-vip-serif italic text-xl md:text-3xl text-[#D4AF37]/80 mb-6 font-light">
                            {wedding.eventType === 'anniversary' ? 'To the celebration of our Anniversary' : 'To witness the union of'}
                        </p>

                        <h1 className="font-vip-heading text-xl xs:text-2xl sm:text-3xl md:text-8xl leading-none tracking-widest uppercase mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                            <span className="block mb-1 md:mb-2 text-white">{wedding.groomName}</span>
                            <span className="block text-lg md:text-3xl my-3 md:my-6 font-vip-serif italic text-[#D4AF37] lowercase">and</span>
                            <span className="block text-white">{wedding.brideName}</span>
                        </h1>

                        <div className="mt-6 md:mt-12 flex items-center justify-center gap-4 md:gap-6">
                            <m.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 1 }} className="h-[1px] bg-[#D4AF37]/40 w-10 md:w-20 origin-left" />
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.5em] text-[#D4AF37] font-bold">
                                {new Date(wedding.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <m.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 1 }} className="h-[1px] bg-[#D4AF37]/40 w-10 md:w-20 origin-right" />
                        </div>
                    </m.div>
                </m.div>
            </section>

            {/* VIP STORY SECTION */}
            <section className="relative py-40 px-6 md:px-20 z-20 bg-[#0A0A0A]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-[#D4AF37] to-transparent opacity-50" />

                <div className="max-w-7xl mx-auto text-center space-y-16 pt-20">
                    <RevealSection>
                        <div className="space-y-6">
                            <span className="text-[10px] tracking-[0.5em] uppercase text-[#D4AF37] font-bold">The Royal Beginning</span>
                            <h2 className="font-vip-heading text-2xl xs:text-3xl md:text-6xl text-white leading-tight">
                                A Love Written in <br /><span className="gold-text-gradient">The Stars</span>
                            </h2>
                        </div>
                    </RevealSection>

                    <RevealSection delay={0.2}>
                        <p className="max-w-3xl mx-auto font-vip-serif text-2xl md:text-3xl text-gray-400 leading-relaxed italic font-light">
                            &quot;{wedding.themeSettings?.groomStory || "Two souls intertwined in the fabric of destiny, embarking on a journey of a lifetime."}&quot;
                        </p>
                    </RevealSection>
                </div>

                {galleryImages.length > 0 && (
                    <div className="mt-32">
                        <CinematicStoryGallery items={wedding.galleryItems} labels={wedding.themeSettings?.customLabels} />
                    </div>
                )}
            </section>

            {/* VIP DETAILS PANEL */}
            <section id="event-info" className="py-32 px-6 relative z-20">
                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />

                <RevealSection>
                    <div className="text-center mb-20">
                        <PremiumHeading className="text-white gold-text-gradient">{wedding.eventType === 'anniversary' ? "កម្មវិធីអបអរសាទរ" : "ព័ត៌មានកម្មវិធី"}</PremiumHeading>
                    </div>
                </RevealSection>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
                    {[
                        { icon: Calendar, label: "DATE", value: new Date(wedding.date).toLocaleDateString('km-KH', { weekday: 'short', month: 'short', day: 'numeric' }) },
                        { icon: Clock, label: "TIME", value: "07AM-10PM" },
                        { icon: MapPin, label: "LOCATION", value: wedding.location || "Phnom Penh" }
                    ].map((item, i) => (
                        <RevealSection key={i} delay={i * 0.15}>
                            <div className="vip-glass p-4 md:p-10 rounded-2xl md:rounded-[2rem] text-center group hover:-translate-y-2 transition-transform duration-500 h-full flex flex-col items-center justify-center">
                                <div className="mx-auto w-8 h-8 md:w-16 md:h-16 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-3 md:mb-8 bg-[#D4AF37]/5 group-hover:bg-[#D4AF37]/20 transition-colors duration-500">
                                    <item.icon size={14} className="group-hover:scale-110 transition-transform duration-500 md:w-6 md:h-6" />
                                </div>
                                <span className="block text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.4em] font-bold text-gray-500 mb-2 md:mb-4">{item.label}</span>
                                <p className="font-vip-heading text-sm md:text-xl text-white truncate w-full">{item.value}</p>
                            </div>
                        </RevealSection>
                    ))}
                </div>

                <RevealSection delay={0.4}>
                    <div className="mt-20 max-w-4xl mx-auto">
                        <div className="vip-glass px-12 py-16 rounded-[2rem] relative overflow-hidden">
                            <div className="absolute opacity-10 top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                            <Countdown wedding={wedding} />
                            <div className="absolute opacity-10 bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                        </div>
                    </div>
                </RevealSection>
            </section>

            {/* VIP ITINERARY */}
            <section className="py-32 px-6 max-w-5xl mx-auto relative z-20">
                <RevealSection>
                    <div className="text-center mb-20">
                        <span className="text-[10px] tracking-[0.5em] uppercase text-[#D4AF37] font-bold">The Agenda</span>
                        <h2 className="font-vip-heading text-4xl mt-4 text-white">របៀបវារៈកម្មវិធី</h2>
                    </div>
                </RevealSection>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    {(wedding.activities || []).map((item, idx) => (
                        <RevealSection key={idx} delay={idx * 0.1}>
                            <div className="vip-glass p-4 md:p-8 rounded-2xl md:rounded-3xl flex flex-col justify-center h-full group hover:border-[#D4AF37]/50 transition-colors">
                                <span className="font-vip-serif text-lg md:text-3xl text-[#D4AF37] mb-2 md:mb-4 group-hover:scale-105 origin-left transition-transform">{item.time}</span>
                                <h3 className="font-khmer-moul text-xs md:text-xl text-white mb-1 md:mb-2 leading-relaxed">{item.title}</h3>
                                <p className="text-gray-400 font-light text-[10px] md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none">{item.description}</p>
                            </div>
                        </RevealSection>
                    ))}
                </div>
            </section>

            {/* VIP GUESTBOOK */}
            <section id="guestbook" className="py-32 px-6 relative z-20">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF37]/5 to-transparent pointer-events-none" />
                <RevealSection>
                    <div className="max-w-4xl mx-auto vip-glass p-8 md:p-16 rounded-[3rem]">
                        <div className="text-center mb-12">
                            <PartyPopper size={32} className="mx-auto text-[#D4AF37] mb-6" />
                            <h2 className="font-khmer-moul text-3xl md:text-4xl text-white gold-text-gradient">សូមអរគុណសម្រាប់ពាក្យជូនពរ</h2>
                        </div>
                        <GuestbookSection
                            wedding={wedding}
                            guestName={guestName}
                            onNewWish={() => setWishTrigger(prev => prev + 1)}
                        />
                    </div>
                </RevealSection>
            </section>

            {/* VIP CONCLUSION & CTA */}
            <section className="relative py-40 bg-[#0A0A0A] overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <img src={displayGallery[displayGallery.length - 1]} className="w-full h-full object-cover grayscale brightness-50" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/80 to-transparent" />

                <div className="relative z-10 text-center px-6">
                    <RevealSection>
                        <p className="font-vip-serif font-light text-3xl text-[#D4AF37] mb-6 tracking-wide italic">An unforgettable evening awaits</p>
                        <h2 className="font-vip-heading text-5xl md:text-7xl mb-12 text-white">Let&apos;s Celebrate <br /><span className="gold-text-gradient">Together</span></h2>
                        <a
                            href={wedding.themeSettings?.mapLink || "#"}
                            target="_blank"
                            className="inline-flex items-center gap-4 md:gap-6 px-8 md:px-12 py-3.5 md:py-5 vip-glass hover:bg-[#D4AF37] border-[#D4AF37]/50 hover:border-[#D4AF37] text-white hover:text-black transition-all duration-500 group rounded-full"
                        >
                            <span className="uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs font-bold">Get VIP Directions</span>
                            <ArrowRight className="group-hover:translate-x-2 transition-transform w-4 h-4 md:w-[18px] md:h-[18px]" />
                        </a>
                    </RevealSection>

                    <div className="mt-32 pt-20 border-t border-white/5 flex flex-col items-center gap-10">
                        <PremiumHeading className="mb-0 text-white italic opacity-80 bg-none drop-shadow-none font-vip-serif">
                            With highest regards, <br /><span className="text-[#D4AF37] block mt-4 text-4xl">{wedding.groomName} & {wedding.brideName}</span>
                        </PremiumHeading>
                        <div className="opacity-50 hover:opacity-100 transition-opacity">
                            <MoneaBranding />
                        </div>
                    </div>
                </div>
            </section>

            {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="auto" style={{ display: 'none' }} />}
        </main>
    );
}

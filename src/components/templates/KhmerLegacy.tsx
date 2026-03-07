"use client";
import React, { useState, useEffect, useRef } from 'react';
import { WeddingData } from "./types";
import { m, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, Heart, Music, Music2, QrCode } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { MoneaBranding } from '@/components/MoneaBranding';
import { RevealSection, useImagePan } from './shared/CinematicComponents';
import Image from 'next/image';

const KHMER_LEGACY_IMAGES = [
    "587515149_905397975378667_8301966555433407602_n.jpg",
    "620164957_905397375378727_7515993526417641923_n.jpg",
    "621344331_905398102045321_4815755327162152289_n.jpg",
    "621726527_905397825378682_844380070510573314_n.jpg",
    "621805736_905398172045314_8133805499277559401_n.jpg",
    "621808984_905395172045614_7667582104116214221_n.jpg",
    "621810838_905399225378542_6103057961978326022_n.jpg",
    "621811002_905396558712142_5126771807004187076_n.jpg",
    "621811254_905398285378636_5240747682765358044_n.jpg",
    "621811942_905392918712506_8600818650624857202_n.jpg",
    "621813168_905393265379138_2356104923368506186_n.jpg",
    "621833880_905399478711850_561394654948501604_n.jpg",
    "622204372_905393362045795_1406565082731770288_n.jpg",
    "622279784_905392782045853_1189842078802821714_n.jpg",
    "622364683_905397398712058_1170908583590535468_n.jpg",
    "622374686_905392995379165_1001573724208229331_n.jpg",
    "622393496_905398208711977_866601887320317883_n.jpg",
    "622582548_905399002045231_4147705888928073222_n.jpg",
    "622629866_905398512045280_817022291532741601_n.jpg",
    "622691275_905397805378684_9190546973257835512_n.jpg",
    "622829275_905399252045206_3319961029231849896_n.jpg",
    "622946269_905396995378765_7954516323151610036_n.jpg",
    "623057581_905398085378656_5768956695184822223_n.jpg",
    "623294861_905397475378717_2162538044329476420_n.jpg",
    "623369201_905397698712028_7743639010812348891_n.jpg",
    "624468981_905397905378674_5683480265720073892_n.jpg"
].map(img => `/images/khmer-legacy/${img}`);

const useSmartColor = (imageUrl: string) => {
    const [colors, setColors] = useState({ primary: '#D4AF37', secondary: '#8E5A5A', dark: '#1a1a1a' });

    useEffect(() => {
        if (!imageUrl || typeof window === 'undefined') return;

        const img = new window.Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = 10;
                canvas.height = 10;
                ctx.drawImage(img, 0, 0, 10, 10);
                const data = ctx.getImageData(0, 0, 10, 10).data;

                let r = 0, g = 0, b = 0;
                for (let i = 0; i < data.length; i += 4) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                }
                r = Math.floor(r / (data.length / 4));
                g = Math.floor(g / (data.length / 4));
                b = Math.floor(b / (data.length / 4));

                const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

                // Create a darker version for contrast
                const darkR = Math.floor(r * 0.3);
                const darkG = Math.floor(g * 0.3);
                const darkB = Math.floor(b * 0.3);
                const darkHex = "#" + ((1 << 24) + (darkR << 16) + (darkG << 8) + darkB).toString(16).slice(1);

                setColors({ primary: hex, secondary: '#FFFFFF', dark: darkHex });
            } catch (e) {
                console.error("Color sync failed", e);
            }
        };
    }, [imageUrl]);

    return colors;
};


export default function KhmerLegacy({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const [revealed, setRevealed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const musicUrl = wedding.themeSettings?.musicUrl;
    const rawGallery = wedding.galleryItems?.filter(i => i.type === 'IMAGE').map(i => i.url) || [];
    const galleryImages = rawGallery.length > 0 ? rawGallery : KHMER_LEGACY_IMAGES;

    const heroImage = wedding.themeSettings?.heroImage || galleryImages[0] || "/images/bg_staircase.jpg";
    const smartColors = useSmartColor(heroImage);

    const heroPan = useImagePan(wedding.themeSettings?.heroImageX || '50%', wedding.themeSettings?.heroImagePosition || '99%', 'heroImageX', 'heroImagePosition');
    const groomPan = useImagePan(wedding.themeSettings?.groomImageX || '50%', wedding.themeSettings?.groomImagePosition || '50%', 'groomImageX', 'groomImagePosition');
    const bridePan = useImagePan(wedding.themeSettings?.brideImageX || '50%', wedding.themeSettings?.brideImagePosition || '50%', 'brideImageX', 'brideImagePosition');

    const formattedDateHero = React.useMemo(() => {
        try {
            const d = new Date(wedding.date);
            if (isNaN(d.getTime())) return "";
            return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
        } catch (e) { return ""; }
    }, [wedding.date]);

    const formattedDateInvitation = React.useMemo(() => {
        try {
            const d = new Date(wedding.date);
            if (isNaN(d.getTime())) return "";
            return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
        } catch (e) { return ""; }
    }, [wedding.date]);

    // Audio Logic - Simplified for performance
    useEffect(() => {
        if (!musicUrl || !audioRef.current) return;
        if (isPlaying) {
            audioRef.current.volume = 0.6;
            audioRef.current.play().catch(() => setIsPlaying(false));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, musicUrl]);

    return (
        <main className="min-h-screen bg-[#FDFBF7] text-[#333] overflow-x-hidden selection:bg-[#E2D1B3]">
            <style jsx global>{`
                :root {
                    --color-cream: #FFFFFF;
                    --color-ivory: #F9F9F9;
                    --color-gold-deep: #B8860B;
                    --color-gold-light: #C5A059;
                    --color-text-main: #333333;
                }

                .font-khmer-moul { font-family: var(--font-moul), serif; }
                .font-khmer-content { font-family: var(--font-kantumruy), sans-serif; line-height: 2.8; }
                .font-serif-elegant { font-family: var(--font-playfair), serif; }
                .font-playfair { font-family: var(--font-playfair), serif; }
                
                .text-gold { color: var(--color-gold-light); }
                .bg-gold { background-color: var(--color-gold-light); }
                .border-gold { border-color: var(--color-gold-light); }
                
                .schedule-text { font-size: 13px; line-height: 2.2; color: #555; }
                
                .premium-texture {
                    background-image: url("https://www.transparenttextures.com/patterns/paper-fibers.png");
                    background-repeat: repeat;
                }

                .border-lux {
                    border: 1px solid rgba(0, 0, 0, 0.03);
                    will-change: transform;
                }

                .gold-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, var(--color-gold-light), transparent);
                    width: 100%;
                    max-width: 140px;
                    margin: 4.5rem auto;
                    opacity: 0.1;
                }

                .parallax-text {
                    text-shadow: 0 10px 20px rgba(0,0,0,0.02);
                }

                @media (max-width: 480px) {
                    .font-khmer-content { line-height: 2.2; }
                    .gold-divider { margin: 3rem auto; }
                }
            `}</style>



            {/* MUSIC CONTROL */}
            {musicUrl && (
                <div className="fixed top-6 right-6 z-50">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="bg-white shadow-2xl p-4 rounded-full border border-gold/10 hover:scale-110 transition-transform"
                    >
                        {isPlaying ? <Music size={20} className="text-gold animate-pulse" /> : <Music2 size={20} className="text-gray-300" />}
                    </button>
                </div>
            )}

            {/* CINEMATIC ENTRANCE OVERLAY */}
            <AnimatePresence>
                {!revealed && (
                    <m.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center p-8"
                    >
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <p className="text-white/40 tracking-[0.4em] uppercase text-xs">Premium Invitation</p>
                                <h2 className="text-white font-khmer-moul text-2xl md:text-3xl tracking-widest leading-relaxed">
                                    សិរីមង្គលអាពាហ៍ពិពាហ៍
                                </h2>
                            </div>

                            <m.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setRevealed(true)}
                                style={{ borderColor: smartColors.primary, color: smartColors.primary }}
                                className="px-10 py-4 border rounded-full bg-black/20 sm:backdrop-blur-md font-khmer text-lg tracking-widest hover:bg-white/5 transition-all outline-none"
                            >
                                {wedding.eventType === 'anniversary' ? 'ខួបអាពាហ៍ពិពាហ៍' : 'បើកសំបុត្រ'}
                            </m.button>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTAINER: Full Screen on Desktop */}
            <div className="max-w-[480px] md:max-w-none mx-auto bg-white min-h-screen relative md:shadow-none overflow-hidden premium-texture font-serif-elegant">

                {/* HERO SECTION / COVER */}
                <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-black py-20">
                    <m.div
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        {wedding.themeSettings?.videoUrl ? (
                            <div className="w-full h-full relative">
                                <iframe
                                    src={`https://www.youtube.com/embed/${wedding.themeSettings.videoUrl.split('v=')[1] || wedding.themeSettings.videoUrl.split('/').pop()}?autoplay=1&mute=1&loop=1&playlist=${wedding.themeSettings.videoUrl.split('v=')[1] || wedding.themeSettings.videoUrl.split('/').pop()}&controls=0&showinfo=0&rel=0&modestbranding=1`}
                                    className="absolute inset-0 w-full h-full pointer-events-none scale-[1.5]"
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/40" />
                            </div>
                        ) : (
                            <>
                                {heroImage.startsWith('/') ? (
                                    <Image
                                        src={heroImage}
                                        fill
                                        sizes="100vw"
                                        className={`object-cover transition-none ${heroPan.isDragging ? 'cursor-grabbing' : 'cursor-grab group-hover:ring-4 ring-gold/30 ring-inset'}`}
                                        style={{
                                            objectPosition: `${heroPan.localX} ${heroPan.localY}`,
                                            transform: `scale(${wedding.themeSettings?.heroImageScale || 1})`,
                                            filter: `brightness(${wedding.themeSettings?.heroImageBrightness || 100}%) contrast(${wedding.themeSettings?.heroImageContrast || 100}%)`,
                                            userSelect: 'none',
                                            touchAction: 'none',
                                            willChange: 'object-position, transform'
                                        }}
                                        onMouseDown={heroPan.onStart}
                                        onTouchStart={heroPan.onStart}
                                        priority
                                        draggable={false}
                                        alt="Wedding Hero"
                                    />
                                ) : (
                                    <CldImage
                                        src={heroImage}
                                        fill
                                        className={`object-cover transition-none ${heroPan.isDragging ? 'cursor-grabbing' : 'cursor-grab group-hover:ring-4 ring-gold/30 ring-inset'}`}
                                        style={{
                                            objectPosition: `${heroPan.localX} ${heroPan.localY}`,
                                            transform: `scale(${wedding.themeSettings?.heroImageScale || 1})`,
                                            filter: `brightness(${wedding.themeSettings?.heroImageBrightness || 100}%) contrast(${wedding.themeSettings?.heroImageContrast || 100}%)`,
                                            userSelect: 'none',
                                            touchAction: 'none',
                                            willChange: 'object-position, transform'
                                        }}
                                        onMouseDown={heroPan.onStart}
                                        onTouchStart={heroPan.onStart}
                                        priority
                                        draggable={false}
                                        alt="Wedding Hero"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
                            </>
                        )}
                    </m.div>

                    <div className="relative z-10 px-8 space-y-10 pointer-events-none">
                        <div className="space-y-4">
                            <m.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1 }}
                                style={{ color: smartColors.primary }}
                                className="font-playfair tracking-[0.3em] text-sm md:text-base uppercase"
                            >
                                The Wedding Of
                            </m.div>
                            <m.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1, duration: 1.2 }}
                                className="text-2xl xs:text-3xl sm:text-5xl md:text-9xl font-bold tracking-[0.2em] md:tracking-[0.5em] text-white/90 drop-shadow-2xl font-serif-kh-bold"
                            >
                                {wedding.groomName} <br /> & <br /> {wedding.brideName}
                            </m.h1>
                        </div>

                        <m.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.4 }}
                            className="space-y-6"
                        >
                            <div className="bg-white/30 sm:backdrop-blur-sm border border-white/20 px-8 py-4 rounded-full inline-block">
                                <span className="text-white font-serif-elegant text-base md:text-xl tracking-widest">{formattedDateHero}</span>
                            </div>
                        </m.div>
                    </div>

                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 pointer-events-none"
                    >
                        <Clock size={24} strokeWidth={1} />
                    </m.div>
                </section>

                {/* OVERLAYS */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-white mix-blend-overlay" />

                {/* EDITORIAL BREAK 1 */}
                <section className="w-full aspect-[4/3] md:aspect-video relative overflow-hidden bg-white">
                    <Image src={galleryImages[1 % galleryImages.length]} fill className="object-cover" loading="lazy" decoding="async" alt="Editorial Break" />
                </section>

                {/* PAGE 1: FORMAL ENGLISH INVITATION */}
                <section id="invitation-english" className="pt-12 md:pt-48 pb-16 md:pb-40 px-4 md:px-12 text-left relative overflow-hidden">
                    <div className="max-w-6xl mx-auto flex items-center gap-6 md:gap-24">
                        <div className="flex-1 space-y-6 md:space-y-12 relative z-10">
                            <RevealSection>
                                <div className="space-y-3 md:space-y-6">
                                    <div className="w-12 h-[1px] bg-black/20 mx-0" />
                                    <p className="text-[10px] md:text-[10px] tracking-[0.4em] uppercase font-bold text-gray-400 max-w-[300px] mx-0 leading-relaxed px-0">
                                        WE CORDIALLY INVITE YOU TO CELEBRATE THE UNION OF OUR FAMILIES AND THE WEDDING CEREMONY OF
                                    </p>
                                </div>
                            </RevealSection>

                            <RevealSection delay={0.2}>
                                <div className="space-y-3 md:space-y-6">
                                    <h2
                                        style={{ color: smartColors.primary }}
                                        className="font-playfair text-2xl xs:text-3xl md:text-8xl font-black tracking-tighter parallax-text"
                                    >
                                        {wedding.groomName}
                                    </h2>
                                    <div className="flex items-center justify-start gap-2 md:gap-4">
                                        <div className="h-[1px] bg-gold/20 w-4 md:w-16" />
                                        <span style={{ color: smartColors.primary }} className="font-serif-elegant text-xl md:text-4xl italic px-1 md:px-2">&</span>
                                        <div className="h-[1px] bg-gold/20 w-4 md:w-16" />
                                    </div>
                                    <h2
                                        style={{ color: smartColors.primary }}
                                        className="font-playfair text-3xl md:text-8xl font-black tracking-tighter parallax-text"
                                    >
                                        {wedding.brideName}
                                    </h2>
                                </div>
                            </RevealSection>
                        </div>

                        <div className="flex-1 block">
                            <div className="aspect-[3/4] max-w-md ml-auto rounded-sm overflow-hidden shadow-2xl border-lux rotate-[2deg] relative">
                                <Image src={galleryImages[11 % galleryImages.length]} fill className="object-cover" loading="lazy" decoding="async" alt="Couple" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-4 md:px-12 py-12 md:py-32 border-t border-gray-50 bg-white relative">
                    <div className="max-w-6xl mx-auto flex flex-row items-start justify-between gap-6 md:gap-20">
                        <RevealSection delay={0.4} className="flex-1">
                            <div className="space-y-4 md:space-y-8 text-left">
                                <div className="text-[7px] md:text-[10px] tracking-[0.6em] uppercase font-black text-gray-400">SAVES THE DATE</div>
                                <div className="space-y-2 md:space-y-4">
                                    <p className="font-playfair text-xl md:text-5xl font-bold tracking-[0.1em] text-gray-800">
                                        {formattedDateInvitation}
                                    </p>
                                    <div className="flex items-center justify-start gap-2 md:gap-4">
                                        <Clock size={12} className="text-gray-300 md:w-4 md:h-4" />
                                        <p className="font-playfair text-[10px] md:text-2xl font-bold text-gray-600 uppercase">FIVE O'CLOCK IN THE EVENING</p>
                                    </div>
                                </div>
                            </div>
                        </RevealSection>

                        <RevealSection delay={0.6} className="flex-1">
                            <div className="space-y-4 md:space-y-6 text-left">
                                <MapPin size={16} className="text-gold/30 mx-0 mb-2 md:w-6 md:h-6" />
                                <p className="font-playfair text-sm md:text-xl font-bold tracking-widest text-gray-800 uppercase leading-relaxed max-w-none mx-0">
                                    PUMI TOUL LEAP SOPHEAK MONGUL <br className="hidden md:block" /> WEDDING CENTER
                                </p>
                                <p className="text-xs md:text-[14px] tracking-widest text-gray-400 uppercase max-w-none mx-0 leading-relaxed font-bold">
                                    TOUL LEAP VILLAGE, SNOR, KAMBOL, PHNOM PENH
                                </p>

                                <div className="pt-2 md:pt-4 flex justify-start">
                                    <div className="gold-divider mx-0" />
                                </div>
                            </div>
                        </RevealSection>
                    </div>
                </section>

                <RevealSection delay={0.8}>
                    <div className="gold-divider" />
                    <p className="font-playfair text-sm tracking-[0.6em] text-gray-300 uppercase italic">Your Presence is our Gift</p>
                </RevealSection>

                {/* PAGE 4 MOVED UP: KHMER PREAMBLE & CIRCULAR PROFILES */}
                <section id="gallery" className="py-32 md:py-64 px-8 md:px-10 bg-[#FAF9F6]/30 relative">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                        <img src="https://www.transparenttextures.com/patterns/floral-paper.png" className="w-full h-full object-cover" />
                    </div>

                    <RevealSection>
                        <div className="text-center space-y-16">
                            <div className="space-y-4">
                                <p className="font-playfair text-xs tracking-[0.5em] text-gray-400 uppercase font-black">THE SOULS</p>
                                <h3 className="font-khmer-moul text-base md:text-lg text-gray-600">សូមស្វាគមន៍មកកាន់ទំព័រខាងក្រោម</h3>
                            </div>

                            <div className="w-full aspect-[16/10] bg-white shadow-xl border-lux mt-10 relative">
                                <Image src={galleryImages[2 % galleryImages.length]} fill className="object-cover" loading="lazy" decoding="async" alt="Love" />
                            </div>

                            <div className="max-w-6xl mx-auto flex flex-row gap-8 md:gap-40 pt-16 md:pt-40 relative">
                                <div className="absolute left-1/2 -top-10 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-gold/10 to-transparent -translate-x-1/2 block" />

                                {/* Groom */}
                                <div className="flex flex-col items-center relative z-10 px-0 flex-1">
                                    <div className="absolute -top-4 font-playfair text-xs md:text-[11px] tracking-[0.8em] font-black text-gold/30 uppercase">GROOM</div>
                                    <m.div
                                        whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
                                        className="w-full aspect-[4/5] md:aspect-[3/4] rounded-[1rem] md:rounded-[4rem] border-4 md:border-[16px] border-white shadow-xl overflow-hidden mb-6 ring-1 ring-gold/10"
                                    >
                                        {galleryImages[3 % galleryImages.length].startsWith('/') ? (
                                            <Image
                                                src={galleryImages[3 % galleryImages.length]}
                                                fill
                                                alt="Groom"
                                                className={`object-cover shadow-inner transition-none ${groomPan.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-105'}`}
                                                style={{
                                                    objectPosition: `${groomPan.localX} ${groomPan.localY}`,
                                                    transform: `scale(${wedding.themeSettings?.groomImageScale || 1})`,
                                                    userSelect: 'none',
                                                    touchAction: 'none',
                                                    willChange: 'object-position, transform'
                                                }}
                                                onMouseDown={groomPan.onStart}
                                                onTouchStart={groomPan.onStart}
                                                draggable={false}
                                            />
                                        ) : (
                                            <CldImage
                                                src={galleryImages[3 % galleryImages.length]}
                                                fill
                                                alt="Groom"
                                                className={`object-cover shadow-inner transition-none ${groomPan.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-105'}`}
                                                style={{
                                                    objectPosition: `${groomPan.localX} ${groomPan.localY}`,
                                                    transform: `scale(${wedding.themeSettings?.groomImageScale || 1})`,
                                                    userSelect: 'none',
                                                    touchAction: 'none',
                                                    willChange: 'object-position, transform'
                                                }}
                                                onMouseDown={groomPan.onStart}
                                                onTouchStart={groomPan.onStart}
                                                draggable={false}
                                            />
                                        )}
                                    </m.div>
                                    <h4
                                        style={{ color: smartColors.primary }}
                                        className="font-khmer-moul text-sm md:text-5xl tracking-widest text-center"
                                    >
                                        {wedding.groomName}
                                    </h4>
                                    <div className="w-8 h-[1px] bg-gold/20 mt-4" />
                                </div>

                                {/* Bride */}
                                <div className="flex flex-col items-center relative z-10 px-0 flex-1">
                                    <div className="absolute -top-4 font-playfair text-xs md:text-[11px] tracking-[0.8em] font-black text-gold/30 uppercase">BRIDE</div>
                                    <m.div
                                        whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
                                        className="w-full aspect-[4/5] md:aspect-[3/4] rounded-[1rem] md:rounded-[4rem] border-4 md:border-[16px] border-white shadow-xl overflow-hidden mb-6 ring-1 ring-gold/10"
                                    >
                                        {galleryImages[4 % galleryImages.length].startsWith('/') ? (
                                            <Image
                                                src={galleryImages[4 % galleryImages.length]}
                                                fill
                                                alt="Bride"
                                                className={`object-cover shadow-inner transition-none ${bridePan.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-105'}`}
                                                style={{
                                                    objectPosition: `${bridePan.localX} ${bridePan.localY}`,
                                                    transform: `scale(${wedding.themeSettings?.brideImageScale || 1})`,
                                                    userSelect: 'none',
                                                    touchAction: 'none',
                                                    willChange: 'object-position, transform'
                                                }}
                                                onMouseDown={bridePan.onStart}
                                                onTouchStart={bridePan.onStart}
                                                draggable={false}
                                            />
                                        ) : (
                                            <CldImage
                                                src={galleryImages[4 % galleryImages.length]}
                                                fill
                                                alt="Bride"
                                                className={`object-cover shadow-inner transition-none ${bridePan.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-105'}`}
                                                style={{
                                                    objectPosition: `${bridePan.localX} ${bridePan.localY}`,
                                                    transform: `scale(${wedding.themeSettings?.brideImageScale || 1})`,
                                                    userSelect: 'none',
                                                    touchAction: 'none',
                                                    willChange: 'object-position, transform'
                                                }}
                                                onMouseDown={bridePan.onStart}
                                                onTouchStart={bridePan.onStart}
                                                draggable={false}
                                            />
                                        )}
                                    </m.div>
                                    <h4
                                        style={{ color: smartColors.primary }}
                                        className="font-khmer-moul text-sm md:text-5xl tracking-widest text-center"
                                    >
                                        {wedding.brideName}
                                    </h4>
                                    <div className="w-8 h-[1px] bg-gold/20 mt-4" />
                                </div>
                            </div>
                        </div>
                    </RevealSection>
                </section>

                {/* EDITORIAL BREAK 2 (Cinematic Full Page) */}
                <section className="w-full flex flex-col md:flex-row min-h-[50vh] md:min-h-[80vh] bg-white group overflow-hidden">
                    <div className="flex-1 h-[50vh] md:h-auto relative overflow-hidden">
                        <Image src={galleryImages[5 % galleryImages.length]} fill className="object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2s] ease-out" loading="lazy" decoding="async" alt="Editorial" />
                    </div>
                    <div className="flex-1 h-[50vh] md:h-auto p-4 md:p-20 flex items-center justify-center bg-[#FAF9F6]">
                        <div className="w-full max-w-lg aspect-[4/5] relative">
                            <Image src={galleryImages[6 % galleryImages.length]} fill className="object-cover shadow-2xl rounded-sm border-lux" loading="lazy" decoding="async" alt="Editorial Details" />
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 border-r border-b border-gold/20 hidden md:block" />
                        </div>
                    </div>
                </section>

                {/* PAGE 2: EVENT INFO / COUNTDOWN - Balanced for Wide Screen */}
                <section id="event-info" className="py-16 md:py-64 px-8 md:px-12 bg-[#FAF9F6]/30 border-y border-gold/5 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none">
                        <img src="https://www.transparenttextures.com/patterns/xv.png" className="w-full h-full object-cover" />
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <RevealSection>
                            <div className="flex flex-col items-center gap-16">
                                <div className="text-[11px] tracking-[0.5em] uppercase font-bold text-gold flex items-center gap-4">
                                    <div className="w-12 h-[1px] bg-gold/30" />
                                    WEDDING HUB
                                    <div className="w-12 h-[1px] bg-gold/30" />
                                </div>

                                <div className="flex flex-row justify-center items-center gap-6 md:gap-32 w-full">
                                    <m.div
                                        whileHover={{ scale: 1.02 }}
                                        className="w-1/2 aspect-[4/5] bg-white p-1 md:p-2 shadow-xl md:shadow-2xl border-lux relative"
                                    >
                                        <img src={galleryImages[7 % galleryImages.length]} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                        <div className="absolute top-4 md:top-10 -left-6 font-playfair text-[30px] md:text-[80px] text-ivory/80 pointer-events-none z-0">01</div>
                                    </m.div>

                                    <div className="w-1/2 flex flex-col justify-center items-center text-center p-0 md:p-6 space-y-6 md:space-y-12">
                                        <div className="space-y-2 md:space-y-4">
                                            <Calendar size={24} className="text-gold/20 mx-auto md:w-12 md:h-12" />
                                            <div className="space-y-1">
                                                <p className="font-khmer-moul text-[8px] md:text-sm text-gold/80">ប្រក្រតិទិន</p>
                                                <p className="font-playfair text-3xl md:text-8xl font-black text-gray-800 tracking-tighter">01.03</p>
                                                <p className="text-[7px] md:text-[12px] tracking-[0.4em] text-gray-400 font-bold uppercase">MARCH 2026</p>
                                            </div>
                                        </div>

                                        <div className="w-full pt-4 md:pt-10 flex flex-col items-center gap-4 md:gap-8 border-t border-gold/5">
                                            <div className="space-y-1 text-center">
                                                <p className="font-playfair text-[8px] md:text-[12px] tracking-widest text-gold font-bold">COUNTDOWN</p>
                                            </div>
                                            <div className="countdown-vertical scale-[0.7] md:scale-100 md:flex-row md:gap-8">
                                                <div className="countdown-row"><span className="countdown-num">20</span> <span className="countdown-unit">DAYS</span></div>
                                                <div className="countdown-row"><span className="countdown-num">01</span> <span className="countdown-unit">HOURS</span></div>
                                                <div className="countdown-row"><span className="countdown-num">37</span> <span className="countdown-unit">MINS</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </RevealSection>
                    </div>
                </section>

                {/* PAGE 3: DETAILED KHMER SCHEDULE - Balanced */}
                <section id="schedule-khmer" className="py-16 md:py-64 px-8 md:px-12 bg-white relative overflow-hidden">
                    <div className="max-w-6xl mx-auto">
                        <RevealSection>
                            <div className="text-center mb-32 space-y-8">
                                <Heart size={32} className="text-gold/20 mx-auto fill-gold/5 mb-4" />
                                <h2 className="font-khmer-moul text-3xl md:text-5xl text-gray-800 tracking-wider">កម្មវិធីវិវាហមង្គល</h2>
                                <div className="w-24 h-[1px] bg-gold/10 mx-auto" />
                            </div>

                            <div className="grid grid-cols-2 gap-6 md:gap-20">
                                <div className="space-y-6 md:space-y-12 md:border-r border-gold/5 md:pr-10">
                                    <RevealSection delay={0.1}>
                                        <div className="space-y-4 md:space-y-10 group text-center md:text-left">
                                            <div className="aspect-[4/5] w-full rounded-sm overflow-hidden shadow-xl border-lux relative">
                                                <Image src={galleryImages[13 % galleryImages.length]} fill className="object-cover group-hover:scale-110 transition-transform duration-[3s]" loading="lazy" decoding="async" alt="Morning Schedule" />
                                                <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white/90 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 text-[6px] md:text-[10px] font-black text-gold tracking-widest shadow-sm">MORNING</div>
                                            </div>
                                            <div className="space-y-3 md:space-y-6">
                                                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                                                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-gold/10 flex items-center justify-center text-xs md:text-xs font-black text-gold">01</div>
                                                    <h4 className="font-khmer-moul text-xs md:text-lg text-gray-800">សិរីសួស្តីទី១</h4>
                                                </div>
                                                <div className="font-khmer-content text-xs md:text-[15px] leading-[2] md:leading-[2.5] text-gray-500 md:pl-16">
                                                    <span className="text-gold font-bold">ម៉ោង ៣:០០ រសៀល</span> <br />
                                                    ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត <br />
                                                    <span className="text-gold font-bold pt-2 md:pt-6 block">ម៉ោង ៥:០០ រសៀល</span>
                                                    ពិធីពិសារភោជនាហារ
                                                </div>
                                            </div>
                                        </div>
                                    </RevealSection>
                                </div>

                                <div className="space-y-6 md:space-y-12">
                                    <RevealSection delay={0.2}>
                                        <div className="space-y-4 md:space-y-10 group text-center md:text-right">
                                            <div className="aspect-[4/5] w-full rounded-sm overflow-hidden shadow-xl border-lux relative">
                                                <Image src={galleryImages[14 % galleryImages.length]} fill className="object-cover group-hover:scale-110 transition-transform duration-[3s]" loading="lazy" decoding="async" alt="Evening Schedule" />
                                                <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-white/90 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 text-[6px] md:text-[10px] font-black text-gold tracking-widest shadow-sm">EVENING</div>
                                            </div>
                                            <div className="space-y-3 md:space-y-6">
                                                <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-2 md:gap-4">
                                                    <h4 className="font-khmer-moul text-xs md:text-lg text-gray-800">សិរីសួស្តីទី២</h4>
                                                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-gold/10 flex items-center justify-center text-xs md:text-xs font-black text-gold">02</div>
                                                </div>
                                                <div className="font-khmer-content text-xs md:text-[15px] leading-[2] md:leading-[2.5] text-gray-500 md:pr-16">
                                                    <span className="text-gold font-bold">ម៉ោង ៨:០០ ព្រឹក</span> <br />
                                                    ពិធីកាត់សក់បង្កក់សិរី <br />
                                                    <span className="text-gold font-bold pt-2 md:pt-6 block">ម៉ោង ១០:៣០ ព្រឹក</span>
                                                    ពិធីហែជំនូន និងសែនព្រេន
                                                </div>
                                            </div>
                                        </div>
                                    </RevealSection>
                                </div>
                            </div>
                        </RevealSection>
                    </div>
                </section>

                {/* EDITORIAL BREAK 3 (Ultra-Wide) */}
                <section className="w-full aspect-square md:aspect-[21/9] h-auto md:h-[60vh] relative overflow-hidden bg-white border-y border-gold/5">
                    <img src={galleryImages[8 % galleryImages.length]} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white opacity-20" />
                </section>

                {/* VISUAL TRANSITION: FAMILY BANNER */}
                <section className="w-full py-24 md:py-48 flex flex-col items-center bg-white space-y-16">
                    <div className="max-w-6xl mx-auto w-full px-8">
                        <RevealSection>
                            <div className="text-center space-y-6 mb-12">
                                <p className="font-khmer-moul text-sm text-gold/60 uppercase tracking-widest">មាតាបិតា និងក្រុមគ្រួសារ</p>
                                <p className="font-serif-elegant italic text-gray-300 text-2xl">Foundation of Love</p>
                            </div>
                        </RevealSection>
                    </div>
                    <div className="w-full aspect-[21/9] md:h-auto md:aspect-[21/7] overflow-hidden grayscale-[10%] hover:grayscale-0 transition-all duration-[2s]">
                        <img src={galleryImages[15 % galleryImages.length]} className="w-full h-full object-cover" />
                    </div>
                </section>
                {/* PAGE 5: FORMAL KHMER INVITATION & PARENTS - Inner Centered */}
                <section className="py-16 md:py-64 px-8 md:px-12 text-center bg-white relative">
                    <div className="absolute inset-0 premium-texture opacity-30 pointer-events-none" />

                    <div className="max-w-6xl mx-auto space-y-20 md:space-y-32">
                        <RevealSection>
                            <div className="space-y-8 mb-24">
                                <div className="text-[12px] tracking-[0.6em] text-gray-400 font-bold uppercase italic">Traditional Blessing</div>
                                <h2 className="font-khmer-moul text-3xl md:text-5xl text-gray-800 tracking-wider leading-relaxed">សួស្តីអាពាហ៍ពិពាហ៍</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 mb-32 px-6 relative">
                                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gold/10 -translate-x-1/2 hidden md:block" />
                                <div className="space-y-4 font-khmer-content text-[15px] font-bold text-gray-600 leading-relaxed">
                                    <p className="text-gold/60 text-[11px] uppercase tracking-[0.4em] mb-4 font-black">GROOM'S PARENTS</p>
                                    <p>លោក {wedding.themeSettings?.parents?.groomFather || "មាតាបិតាខាងប្រុស"}</p>
                                    <p>អ្នកស្រី {wedding.themeSettings?.parents?.groomMother || ""}</p>
                                </div>
                                <div className="space-y-4 font-khmer-content text-[15px] font-bold text-gray-600 leading-relaxed">
                                    <p className="text-gold/60 text-[11px] uppercase tracking-[0.4em] mb-4 font-black">BRIDE'S PARENTS</p>
                                    <p>លោក {wedding.themeSettings?.parents?.brideFather || "មាតាបិតាខាងស្រី"}</p>
                                    <p>អ្នកស្រី {wedding.themeSettings?.parents?.brideMother || ""}</p>
                                </div>
                            </div>

                            <div className="space-y-16 bg-white/80 p-12 md:p-24 rounded-3xl border-lux relative overflow-hidden shadow-2xl">
                                <h3 className="font-khmer-moul text-gray-800 text-lg md:text-xl tracking-widest">មានកិត្តិយសគោរពអញ្ជើញ</h3>
                                <p className="font-khmer-content text-[16px] md:text-[18px] leading-[3] text-gray-500 max-w-[480px] mx-auto text-left italic font-medium">
                                    ឯកឧត្តម អ្នកឧកញ៉ា ឧកញ៉ា លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា ម៉ែឪ អញ្ជើញចូលរួមជាអធិបតី និងពិសាភោជនាហារ ដើម្បីផ្តល់សក្ខីភាព ដ៏ខ្ពង់ខ្ពស់ ក្នុងពិធីអាពាហ៍ពិពាហ៍របស់កូនប្រុស-កូនស្រីរបស់យើងខ្ញុំ
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-12 pt-32">
                                <div className="space-y-6">
                                    <div className="text-[11px] tracking-[0.4em] text-gold/50 uppercase font-black">THE GROOM</div>
                                    <p className="font-khmer-moul text-xl md:text-4xl text-gray-800 tracking-wider">ហេង សីហា</p>
                                    <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/20 to-transparent w-32 mx-auto" />
                                </div>
                                <div className="space-y-6">
                                    <div className="text-[11px] tracking-[0.4em] text-gold/50 uppercase font-black">THE BRIDE</div>
                                    <p className="font-khmer-moul text-xl md:text-4xl text-gray-800 tracking-wider">ម៉ែន ពេជ្រច័ន្ទរស្មី</p>
                                    <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/20 to-transparent w-32 mx-auto" />
                                </div>
                            </div>

                            <div className="pt-40">
                                <p className="font-khmer-content text-[15px] md:text-[17px] text-gray-400 font-medium leading-[3] px-4 max-w-[520px] mx-auto">
                                    ដែលនឹងប្រព្រឹត្តទៅនៅថ្ងៃអាទិត្យ ១៣កើត ខែផល្គុន ឆ្នាំរោង សប្តស័ក ពុទ្ធសករាជ ២៥៦៩ ត្រូវនឹងថ្ងៃទី០១ ខែមីនា ឆ្នាំ២០២៦ វេលាម៉ោង ០៥:០០នាទីល្ងាច នៅវិមានស្បៃពិពាហ៍សើភ័ណមង្គល។
                                </p>
                                <p className="font-playfair text-[12px] tracking-[1em] text-gold/30 mt-16 uppercase italic">Sincerely Thank You</p>
                            </div>
                        </RevealSection>
                    </div>
                </section>

                {/* EDITORIAL BREAK 4 (Large Portrait Focus) */}
                <section className="w-full py-24 md:py-48 bg-[#FAF9F6]/10 flex flex-col items-center px-4 relative overflow-hidden">
                    <div className="absolute top-0 w-64 h-[2px] bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
                    <div className="w-full max-w-xl aspect-[3/4] relative overflow-hidden ring-1 ring-black/5 shadow-2xl">
                        <img src={galleryImages[9 % galleryImages.length]} className="w-full h-full object-cover" />
                    </div>
                </section>

                {/* MAPS & QR AS ELEGANT CARDS - Full Screen Balanced */}
                <section className="py-16 md:py-64 px-8 md:px-12 bg-[#FAF9F6]/20 relative overflow-hidden">
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-gold/5 rounded-full blur-[100px]" />

                    <div className="max-w-6xl mx-auto space-y-32 md:space-y-48">
                        <RevealSection>
                            <div className="space-y-16">
                                <div className="text-center space-y-6">
                                    <h4 className="font-khmer-moul text-lg text-gold/60 uppercase tracking-widest">ទីតាំងកម្មវិធី</h4>
                                    <p className="font-serif-elegant text-xl italic text-gray-400 tracking-widest font-medium">Find your way to us</p>
                                </div>
                                <div className="w-full md:aspect-[21/9] bg-white shadow-2xl border-lux rounded-sm overflow-hidden group">
                                    <img src={galleryImages[10 % galleryImages.length] || "/images/bg_staircase.jpg"} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[4s]" />
                                    <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                                </div>
                            </div>
                        </RevealSection>

                        <div className="grid grid-cols-2 gap-4 md:gap-20">
                            <RevealSection delay={0.1}>
                                <m.div
                                    whileHover={{ y: -10 }}
                                    className="bg-white p-6 md:p-20 shadow-xl md:shadow-2xl border-lux flex flex-col items-center gap-4 md:gap-10 rounded-2xl md:rounded-3xl group hover:shadow-gold/10 transition-all cursor-pointer h-full relative overflow-hidden"
                                >
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
                                    <div className="text-[7px] md:text-[12px] font-black tracking-[0.8em] uppercase text-gold/60">LOCATION</div>
                                    <div className="p-4 md:p-8 bg-gray-50 rounded-xl md:rounded-2xl group-hover:bg-ivory transition-colors ring-1 ring-gold/5">
                                        <QrCode size={32} className="text-gold/30 md:w-16 md:h-16" />
                                    </div>
                                    <div className="text-[7px] md:text-[11px] text-gray-400 text-center leading-relaxed md:leading-[2] md:h-12 px-2 md:px-6 md:mt-auto font-medium">
                                        Click to view Google Maps location
                                    </div>
                                </m.div>
                            </RevealSection>

                            <RevealSection delay={0.2}>
                                <m.div
                                    whileHover={{ y: -10 }}
                                    className="bg-white p-6 md:p-20 shadow-xl md:shadow-2xl border-lux flex flex-col items-center gap-4 md:gap-10 rounded-2xl md:rounded-3xl group hover:shadow-gold/10 transition-all cursor-pointer h-full relative overflow-hidden"
                                >
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
                                    <div className="text-[7px] md:text-[12px] font-black tracking-[0.8em] uppercase text-gold/60">WEDDING GIFTS</div>
                                    <div className="p-4 md:p-8 bg-gray-50 rounded-xl md:rounded-2xl group-hover:bg-ivory transition-colors ring-1 ring-gold/5">
                                        <QrCode size={32} className="text-gold/30 md:w-16 md:h-16" />
                                    </div>
                                    <div className="text-[7px] md:text-[11px] text-gray-400 text-center leading-relaxed md:leading-[2] md:h-12 px-2 md:px-6 md:mt-auto font-medium">
                                        Thank you for your warm wishes!
                                    </div>
                                </m.div>
                            </RevealSection>
                        </div>
                    </div>
                </section>

                {/* SIGNATURE MOMENTS & THANK YOU - Full screen balance */}
                <section className="py-16 md:py-64 px-8 md:px-12 bg-white relative overflow-hidden">
                    <div className="max-w-6xl mx-auto space-y-32 md:space-y-48">
                        <RevealSection delay={0.3}>
                            <div className="text-center">
                                <h3 className="font-playfair text-4xl tracking-[0.5em] text-gold/20 uppercase mb-16">Thank you</h3>
                                <div className="space-y-8 font-khmer-moul text-sm text-gray-500 tracking-[0.2em] opacity-80">
                                    <p className="text-lg">{wedding.groomName}</p>
                                    <p className="font-serif-elegant italic text-gold/30 text-3xl font-normal">&</p>
                                    <p className="text-lg">{wedding.brideName}</p>
                                </div>
                            </div>
                        </RevealSection>

                        {/* SIGNATURE MOMENTS GRID - Balanced */}
                        <div className="grid grid-cols-3 gap-6 md:gap-8 pt-20">
                            <div className="col-span-1 aspect-[3/4] rounded-sm overflow-hidden shadow-xl md:shadow-2xl border-lux mt-6 md:mt-0">
                                <img src={galleryImages[23 % galleryImages.length]} className="w-full h-full object-cover" />
                            </div>
                            <div className="col-span-1 aspect-[3/4] rounded-sm overflow-hidden shadow-xl md:shadow-2xl border-lux md:mt-24">
                                <img src={galleryImages[24 % galleryImages.length]} className="w-full h-full object-cover" />
                            </div>
                            <div className="col-span-1 aspect-[3/4] rounded-sm overflow-hidden shadow-xl md:shadow-2xl border-lux mt-0">
                                <img src={galleryImages[25 % galleryImages.length]} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* THE GALLERY PATTERNS (Luxury Refinement) - Full Bleed */}
                <section id="gallery-sections" className="py-32 md:py-64 px-6 md:px-12 bg-white relative">
                    <div className="max-w-7xl mx-auto space-y-32 md:space-y-48">
                        <RevealSection>
                            <div className="text-center space-y-8">
                                <div className="h-[1px] w-24 bg-gold/10 mx-auto" />
                                <h2 className="font-playfair text-4xl md:text-6xl font-black italic text-gray-800 tracking-tighter">Golden Memories</h2>
                                <p className="font-serif-elegant text-sm text-gold/40 tracking-[0.5em] uppercase">Private Gallery</p>
                            </div>
                        </RevealSection>

                        {/* DYNAMIC GALLERY MODES */}
                        <div className="space-y-48">
                            {wedding.themeSettings?.galleryStyle === 'slider' ? (
                                <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-12 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                                    {galleryImages.map((img, idx) => (
                                        <m.div
                                            key={idx}
                                            className="flex-shrink-0 w-[85%] md:w-[450px] aspect-[3/4] snap-center rounded-sm overflow-hidden border-lux shadow-2xl bg-white"
                                        >
                                            <img src={img} className="w-full h-full object-cover" />
                                        </m.div>
                                    ))}
                                </div>
                            ) : wedding.themeSettings?.galleryStyle === 'polaroid' ? (
                                <div className="space-y-32 flex flex-col items-center">
                                    {/* SECTION 1: Pre-Wedding */}
                                    {galleryImages.length > 0 && (
                                        <div className="w-full">
                                            <div className="text-center mb-16">
                                                <h3 className="font-playfair text-3xl italic text-gray-700">The Pre-Wedding</h3>
                                                <div className="w-12 h-[1px] bg-gold/10 mx-auto mt-6" />
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 md:gap-8 px-2 pb-10">
                                                {galleryImages.slice(18, 24).map((img, idx) => (
                                                    <m.div
                                                        key={idx + 18}
                                                        initial={{ rotate: idx % 2 === 0 ? -3 : 3 }}
                                                        whileInView={{ rotate: idx % 2 === 0 ? -1 : 1 }}
                                                        className="bg-white p-2 md:p-4 pt-2 md:pt-4 pb-8 md:pb-16 shadow-xl md:shadow-2xl border border-gray-100 rounded-sm relative group"
                                                    >
                                                        <img src={img} className="w-full h-32 md:h-80 object-cover" />
                                                    </m.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* SECTION 2: Ceremony */}
                                    {galleryImages.length > 6 && (
                                        <div className="w-full">
                                            <div className="text-center mb-16 pt-16 border-t border-gold/5">
                                                <h3 className="font-playfair text-3xl italic text-gray-700">The Ceremony</h3>
                                                <div className="w-12 h-[1px] bg-gold/10 mx-auto mt-6" />
                                            </div>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 px-2 pb-10">
                                                {galleryImages.slice(0, 8).map((img, idx) => (
                                                    <m.div
                                                        key={idx}
                                                        initial={{ rotate: idx % 2 === 0 ? 3 : -3 }}
                                                        whileInView={{ rotate: idx % 2 === 0 ? 1 : -1 }}
                                                        className="bg-white p-4 pt-4 pb-16 shadow-2xl border border-gray-100 rounded-sm relative group"
                                                    >
                                                        <img src={img} className="w-full h-64 md:h-80 object-cover" />
                                                    </m.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* SECTION 3: Reception */}
                                    {galleryImages.length > 12 && (
                                        <div className="w-full">
                                            <div className="text-center mb-16 pt-16 border-t border-gold/5">
                                                <h3 className="font-playfair text-3xl italic text-gray-700">The Reception</h3>
                                                <div className="w-12 h-[1px] bg-gold/10 mx-auto mt-6" />
                                            </div>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 px-2 pb-10">
                                                {galleryImages.slice(8, 16).map((img, idx) => (
                                                    <m.div
                                                        key={idx + 8}
                                                        initial={{ rotate: idx % 2 === 0 ? -2 : 2 }}
                                                        whileInView={{ rotate: idx % 2 === 0 ? -1 : 1 }}
                                                        className="bg-white p-4 pt-4 pb-16 shadow-2xl border border-gray-100 rounded-sm relative group"
                                                    >
                                                        <img src={img} className="w-full h-64 md:h-80 object-cover" />
                                                    </m.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-32">
                                    {/* SECTION 1: Pre-Wedding (Refined Editorial) */}
                                    {galleryImages.length > 0 && (
                                        <div>
                                            <div className="text-center mb-16">
                                                <h3 className="font-playfair text-3xl md:text-4xl italic text-gray-700">Pre-Wedding</h3>
                                                <div className="w-16 h-[1px] bg-gold/10 mx-auto mt-6" />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 md:gap-8 px-1">
                                                {galleryImages.slice(0, 6).map((img, idx) => {
                                                    // Standardized Editorial Pattern (Pattern A):
                                                    // Global (3cols): 2+1(L+S), 1+1+1(S+S+S), 3(F)
                                                    let spanClass = "col-span-1 h-[120px] md:h-[450px]";
                                                    if (idx === 0) spanClass = "col-span-2 h-[150px] md:h-[600px]";
                                                    if (idx === 5) spanClass = "col-span-3 h-[140px] md:h-[500px]";

                                                    return (
                                                        <RevealSection
                                                            key={idx}
                                                            delay={0.1 + (idx % 3) * 0.1}
                                                            className={`border-lux bg-white shadow-2xl relative overflow-hidden group ${spanClass}`}
                                                        >
                                                            <m.img
                                                                whileHover={{ scale: 1.05 }}
                                                                transition={{ duration: 1.5 }}
                                                                src={img}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </RevealSection>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* SECTION 2: Ceremony (Refined Editorial) */}
                                    {galleryImages.length > 6 && (
                                        <div>
                                            <div className="text-center mb-16 pt-32 border-t border-gold/5">
                                                <h3 className="font-playfair text-3xl md:text-4xl italic text-gray-700">Traditional Ceremony</h3>
                                                <div className="w-16 h-[1px] bg-gold/10 mx-auto mt-6" />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 md:gap-8 px-1">
                                                {galleryImages.slice(6, 12).map((img, idx) => {
                                                    // Pattern Variation (Pattern B): Responsive Balance
                                                    // Global (3cols): 1+2(S+L), 1+1+1(S+S+S), 3(F)
                                                    let spanClass = "col-span-1 h-[120px] md:h-[450px]";
                                                    if (idx === 1) spanClass = "col-span-2 h-[150px] md:h-[600px]";
                                                    if (idx === 5) spanClass = "col-span-3 h-[140px] md:h-[500px]";

                                                    return (
                                                        <RevealSection
                                                            key={idx + 6}
                                                            delay={0.1 + (idx % 3) * 0.1}
                                                            className={`border-lux bg-white shadow-2xl relative overflow-hidden group ${spanClass}`}
                                                        >
                                                            <m.img
                                                                whileHover={{ scale: 1.05 }}
                                                                transition={{ duration: 1.5 }}
                                                                src={img}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </RevealSection>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* SECTION 3: Reception (Refined Editorial) */}
                                    {galleryImages.length > 12 && (
                                        <div>
                                            <div className="text-center mb-16 pt-32 border-t border-gold/5">
                                                <h3 className="font-playfair text-3xl md:text-4xl italic text-gray-700">Evening Reception</h3>
                                                <div className="w-16 h-[1px] bg-gold/10 mx-auto mt-6" />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 md:gap-8 px-1">
                                                {galleryImages.slice(12, 18).map((img, idx) => {
                                                    // Pattern Variation (Pattern C): Responsive Balance
                                                    // Global (3cols): 1+1+1(S+S+S), 2+1(L+S), 3(F)
                                                    let spanClass = "col-span-1 h-[120px] md:h-[450px]";
                                                    if (idx === 3) spanClass = "col-span-2 h-[150px] md:h-[600px]";
                                                    if (idx === 5) spanClass = "col-span-3 h-[140px] md:h-[500px]";

                                                    return (
                                                        <RevealSection
                                                            key={idx + 12}
                                                            delay={0.1 + (idx % 3) * 0.1}
                                                            className={`border-lux bg-white shadow-2xl relative overflow-hidden group ${spanClass}`}
                                                        >
                                                            <m.img
                                                                whileHover={{ scale: 1.05 }}
                                                                transition={{ duration: 1.5 }}
                                                                src={img}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </RevealSection>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* FINAL KHMER PREAMBLE & FOOTER - Inner Centered */}
                <section className="py-60 px-12 text-center bg-white border-t border-gold/5 pb-64 relative">
                    <div className="max-w-4xl mx-auto">
                        <RevealSection>
                            <div className="space-y-24 relative z-10">
                                <p className="font-khmer-content text-[16px] md:text-[18px] leading-[3] text-gray-500 max-w-[480px] mx-auto opacity-80 italic font-medium">
                                    យើងខ្ញុំសូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅបំផុតចំពោះការផ្តល់កិត្តិយសចូលរួម ក្នុងពិធីរបស់យើងខ្ញុំ និងសូមជូនពរឱ្យទទួលបាននូវព្រះពុទ្ធពរ ៤ ប្រការគឺ អាយុ វណ្ណៈ សុខៈ ពលៈ កុំបីឃ្លៀងឃ្លាតឡើយ។
                                </p>
                                <div className="pt-10">
                                    <MoneaBranding />
                                </div>
                                <div className="text-[11px] tracking-[0.8em] font-black text-gray-200 uppercase pt-4">
                                    MOMENTS MATTERS
                                </div>
                            </div>
                        </RevealSection>
                    </div>
                </section>

                {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="auto" style={{ display: 'none' }} />}
            </div>
        </main>
    );
}

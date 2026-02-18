"use client";
import React, { useState, useEffect, useRef } from 'react';
import { WeddingData } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Clock, Heart, Bell, Music, Music2, QrCode } from 'lucide-react';
import { MoneaBranding } from '@/components/MoneaBranding';
import { RevealSection, useImagePan } from './shared/CinematicComponents';
import Countdown from './classic-khmer/Countdown';

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

        const img = new Image();
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

    // Audio Logic
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
        <main className="min-h-screen bg-[#FDFBF7] text-[#333] overflow-x-hidden selection:bg-[#E2D1B3]">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600;700;900&display=swap');
                
                :root {
                    --color-cream: #FDFBF7;
                    --color-ivory: #FAF9F6;
                    --color-gold-deep: #B8860B;
                    --color-gold-light: #C5A059;
                    --color-text-main: #333333;
                }

                .font-khmer-moul { font-family: var(--font-moul), serif; }
                .font-khmer-content { font-family: var(--font-kantumruy), sans-serif; }
                .font-serif-elegant { font-family: 'Cormorant Garamond', serif; }
                .font-playfair { font-family: 'Playfair Display', serif; }
                
                .text-gold { color: var(--color-gold-light); }
                .bg-gold { background-color: var(--color-gold-light); }
                .border-gold { border-color: var(--color-gold-light); }
                
                .schedule-text { font-size: 11px; line-height: 2; color: #555; }
                
                .premium-texture {
                    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5a059' fill-opacity='0.015'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }

                .border-lux {
                    border: 1px solid rgba(184, 134, 11, 0.1);
                    position: relative;
                }
                .border-lux::before {
                    content: '';
                    position: absolute;
                    inset: 4px;
                    border: 1px solid rgba(184, 134, 11, 0.05);
                    pointer-events: none;
                }

                .gold-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, var(--color-gold-light), transparent);
                    width: 100%;
                    max-width: 200px;
                    margin: 2rem auto;
                    opacity: 0.3;
                }

                .parallax-text {
                    text-shadow: 0 10px 20px rgba(0,0,0,0.02);
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
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center p-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <p className="text-white/40 tracking-[0.4em] uppercase text-[10px]">Premium Invitation</p>
                                <h2 className="text-white font-khmer-moul text-2xl md:text-3xl tracking-widest leading-relaxed">
                                    សិរីមង្គលអាពាហ៍ពិពាហ៍
                                </h2>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setRevealed(true)}
                                style={{ borderColor: smartColors.primary, color: smartColors.primary }}
                                className="px-10 py-4 border rounded-full bg-transparent font-khmer text-lg tracking-widest hover:bg-white/5 transition-all outline-none"
                            >
                                {wedding.eventType === 'anniversary' ? 'ខួបអាពាហ៍ពិពាហ៍' : 'បើកសំបុត្រ'}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-[480px] mx-auto bg-white min-h-screen relative shadow-[0_0_100px_rgba(0,0,0,0.1)] overflow-hidden premium-texture font-serif-elegant">

                {/* HERO SECTION / COVER */}
                <section id="hero" className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-black">
                    <motion.div
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
                                />
                                <div className="absolute inset-0 bg-black/40" />
                            </div>
                        ) : (
                            <>
                                <img
                                    src={heroImage}
                                    className={`w-full h-full object-cover transition-none ${heroPan.isDragging ? 'cursor-grabbing' : 'cursor-grab group-hover:ring-4 ring-gold/30 ring-inset'}`}
                                    style={{
                                        objectPosition: `${heroPan.localX} ${heroPan.localY}`,
                                        transform: `scale(${wedding.themeSettings?.heroImageScale || 1})`,
                                        filter: `brightness(${wedding.themeSettings?.heroImageBrightness || 100}%) contrast(${wedding.themeSettings?.heroImageContrast || 100}%)`,
                                        userSelect: 'none',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={heroPan.onStart}
                                    onTouchStart={heroPan.onStart}
                                    draggable={false}
                                    alt="Wedding Hero"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
                            </>
                        )}
                    </motion.div>

                    <div className="relative z-10 px-8 space-y-10 pointer-events-none">
                        <div className="space-y-4">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1 }}
                                style={{ color: smartColors.primary }}
                                className="font-playfair tracking-[0.3em] text-sm md:text-base uppercase"
                            >
                                The Wedding Of
                            </motion.div>
                            <motion.h1
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 1.2, duration: 1 }}
                                className="font-khmer-moul text-4xl md:text-5xl text-white drop-shadow-2xl leading-relaxed py-2"
                            >
                                {wedding.groomName} <br /> & <br /> {wedding.brideName}
                            </motion.h1>
                        </div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.4 }}
                            className="space-y-6"
                        >
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-full inline-block">
                                <span className="text-white font-serif-elegant text-xl tracking-widest">{formattedDateHero}</span>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 pointer-events-none"
                    >
                        <Clock size={24} strokeWidth={1} />
                    </motion.div>
                </section>

                {/* DECORATIVE CORNERS (SVGs) */}
                <div className="absolute top-0 left-0 w-32 h-32 opacity-10 pointer-events-none rotate-0">
                    <img src="https://www.transparenttextures.com/patterns/natural-paper.png" className="w-full h-full object-cover" />
                </div>

                {/* PAGE 1: FORMAL ENGLISH INVITATION */}
                <section id="invitation-english" className="pt-32 pb-24 px-12 text-center space-y-14">
                    <RevealSection>
                        <div className="space-y-4">
                            <div className="w-12 h-1 bg-gold/20 mx-auto rounded-full" />
                            <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-400 max-w-[300px] mx-auto leading-relaxed px-4">
                                WE CORDIALLY INVITE YOU TO CELEBRATE THE UNION OF OUR FAMILIES AND THE WEDDING CEREMONY OF
                            </p>
                        </div>
                    </RevealSection>

                    <RevealSection delay={0.2}>
                        <div className="space-y-6">
                            <h2
                                style={{ color: smartColors.primary }}
                                className="font-playfair text-5xl font-black tracking-tighter parallax-text"
                            >
                                {wedding.groomName}
                            </h2>
                            <div className="flex items-center justify-center gap-4">
                                <div className="h-[1px] bg-gold/20 flex-1" />
                                <span style={{ color: smartColors.primary }} className="font-serif-elegant text-4xl italic px-2">&</span>
                                <div className="h-[1px] bg-gold/20 flex-1" />
                            </div>
                            <h2
                                style={{ color: smartColors.primary }}
                                className="font-playfair text-5xl font-black tracking-tighter parallax-text"
                            >
                                {wedding.brideName}
                            </h2>
                        </div>
                    </RevealSection>

                    <RevealSection delay={0.4}>
                        <div className="space-y-8 pt-8 px-4 border-lux bg-ivory/50 rounded-xl py-10">
                            <div className="text-[11px] tracking-[0.5em] uppercase font-black text-gold/60">SAVES THE DATE</div>
                            <div className="space-y-4">
                                <p className="font-playfair text-xl font-bold tracking-[0.1em] text-gray-800">
                                    {formattedDateInvitation}
                                </p>
                                <div className="flex items-center justify-center gap-3">
                                    <Clock size={16} className="text-gold/40" />
                                    <p className="font-playfair text-lg font-bold text-gray-700">FIVE O'CLOCK IN THE EVENING</p>
                                </div>
                            </div>
                        </div>
                    </RevealSection>

                    <RevealSection delay={0.6}>
                        <div className="space-y-4 pt-10">
                            <MapPin size={24} className="text-gold/30 mx-auto mb-4" />
                            <p className="font-playfair text-sm font-bold tracking-widest text-gray-800 uppercase leading-relaxed max-w-[320px] mx-auto">
                                PUMI TOUL LEAP SOPHEAK MONGUL <br /> WEDDING CENTER
                            </p>
                            <p className="text-[10px] tracking-widest text-gray-400 uppercase max-w-[280px] mx-auto leading-relaxed">
                                TOUL LEAP VILLAGE, SNOR, KAMBOL, PHNOM PENH
                            </p>
                        </div>
                    </RevealSection>

                    <RevealSection delay={0.8}>
                        <div className="gold-divider" />
                        <p className="font-playfair text-sm tracking-[0.6em] text-gray-300 uppercase italic">Your Presence is our Gift</p>
                    </RevealSection>
                </section>

                {/* PAGE 2: VISUALS & VERTICAL COUNTDOWN */}
                <section id="event-info" className="py-24 px-10 bg-[#FAF9F6] border-y border-gold/5 relative">
                    <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.03] pointer-events-none">
                        <img src="https://www.transparenttextures.com/patterns/xv.png" className="w-full h-full object-cover" />
                    </div>

                    <RevealSection>
                        <div className="flex flex-col items-center gap-16">
                            <div className="text-[11px] tracking-[0.5em] uppercase font-bold text-gold flex items-center gap-4">
                                <div className="w-8 h-[1px] bg-gold/30" />
                                WEDDING HUB
                                <div className="w-8 h-[1px] bg-gold/30" />
                            </div>

                            <div className="flex justify-center gap-8 w-full">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="flex-1 aspect-[4/5] bg-white p-2 shadow-2xl border-lux rounded-sm"
                                >
                                    <img src={galleryImages[0] || "/images/bg_staircase.jpg"} className="w-full h-full object-cover transition-all duration-700" />
                                </motion.div>
                                <div className="flex-1 flex flex-col justify-center items-center text-center p-6 space-y-6">
                                    <Calendar size={32} className="text-gold/20" />
                                    <div className="space-y-1">
                                        <p className="font-khmer-moul text-xs text-gold/80">ប្រក្រតិទិន</p>
                                        <p className="font-playfair text-4xl font-black text-gray-800 tracking-tighter">01.03</p>
                                        <p className="text-[10px] tracking-widest text-gray-400 font-bold uppercase">MARCH 2026</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full pt-10 px-8 flex justify-between items-center border-t border-gold/5">
                                <div className="space-y-1">
                                    <p className="font-playfair text-[10px] tracking-widest text-gold font-bold">COUNTDOWN</p>
                                    <p className="font-khmer-content text-[9px] text-gray-400 italic">"Time flies, love stays."</p>
                                </div>
                                <div className="countdown-vertical">
                                    <div className="countdown-row"><span className="countdown-num">20</span> <span className="countdown-unit">DAYS</span></div>
                                    <div className="countdown-row"><span className="countdown-num">01</span> <span className="countdown-unit">HOURS</span></div>
                                    <div className="countdown-row"><span className="countdown-num">37</span> <span className="countdown-unit">MINS</span></div>
                                    <div className="countdown-row text-gold"><span className="countdown-num border-b-2 border-gold/20">12</span> <span className="countdown-unit">SECS</span></div>
                                </div>
                            </div>
                        </div>
                    </RevealSection>
                </section>

                {/* PAGE 3: DETAILED KHMER SCHEDULE */}
                <section id="schedule-khmer" className="py-28 px-10 bg-white relative">
                    <RevealSection>
                        <div className="text-center mb-20 space-y-4">
                            <Heart size={20} className="text-gold/20 mx-auto fill-gold/10" />
                            <h2 className="font-khmer-moul text-2xl text-gold pb-6 tracking-wide drop-shadow-sm">កម្មវិធីវិវាហមង្គល</h2>
                            <div className="w-24 h-[1px] bg-gold/10 mx-auto" />
                        </div>

                        <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-12 border-r border-gold/5 pr-6">
                                <RevealSection delay={0.1}>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gold/5 flex items-center justify-center text-[10px] font-bold text-gold">I</div>
                                            <h4 className="font-khmer-moul text-[12px] text-gray-800">សិរីសួស្តីទី១</h4>
                                        </div>
                                        <div className="schedule-text pl-9">
                                            <span className="text-gold font-bold">ម៉ោង ៣:០០ រសៀល</span> <br />
                                            ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត <br />
                                            <span className="text-gold font-bold pt-4 block">ម៉ោង ៥:០០ រសៀល</span>
                                            ពិធីពិសារភោជនាហារពេលល្ងាច <br />
                                            អញ្ជើញភ្ញៀវចូលរួមពិសារអាហារ
                                        </div>
                                    </div>
                                </RevealSection>
                            </div>
                            <div className="space-y-12 pl-6">
                                <RevealSection delay={0.2}>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gold/5 flex items-center justify-center text-[10px] font-bold text-gold">II</div>
                                            <h4 className="font-khmer-moul text-[12px] text-gray-800">សិរីសួស្តីទី២</h4>
                                        </div>
                                        <div className="schedule-text pl-9">
                                            <span className="text-gold font-bold">ម៉ោង ៧:០០ ព្រឹក</span> <br />
                                            ពិធីហែជំនូនទី១ តាមលំដាប់លំដោយ <br />
                                            <span className="text-gold font-bold pt-4 block">ម៉ោង ៩:០០ ព្រឹក</span>
                                            ពិធីកាត់សក់បង្កក់សិរី <br />
                                            <span className="text-gold font-bold pt-4 block">ម៉ោង ១១:០០ ថ្ងៃត្រង់</span>
                                            អញ្ជើញភ្ញៀវពិសារភោជនាហារ
                                        </div>
                                    </div>
                                </RevealSection>
                            </div>
                        </div>
                    </RevealSection>
                </section>

                {/* PAGE 4: KHMER PREAMBLE & CIRCULAR PROFILES */}
                <section id="gallery" className="py-28 px-10 bg-[#FAF9F6] relative">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                        <img src="https://www.transparenttextures.com/patterns/floral-paper.png" className="w-full h-full object-cover" />
                    </div>

                    <RevealSection>
                        <div className="text-center space-y-16">
                            <div className="space-y-4">
                                <p className="font-playfair text-[10px] tracking-[0.5em] text-gray-400 uppercase font-black">THE SOULS</p>
                                <h3 className="font-khmer-moul text-lg text-gray-600">សូមស្វាគមន៍មកកាន់ទំព័រខាងក្រោម</h3>
                            </div>

                            <div className="w-full aspect-[16/10] bg-white p-3 shadow-2xl border-lux rotate-1 rounded-sm">
                                <img src={galleryImages[2] || "/images/bg_staircase.jpg"} className="w-full h-full object-cover rounded-sm" />
                            </div>

                            <div className="flex flex-col gap-32 pt-20 relative">
                                <div className="absolute left-1/2 -top-10 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-gold/10 to-transparent -translate-x-1/2 hidden sm:block" />

                                {/* Groom */}
                                <div className="flex flex-col items-center relative z-10">
                                    <div className="absolute -top-6 font-playfair text-[11px] tracking-[0.8em] font-black text-gold/30">GROOM</div>
                                    <motion.div
                                        whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
                                        className="w-full aspect-[4/5] rounded-[2rem] border-8 border-white shadow-2xl overflow-hidden mb-10 ring-1 ring-gold/10"
                                    >
                                        <img
                                            src={galleryImages[0] || "/images/bg_staircase.jpg"}
                                            className={`w-full h-full object-cover shadow-inner transition-none ${groomPan.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-105'}`}
                                            style={{
                                                objectPosition: `${groomPan.localX} ${groomPan.localY}`,
                                                transform: `scale(${wedding.themeSettings?.groomImageScale || 1})`,
                                                userSelect: 'none',
                                                touchAction: 'none'
                                            }}
                                            onMouseDown={groomPan.onStart}
                                            onTouchStart={groomPan.onStart}
                                            draggable={false}
                                        />
                                    </motion.div>
                                    <h4
                                        style={{ color: smartColors.primary }}
                                        className="font-khmer-moul text-2xl tracking-widest"
                                    >
                                        {wedding.groomName}
                                    </h4>
                                    <div className="w-8 h-[1px] bg-gold/20 mt-4" />
                                </div>

                                {/* Bride */}
                                <div className="flex flex-col items-center relative z-10">
                                    <div className="absolute -top-6 font-playfair text-[11px] tracking-[0.8em] font-black text-gold/30">BRIDE</div>
                                    <motion.div
                                        whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
                                        className="w-full aspect-[4/5] rounded-[2rem] border-8 border-white shadow-2xl overflow-hidden mb-10 ring-1 ring-gold/10"
                                    >
                                        <img
                                            src={galleryImages[1] || "/images/bg_staircase.jpg"}
                                            className={`w-full h-full object-cover shadow-inner transition-none ${bridePan.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-105'}`}
                                            style={{
                                                objectPosition: `${bridePan.localX} ${bridePan.localY}`,
                                                transform: `scale(${wedding.themeSettings?.brideImageScale || 1})`,
                                                userSelect: 'none',
                                                touchAction: 'none'
                                            }}
                                            onMouseDown={bridePan.onStart}
                                            onTouchStart={bridePan.onStart}
                                            draggable={false}
                                        />
                                    </motion.div>
                                    <h4
                                        style={{ color: smartColors.primary }}
                                        className="font-khmer-moul text-2xl tracking-widest"
                                    >
                                        {wedding.brideName}
                                    </h4>
                                    <div className="w-8 h-[1px] bg-gold/20 mt-4" />
                                </div>
                            </div>
                        </div>
                    </RevealSection>
                </section>

                {/* PAGE 5: FORMAL KHMER INVITATION & PARENTS */}
                <section className="py-28 px-12 text-center bg-white space-y-20 relative">
                    <div className="absolute inset-0 premium-texture opacity-30 pointer-events-none" />

                    <RevealSection>
                        <div className="space-y-4 mb-20">
                            <div className="text-[10px] tracking-[0.6em] text-gray-300 font-bold uppercase italic">Traditional Blessing</div>
                            <h2 className="font-khmer-moul text-2xl text-gold tracking-widest leading-relaxed">សួស្តីអាពាហ៍ពិពាហ៍</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-10 mb-24 px-6 relative">
                            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gold/10 -translate-x-1/2" />
                            <div className="space-y-3 font-khmer-content text-[12px] font-bold text-gray-600 leading-relaxed">
                                <p className="text-gold/40 text-[9px] uppercase tracking-widest mb-2 font-black">GROOM'S PARENTS</p>
                                <p>លោក {wedding.themeSettings?.parents?.groomFather || "មាតាបិតាខាងប្រុស"}</p>
                                <p>អ្នកស្រី {wedding.themeSettings?.parents?.groomMother || ""}</p>
                            </div>
                            <div className="space-y-3 font-khmer-content text-[12px] font-bold text-gray-600 leading-relaxed">
                                <p className="text-gold/40 text-[9px] uppercase tracking-widest mb-2 font-black">BRIDE'S PARENTS</p>
                                <p>លោក {wedding.themeSettings?.parents?.brideFather || "មាតាបិតាខាងស្រី"}</p>
                                <p>អ្នកស្រី {wedding.themeSettings?.parents?.brideMother || ""}</p>
                            </div>
                        </div>

                        <div className="space-y-14 bg-[#FAF9F6]/80 p-10 rounded-3xl border-lux relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold/10 rounded-tl-3xl" />
                            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold/10 rounded-br-3xl" />

                            <h3 className="font-khmer-moul text-gray-800 text-sm tracking-widest">មានកិត្តិយសគោរពអញ្ជើញ</h3>
                            <p className="font-khmer-content text-[15px] leading-[2.8] text-gray-500 max-w-[340px] mx-auto text-left italic">
                                ឯកឧត្តម អ្នកឧកញ៉ា ឧកញ៉ា លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា ម៉ែឪ អញ្ជើញចូលរួមជាអធិបតី និងពិសាភោជនាហារ ដើម្បីផ្តល់សក្ខីភាព ដ៏ខ្ពង់ខ្ពស់ ក្នុងពិធីអាពាហ៍ពិពាហ៍របស់កូនប្រុស-កូនស្រីរបស់យើងខ្ញុំ
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-12 pt-24">
                            <div className="space-y-4">
                                <div className="text-[10px] tracking-widest text-gold/40 uppercase font-black">THE GROOM</div>
                                <p className="font-khmer-moul text-lg text-gray-800 tracking-wider">ហេង សីហា</p>
                                <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
                            </div>
                            <div className="space-y-4">
                                <div className="text-[10px] tracking-widest text-gold/40 uppercase font-black">THE BRIDE</div>
                                <p className="font-khmer-moul text-lg text-gray-800 tracking-wider">ម៉ែន ពេជ្រច័ន្ទរស្មី</p>
                                <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
                            </div>
                        </div>

                        <div className="pt-28">
                            <p className="font-khmer-content text-[13px] text-gray-400 font-medium leading-[2.5] px-4 max-w-[360px] mx-auto">
                                ដែលនឹងប្រព្រឹត្តទៅនៅថ្ងៃអាទិត្យ ១៣កើត ខែផល្គុន ឆ្នាំរោង សប្តស័ក ពុទ្ធសករាជ ២៥៦៩ ត្រូវនឹងថ្ងៃទី០១ ខែមីនា ឆ្នាំ២០២៦ វេលាម៉ោង ០៥:០០នាទីល្ងាច នៅវិមានស្បៃពិពាហ៍សើភ័ណមង្គល។
                            </p>
                            <p className="font-playfair text-[10px] tracking-[0.8em] text-gold/30 mt-10 uppercase">Sincerely Thank You</p>
                        </div>
                    </RevealSection>
                </section>

                {/* MAPS & QR AS ELEGANT CARDS */}
                <section className="py-28 px-10 bg-[#FAF9F6] space-y-24 relative overflow-hidden">
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-gold/5 rounded-full blur-[100px]" />

                    <RevealSection>
                        <div className="space-y-12">
                            <div className="text-center space-y-4">
                                <h4 className="font-khmer-moul text-xs text-gold/60 uppercase tracking-widest">ទីតាំងកម្មវិធី</h4>
                                <p className="font-serif-elegant text-sm italic text-gray-400 tracking-widest">Find your way to us</p>
                            </div>
                            <div className="w-full aspect-video bg-white p-3 shadow-2xl border-lux rounded-sm">
                                <img src={galleryImages[3] || "/images/bg_staircase.jpg"} className="w-full h-full object-cover opacity-90" />
                            </div>
                        </div>
                    </RevealSection>

                    <div className="grid grid-cols-2 gap-6 px-2">
                        <RevealSection delay={0.1}>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-white p-8 shadow-xl border-lux flex flex-col items-center gap-6 rounded-2xl group hover:shadow-gold/10 transition-all cursor-pointer h-full"
                            >
                                <div className="text-[10px] font-black tracking-widest uppercase text-gold/40">LOCATION</div>
                                <div className="p-4 bg-gray-50 rounded-xl group-hover:bg-ivory transition-colors ring-1 ring-gold/5">
                                    <QrCode size={40} className="text-gold/30" />
                                </div>
                                <div className="text-[9px] text-gray-400 text-center leading-relaxed h-12 overflow-hidden px-2 mt-auto">
                                    Scan to find the venue on Map
                                </div>
                            </motion.div>
                        </RevealSection>
                        <RevealSection delay={0.2}>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-white p-8 shadow-xl border-lux flex flex-col items-center gap-6 rounded-2xl group hover:shadow-gold/10 transition-all cursor-pointer h-full"
                            >
                                <div className="text-[10px] font-black tracking-widest uppercase text-gold/40">WEDDING GIFTS</div>
                                <div className="p-4 bg-gray-50 rounded-xl group-hover:bg-ivory transition-colors ring-1 ring-gold/5">
                                    <QrCode size={40} className="text-gold/30" />
                                </div>
                                <div className="text-[9px] text-gray-400 text-center leading-relaxed h-12 overflow-hidden px-2 mt-auto">
                                    Thank you for your warm wishes!
                                </div>
                            </motion.div>
                        </RevealSection>
                    </div>

                    <RevealSection delay={0.3}>
                        <div className="text-center pt-20">
                            <h3 className="font-playfair text-3xl tracking-[0.5em] text-gold/20 uppercase mb-12">Thank you</h3>
                            <div className="space-y-6 font-khmer-moul text-sm text-gray-400 tracking-[0.2em] opacity-80">
                                <p>{wedding.groomName}</p>
                                <p className="font-serif-elegant italic text-gold/30 text-xl font-normal">&</p>
                                <p>{wedding.brideName}</p>
                            </div>
                        </div>
                    </RevealSection>
                </section>

                {/* THE GALLERY PATTERNS (Luxury Refinement) */}
                <section className="py-24 px-6 space-y-6 bg-white relative">
                    <RevealSection>
                        <div className="text-center mb-24 space-y-6">
                            <div className="h-[1px] w-12 bg-gold/20 mx-auto" />
                            <h2 className="font-playfair text-4xl font-black italic text-gray-800 tracking-tighter">Golden Memories</h2>
                            <p className="font-serif-elegant text-sm text-gray-400 tracking-[0.4em] uppercase">Private Gallery</p>
                        </div>
                    </RevealSection>

                    {/* DYNAMIC GALLERY MODES */}
                    <div className="space-y-12">
                        {wedding.themeSettings?.galleryStyle === 'slider' ? (
                            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-8 no-scrollbar -mx-6 px-6">
                                {galleryImages.map((img, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="flex-shrink-0 w-[85%] aspect-[3/4] snap-center rounded-2xl overflow-hidden border-lux shadow-2xl bg-white p-2"
                                    >
                                        <img src={img} className="w-full h-full object-cover rounded-xl" />
                                    </motion.div>
                                ))}
                            </div>
                        ) : wedding.themeSettings?.galleryStyle === 'polaroid' ? (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-10 px-2 pt-10 pb-20">
                                {galleryImages.slice(0, 8).map((img, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ rotate: idx % 2 === 0 ? -3 : 3 }}
                                        whileInView={{ rotate: idx % 2 === 0 ? -1 : 1 }}
                                        className="bg-white p-3 pt-3 pb-12 shadow-xl border border-gray-100 rounded-sm relative group"
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-4 left-0 right-0 text-center font-serif-elegant italic text-[10px] text-gray-400">
                                            Moment {idx + 1}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* DEFAULT MASONRY PATTERN (Already implemented as split view) */}
                                <div className="grid grid-cols-2 gap-4 h-[350px] px-2">
                                    <RevealSection delay={0.05} className="h-full border-lux p-1 bg-white rounded-xl">
                                        <img src={galleryImages[0 % galleryImages.length]} className="w-full h-full object-cover rounded-lg" />
                                    </RevealSection>
                                    <RevealSection delay={0.1} className="h-full border-lux p-1 bg-white rounded-xl">
                                        <img src={galleryImages[1 % galleryImages.length]} className="w-full h-full object-cover rounded-lg" />
                                    </RevealSection>
                                </div>
                                <div className="w-full h-[450px] px-2">
                                    <RevealSection delay={0.2} className="h-full border-lux p-2 bg-white rounded-2xl">
                                        <img src={galleryImages[2 % galleryImages.length]} className="w-full h-full object-cover rounded-xl" />
                                    </RevealSection>
                                </div>
                                <div className="grid grid-cols-2 gap-4 h-[600px] px-2">
                                    <div className="flex flex-col gap-4">
                                        <RevealSection delay={0.6} className="flex-1 border-lux p-1 bg-white rounded-xl">
                                            <img src={galleryImages[6 % galleryImages.length]} className="w-full h-full object-cover rounded-lg" />
                                        </RevealSection>
                                        <RevealSection delay={0.7} className="flex-1 border-lux p-1 bg-white rounded-xl">
                                            <img src={galleryImages[7 % galleryImages.length]} className="w-full h-full object-cover rounded-lg" />
                                        </RevealSection>
                                    </div>
                                    <RevealSection delay={0.8} className="h-full border-lux p-1 bg-white rounded-xl">
                                        <img src={galleryImages[8 % galleryImages.length]} className="w-full h-full object-cover rounded-lg" />
                                    </RevealSection>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* FINAL KHMER PREAMBLE & FOOTER */}
                <section className="py-28 px-12 text-center bg-white border-t border-gold/5 pb-48 relative">
                    <div className="absolute inset-0 premium-texture opacity-20 pointer-events-none" />
                    <RevealSection>
                        <div className="space-y-20 relative z-10">
                            <p className="font-khmer-content text-[13px] leading-[2.8] text-gray-500 max-w-[340px] mx-auto opacity-80 italic font-medium">
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
                </section>
            </div>

            {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="auto" style={{ display: 'none' }} />}
        </main>
    );
}

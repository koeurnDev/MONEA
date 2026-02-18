"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, MapPin, Gift, Phone, Music, ChevronDown, X, Music2 } from 'lucide-react';
import { WeddingData } from "./types";
import { cn } from "@/lib/utils";
import { useImagePan } from './shared/CinematicComponents';

interface TemplateProps {
    wedding: WeddingData;
    guestName?: string;
}

export default function ElegantPink({ wedding, guestName }: { wedding: WeddingData, guestName?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const primaryColor = wedding.themeSettings?.primaryColor || "#8E5A5A";
    const musicUrl = wedding.themeSettings?.musicUrl;
    const heroImage = wedding.themeSettings?.heroImage || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1000";

    // Cinematic Adjustments
    const heroPan = useImagePan(wedding.themeSettings?.heroImageX || '50%', wedding.themeSettings?.heroImagePosition || '50%', 'heroImageX', 'heroImagePosition');
    const heroAdjustScale = wedding.themeSettings?.heroImageScale || 1;
    const heroBrightness = wedding.themeSettings?.heroImageBrightness || 100;
    const heroContrast = wedding.themeSettings?.heroImageContrast || 100;
    const videoUrl = wedding.themeSettings?.videoUrl;

    const activities = wedding.activities && wedding.activities.length > 0 ? wedding.activities : [
        { time: "07:30 AM", title: "ពិធីហែជំនូន", description: "ហែជំនូន និង កាត់សក់បង្កក់សិរី" },
        { time: "04:30 PM", title: "ពិធីពិសារភោជនាហារ", description: "អញ្ជើញពិសាភោជនាហារ" }
    ];

    // Music Effect
    useEffect(() => {
        if (!musicUrl) return;
        if (!audioRef.current) {
            audioRef.current = new Audio(musicUrl);
            audioRef.current.loop = true;
        }
        if (isPlaying) {
            audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, musicUrl]);

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8 }
    };

    return (
        <div className="min-h-screen font-sans text-[#5A4B4B] overflow-x-hidden relative">

            {/* GLOBAL BACKGROUND - DREAMY */}
            <div className="fixed inset-0 z-0">
                <img src="/images/bg_tunnel.jpg" alt="Background" className="w-full h-full object-cover blur-[2px] scale-105" />
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>

                {/* Floating Elements (Pink Theme) */}
                <div className="absolute top-0 right-0 w-64 h-64 opacity-40 animate-float pointer-events-none">
                    <img src="/images/floral_corner.png" className="w-full h-full object-contain" alt="Floral" />
                </div>
                <div className="absolute bottom-20 left-10 w-32 h-32 opacity-30 animate-float pointer-events-none" style={{ animationDuration: '10s', animationDelay: '1s' }}>
                    <img src="/images/butterfly.png" className="w-full h-full object-contain" alt="Butterfly" />
                </div>
            </div>

            <div className="relative z-10">
                {/* Splash Screen */}
                <AnimatePresence>
                    {!isOpen && (
                        <motion.div
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center text-center p-8 text-black border-4 border-double border-pink-100 m-4 rounded-[3rem]"
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center grayscale opacity-20 rounded-[3rem]"
                                style={{ backgroundImage: `url('${heroImage}')` }}
                            />
                            <div className="relative z-10 space-y-10">
                                <p className="tracking-[0.5em] text-sm font-bold text-pink-600 uppercase font-khmer">
                                    {wedding.eventType === 'anniversary' ? 'រីករាយខួបអាពាហ៍ពិពាហ៍' : 'សិរីសួស្តីអាពាហ៍ពិពាហ៍'}
                                </p>
                                <h1 className="text-4xl sm:text-5xl leading-relaxed text-wedding-title" style={{ color: primaryColor }}>
                                    {wedding.groomName} <br /> & <br /> {wedding.brideName}
                                </h1>

                                {guestName && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="z-10 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-pink-200/50"
                                    >
                                        <p className="text-base opacity-70 font-khmer mb-2 text-[#5A4B4B]">សូមគោរពអញ្ជើញ</p>
                                        <p className="text-4xl font-bold leading-loose text-pink-700 text-wedding-title">{guestName}</p>
                                    </motion.div>
                                )}

                                <button
                                    onClick={() => { setIsOpen(true); setIsPlaying(!!musicUrl); }}
                                    className="mt-8 bg-[#8E5A5A] text-white px-10 py-3 rounded-full text-sm uppercase tracking-[0.2em] font-bold font-khmer shadow-xl animate-bounce"
                                >
                                    បើកសំបុត្រអញ្ជើញ
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <section className="relative h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden">
                    <div
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
                                alt="Pre-wedding"
                                className="w-full h-full object-cover"
                                style={{
                                    objectPosition: `${heroPan.localX} ${heroPan.localY}`,
                                    transform: `scale(${heroAdjustScale})`,
                                    filter: `brightness(${heroBrightness}%) contrast(${heroContrast}%)`,
                                    transition: heroPan.isDragging ? 'none' : 'object-position 0.2s ease-out, transform 0.2s ease-out, filter 0.2s ease-out'
                                }}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-[#FFFBFB]/90"></div>
                    </div>

                    <motion.div {...fadeInUp} className="relative z-10 space-y-6">
                        <p className="tracking-[0.5em] text-sm font-bold text-pink-600 uppercase">
                            {wedding.eventType === 'anniversary' ? 'Anniversary Celebration' : 'Save The Date'}
                        </p>
                        <h1 className="text-4xl sm:text-6xl md:text-9xl leading-relaxed text-wedding-title" style={{ color: primaryColor }}>
                            {wedding.groomName} <br /> <span className="text-4xl font-light italic text-[#5A4B4B]">&</span> <br /> {wedding.brideName}
                        </h1>
                        <div className="h-16 w-[1px] bg-pink-300 mx-auto my-6"></div>
                        <p className="text-2xl font-bold tracking-[0.2em] font-mono text-[#5A4B4B]">
                            {new Date(wedding.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' . ')}
                        </p>
                        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="pt-10">
                            <ChevronDown className="mx-auto text-pink-300" />
                        </motion.div>
                    </motion.div>
                </section>

                {/* 2. Family Section (មាតាបិតា) - Only show for Wedding */}
                {wedding.eventType !== 'anniversary' && (
                    <motion.section {...fadeInUp} className="max-w-4xl mx-auto py-20 px-8 text-center space-y-12 bg-white/50 backdrop-blur-sm rounded-[3rem] m-4">
                        <div className="grid md:grid-cols-2 gap-12 relative">
                            <div className="space-y-4">
                                <h3 className="text-pink-500 font-bold tracking-tighter text-sm uppercase font-khmer">មាតាបិតាខាងកូនប្រុស</h3>
                                <p className="text-xl font-bold text-[#8E5A5A] font-khmer">{wedding.themeSettings?.parents?.groomFather || "លោក មាស ភារុណ"}</p>
                                <p className="text-xl font-bold text-[#8E5A5A] font-khmer">{wedding.themeSettings?.parents?.groomMother || "លោកស្រី ស៊ឹម សុខា"}</p>
                            </div>
                            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-pink-100"></div>
                            <div className="space-y-4">
                                <h3 className="text-pink-500 font-bold tracking-tighter text-sm uppercase font-khmer">មាតាបិតាខាងកូនស្រី</h3>
                                <p className="text-xl font-bold text-[#8E5A5A] font-khmer">{wedding.themeSettings?.parents?.brideFather || "លោក ចាន់ សុភ័ក្រ"}</p>
                                <p className="text-xl font-bold text-[#8E5A5A] font-khmer">{wedding.themeSettings?.parents?.brideMother || "លោកស្រី ហែម ស្រីពៅ"}</p>
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* 3. Program Section (កម្មវិធីបុណ្យ) */}
                <section className="bg-white/80 backdrop-blur-md py-24 px-6 relative overflow-hidden m-4 rounded-[3rem] shadow-lg">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-pink-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-pink-50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                    <div className="max-w-xl mx-auto space-y-10 relative z-10">
                        <motion.div {...fadeInUp} className="text-center mb-16">
                            <h2 className="text-4xl mb-6 text-wedding-title" style={{ color: primaryColor }}>
                                {wedding.eventType === 'anniversary' ? 'កម្មវិធីខួប' : 'កម្មវិធីមង្គលការ'}
                            </h2>
                            <p className="text-pink-600 font-khmer text-lg font-bold mb-2">
                                {new Date(wedding.date).toLocaleDateString('km-KH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <p className="text-gray-500 italic text-sm font-khmer bg-pink-50 py-2 px-4 rounded-full inline-block">
                                {wedding.themeSettings?.lunarDate || "ថ្ងៃអាទិត្យ ១២កើត ខែផល្គុន ឆ្នាំរោង ឆស័ក"}
                            </p>
                        </motion.div>

                        {activities.map((act, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeInUp}
                                className={cn(
                                    "flex gap-8 items-center p-8 rounded-[2.5rem] border transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]",
                                    idx % 2 === 0
                                        ? "bg-pink-50/50 border-pink-100"
                                        : "bg-[#8E5A5A] text-white shadow-xl shadow-pink-900/10"
                                )}
                            >
                                <div className={cn(
                                    "p-3 rounded-2xl shadow-sm",
                                    idx % 2 === 0 ? "bg-white text-pink-400" : "bg-white/20 text-white"
                                )}>
                                    {idx % 2 === 0 ? <Calendar size={24} /> : <Music size={24} />}
                                </div>
                                <div>
                                    <h4 className={cn("font-bold", idx % 2 === 0 ? "text-[#8E5A5A]" : "text-white")}>
                                        {act.title || (idx === 0 ? "កម្មវិធីពេលព្រឹក" : "កម្មវិធីពេលល្ងាច")}
                                    </h4>
                                    <p className={cn("text-sm", idx % 2 === 0 ? "text-gray-500 font-khmer" : "opacity-80 font-khmer")}>
                                        {act.description}
                                    </p>
                                    <p className={cn(
                                        "mt-2 font-serif font-bold tracking-widest",
                                        idx % 2 === 0 ? "text-pink-500" : "text-pink-200"
                                    )}>
                                        {act.time}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 4. Location Section (ផែនទី) */}
                <motion.section {...fadeInUp} className="py-20 px-6 max-w-4xl mx-auto text-center bg-white/60 backdrop-blur-sm rounded-[3rem] m-4">
                    <MapPin className="mx-auto text-pink-400 mb-4" size={32} />
                    <h2 className="text-3xl text-[#8E5A5A] mb-8 text-wedding-title">ទីតាំងកម្មវិធី</h2>
                    <p className="text-gray-500 mb-8 font-khmer">{wedding.location || "មជ្ឈមណ្ឌលសន្និបាត និងពិព័រណ៍កោះពេជ្រ (អាគារ L)"}</p>
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white aspect-video md:aspect-auto md:h-[400px]">
                        <iframe
                            src={wedding.themeSettings?.mapLink ? `https://www.google.com/maps/embed?pb=!1m18...` : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3909.013908221861!2d104.9351233!3d11.5508823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109513dc9815777%3A0x633190df62f689c1!2sKoh%20Pich%20Exhibition%20Center!5e0!3m2!1sen!2skh!4v1700000000000"}
                            className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
                            loading="lazy"
                        ></iframe>
                    </div>
                    <a
                        href={wedding.themeSettings?.mapLink || "https://maps.google.com"}
                        target="_blank"
                        className="mt-8 bg-[#8E5A5A] text-white px-8 py-4 rounded-full shadow-lg flex items-center gap-2 mx-auto hover:scale-105 transition-transform w-fit"
                    >
                        <MapPin size={18} /> បើកក្នុង Google Maps
                    </a>
                </motion.section>

                {/* 5. Sticky Bottom Navigation */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-lg px-8 py-4 rounded-full shadow-2xl border border-pink-100 flex gap-10 z-50">
                    <button className="text-pink-500 flex flex-col items-center gap-1" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <Heart size={20} fill="currentColor" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
                    </button>
                    <button className="text-gray-400 flex flex-col items-center gap-1 hover:text-pink-400 transition-colors" onClick={() => document.getElementById('program')?.scrollIntoView({ behavior: 'smooth' })}>
                        <Calendar size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Date</span>
                    </button>
                    <button className="text-gray-400 flex flex-col items-center gap-1 hover:text-pink-400 transition-colors" onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <Music className="animate-spin-slow text-pink-500" size={20} /> : <Music2 size={20} />}
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Music</span>
                    </button>
                </div>

                {/* Floating Call Button */}
                <a href={`tel:${wedding.themeSettings?.parents?.groomPhone || "012345678"}`} className="fixed bottom-24 right-6 bg-pink-500 text-white p-4 rounded-full shadow-xl z-40 md:hidden animate-pulse">
                    <Phone size={20} />
                </a>
            </div>
        </div>
    );
}

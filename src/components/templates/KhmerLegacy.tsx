"use client";
import * as React from "react";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { AnimatePresence, m } from 'framer-motion';
import { Music, Music2, Heart } from 'lucide-react';
import { WeddingData } from "./types";

// Extracted Hook
import { useKhmerLegacy } from './khmer-legacy/useKhmerLegacy';

// Immediate Components (Initial Viewport)
import { HeroSection } from './khmer-legacy/HeroSection';
import { BackgroundMusic } from './khmer-legacy/BackgroundMusic';
import { overlayVariants, containerVariants } from './khmer-legacy/animations';

// Dynamic Components (Deferred Loading)
const EnglishInvitation = dynamic(() => import('./khmer-legacy/EnglishInvitation').then(mod => mod.EnglishInvitation), { ssr: false });
const EventCountdown = dynamic(() => import('./khmer-legacy/EventCountdown').then(mod => mod.EventCountdown), { ssr: false });
const KhmerSchedule = dynamic(() => import('./khmer-legacy/KhmerSchedule').then(mod => mod.KhmerSchedule), { ssr: false });
const KhmerInvitation = dynamic(() => import('./khmer-legacy/KhmerInvitation').then(mod => mod.KhmerInvitation), { ssr: false });
const EditorialBreaks = dynamic(() => import('./khmer-legacy/EditorialBreaks').then(mod => mod.EditorialBreaks), { ssr: false });
const SaverDateSection = dynamic(() => import('./khmer-legacy/EditorialBreaks').then(mod => mod.SaverDateSection), { ssr: false });
const LoveStorySection = dynamic(() => import('./khmer-legacy/LoveStorySection').then(mod => mod.LoveStorySection), { ssr: false });
const DynamicGallery = dynamic(() => import('./khmer-legacy/DynamicGallery').then(mod => mod.DynamicGallery), { ssr: false });
const SignatureMoments = dynamic(() => import('./khmer-legacy/SignatureMoments').then(mod => mod.SignatureMoments), { ssr: false });
const LocationMap = dynamic(() => import('./khmer-legacy/LocationMap').then(mod => mod.LocationMap), { ssr: false });
const ThankYouSection = dynamic(() => import('./khmer-legacy/ThankYouSection').then(mod => mod.ThankYouSection), { ssr: false });
const FooterSection = dynamic(() => import('./khmer-legacy/FooterSection').then(mod => mod.FooterSection), { ssr: false });
const RSVPSection = dynamic(() => import('./khmer-legacy/RSVPSection'), { ssr: false });
const GuestbookSection = dynamic(() => import('./khmer-legacy/GuestbookSection'), { ssr: false });
const GiftSection = dynamic(() => import('./khmer-legacy/GiftSection'), { ssr: false });
const VideoSection = dynamic(() => import('./khmer-legacy/VideoSection').then(mod => mod.VideoSection), { ssr: false });

export default function KhmerLegacy({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const {
        revealed,
        setRevealed,
        isPlaying,
        setIsPlaying,
        audioRef,
        timeLeft,
        galleryImages,
        heroImage,
        smartColors,
        heroPan,
        groomPan,
        bridePan,
        englishPan,
        bannerPan,
        editorialPan1,
        editorialPan2,
        editorialPan3,
        editorialPan4,
        signaturePan1,
        signaturePan2,
        signaturePan3,
        hubPan,
        mapPan,
        galleryPan,
        preWeddingPan1,
        preWeddingPan2,
        preWeddingPan3,
        preWeddingPan4,
        preWeddingPan5,
        preWeddingPan6,
        formattedDateHero,
        formattedDateInvitation,
        musicUrl,
        dynamicPool,
        mounted
    } = useKhmerLegacy(wedding);

    if (!mounted) {
        return (
            <div className="fixed inset-0 bg-[#FDFBF7] flex flex-col items-center justify-center z-[200]">
                <m.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    <div className="w-20 h-20 border-2 border-gold/10 rounded-full animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Heart className="text-gold animate-pulse" size={24} fill="currentColor" />
                    </div>
                </m.div>
                <m.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 font-khmer-moul text-gold/60 text-xs tracking-widest"
                >
                    សូមរង់ចាំបន្តិច...
                </m.p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#333] overflow-x-hidden selection:bg-[#E2D1B3]">
            <style jsx global>{`
                :root {
                    --color-cream: #FFFFFF;
                    --color-ivory: #F9F9F9;
                    --color-gold-deep: #805C00;
                    --color-gold-main: #C5A027;
                    --color-gold-light: #D4AF37;
                    --color-gold-shimmer: #FFF7E0;
                    --color-gold-glow: rgba(212, 175, 55, 0.5);
                    --color-text-main: #333333;
                }

                .font-khmer-moul { font-family: var(--font-moul), serif; }
                .font-khmer-content { font-family: var(--font-kantumruy), sans-serif; line-height: 2.2; }
                .font-serif-elegant { font-family: var(--font-playfair), serif; }
                .font-playfair { font-family: var(--font-playfair), serif; }
                
                .text-gold { color: var(--color-gold-main); }
                .bg-gold { background-color: var(--color-gold-main); }
                .border-gold { border-color: var(--color-gold-main); }

                .text-gold-gradient {
                    background: linear-gradient(
                        145deg, 
                        var(--color-gold-deep) 0%, 
                        var(--color-gold-main) 20%, 
                        var(--color-gold-light) 45%, 
                        var(--color-gold-shimmer) 50%, 
                        var(--color-gold-light) 55%, 
                        var(--color-gold-main) 80%, 
                        var(--color-gold-deep) 100%
                    );
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .text-gold-embossed {
                    text-shadow: 
                        0 1px 1px rgba(0,0,0,0.1),
                        0 2px 4px rgba(139, 101, 8, 0.2);
                }

                .premium-shadow { 
                    text-shadow: 0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05); 
                }
                
                .schedule-text { font-size: 13px; line-height: 2.2; color: #555; }
                
                .premium-texture {
                    background-color: #FDFBF7;
                    background-image: 
                        radial-gradient(#333 0.5px, transparent 0.5px),
                        radial-gradient(#333 0.5px, #FDFBF7 0.5px);
                    background-size: 20px 20px;
                    background-position: 0 0, 10px 10px;
                    opacity: 0.02;
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
                    opacity: 0.2;
                }

                .blend-multiply {
                    mix-blend-mode: multiply !important;
                    -webkit-mix-blend-mode: multiply !important;
                }

                .image-hide-white {
                    filter: brightness(1.02) contrast(1.1);
                    mix-blend-mode: multiply;
                }
            `}</style>

            {/* PREMIUM ATMOSPHERE */}
            <BackgroundMusic 
                wedding={wedding} 
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                audioRef={audioRef}
            />

            {/* CINEMATIC ENTRANCE OVERLAY - REDESIGNED */}
            <AnimatePresence mode="wait">
                {!revealed && (
                    <m.div
                        key="overlay"
                        variants={overlayVariants}
                        initial="initial"
                        exit="exit"
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-center p-8 overflow-hidden"
                        style={{ isolation: 'auto' }}
                    >
                        {/* THE BACKGROUND LAYER - ESSENTIAL FOR BLENDING */}
                        <div className="absolute inset-0 bg-[#FDFBF7]" />
                        
                        {/* Soft Background Texture */}
                        <div className="absolute inset-0 premium-texture opacity-40 pointer-events-none" />
                        
                        {/* Soft Background Texture */}
                        <div className="absolute inset-0 premium-texture opacity-40 pointer-events-none" />
                        
                        {/* Floating Rumduol Flowers (National Flower of Cambodia) */}

                        {/* Floating Rumduol Flowers (National Flower of Cambodia) */}
                        <m.div
                            animate={{ 
                                x: [0, 20, 0], 
                                y: [0, -40, 0],
                                rotate: [0, 45, 0]
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/4 left-1/4 w-12 md:w-20 h-12 md:h-20 pointer-events-none"
                            style={{ mixBlendMode: 'multiply' }}
                        >
                            <Image 
                                src="/images/rumduol.png" 
                                className="w-full h-full object-contain opacity-80" 
                                alt="" 
                                width={80}
                                height={80}
                            />
                        </m.div>
                        <m.div
                            animate={{ 
                                x: [0, -30, 0], 
                                y: [0, 30, 0],
                                rotate: [0, -60, 0]
                            }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            className="absolute bottom-1/4 right-1/4 w-16 md:w-24 h-16 md:h-24 pointer-events-none"
                            style={{ mixBlendMode: 'multiply' }}
                        >
                            <Image 
                                src="/images/rumduol.png" 
                                className="w-full h-full object-contain opacity-70" 
                                alt="" 
                                width={96}
                                height={96}
                            />
                        </m.div>
                        <m.div
                            animate={{ 
                                x: [0, 40, 0], 
                                y: [0, -100, 0],
                                rotate: [0, 360, 0]
                            }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
                            className="absolute top-1/2 left-0 w-8 md:w-12 h-8 md:h-12 pointer-events-none"
                            style={{ mixBlendMode: 'multiply' }}
                        >
                            <Image 
                                src="/images/rumduol.png" 
                                className="w-full h-full object-contain opacity-40 grayscale" 
                                alt="" 
                                width={48}
                                height={48}
                            />
                        </m.div>

                        <m.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 flex flex-col items-center gap-6 md:gap-10">
                            {/* Version Marker (Debugging) - v2.7 */}
                            <div className="absolute -top-32 opacity-0 select-none pointer-events-none">v2.7-final-blend-fix</div>
                            
                            {/* Top Title */}
                            <m.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="space-y-4"
                            >
                                <h1 className="font-khmer-moul text-xl md:text-3xl text-[#B19356] drop-shadow-sm tracking-[0.1em] leading-relaxed">
                                    {wedding.themeSettings?.customLabels?.invitationTitle || (wedding.eventType === 'anniversary' ? 'កម្មវិធីខួបអាពាហ៍ពិពាហ៍' : 'សិរីមង្គលអាពាហ៍ពិពាហ៍')}
                                </h1>
                            </m.div>

                            {/* Center Logo / Custom Red Heart Frame */}
                            <m.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ 
                                    scale: 1, 
                                    opacity: 1,
                                    y: [0, -10, 0] // Floating animation
                                }}
                                transition={{ 
                                    opacity: { duration: 1.2, delay: 0.2 },
                                    scale: { duration: 1.2, ease: "backOut", delay: 0.2 },
                                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" } // Infinite loop
                                }}
                                className="relative w-48 h-48 md:w-[240px] md:h-[240px] flex items-center justify-center p-4"
                            >
                            <Image 
                                src="/images/assets/user-red-heart.png" 
                                className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none drop-shadow-lg" 
                                style={{ mixBlendMode: 'multiply' }}
                                alt="Frame" 
                                width={240}
                                height={240}
                                priority
                            />
                                <div className="flex flex-col items-center justify-center relative z-10 -translate-y-1 md:-translate-y-2">
                                    <div className="font-khmer-moul text-lg md:text-3xl text-gold-gradient drop-shadow-md scale-x-110 select-none leading-tight">
                                        {wedding.groomName.split(' ')[0]}
                                    </div>
                                    <div className="font-khmer-content text-[10px] md:text-sm text-gold/40 italic">និង</div>
                                    <div className="font-khmer-moul text-lg md:text-3xl text-gold-gradient drop-shadow-md scale-x-110 select-none leading-tight">
                                        {wedding.brideName.split(' ')[0]}
                                    </div>
                                </div>
                            </m.div>

                            {/* Text Info */}
                            <m.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="space-y-4 flex flex-col items-center"
                            >
                                <p className="font-khmer-moul text-gold/60 text-[10px] md:text-xs tracking-[0.4em] uppercase">សូមគោរពអញ្ជើញ</p>
                                <div className="space-y-2">
                                    {guestName ? (
                                        <h2 className="font-khmer-moul text-2xl md:text-4xl text-[#8E7942] tracking-widest drop-shadow-sm px-4">
                                            {guestName}
                                        </h2>
                                    ) : (
                                        <h2 className="font-khmer-moul text-xl md:text-3xl text-[#8E7942] tracking-widest flex items-center gap-4 px-4">
                                            {wedding.groomName} <span className="text-gold/30 text-xs italic font-khmer-content">និង</span> {wedding.brideName}
                                        </h2>
                                    )}
                                </div>
                                
                                {/* Open Button */}
                                <m.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 15px 30px rgba(139, 126, 60, 0.4)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setRevealed(true)}
                                    className="mt-6 px-16 py-4 bg-gradient-to-b from-[#B0A678] to-[#8B7E3C] text-white rounded-xl font-khmer-moul text-xl tracking-widest transition-all outline-none border border-white/20 shadow-[0_10px_20px_rgba(0,0,0,0.15)] active:shadow-inner"
                                >
                                    {wedding.eventType === 'anniversary' ? 'ខួបមង្គល' : 'បើកធៀប'}
                                </m.button>

                                <p className="mt-8 font-khmer-content text-[12px] md:text-[14px] text-gold/40 font-bold max-w-[280px] leading-relaxed italic text-center">
                                    {guestName ? "សូមមេត្តាចុចដើម្បីទទួលសំបុត្រអេឡិចត្រូនិច" : "សូមមេត្តាចុចដើម្បីបើកធៀបអេឡិចត្រូនិច"}
                                </p>
                            </m.div>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>

            <div className="max-w-[480px] md:max-w-none mx-auto bg-white min-h-screen relative md:shadow-none font-serif-elegant">
                {/* Fixed Texture Layer */}
                <div className="absolute inset-0 premium-texture pointer-events-none z-0" />
                
                <div className="relative z-10">
                <HeroSection
                    wedding={wedding}
                    heroImage={heroImage}
                    smartColors={smartColors}
                    heroPan={heroPan}
                    formattedDateHero={formattedDateHero}
                />

                <SaverDateSection formattedDateInvitation={formattedDateInvitation} />
                
                <EditorialBreaks
                    wedding={wedding}
                    galleryImages={galleryImages}
                    editorialPan1={editorialPan1}
                    editorialPan2={editorialPan2}
                    editorialPan3={editorialPan3}
                    editorialPan4={editorialPan4}
                />

                {(wedding.themeSettings?.groomStory || wedding.themeSettings?.brideStory || wedding.themeSettings?.story?.kh) && (
                    <LoveStorySection wedding={wedding} />
                )}

                <DynamicGallery
                    wedding={wedding}
                    galleryImages={galleryImages}
                    dynamicPool={dynamicPool}
                    preWeddingPan1={preWeddingPan1}
                    preWeddingPan2={preWeddingPan2}
                    preWeddingPan3={preWeddingPan3}
                    preWeddingPan4={preWeddingPan4}
                    preWeddingPan5={preWeddingPan5}
                    preWeddingPan6={preWeddingPan6}
                />

                {(wedding.themeSettings?.visibility as any)?.showStory !== false && (
                    <EnglishInvitation 
                        wedding={wedding} 
                        galleryImages={galleryImages} 
                        smartColors={smartColors} 
                        englishPan={englishPan} 
                    />
                )}

                <KhmerInvitation wedding={wedding} smartColors={smartColors} />

                {(wedding.themeSettings?.visibility as any)?.showTimeline !== false && wedding.activities && wedding.activities.length > 0 && (
                    <KhmerSchedule wedding={wedding} />
                )}

                <EventCountdown wedding={wedding} galleryImages={galleryImages} mounted={mounted} timeLeft={timeLeft} hubPan={hubPan} />

                {wedding.themeSettings?.videoUrl && (
                    <VideoSection wedding={wedding} />
                )}

                {(wedding.themeSettings?.visibility as any)?.showStory !== false && (
                    <SignatureMoments 
                        wedding={wedding}
                        galleryImages={galleryImages} 
                        signaturePan1={signaturePan1}
                        signaturePan2={signaturePan2}
                        signaturePan3={signaturePan3}
                    />
                )}

                <section id="sacred-bond" className="py-24 px-8 md:px-12 bg-white relative overflow-hidden">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <div className="space-y-4">
                            <p className="font-playfair text-xs tracking-[0.5em] text-gray-400 uppercase font-black">Sacred Bond</p>
                            <h3 className="font-khmer-moul text-lg md:text-xl text-gold/80">
                                {wedding.eventType === 'anniversary' ? 'អនុស្សាវរីយ៍យូរអង្វែង' : 'សក្ខីភាពនៃក្តីស្រលាញ់'}
                            </h3>
                        </div>
                        {wedding.galleryItems?.find(i => i.type === 'CERTIFICATE') && (
                            <div 
                                className="relative aspect-[1.4/1] w-full shadow-2xl rounded-sm border-lux overflow-hidden"
                            >
                                <Image 
                                    src={wedding.galleryItems.find(i => i.type === 'CERTIFICATE')?.url || "/og-main.jpg"} 
                                    className="w-full h-full object-contain p-4 md:p-10 bg-[#FAF9F6] transition-transform [transition-duration:5s]" 
                                    alt="Marriage Certificate" 
                                    width={800}
                                    height={600}
                                />
                            </div>
                        )}
                    </div>
                </section>

                <LocationMap wedding={wedding} galleryImages={galleryImages} mapPan={mapPan} />

                <RSVPSection wedding={wedding} guestName={guestName} />

                {(wedding.themeSettings?.visibility as any)?.showGuestbook !== false && (
                    <GuestbookSection wedding={wedding} guestName={guestName} />
                )}

                {(wedding.themeSettings?.visibility as any)?.showGift !== false && (wedding.themeSettings?.bankAccounts?.length || wedding.themeSettings?.giftRegistry?.length) && (
                    <GiftSection wedding={wedding} />
                )}

                <ThankYouSection wedding={wedding} smartColors={smartColors} />

                <FooterSection wedding={wedding} />
                </div>
            </div>
        </div>
    );
}

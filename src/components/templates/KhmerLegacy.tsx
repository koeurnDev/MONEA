"use client";
import * as React from "react";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { AnimatePresence, m, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { WeddingData } from "./types";
import { useTranslation } from "@/i18n/LanguageProvider";

// Extracted Hook
import { useKhmerLegacy } from './khmer-legacy/useKhmerLegacy';

// Immediate Components (Initial Viewport)
import { HeroSection } from './khmer-legacy/HeroSection';
import { BackgroundMusic } from './khmer-legacy/BackgroundMusic';
import { overlayVariants, containerVariants } from './khmer-legacy/animations';

const GoldDustAtmosphere = ({ opacity }: { opacity: any }) => {
    return (
        <m.div 
            style={{ opacity }}
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        >
            {[...Array(25)].map((_, i) => (
                <m.div
                    key={i}
                    initial={{ 
                        x: Math.random() * 100 + '%', 
                        y: Math.random() * 100 + '%',
                        scale: Math.random() * 0.5 + 0.5,
                        opacity: 0
                    }}
                    animate={{ 
                        opacity: [0, 1, 0],
                        y: ['-10%', '110%'],
                        x: (Math.random() * 100 + (Math.random() * 20 - 10)) + '%'
                    }}
                    transition={{ 
                        duration: 15 + Math.random() * 15, 
                        repeat: Infinity,
                        delay: Math.random() * 15,
                        ease: "linear"
                    }}
                    className={clsx(
                        "absolute rounded-full",
                        i % 2 === 0 ? "w-1 h-1 bg-gold-main/20 blur-[1px]" : "w-0.5 h-0.5 bg-gold-light/30"
                    )}
                />
            ))}
        </m.div>
    );
};

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
const CelebrationNavigator = dynamic(() => import('./khmer-legacy/CelebrationNavigator').then(mod => mod.CelebrationNavigator), { ssr: false });
const SacredBond = dynamic(() => import('./khmer-legacy/SacredBond').then(mod => mod.SacredBond), { ssr: false });

export default function KhmerLegacy({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const { t } = useTranslation();
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
        englishPan,
        editorialPan1,
        editorialPan2,
        editorialPan3,
        editorialPan4,
        signaturePan1,
        signaturePan2,
        signaturePan3,
        hubPan,
        mapPan,
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
    
    const shouldReduceMotion = useReducedMotion();

    const { scrollYProgress } = useScroll();
    const dustOpacity = useTransform(
        scrollYProgress,
        [0, 0.2, 0.4, 0.6, 0.8, 1],
        [0.05, 0.15, 0.3, 0.4, 0.2, 0.1]
    );

    // We still keep the mounted check for browser-only data (like timeLeft)
    // but we allow the static shell to render on the server.

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#333] overflow-x-hidden selection:bg-[#E2D1B3] relative">
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

                .font-khmer-moul { font-family: var(--font-moul), serif; line-height: 1.8; }
                .font-khmer-content { font-family: var(--font-kantumruy), sans-serif; line-height: 2.4; }
                .font-khmer-m1 { font-family: var(--font-m1), serif; line-height: 1.8; }
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
                    margin: 3.5rem auto;
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

                .gold-dust-global {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 50;
                    opacity: 0.15;
                }
            `}</style>

            {/* Client-only Atmosphere & Music */}
            {mounted && (
                <>
                    <GoldDustAtmosphere opacity={dustOpacity} />
                    <BackgroundMusic 
                        wedding={wedding} 
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        audioRef={audioRef}
                    />
                </>
            )}

            {/* CINEMATIC ENTRANCE OVERLAY - REDESIGNED */}
            <AnimatePresence mode="wait">
                {!revealed && !shouldReduceMotion && (
                    <m.div
                        key="overlay"
                        variants={overlayVariants}
                        initial="initial"
                        exit="exit"
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-center p-8 overflow-hidden bg-[#FDFBF7]"
                        style={{ isolation: 'isolate' }}
                    >
                        {/* Premium Background Layer */}
                        <div className="absolute inset-0 z-0">
                            {heroImage ? (
                                <Image
                                    src={heroImage}
                                    fill
                                    className="object-cover opacity-[0.07] scale-110 blur-xl"
                                    alt="Background"
                                />
                            ) : (
                                <div className="absolute inset-0 premium-texture opacity-40" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7]/50 via-transparent to-[#FDFBF7]" />
                        </div>
                        
                        {/* Soft Glows */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-main/10 blur-[120px] rounded-full pointer-events-none" />
                        
                        <m.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 flex flex-col items-center gap-8 md:gap-14 pt-16 md:pt-24">
                            {/* Top Title */}
                            <m.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 1 }}
                                className="space-y-4"
                            >
                                <p className="font-playfair text-[9px] md:text-xs tracking-[0.6em] text-gold-main/50 uppercase font-black">{t("template.khmerLegacy.overlaySubtitle")}</p>
                                <h1 className="font-khmer-moul text-xl md:text-3xl text-[#B19356] drop-shadow-sm tracking-[0.1em] leading-relaxed">
                                    {wedding.themeSettings?.customLabels?.invitationTitle || 
                                     (wedding.eventType === 'anniversary' 
                                        ? t("template.khmerLegacy.overlayTitleAnniversary") 
                                        : t("template.khmerLegacy.overlayTitleWedding"))}
                                </h1>
                            </m.div>

                            {/* Center Logo / Custom Red Heart Frame with Photo */}
                            <m.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ 
                                    scale: 1, 
                                    opacity: 1,
                                    y: [0, -10, 0]
                                }}
                                transition={{ 
                                    opacity: { duration: 1.5, delay: 0.2 },
                                    scale: { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
                                    y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                                }}
                                className="relative w-52 h-52 md:w-[320px] md:h-[320px] flex items-center justify-center p-8"
                            >
                                <div className="absolute inset-0 bg-gold-main/10 blur-3xl rounded-full" />
                                
                                {/* The Couple Photo clipped to Heart shape basically */}
                                <div className="absolute inset-[18%] rounded-full overflow-hidden z-0 bg-gold-light/10 border border-gold-main/10">
                                    {heroImage && (
                                        <Image
                                            src={heroImage}
                                            fill
                                            className="object-cover object-top scale-110 saturate-[0.85] contrast-[1.1]"
                                            alt="Couple"
                                            priority
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gold-main/20 via-transparent to-transparent" />
                                </div>

                                <Image
                                    src="/images/assets/user-red-heart.webp"
                                    className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_20px_50px_rgba(139,126,60,0.4)] filter contrast-[1.1] z-10"
                                    style={{ mixBlendMode: 'multiply' }}
                                    alt="Frame"
                                    width={320}
                                    height={320}
                                    priority
                                />
                            </m.div>

                            {/* Text Info */}
                            <m.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 1.2 }}
                                className="space-y-6 flex flex-col items-center"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <p className="font-khmer-moul text-gold-main/40 text-[10px] md:text-xs tracking-[0.5em] uppercase">{t("template.khmerLegacy.invitationGreeting")}</p>
                                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gold-main/30 to-transparent" />
                                </div>
                                
                                <div className="space-y-3 px-4">
                                    {guestName ? (
                                        <h2 className="font-khmer-moul text-3xl md:text-5xl text-[#8E7942] tracking-widest drop-shadow-sm">
                                            {guestName}
                                        </h2>
                                    ) : (
                                        <h2 className="font-khmer-moul text-2xl md:text-4xl text-[#8E7942] tracking-widest flex flex-wrap justify-center items-center gap-x-4">
                                            {wedding.groomName} <span className="text-gold-main/20 text-sm italic font-serif-elegant">{t("template.khmerLegacy.and")}</span> {wedding.brideName}
                                        </h2>
                                    )}
                                </div>
                                
                                {/* Open Button - Studio Style */}
                                <m.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.5 }}
                                    className="relative group mt-4"
                                >
                                    <div className="absolute -inset-4 bg-gold-main/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <m.button
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setRevealed(true)}
                                        className="relative px-20 py-5 bg-gradient-to-br from-[#D4AF37] via-[#C5A027] to-[#805C00] text-white rounded-full font-khmer-moul text-2xl tracking-[0.2em] transition-all border border-white/30 shadow-[0_20px_40px_rgba(139,126,60,0.4)] active:shadow-inner overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50" />
                                        <span className="relative z-10 drop-shadow-md">
                                            {wedding.eventType === 'anniversary' 
                                                ? t("template.khmerLegacy.heroButtonAnniversary") 
                                                : (wedding.themeSettings?.customLabels?.heroButton || t("template.khmerLegacy.heroButtonWedding"))}
                                        </span>
                                        {/* Shine Effect */}
                                        <m.div 
                                            animate={{ x: ['-200%', '200%'] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" 
                                        />
                                    </m.button>
                                </m.div>

                                <m.p 
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="mt-6 font-khmer-content text-[11px] md:text-[13px] text-gold-main/50 font-black max-w-[300px] leading-relaxed italic text-center uppercase tracking-widest"
                                >
                                    {guestName ? t("template.khmerLegacy.overlayHintTicket") : t("template.khmerLegacy.overlayHintInvitation")}
                                </m.p>
                            </m.div>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>

            <div className="max-w-[480px] md:max-w-none mx-auto bg-white min-h-screen relative md:shadow-none font-serif-elegant">
                {/* Fixed Texture Layer */}
                <div className="absolute inset-0 premium-texture pointer-events-none z-0" />
                
                <div className="relative z-10">
                <m.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5 }}
                >
                    <HeroSection
                        wedding={wedding}
                        heroImage={heroImage}
                        smartColors={smartColors}
                        heroPan={heroPan}
                        formattedDateHero={formattedDateHero}
                    />
                </m.div>

                <m.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative overflow-hidden"
                >
                    {/* Background Watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-playfair text-[20vw] text-gold-main/5 pointer-events-none select-none uppercase font-black tracking-tighter mix-blend-multiply opacity-30">
                        {wedding.groomName?.[0]}{wedding.brideName?.[0]}
                    </div>
                    
                    <SaverDateSection formattedDateInvitation={formattedDateInvitation} />
                </m.div>
                
                <m.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <EditorialBreaks
                        wedding={wedding}
                        galleryImages={galleryImages}
                        editorialPan1={editorialPan1}
                        editorialPan2={editorialPan2}
                        editorialPan3={editorialPan3}
                        editorialPan4={editorialPan4}
                    />
                </m.div>

                {(wedding.themeSettings?.groomStory || wedding.themeSettings?.brideStory || wedding.themeSettings?.story?.kh) && (
                    <m.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1 }}
                    >
                        <LoveStorySection wedding={wedding} />
                    </m.div>
                )}

                <m.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5 }}
                    className="relative"
                >
                     {/* Dynamic Watermark for Gallery */}
                     <div className="absolute top-0 right-0 font-playfair text-[15vw] text-gold-main/5 pointer-events-none select-none uppercase font-black -rotate-90 origin-top-right translate-y-20 opacity-20">
                        {t("template.khmerLegacy.galleryWatermark")}
                    </div>

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
                </m.div>

                {(wedding.themeSettings?.visibility as any)?.showStory !== false && (
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <EnglishInvitation 
                            wedding={wedding} 
                            galleryImages={galleryImages} 
                            smartColors={smartColors} 
                            englishPan={englishPan} 
                        />
                    </m.div>
                )}

                <m.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    <KhmerInvitation wedding={wedding} smartColors={smartColors} />
                </m.div>

                {(wedding.themeSettings?.visibility as any)?.showTimeline !== false && wedding.activities && wedding.activities.length > 0 && (
                    <m.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <KhmerSchedule wedding={wedding} />
                    </m.div>
                )}

                <m.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    <EventCountdown wedding={wedding} galleryImages={galleryImages} mounted={mounted} timeLeft={timeLeft} hubPan={hubPan} />
                </m.div>

                {wedding.themeSettings?.videoUrl && (
                    <m.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                    >
                        <VideoSection wedding={wedding} />
                    </m.div>
                )}

                {(wedding.themeSettings?.visibility as any)?.showStory !== false && (
                    <m.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <SignatureMoments 
                            wedding={wedding}
                            galleryImages={galleryImages} 
                            signaturePan1={signaturePan1}
                            signaturePan2={signaturePan2} 
                            signaturePan3={signaturePan3}
                        />
                    </m.div>
                )}

                <m.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5 }}
                >
                    <SacredBond wedding={wedding} />
                </m.div>

                <m.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    <LocationMap wedding={wedding} galleryImages={galleryImages} mapPan={mapPan} />
                </m.div>

                <m.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    <RSVPSection wedding={wedding} guestName={guestName} />
                </m.div>

                {(wedding.themeSettings?.visibility as any)?.showGuestbook !== false && (
                    <m.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <GuestbookSection wedding={wedding} guestName={guestName} />
                    </m.div>
                )}

                {(wedding.themeSettings?.visibility as any)?.showGift !== false && (wedding.themeSettings?.bankAccounts?.length || wedding.themeSettings?.giftRegistry?.length) && (
                    <m.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <GiftSection wedding={wedding} />
                    </m.div>
                )}

                <m.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2 }}
                >
                    <ThankYouSection wedding={wedding} smartColors={smartColors} />
                </m.div>

                <FooterSection wedding={wedding} />
                </div>
            </div>
        </div>
    );
}

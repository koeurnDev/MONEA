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

const GoldDustAtmosphere = ({ opacity, isMobile }: { opacity: any; isMobile: boolean }) => {
    return (
        <m.div 
            style={{ opacity }}
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        >
            {!isMobile && [...Array(25)].map((_, i) => (
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

// Immediate Components (Initial Viewport - Static Imports for SSR & Fast Load)
import { EnglishInvitation } from './khmer-legacy/EnglishInvitation';
import { EventCountdown } from './khmer-legacy/EventCountdown';
import { KhmerSchedule } from './khmer-legacy/KhmerSchedule';
import { KhmerInvitation } from './khmer-legacy/KhmerInvitation';
import { EditorialBreaks, SaverDateSection } from './khmer-legacy/EditorialBreaks';

// Dynamic Components (Deferred JS Loading, but SSR Enabled)
const LoveStorySection = dynamic(() => import('./khmer-legacy/LoveStorySection').then(mod => mod.LoveStorySection));
const DynamicGallery = dynamic(() => import('./khmer-legacy/DynamicGallery').then(mod => mod.DynamicGallery));
const SignatureMoments = dynamic(() => import('./khmer-legacy/SignatureMoments').then(mod => mod.SignatureMoments));
const ThankYouSection = dynamic(() => import('./khmer-legacy/ThankYouSection').then(mod => mod.ThankYouSection));
const FooterSection = dynamic(() => import('./khmer-legacy/FooterSection').then(mod => mod.FooterSection));
const RSVPSection = dynamic(() => import('./khmer-legacy/RSVPSection').then(mod => mod.default));
const GuestbookSection = dynamic(() => import('./khmer-legacy/GuestbookSection').then(mod => mod.default));
const GiftSection = dynamic(() => import('./khmer-legacy/GiftSection').then(mod => mod.default));
const VideoSection = dynamic(() => import('./khmer-legacy/VideoSection').then(mod => mod.VideoSection));
const CelebrationNavigator = dynamic(() => import('./khmer-legacy/CelebrationNavigator').then(mod => mod.CelebrationNavigator));
const SacredBond = dynamic(() => import('./khmer-legacy/SacredBond').then(mod => mod.SacredBond));

// Components strictly requiring Client-Side Rendering (due to window access)
const LocationMap = dynamic(() => import('./khmer-legacy/LocationMap').then(mod => mod.LocationMap), { ssr: false });

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
        signaturePan4,
        signaturePan5,
        signaturePan6,
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

    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        if (mounted) {
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }
    }, [mounted]);

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
                
                .schedule-text { font-size: 15px; line-height: 2.4; color: #555; }
                
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
                    @media (min-width: 768px) {
                        mix-blend-mode: multiply;
                    }
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
                    <GoldDustAtmosphere opacity={dustOpacity} isMobile={isMobile} />
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
                {!revealed && (
                    <m.div
                        key="overlay"
                        variants={overlayVariants}
                        initial="initial"
                        exit="exit"
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-center overflow-hidden bg-[#FDFBF7]"
                        style={{ isolation: 'isolate' }}
                    >
                        {/* Background Image Layer */}
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/images/assets/overlay-bg.webp"
                                fill
                                className="object-cover"
                                alt="Background"
                                priority
                            />
                            {/* Light overlays for text contrast */}
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
                            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white/80" />
                        </div>
                        
                        {/* The Content Card */}
                        <m.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 w-full h-[100dvh] max-w-[480px] p-8 py-12 md:p-12 flex flex-col items-center justify-between overflow-y-auto">
                            
                            {/* Top Title */}
                            <div className="space-y-4">
                                <h1 className="font-khmer-moul text-[15px] md:text-lg text-[#9C7A3C] drop-shadow-sm tracking-[0.05em] leading-relaxed">
                                    {wedding.themeSettings?.customLabels?.invitationTitle || 
                                     (wedding.eventType === 'anniversary' 
                                        ? t("template.khmerLegacy.overlayTitleAnniversary") 
                                        : t("template.khmerLegacy.overlayTitleWedding"))}
                                </h1>
                                <p className="font-sans text-[8px] md:text-[9px] tracking-[0.4em] text-[#8EA2B3] uppercase font-bold">THE WEDDING DAY</p>
                            </div>

                            {/* Names */}
                            {(() => {
                                const nameFontClass = wedding.themeSettings?.nameFont === 'moul' ? 'font-khmer-moul' : wedding.themeSettings?.nameFont === 'kantumruy' ? 'font-kantumruy font-bold' : 'font-suwannaphum';
                                const nameSeparator = wedding.themeSettings?.nameSeparator === 'ampersand' ? '&' : wedding.themeSettings?.nameSeparator === 'heart' ? '♥' : t("template.khmerLegacy.and");
                                return (
                                    <div className="space-y-4 w-full text-center">
                                        <h2 className={`${nameFontClass} text-4xl md:text-5xl text-[#0A1226] tracking-[0.05em] drop-shadow-sm break-words whitespace-normal`}>
                                            {wedding.groomName}
                                        </h2>
                                        <p className={`${nameFontClass} text-[#8EA2B3] text-base md:text-xl`}>{nameSeparator}</p>
                                        <h2 className={`${nameFontClass} text-4xl md:text-5xl text-[#0A1226] tracking-[0.05em] drop-shadow-sm break-words whitespace-normal`}>
                                            {wedding.brideName}
                                        </h2>
                                    </div>
                                );
                            })()}
                            
                            {/* Divider */}
                            <div className="h-[1px] w-12 bg-[#8EA2B3]/30" />

                            {/* Invitation Text */}
                            <div className="space-y-4 flex flex-col items-center">
                                <p className="font-khmer-moul text-[#8EA2B3] text-[10px] md:text-xs tracking-[0.1em] uppercase">{t("template.khmerLegacy.invitationGreeting")}</p>
                                
                                {guestName ? (
                                    <h3 className="font-khmer-moul text-lg text-[#9C7A3C] tracking-wider drop-shadow-sm">
                                        {guestName}
                                    </h3>
                                ) : (
                                    <h3 className="font-khmer-content text-[13px] md:text-[14px] text-[#9C7A3C] tracking-wide max-w-[200px] leading-relaxed text-center">
                                        ឯកឧត្តម លោកជំទាវ លោក លោកស្រី
                                    </h3>
                                )}
                            </div>
                                
                            {/* Open Button */}
                            <m.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full mt-2"
                            >
                                <button
                                    onClick={() => setRevealed(true)}
                                    className="w-full py-3.5 bg-[#0A1226] text-white rounded-full font-khmer-moul text-sm md:text-base tracking-[0.05em] transition-all shadow-md active:shadow-inner"
                                >
                                    {wedding.eventType === 'anniversary' 
                                        ? t("template.khmerLegacy.heroButtonAnniversary") 
                                        : (wedding.themeSettings?.customLabels?.heroButton || t("template.khmerLegacy.heroButtonWedding"))}
                                </button>
                            </m.div>

                            <m.p 
                                animate={{ opacity: [0.3, 0.7, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="font-khmer-content text-[9px] md:text-[10px] text-[#8EA2B3] font-bold max-w-[250px] leading-relaxed italic text-center uppercase tracking-widest absolute bottom-4 opacity-0 hidden"
                            >
                                {guestName ? t("template.khmerLegacy.overlayHintTicket") : t("template.khmerLegacy.overlayHintInvitation")}
                            </m.p>
                            
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
                        isMobile={isMobile}
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
                            signaturePan4={signaturePan4}
                            signaturePan5={signaturePan5}
                            signaturePan6={signaturePan6}
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

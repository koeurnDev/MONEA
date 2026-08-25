import * as React from "react";
import { AnimatePresence, m } from 'framer-motion';
import { WeddingData } from "./types";
import { useTranslation } from "@/i18n/LanguageProvider";

// Extracted Hook
import { useKhmerLegacy } from './khmer-legacy/useKhmerLegacy';

// Template Components
import { HeroSection } from './khmer-legacy/HeroSection';
import { BackgroundMusic } from './khmer-legacy/BackgroundMusic';
import { overlayVariants, containerVariants } from './khmer-legacy/animations';
import { KhmerInvitation } from './khmer-legacy/KhmerInvitation';
import { KhmerSchedule } from './khmer-legacy/KhmerSchedule';
import { EventCountdown } from './khmer-legacy/EventCountdown';
import { DynamicGallery } from "./khmer-legacy/DynamicGallery";
import { LoveStorySection } from "./khmer-legacy/LoveStorySection";
import { SacredBond } from "./khmer-legacy/SacredBond";
import { VideoSection } from "./khmer-legacy/VideoSection";
import { LocationMap } from './khmer-legacy/LocationMap';
import GiftSection from "./khmer-legacy/GiftSection";
import { ThankYouSection } from "./khmer-legacy/ThankYouSection";
import { FooterSection } from "./khmer-legacy/FooterSection";

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
        hubPan,
        mapPan,
        signaturePan1,
        signaturePan2,
        signaturePan3,
        signaturePan4,
        signaturePan5,
        signaturePan6,
        preWeddingPan1,
        preWeddingPan2,
        preWeddingPan3,
        preWeddingPan4,
        preWeddingPan5,
        preWeddingPan6,
        formattedDateHero,
        musicUrl,
        dynamicPool,
        mounted
    } = useKhmerLegacy(wedding);

    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        if (mounted) {
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }
    }, [mounted]);

    const primaryColor = wedding.themeSettings?.primaryColor || smartColors.primary || "#C5A027";

    const handleOpenEnvelope = () => {
        setRevealed(true);
        setIsPlaying(true);
        if (audioRef.current && musicUrl) {
            audioRef.current.play().catch((err) => {
                console.log("Autoplay policy prevented audio play:", err);
            });
        }
    };

    return (
        <div 
            style={{ "--primary": primaryColor } as React.CSSProperties}
            className="min-h-screen bg-[#FAF9F6] text-[#333] overflow-x-hidden selection:bg-[#E2D1B3] relative"
        >
            <style>{`
                :root {
                    --color-cream: #FFFFFF;
                    --color-ivory: #F9F9F9;
                    --color-gold-deep: #805C00;
                    --color-gold-main: ${primaryColor};
                    --color-gold-light: ${primaryColor};
                    --color-gold-shimmer: #FFF7E0;
                    --color-gold-glow: rgba(212, 175, 55, 0.5);
                    --color-text-main: #333333;
                    --primary: ${primaryColor};
                }

                .font-khmer-moul { font-family: var(--font-moul), serif; line-height: 1.8; }
                .font-khmer-content { font-family: var(--font-kantumruy), sans-serif; line-height: 2.2; }
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
                        #FFFFFF 50%, 
                        var(--color-gold-light) 55%, 
                        var(--color-gold-main) 80%, 
                        var(--color-gold-deep) 100%
                    );
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    display: inline-block;
                }

                .text-gold-embossed {
                    text-shadow: 
                        0 1px 1px rgba(0,0,0,0.1),
                        0 2px 4px rgba(139, 101, 8, 0.2);
                }

                .premium-shadow { 
                    text-shadow: 0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05); 
                }
            `}</style>

            {/* Client-only Background Music */}
            {mounted && (
                <BackgroundMusic 
                    wedding={wedding} 
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    audioRef={audioRef}
                />
            )}

            {/* CINEMATIC ENTRANCE OVERLAY */}
            <AnimatePresence mode="wait">
                {!revealed && (
                    <m.div
                        key="overlay"
                        variants={overlayVariants}
                        initial="initial"
                        exit="exit"
                        className="fixed inset-0 z-[100] flex flex-col justify-between items-center p-6 py-10 text-center select-none overflow-hidden bg-[#0A1226]"
                        style={{ isolation: 'isolate' }}
                    >
                        {/* Full Background (Pre-Wedding Photo or Botanical Garden Arch) */}
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <img
                                src={wedding.themeSettings?.coverImageUrl || heroImage || "/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg"} 
                                className="w-full h-full object-cover transform scale-100 filter brightness-[0.88] transition-transform duration-1000"
                                alt="Pre-wedding Cover"
                            />
                            {/* Soft Vignette & Radial Glow */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.15)_0%,_transparent_70%)] pointer-events-none" />
                        </div>
                        
                        {/* Top Area: Title & Couple Names in Royal Gold */}
                        <m.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="relative z-10 w-full max-w-lg mx-auto space-y-2.5 pt-6 sm:pt-10"
                        >
                            {/* Traditional Title with gold wings */}
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-6 sm:w-8 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
                                <h1 className="font-khmer-moul text-xs sm:text-sm md:text-base text-gold-gradient text-gold-embossed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] tracking-wider">
                                    {wedding.themeSettings?.customLabels?.invitationTitle || 
                                     (wedding.eventType === 'anniversary' 
                                        ? "សិរីមង្គលពិធីភ្ជាប់ពាក្យ" 
                                        : "សិរីមង្គលអាពាហ៍ពិពាហ៍")}
                                </h1>
                                <span className="w-6 sm:w-8 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
                            </div>

                            {/* Couple Names */}
                            <div className="space-y-0.5 pt-1">
                                <h2 className="font-khmer-moul text-2xl sm:text-3xl md:text-4xl text-gold-gradient text-gold-embossed drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)] tracking-wide">
                                    {wedding.groomName}
                                </h2>
                                <p className="text-xs text-[#D4AF37] font-khmer-moul drop-shadow-md py-0.5">និង</p>
                                <h2 className="font-khmer-moul text-2xl sm:text-3xl md:text-4xl text-gold-gradient text-gold-embossed drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)] tracking-wide">
                                    {wedding.brideName}
                                </h2>
                            </div>
                        </m.div>

                        {/* Middle Area: KEPT OPEN & CLEAR for unobstructed photo viewing */}
                        <div className="flex-1" />

                        {/* Bottom Area: Guest Pill + Royal Gold Open Envelope Button */}
                        <m.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="relative z-10 w-full max-w-xs space-y-3 pb-4 sm:pb-6"
                        >
                            {/* Clean One-Line Guest Pill in Khmer Moul */}
                            <div className="text-[11px] sm:text-xs text-amber-100 bg-black/50 backdrop-blur-md border border-[#D4AF37]/60 px-4 py-2.5 rounded-2xl font-khmer-moul shadow-lg drop-shadow-md">
                                <span className="text-amber-300/90 mr-1.5">សូមគោរពអញ្ជើញ៖</span>
                                <span className="text-amber-200">{guestName || "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី"}</span>
                            </div>
                                
                            {/* Royal Gold Open Button */}
                            <m.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleOpenEnvelope}
                                className="w-full py-3.5 px-6 rounded-2xl font-khmer-moul text-amber-200 bg-[#0A1226]/95 hover:bg-[#14234b] active:scale-95 transition-all text-xs sm:text-sm tracking-wider shadow-[0_4px_25px_rgba(212,175,55,0.35)] flex items-center justify-center gap-2 border-2 border-[#D4AF37] cursor-pointer pointer-events-auto"
                            >
                                <span>សូមចុចបើកធៀប</span>
                            </m.button>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* MAIN WEDDING INVITATION CONTENT */}
            <div className="max-w-[480px] md:max-w-none mx-auto bg-white min-h-screen relative font-serif-elegant">
                <div className="relative z-10">
                    
                    {/* ១. ផ្ទាំងទំព័រមុខ Hero Section */}
                    <m.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
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

                    {/* ២. សំបុត្រអញ្ជើញ & មាតាបិតាទាំងសងខាង (Khmer Formal Invitation & Parents) */}
                    <m.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <KhmerInvitation wedding={wedding} smartColors={smartColors} />
                    </m.div>

                    {/* ៣. សម្រង់ពាក្យសច្ចា & ចំណងនិស្ស័យ (Sacred Bond / Certificate - If Available) */}
                    <m.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                    >
                        <SacredBond wedding={wedding} />
                    </m.div>

                    {/* ៤. ដំណើររឿងរ៉ាវនៃក្តីស្រឡាញ់ (Love Story - If Configured) */}
                    {(wedding.themeSettings?.groomStory || wedding.themeSettings?.brideStory || wedding.themeSettings?.story?.kh) && (
                        <m.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <LoveStorySection wedding={wedding} />
                        </m.div>
                    )}

                    {/* ៥. កាលវិភាគពិធីសិរីមង្គល (Wedding Schedule / Itinerary) */}
                    {(wedding.themeSettings?.visibility as any)?.showTimeline !== false && wedding.activities && wedding.activities.length > 0 && (
                        <m.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <KhmerSchedule wedding={wedding} galleryImages={galleryImages} />
                        </m.div>
                    )}

                    {/* ៦. រាប់ថយក្រោយដល់ថ្ងៃសិរីមង្គល (Wedding Countdown) */}
                    <m.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <EventCountdown 
                            wedding={wedding} 
                            galleryImages={galleryImages} 
                            mounted={mounted} 
                            timeLeft={timeLeft} 
                            hubPan={hubPan} 
                        />
                    </m.div>

                    {/* ៧. កម្រងរូបភាពអនុស្សាវរីយ៍ (Pre-Wedding Dynamic Photo Gallery) */}
                    <m.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                        className="relative"
                    >
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

                    {/* ៨. វីដេអូអនុស្សាវរីយ៍ (Video Section - If provided) */}
                    {wedding.themeSettings?.videoUrl && (
                        <m.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                        >
                            <VideoSection wedding={wedding} />
                        </m.div>
                    )}



                    {/* ១០. ទីតាំងកម្មវិធី & ផែនទីនាំផ្លូវ (Location Map & GPS) */}
                    <m.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <LocationMap wedding={wedding} galleryImages={galleryImages} mapPan={mapPan} />
                    </m.div>

                    {/* ១១. ចូលរួមជូនពរ & ចំណងដៃ KHQR (Gift Section - If enabled) */}
                    {(wedding.themeSettings?.visibility as any)?.showGift !== false && (wedding.themeSettings?.bankAccounts?.length || wedding.themeSettings?.giftRegistry?.length) && (
                        <m.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <GiftSection wedding={wedding} />
                        </m.div>
                    )}

                    {/* ១២. សេចក្តីថ្លែងអំណរគុណ (Thank You Section) */}
                    <m.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5 }}
                    >
                        <ThankYouSection wedding={wedding} smartColors={smartColors} />
                    </m.div>

                    {/* Footer */}
                    <FooterSection wedding={wedding} />
                </div>
            </div>
        </div>
    );
}

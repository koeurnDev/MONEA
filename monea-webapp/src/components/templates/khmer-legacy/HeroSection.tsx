import { m } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { WeddingData } from '../types';
import { useTranslation } from '@/i18n/LanguageProvider';
import { PhotoImage } from '../shared/PhotoImage';
import { useState, useEffect } from 'react';

interface HeroSectionProps {
    wedding: WeddingData;
    heroImage: string;
    smartColors: { primary: string; secondary: string; dark: string };
    heroPan: any;
    formattedDateHero: string;
    isMobile?: boolean;
}

export function HeroSection({ wedding, heroImage, smartColors, heroPan, formattedDateHero, isMobile }: HeroSectionProps) {
    const { t, locale } = useTranslation();
    const isAnniversary = wedding.eventType === 'anniversary';
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <section id="hero" className="relative min-h-[100dvh] lg:min-h-[93vh] lg:max-h-[960px] flex flex-col justify-between items-center text-center overflow-hidden p-4 py-8 sm:p-6 sm:py-12 select-none bg-[#1a1a1a]">
            {/* Background Full-Color Image */}
            <m.div
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 z-0"
            >
                {wedding.themeSettings?.videoUrl && !isMobile ? (
                    <div className="w-full h-full relative">
                        <iframe
                            src={`https://www.youtube.com/embed/${wedding.themeSettings.videoUrl.split('v=')[1] || wedding.themeSettings.videoUrl.split('/').pop()}?autoplay=1&mute=1&loop=1&playlist=${wedding.themeSettings.videoUrl.split('v=')[1] || wedding.themeSettings.videoUrl.split('/').pop()}&controls=0&showinfo=0&rel=0&modestbranding=1`}
                            className="absolute inset-0 w-full h-full pointer-events-none scale-[1.5]"
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                        />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />
                    </div>
                ) : (
                    <>
                        {heroImage && (
                            <div className="absolute inset-0 bg-[#1a1a1a]">
                                {/* Main Image - responsive fit */}
                                <PhotoImage
                                    src={heroImage} 
                                    className={`w-full h-full transition-none ${heroPan.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                    style={{
                                        objectFit: isMobile ? 'contain' : 'cover',  // contain = show full image on mobile
                                        objectPosition: 'center center',
                                        transform: `scale(${wedding.themeSettings?.heroImageScale || 1})`,
                                        filter: `brightness(${wedding.themeSettings?.heroImageBrightness || 100}%) contrast(${wedding.themeSettings?.heroImageContrast || 100}%)`,
                                        userSelect: 'none',
                                        touchAction: 'none',
                                        willChange: isMobile ? 'transform' : 'object-position, transform'
                                    }}
                                    onMouseDown={(e) => {
                                        if (!isMobile) {
                                            e.stopPropagation();
                                            heroPan.onStart(e);
                                        }
                                    }}
                                    onTouchStart={(e) => {
                                        if (!isMobile) {
                                            e.stopPropagation();
                                            heroPan.onStart(e);
                                        }
                                    }}
                                    draggable={false}
                                    alt="Wedding Hero"
                                />
                            </div>
                        )}
                        {/* Minimal gradient - only at edges for text */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/15 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                    </>
                )}
            </m.div>

            {/* Top Area: Subtitle & Couple Names in Royal Gold Metallic Gradient */}
            <m.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 1 }}
                className="relative z-10 w-full max-w-lg mx-auto space-y-3 pt-6 sm:pt-12"
            >
                {/* Subtitle with gold accents */}
                <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D4AF37]/35 bg-black/20 px-4 py-2 backdrop-blur-sm shadow-[0_12px_24px_rgba(0,0,0,0.18)] mx-auto">
                    <span className="w-5 sm:w-7 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
                    <h3 className="font-khmer-moul text-[10px] sm:text-xs md:text-sm text-gold-gradient text-gold-embossed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] tracking-[0.18em] uppercase">
                        {wedding.themeSettings?.customLabels?.heroSubtitle || 
                         (isAnniversary ? "សិរីមង្គលពិធីភ្ជាប់ពាក្យ" : "សិរីមង្គលអាពាហ៍ពិពាហ៍")}
                    </h3>
                    <span className="w-5 sm:w-7 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
                </div>
                
                {/* Couple Names */}
                <div className="space-y-2 w-full pt-1">
                    {wedding.themeSettings?.customTypographyUrl ? (
                        <div 
                            className="flex justify-center py-4 relative" 
                            style={{ 
                                transform: `scale(${(wedding.themeSettings.customTypographyScale || 100) / 100}) translateY(${wedding.themeSettings.customTypographyY || 0}px)`, 
                                transformOrigin: 'center' 
                            }}
                        >
                            <img 
                                src={wedding.themeSettings.customTypographyUrl} 
                                alt={`${wedding.groomName} and ${wedding.brideName}`} 
                                className="h-20 sm:h-24 md:h-28 w-auto object-contain"
                                style={{ filter: `drop-shadow(${wedding.themeSettings.customTypographyDropShadow || '0px 2px 4px rgba(0,0,0,0.5)'})` }}
                            />
                        </div>
                    ) : (
                        <>
                            {(wedding.groomName || wedding.brideName) && (
                                <>
                                    <h1
                                        aria-label={[
                                            wedding.groomName,
                                            wedding.groomName && wedding.brideName
                                                ? wedding.themeSettings?.customLabels?.andLabel || "និង"
                                                : undefined,
                                            wedding.brideName,
                                        ].filter(Boolean).join(" ")}
                                        className="text-3xl sm:text-4xl md:text-5xl font-khmer-moul text-gold-gradient text-gold-embossed drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] tracking-[0.08em] leading-tight py-0.5"
                                    >
                                        {wedding.groomName && <span className="block">{wedding.groomName}</span>}
                                        {wedding.groomName && wedding.brideName && (
                                            <span aria-hidden="true" className="block text-xs sm:text-sm text-[#D4AF37] tracking-[0.32em] py-0.5">
                                                {wedding.themeSettings?.customLabels?.andLabel || "និង"}
                                            </span>
                                        )}
                                        {wedding.brideName && <span aria-hidden="true" className="block">{wedding.brideName}</span>}
                                    </h1>
                                </>
                            )}
                        </>
                    )}
                </div>
            </m.div>

            {/* Middle Area: Left open & unobstructed for couple photo */}
            <div className="flex-1" />

            {/* Bottom Area: Direct Golden Date Typography & Sleek Minimalist Calendar Pill */}
            <m.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="relative z-10 flex flex-col items-center space-y-3 w-full max-w-sm px-4 pb-6 sm:pb-8"
            >
                {/* Direct Golden Date with Side Accent Lines */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
                    <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
                    <p className="font-khmer-moul text-xs sm:text-sm md:text-base text-gold-gradient text-gold-embossed drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] tracking-wide whitespace-nowrap">
                        {formattedDateHero}
                    </p>
                    <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
                </div>

                {/* Sleek Minimalist Glass Calendar Pill */}
                <m.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                        const type = isAnniversary ? t("common.anniversary") : t("common.wedding");
                        const title = t("invitation.calendar.eventTitle", { groom: wedding.groomName, bride: wedding.brideName });
                        const details = t("invitation.calendar.eventDetails", { groom: wedding.groomName, bride: wedding.brideName });
                        const location = wedding.location || (locale === 'km' ? `កម្មវិធី${type}` : `${type} Event`);
                        const start = new Date(wedding.date).toISOString().replace(/-|:|\.\d\d\d/g, "");
                        const end = new Date(new Date(wedding.date).getTime() + 6*60*60*1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
                        
                        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
                        window.open(url, '_blank');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/35 backdrop-blur-md border border-[#D4AF37]/40 text-amber-200 hover:text-white font-khmer-moul text-[11px] sm:text-xs shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:bg-black/55 hover:border-[#D4AF37] active:scale-95 transition-all cursor-pointer pointer-events-auto"
                >
                    <Calendar size={13} className="text-[#D4AF37]" />
                    <span>{wedding.themeSettings?.customLabels?.heroButton || t("template.khmerLegacy.heroButton") || "រក្សាទុកក្នុងប្រតិទិន"}</span>
                </m.button>
            </m.div>
        </section>
    );
}

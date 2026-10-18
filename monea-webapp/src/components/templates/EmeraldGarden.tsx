import React, { useState, useRef, useEffect } from 'react';
import { Heart, Volume2, VolumeX } from 'lucide-react';
import { WeddingData, TemplateProps } from './types';
import { EntranceEnvelope } from './emerald-garden/EntranceEnvelope';
import { HeroSection } from './emerald-garden/HeroSection';
import { ParentsSection } from './emerald-garden/ParentsSection';
import { ScheduleSection } from './emerald-garden/ScheduleSection';
import { LocationSection } from './emerald-garden/LocationSection';
import { GallerySection } from './emerald-garden/GallerySection';
import { GiftSection } from './emerald-garden/GiftSection';
import { ThankYouSection } from './emerald-garden/ThankYouSection';
import { getTemplatePaletteStyles } from "@/lib/template-color-palette";
import { isSectionVisible } from "./shared/template-settings";
import { GuestbookSection } from "./shared/GuestbookSection";

export const EmeraldGarden: React.FC<TemplateProps> = ({ wedding, guestName, config }) => {
    const [revealed, setRevealed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const handleForceReveal = () => setRevealed(true);
        window.addEventListener('FORCE_REVEAL', handleForceReveal);
        return () => window.removeEventListener('FORCE_REVEAL', handleForceReveal);
    }, []);

    const primaryColor = wedding.themeSettings?.primaryColor || "#1B4332";
    const cardColor = wedding.themeSettings?.emeraldCardColor || "#ffffff";
    const paperStyles = getTemplatePaletteStyles(wedding.themeSettings, "#1B4332", cardColor);
    const musicUrl = wedding.themeSettings?.musicUrl;
    const loveStory = wedding.themeSettings?.loveStory?.trim() || wedding.themeSettings?.story?.kh?.trim() || "";
    const storyImages = wedding.themeSettings?.storyImages?.filter(Boolean) || [];
    const storyImage = storyImages[0];

    const handleOpenEnvelope = () => {
        setRevealed(true);
        window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
        if (audioRef.current && musicUrl) {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch((e) => console.log("Audio autoplay prevented:", e));
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    };

    return (
        <div
            style={{
                ...paperStyles,
                "--emerald-card-surface": paperStyles["--monea-paper-color"],
            } as React.CSSProperties}
            className="monea-full-palette khmer-readable-type-system w-full bg-[#0A1A14] font-kantumruy text-slate-800 relative min-h-screen selection:bg-emerald-600 selection:text-white"
        >
            {/* Background Audio */}
            {musicUrl && (
                <audio ref={audioRef} id="bg-music" src={musicUrl} loop preload="none" />
            )}

            {/* Entrance Envelope Overlay */}
            <EntranceEnvelope
                wedding={wedding}
                guestName={guestName}
                revealed={revealed}
                onOpen={handleOpenEnvelope}
                primaryColor={primaryColor}
            />

            {/* Floating Music Control Button */}
            {revealed && musicUrl && (
                <button
                    onClick={togglePlay}
                    className="invitation-floating-control fixed bottom-6 z-40 w-11 h-11 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md border border-emerald-300 text-emerald-700 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    aria-label="Toggle Music"
                >
                    {isPlaying ? <Volume2 size={18} className="animate-pulse" /> : <VolumeX size={18} />}
                </button>
            )}

            {revealed && (
            <main className="monea-paper-canvas relative max-w-[540px] mx-auto min-h-screen shadow-2xl bg-white flex flex-col" style={{ backgroundColor: "var(--emerald-card-surface)" }}>
                {/* 1. Hero Section */}
                <HeroSection wedding={wedding} primaryColor={primaryColor} />

                {/* 2. Parents Formal Invitation Section */}
                <ParentsSection wedding={wedding} primaryColor={primaryColor} />

                {isSectionVisible(config, "story") && (loveStory || storyImage) && (
                    <section className="relative isolate overflow-hidden bg-[#0d241a] px-5 py-16 text-center text-emerald-50 sm:py-20">
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,.14),transparent_60%)]" />
                        <div className="relative mx-auto max-w-md px-5 py-8 sm:px-8">
                            <Heart aria-hidden="true" className="mx-auto mb-3 h-6 w-6 fill-emerald-200/30 text-amber-300" />
                            <h2 className="font-khmer-moul text-xl leading-relaxed text-amber-100 sm:text-2xl">
                                {wedding.themeSettings?.customLabels?.storyTitle || "រឿងរ៉ាវស្នេហារបស់យើង"}
                            </h2>
                            {loveStory && (
                                <p className="mt-5 whitespace-pre-line break-words text-sm leading-8 text-emerald-50/90 sm:text-base">
                                    {loveStory}
                                </p>
                            )}
                            {storyImages.length > 0 && (
                                <div className={`mt-6 grid gap-3 ${storyImages.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                                    {storyImages.map((image, index) => (
                                        <figure key={`${image}-${index}`}>
                                            <img
                                                src={image}
                                                alt={`រូបភាពរឿងរ៉ាវស្នេហាទី ${index + 1}`}
                                                className="max-h-[28rem] aspect-[4/3] w-full rounded-2xl object-cover"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            {wedding.themeSettings?.storyImageCaptions?.[index]?.trim() && (
                                                <figcaption className="mt-2 text-sm leading-relaxed text-amber-100/90">
                                                    {wedding.themeSettings.storyImageCaptions[index]}
                                                </figcaption>
                                            )}
                                        </figure>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* 3. Schedule & Timeline Section */}
                {isSectionVisible(config, "timeline") && (
                    <ScheduleSection wedding={wedding} primaryColor={primaryColor} title={config.labels.scheduleTitle} />
                )}

                {/* 4. Location & Map Section */}
                {isSectionVisible(config, "map") && (
                    <LocationSection wedding={wedding} primaryColor={primaryColor} />
                )}

                {/* 5. Memory Photo Gallery */}
                {isSectionVisible(config, "gallery") && (
                    <GallerySection wedding={wedding} primaryColor={primaryColor} />
                )}

                {/* 6. Gift & Bank Accounts */}
                {isSectionVisible(config, "gift") && (
                    <GiftSection wedding={wedding} primaryColor={primaryColor} />
                )}

                {isSectionVisible(config, "guestbook") && <GuestbookSection wedding={wedding} unboxed />}

                {/* 7. Thank You & Blessings */}
                <ThankYouSection wedding={wedding} primaryColor={primaryColor} />
            </main>
            )}
        </div>
    );
};

export default EmeraldGarden;

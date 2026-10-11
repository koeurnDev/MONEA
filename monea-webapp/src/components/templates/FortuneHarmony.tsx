import React, { useState, useRef, useEffect } from 'react';
import { Heart, Volume2, VolumeX } from 'lucide-react';
import { WeddingData, TemplateProps } from './types';
import { EntranceEnvelope } from './fortune-harmony/EntranceEnvelope';
import { HeroSection } from './fortune-harmony/HeroSection';
import { ParentsSection } from './fortune-harmony/ParentsSection';
import { ScheduleSection } from './fortune-harmony/ScheduleSection';
import { LocationSection } from './fortune-harmony/LocationSection';
import { GallerySection } from './fortune-harmony/GallerySection';
import { GiftSection } from './fortune-harmony/GiftSection';
import { ThankYouSection } from './fortune-harmony/ThankYouSection';
import { getTemplatePaletteStyles } from "@/lib/template-color-palette";
import { isSectionVisible } from "./shared/template-settings";
import { GuestbookSection } from "./shared/GuestbookSection";

export const FortuneHarmony: React.FC<TemplateProps> = ({ wedding, guestName, config }) => {
    const [revealed, setRevealed] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const handleForceReveal = () => setRevealed(true);
        window.addEventListener('FORCE_REVEAL', handleForceReveal);
        return () => window.removeEventListener('FORCE_REVEAL', handleForceReveal);
    }, []);

    const primaryColor = wedding.themeSettings?.primaryColor || "#D4AF37";
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
            style={getTemplatePaletteStyles(wedding.themeSettings, "#D4AF37", "#FDFBF7")}
            className="monea-full-palette monea-paper-canvas m05-type-system w-full font-kantumruy bg-[#FDFBF7] text-[#2d352b] relative min-h-screen selection:bg-amber-400 selection:text-red-950"
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
                    className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/60 text-amber-300 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    aria-label="Toggle Music"
                >
                    {isPlaying ? <Volume2 size={18} className="animate-pulse" /> : <VolumeX size={18} />}
                </button>
            )}

            {revealed && (
            <main className="monea-paper-canvas relative z-10 mx-auto flex min-h-screen max-w-[540px] flex-col overflow-hidden bg-transparent shadow-2xl">
                <div className="absolute inset-0 bg-[#f7f2eb]/5" />
                {/* 1. Hero Section */}
                <HeroSection wedding={wedding} primaryColor={primaryColor} />

                {/* 2. Parents Formal Invitation Section */}
                <ParentsSection wedding={wedding} primaryColor={primaryColor} />

                {isSectionVisible(config, "story") && (loveStory || storyImage) && (
                    <section className="relative overflow-hidden bg-[#3b070e] px-5 py-16 text-center text-[#fff5e8] sm:py-20">
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,.2),transparent_65%)]" />
                        <div className="relative mx-auto max-w-md rounded-[2rem] border border-amber-300/30 bg-[#4b0b13]/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,.25)] sm:p-8">
                            <Heart aria-hidden="true" className="mx-auto mb-3 h-6 w-6 fill-amber-200/30 text-amber-300" />
                            <h2 className="font-khmer-moul text-xl leading-relaxed text-amber-100 sm:text-2xl">
                                {wedding.themeSettings?.customLabels?.storyTitle || "រឿងរ៉ាវស្នេហារបស់យើង"}
                            </h2>
                            <div className="mx-auto mb-5 mt-3 h-px w-16 bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
                            {loveStory && (
                                <p className="whitespace-pre-line break-words text-sm leading-8 text-[#fff5e8]/90 sm:text-base">
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
                                                className="max-h-[28rem] aspect-[4/3] w-full rounded-2xl border border-amber-200/30 object-cover shadow-xl"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            {wedding.themeSettings?.storyImageCaptions?.[index]?.trim() && (
                                                <figcaption className="mt-2 text-sm leading-relaxed text-[#fff5e8]/90">
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

                {isSectionVisible(config, "guestbook") && <GuestbookSection wedding={wedding} />}

                {/* 7. Thank You & Blessings */}
                <ThankYouSection wedding={wedding} primaryColor={primaryColor} />
            </main>
            )}
        </div>
    );
};

export default FortuneHarmony;

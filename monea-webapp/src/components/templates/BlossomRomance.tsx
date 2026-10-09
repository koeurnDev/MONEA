import React, { useState, useRef, useEffect } from 'react';
import { Heart, Volume2, VolumeX } from 'lucide-react';
import { WeddingData, TemplateProps } from './types';
import { EntranceEnvelope } from './blossom-romance/EntranceEnvelope';
import { HeroSection } from './blossom-romance/HeroSection';
import { ParentsSection } from './blossom-romance/ParentsSection';
import { ScheduleSection } from './blossom-romance/ScheduleSection';
import { LocationSection } from './blossom-romance/LocationSection';
import { GallerySection } from './blossom-romance/GallerySection';
import { GiftSection } from './blossom-romance/GiftSection';
import { ThankYouSection } from './blossom-romance/ThankYouSection';
import { getTemplatePaletteStyles } from "@/lib/template-color-palette";
import { isSectionVisible } from "./shared/template-settings";
import { GuestbookSection } from "./shared/GuestbookSection";

export const BlossomRomance: React.FC<TemplateProps> = ({ wedding, guestName, config }) => {
    const [revealed, setRevealed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const handleForceReveal = () => setRevealed(true);
        window.addEventListener('FORCE_REVEAL', handleForceReveal);
        return () => window.removeEventListener('FORCE_REVEAL', handleForceReveal);
    }, []);

    const primaryColor = wedding.themeSettings?.primaryColor || "#B45309";
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
            style={getTemplatePaletteStyles(wedding.themeSettings, "#B45309")}
            className="monea-full-palette m05-type-system w-full bg-[#F5EBE6] font-kantumruy text-slate-800 relative min-h-screen selection:bg-rose-500 selection:text-white"
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
                    className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md border border-rose-200 text-rose-600 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    aria-label="Toggle Music"
                >
                    {isPlaying ? <Volume2 size={18} className="animate-pulse" /> : <VolumeX size={18} />}
                </button>
            )}

            {/* Mount invitation sections only after the guest opens the envelope. */}
            {revealed && (
            <main className="relative max-w-[540px] mx-auto min-h-screen bg-transparent flex flex-col">
                {/* 1. Hero Section */}
                <HeroSection wedding={wedding} primaryColor={primaryColor} />

                {/* 2. Parents Formal Invitation Section */}
                <ParentsSection wedding={wedding} primaryColor={primaryColor} />

                {isSectionVisible(config, "story") && (loveStory || storyImage) && (
                    <section className="bg-gradient-to-b from-[#fff9f5] to-[#f5ebe6] px-5 py-16 text-center">
                        <div className="mx-auto max-w-md rounded-[2rem] border border-rose-200/80 bg-white/80 p-6 shadow-[0_18px_45px_rgba(100,45,45,.08)] sm:p-8">
                            <Heart aria-hidden="true" className="mx-auto mb-3 h-6 w-6 fill-rose-200 text-rose-500" />
                            <h2 className="font-khmer-moul text-xl leading-relaxed text-rose-950 sm:text-2xl">
                                {wedding.themeSettings?.customLabels?.storyTitle || "រឿងរ៉ាវស្នេហារបស់យើង"}
                            </h2>
                            <div className="mx-auto mb-5 mt-3 h-px w-16 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
                            {loveStory && (
                                <p className="whitespace-pre-line break-words text-sm leading-8 text-slate-700 sm:text-base">
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
                                                className="max-h-[28rem] aspect-[4/3] w-full rounded-2xl object-cover shadow-md"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            {wedding.themeSettings?.storyImageCaptions?.[index]?.trim() && (
                                                <figcaption className="mt-2 text-sm leading-relaxed text-slate-700">
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

export default BlossomRomance;

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Heart, Quote } from 'lucide-react';
import type { WeddingData } from '../types';
import { getWeddingSectionPhoto } from "../shared/weddingPhotos";

export const AnniversaryStory = ({ wedding }: { wedding: WeddingData }) => {
    const [likes, setLikes] = useState(128);
    const [hasLiked, setHasLiked] = useState(false);
    const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);

    const settings = wedding.themeSettings as any;
    const title = settings?.customLabels?.storyTitle || "ផ្តើមស្នេហ៍";
    
    const storyText = settings?.loveStory || settings?.story?.kh;

    const storyImages: string[] = Array.isArray(settings?.storyImages) ? settings.storyImages.filter(Boolean) : [];
    const storyPhoto = storyImages[0] || (storyText?.trim()
        ? getWeddingSectionPhoto(wedding, "story")?.url
        : undefined);
    const displayedStoryImages = storyImages.length > 0 ? storyImages : storyPhoto ? [storyPhoto] : [];
    if (!storyText?.trim() && storyImages.length === 0) return null;

    const handleHeartClick = () => {
        if (!hasLiked) {
            setLikes(prev => prev + 1);
            setHasLiked(true);
        }
        const newHeart = { id: Date.now(), x: Math.random() * 40 - 20 };
        setFloatingHearts(prev => [...prev, newHeart]);
        setTimeout(() => {
            setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
        }, 1200);
    };

    return (
        <section className="py-16 px-4 bg-[#F1ECE5] font-kantumruy relative overflow-hidden" id="story">
            <div className="max-w-xl mx-auto space-y-6 text-center">
                
                {/* Header */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#F0E3D1] flex items-center justify-center text-[#966B4E] mb-1 shadow-sm">
                        <Heart className="w-5 h-5 fill-[#966B4E]" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-khmer-moul text-[#633E42] leading-relaxed">
                        {title}
                    </h2>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#CBAF78] to-transparent mx-auto mt-1" />
                </div>

                {/* Romantic Story Keepsake Card */}
                {storyPhoto && <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-[#FBF9F5] p-5 sm:p-7 rounded-[2rem] border border-[#D9C6AA] shadow-[0_18px_45px_rgba(75,55,40,0.10)] space-y-5 text-center relative overflow-hidden"
                >
                    {/* Romantic story photos */}
                    {displayedStoryImages.length > 0 && (
                        <div className={`grid gap-3 ${displayedStoryImages.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                            {displayedStoryImages.map((image, index) => (
                                <figure key={`${image}-${index}`}>
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#D9C6AA] bg-slate-100 shadow-md sm:rounded-3xl">
                                        <img
                                            src={image}
                                            alt={`Our Love Story Moment ${index + 1}`}
                                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    {storyImages[index] && settings?.storyImageCaptions?.[index]?.trim() && (
                                        <figcaption className="mt-2 text-sm leading-relaxed text-[#633E42]">
                                            {settings.storyImageCaptions[index]}
                                        </figcaption>
                                    )}
                                </figure>
                            ))}
                        </div>
                    )}

                    {/* Story Quote Body */}
                    {storyText && <div className="relative px-2 sm:px-4 py-2 space-y-2.5">
                        <Quote className="w-7 h-7 text-[#CBAF78] mx-auto -rotate-6 opacity-80" />
                        
                        <p className="text-xs sm:text-sm text-slate-700 font-kantumruy leading-relaxed text-center font-normal px-2">
                            {storyText}
                        </p>
                    </div>}

                    {/* Interactive Send Love Button */}
                    <div className="pt-2 flex items-center justify-center relative">
                        <button
                            onClick={handleHeartClick}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold font-kantumruy transition-all shadow-sm active:scale-95 border ${
                                hasLiked 
                                    ? 'bg-rose-50 border-rose-300 text-rose-600' 
                                    : 'bg-white hover:bg-rose-50/50 border-rose-200 text-[#633E42]'
                            }`}
                        >
                            <Heart size={15} className={hasLiked ? "fill-rose-500 text-rose-500 animate-bounce" : "text-rose-500 fill-rose-100"} />
                            <span className="text-[#633E42]">ផ្ញើក្តីស្រឡាញ់</span>
                            <span className="font-mono text-[#633E42] bg-[#F0E3D1] px-2 py-0.5 rounded-full text-[11px] border border-[#D9C6AA]">
                                {likes}
                            </span>
                        </button>

                        {/* Floating Hearts Animation */}
                        <AnimatePresence>
                            {floatingHearts.map(heart => (
                                <m.div
                                    key={heart.id}
                                    initial={{ opacity: 1, y: 0, scale: 0.8, x: heart.x }}
                                    animate={{ opacity: 0, y: -60, scale: 1.4 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="absolute bottom-10 pointer-events-none text-rose-500 text-base"
                                >
                                    ❤️
                                </m.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </m.div>}
            </div>
        </section>
    );
};

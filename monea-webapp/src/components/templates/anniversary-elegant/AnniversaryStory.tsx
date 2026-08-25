import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Heart, Quote } from 'lucide-react';
import type { WeddingData } from '../types';

export const AnniversaryStory = ({ wedding }: { wedding: WeddingData }) => {
    const [likes, setLikes] = useState(128);
    const [hasLiked, setHasLiked] = useState(false);
    const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);

    const settings = wedding.themeSettings as any;
    const title = settings?.customLabels?.storyTitle || "ផ្តើមស្នេហ៍";
    
    const defaultStory = "ដំណើររឿងសេចក្តីស្រឡាញ់របស់យើងខ្ញុំ បានចាប់ផ្តើមឡើងដោយក្តីស្រលាញ់ ភាពស្មោះត្រង់ និងការយោគយល់គ្នា។ ពីថ្ងៃដែលបានជួបគ្នាដំបូង រហូតមកដល់ថ្ងៃដែលយើងខ្ញុំបានសម្រេចចិត្តរួមដំណើរជីវិតជាមួយគ្នា ដើម្បីកសាងអនាគតដ៏មានសុភមង្គល និងពោរពេញដោយស្នាមញញឹម។";
    const storyText = settings?.loveStory || settings?.story?.kh || defaultStory;

    const storyPhoto = wedding.galleryItems?.[6]?.url || 
                       wedding.galleryItems?.[1]?.url || 
                       wedding.galleryItems?.[0]?.url || 
                       '/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg';

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
        <section className="py-14 px-4 bg-[#FAF7F2] font-kantumruy relative overflow-hidden" id="story">
            <div className="max-w-xl mx-auto space-y-6 text-center">
                
                {/* Header */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mb-1 shadow-sm">
                        <Heart className="w-5 h-5 fill-purple-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-khmer-moul text-[#3B0764] leading-relaxed">
                        {title}
                    </h2>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-1" />
                </div>

                {/* Romantic Story Keepsake Card */}
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white p-5 sm:p-7 rounded-[2.5rem] border-2 border-purple-200/80 shadow-[0_12px_40px_rgba(76,29,149,0.08)] space-y-5 text-center relative overflow-hidden"
                >
                    {/* Top: Clean Romantic Framed Couple Photo without Text Overlay */}
                    <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border-2 border-purple-100 bg-slate-100 group">
                        <img 
                            src={storyPhoto} 
                            alt="Our Love Story Moment" 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                        />
                    </div>

                    {/* Story Quote Body */}
                    <div className="relative px-2 sm:px-4 py-2 space-y-2.5">
                        <Quote className="w-7 h-7 text-purple-300 mx-auto -rotate-6 opacity-70" />
                        
                        <p className="text-xs sm:text-sm text-slate-700 font-kantumruy leading-relaxed text-center font-normal px-2">
                            {storyText}
                        </p>
                    </div>

                    {/* Interactive Send Love Button */}
                    <div className="pt-2 flex items-center justify-center relative">
                        <button
                            onClick={handleHeartClick}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold font-kantumruy transition-all shadow-sm active:scale-95 border ${
                                hasLiked 
                                    ? 'bg-rose-50 border-rose-300 text-rose-600' 
                                    : 'bg-white hover:bg-rose-50/50 border-rose-200 text-[#3B0764]'
                            }`}
                        >
                            <Heart size={15} className={hasLiked ? "fill-rose-500 text-rose-500 animate-bounce" : "text-rose-500 fill-rose-100"} />
                            <span className="text-[#3B0764]">ផ្ញើក្តីស្រឡាញ់</span>
                            <span className="font-mono text-purple-900 bg-purple-50 px-2 py-0.5 rounded-full text-[11px] border border-purple-200">
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
                </m.div>
            </div>
        </section>
    );
};

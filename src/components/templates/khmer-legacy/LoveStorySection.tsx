"use client";

import React from 'react';
import { m } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { WeddingData } from '../types';
import { RevealSection } from '../shared/CinematicComponents';
import { useTranslation } from '@/i18n/LanguageProvider';

export function LoveStorySection({ wedding }: { wedding: WeddingData }) {
    const { t } = useTranslation();
    const story = wedding.themeSettings?.story;
    
    // Default placeholder text to check against
    const defaultKh = "ដំណើររឿងសេចក្តីស្រឡាញ់របស់យើងខ្ញុំ បានចាប់ផ្តើមឡើងដោយក្តីស្រលាញ់ និងការយោគយល់គ្នា។ យើងខ្ញុំបានសម្រេចចិត្តរួមរស់ជាមួយគ្នា ដើម្បីកសាងគ្រួសារដ៏មានសុភមង្គលមួយ។";

    // If story is missing or still exactly the default placeholder, hide the section
    if (!story || !story.kh || story.kh.trim() === "" || story.kh === defaultKh) {
        return null;
    }

    const firstChar = story.kh.charAt(0);
    const restOfStory = story.kh.slice(1);

    return (
        <section id="our-story" className="py-16 md:py-24 bg-[#FDFBF7] relative overflow-hidden px-8">
            {/* PETAL FALL ANIMATION */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                    <m.div
                        key={i}
                        initial={{ 
                            opacity: 0, 
                            y: -100, 
                            x: Math.random() * 100 + '%',
                            rotate: 0 
                        }}
                        animate={{ 
                            opacity: [0, 0.4, 0], 
                            y: 1000,
                            x: (Math.random() * 110 - 5) + '%',
                            rotate: 360 
                        }}
                        transition={{ 
                            duration: 15 + Math.random() * 20, 
                            delay: i * 3, 
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute text-gold/10"
                    >
                        <div className="scale-[0.5] md:scale-100">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>
                    </m.div>
                ))}
            </div>

            <div className="absolute inset-0 opacity-[0.03] pointer-events-none premium-texture" />
            
            <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="flex items-center gap-4 text-gold-main/30">
                            <Sparkles size={20} />
                            <p className="font-playfair text-[10px] md:text-xs tracking-[0.8em] text-gold-main/80 uppercase font-black italic">
                                {wedding.themeSettings?.customLabels?.storyBadge || t("template.khmerLegacy.storyBadge")}
                            </p>
                            <Sparkles size={20} />
                        </div>
                        <h2 className="font-khmer-moul text-4xl md:text-6xl text-gold-gradient text-gold-embossed tracking-wider leading-relaxed">
                            {wedding.themeSettings?.customLabels?.storyTitle || t("template.khmerLegacy.storyTitle")}
                        </h2>
                        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-main/20 to-transparent mx-auto" />
                    </div>

                <RevealSection>
                    <div className="bg-white/60 backdrop-blur-2xl border border-white/60 p-8 md:p-16 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden group text-center">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 transition-all duration-1000">
                            <Heart size={400} fill="currentColor" className="text-gold-main" />
                        </div>
                        
                        <div className="space-y-16 relative z-10">
                            <div className="space-y-10">
                                <p className="font-khmer-content text-2xl md:text-4xl leading-[2.6] text-slate-800 font-black italic">
                                    <span className="float-left text-7xl md:text-9xl font-khmer-moul text-gold-main mr-8 mt-2 leading-[0.8] drop-shadow-sm select-none">
                                        {firstChar}
                                    </span>
                                    {restOfStory}
                                </p>
                            </div>
                            
                            <div className="h-[1.5px] w-48 bg-gradient-to-r from-transparent via-gold-main/20 to-transparent mx-auto" />
                            
                            {story.en && (
                                <p className="font-playfair text-xl md:text-3xl text-slate-600 leading-relaxed max-w-2xl mx-auto italic font-black">
                                    &ldquo;{story.en}&rdquo;
                                </p>
                            )}

                            <div className="pt-12">
                                <m.div 
                                    animate={{ 
                                        scale: [1, 1.15, 1],
                                        boxShadow: ["0 0 0px rgba(177,147,86,0)", "0 0 20px rgba(177,147,86,0.2)", "0 0 0px rgba(177,147,86,0)"]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold-main/5 text-gold-main border border-gold-main/20 shadow-inner"
                                >
                                    <Heart size={32} fill="currentColor" className="drop-shadow-sm" />
                                </m.div>
                            </div>
                        </div>
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}

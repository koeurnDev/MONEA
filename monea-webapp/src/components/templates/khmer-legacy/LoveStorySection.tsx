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

    return (
        <section id="our-story" className="py-12 md:py-24 bg-[#FAF9F6] relative overflow-hidden px-4 sm:px-8">
            <div className="max-w-3xl mx-auto space-y-8 relative z-10">
                <RevealSection>
                    {/* Header */}
                    <div className="text-center space-y-3 mb-8">
                        <div className="flex items-center justify-center gap-3">
                            <span className="w-8 h-[1px] bg-[#9C7A3C]/40" />
                            <span className="font-khmer-moul text-xs text-[#9C7A3C] tracking-wide">
                                {wedding.themeSettings?.customLabels?.storyBadge || "ដំណើរនៃក្តីស្រឡាញ់"}
                            </span>
                            <span className="w-8 h-[1px] bg-[#9C7A3C]/40" />
                        </div>
                        <h2 className="font-khmer-moul text-2xl sm:text-3xl md:text-4xl text-[#0A1226] tracking-wide leading-relaxed">
                            {wedding.themeSettings?.customLabels?.storyTitle || "ប្រវត្តិស្នេហារបស់យើង"}
                        </h2>
                    </div>

                    {/* Story Card */}
                    <div className="bg-white p-6 sm:p-10 md:p-12 rounded-3xl shadow-sm border border-amber-200/60 text-center relative overflow-hidden space-y-6">
                        <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#9C7A3C]">
                            <Heart size={22} fill="currentColor" />
                        </div>

                        {/* Full Khmer Text (No broken substring slicing) */}
                        <p className="font-kantumruy font-normal text-sm sm:text-base md:text-lg leading-relaxed sm:leading-loose text-slate-700 max-w-xl mx-auto whitespace-pre-line">
                            {story.kh}
                        </p>

                        {/* Optional English Quote */}
                        {story.en && (
                            <div className="pt-4 border-t border-amber-200/40">
                                <p className="font-playfair italic text-xs sm:text-sm text-[#9C7A3C] max-w-lg mx-auto">
                                    &ldquo;{story.en}&rdquo;
                                </p>
                            </div>
                        )}
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}

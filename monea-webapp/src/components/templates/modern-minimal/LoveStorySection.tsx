import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from '../types';
// next/image replaced with <img>;

export function LoveStorySection({ wedding }: { wedding: WeddingData }) {
    const story = wedding.themeSettings?.story;
    const images = wedding.themeSettings?.storyImages || [];
    
    // Default placeholder text to check against
    const defaultKh = "ដំណើររឿងសេចក្តីស្រឡាញ់របស់យើងខ្ញុំ បានចាប់ផ្តើមឡើងដោយក្តីស្រលាញ់ និងការយោគយល់គ្នា។ យើងខ្ញុំបានសម្រេចចិត្តរួមរស់ជាមួយគ្នា ដើម្បីកសាងគ្រួសារដ៏មានសុភមង្គលមួយ។";

    // If story is missing or still exactly the default placeholder, hide the section
    if (!story || !story.kh || story.kh.trim() === "" || story.kh === defaultKh) {
        return null;
    }

    return (
        <section className="py-24 md:py-32 bg-white relative">
            <div className="max-w-4xl mx-auto px-6">
                <m.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-2xl md:text-4xl font-kantumruy font-bold text-slate-900 tracking-normal mb-4">
                        សាច់រឿងស្នេហា
                    </h2>
                    <div className="w-12 h-1 bg-slate-900 mx-auto mb-6" />
                    <p className="text-slate-400 text-xs font-bold tracking-[0.4em] uppercase">
                        Our Love Story
                    </p>
                </m.div>

                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                    {/* Story Text */}
                    <m.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full md:w-1/2"
                    >
                        <p className="font-kantumruy text-slate-600 leading-relaxed text-justify relative z-10 text-lg md:text-xl first-letter:float-left first-letter:font-suwannaphum first-letter:text-6xl first-letter:md:text-8xl first-letter:text-slate-900 first-letter:mr-4 first-letter:mt-2 first-letter:leading-[0.8] first-letter:drop-shadow-sm first-letter:font-black">
                            {story.kh}
                        </p>
                    </m.div>

                    {/* Story Images Grid */}
                    {images.length > 0 && (
                        <m.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="w-full md:w-1/2 relative"
                        >
                            <div className="relative aspect-[4/5] w-full max-w-sm mx-auto">
                                <img 
                                    src={images[0]}
                                    alt="Our Story" 
                                    className="object-cover rounded-xl shadow-2xl filter grayscale-[20%]"
                                />
                                {images.length > 1 && (
                                    <div className="absolute -bottom-8 -right-8 w-1/2 aspect-square border-4 border-white shadow-xl rounded-xl overflow-hidden z-20 hidden md:block">
                                        <img 
                                            src={images[1]}
                                            alt="Memory" 
                                            className="object-cover filter grayscale-[10%]"
                                        />
                                    </div>
                                )}
                            </div>
                        </m.div>
                    )}
                </div>
            </div>
        </section>
    );
}

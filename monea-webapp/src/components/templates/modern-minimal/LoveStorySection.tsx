import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from '../types';
// next/image replaced with <img>;

export function LoveStorySection({ wedding }: { wedding: WeddingData }) {
    const storyText = wedding.themeSettings?.story?.kh || wedding.themeSettings?.loveStory || "";
    const images = wedding.themeSettings?.storyImages?.filter(Boolean) || [];
    
    // Default placeholder text to check against
    const defaultKh = "ដំណើររឿងសេចក្តីស្រឡាញ់របស់យើងខ្ញុំ បានចាប់ផ្តើមឡើងដោយក្តីស្រលាញ់ និងការយោគយល់គ្នា។ យើងខ្ញុំបានសម្រេចចិត្តរួមរស់ជាមួយគ្នា ដើម្បីកសាងគ្រួសារដ៏មានសុភមង្គលមួយ។";

    // If story is missing or still exactly the default placeholder, hide the section
    if ((!storyText.trim() || storyText === defaultKh) && images.length === 0) {
        return null;
    }

    return (
        <section className="py-24 md:py-32 bg-white relative">
            <div className="max-w-4xl mx-auto px-5 sm:px-6">
                <m.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10 md:mb-16"
                >
                    <h2 className="text-2xl md:text-4xl font-kantumruy font-bold text-slate-900 tracking-normal mb-4">
                        សាច់រឿងស្នេហា
                    </h2>
                    <div className="w-12 h-1 bg-slate-900 mx-auto mb-6" />
                </m.div>

                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                    {/* Story Text */}
                    <m.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full md:w-1/2"
                    >
                        {storyText.trim() && storyText !== defaultKh && (
                            <p className="font-kantumruy text-slate-600 text-base md:text-xl leading-8 md:leading-loose text-left md:text-justify relative z-10">
                                {storyText}
                            </p>
                        )}
                    </m.div>

                    {/* Story Images Grid */}
                    {images.length > 0 && (
                        <m.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="w-full md:w-1/2 relative"
                        >
                            <div className={`grid w-full gap-3 ${images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                                {images.map((image, index) => (
                                    <figure key={`${image}-${index}`}>
                                        <img
                                            src={image}
                                            alt={`Our story memory ${index + 1}`}
                                            className="aspect-[4/5] w-full rounded-xl object-cover filter grayscale-[10%]"
                                            loading="lazy"
                                        />
                                        {wedding.themeSettings?.storyImageCaptions?.[index]?.trim() && (
                                            <figcaption className="mt-2 text-center text-sm leading-relaxed text-slate-600">
                                                {wedding.themeSettings.storyImageCaptions[index]}
                                            </figcaption>
                                        )}
                                    </figure>
                                ))}
                            </div>
                        </m.div>
                    )}
                </div>
            </div>
        </section>
    );
}

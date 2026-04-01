"use client";

import React from 'react';
import { RevealSection } from '../shared/CinematicComponents';
import { WeddingData } from '../types';

interface VideoSectionProps {
    wedding: WeddingData;
}

export function VideoSection({ wedding }: VideoSectionProps) {
    const videoUrl = wedding.themeSettings?.videoUrl;
    if (!videoUrl) return null;

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYoutubeId(videoUrl);

    return (
        <section className="py-32 md:py-64 px-8 md:px-12 bg-[#FDFBF7] relative overflow-hidden">
             {/* Studio Atmosphere */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none premium-texture" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-main/20 to-transparent" />

            <RevealSection>
                <div className="max-w-5xl mx-auto space-y-20">
                    <div className="text-center space-y-6">
                        <div className="flex items-center justify-center gap-4 text-gold-main/30">
                            <div className="w-8 h-[1px] bg-gold-main/20" />
                            <p className="font-playfair text-[10px] md:text-xs tracking-[0.8em] text-gold-main/60 uppercase font-black italic">
                                {wedding.themeSettings?.customLabels?.videoBadge || "Cinematic Memory"}
                            </p>
                            <div className="w-8 h-[1px] bg-gold-main/20" />
                        </div>
                        <h3 className="font-khmer-moul text-3xl md:text-5xl text-gold-gradient text-gold-embossed tracking-wider leading-relaxed">
                            {wedding.themeSettings?.customLabels?.videoTitle || "វីដេអូអនុស្សាវរីយ៍"}
                        </h3>
                    </div>
                    
                    <div className="rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] aspect-video bg-black relative border-[12px] md:border-[24px] border-white group ring-1 ring-gold-main/10">
                        {videoId ? (
                            <iframe
                                title="Wedding Video"
                                className="w-full h-full transition-transform duration-1000 group-hover:scale-[1.02]"
                                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="eager"
                            />
                        ) : (
                            <video src={videoUrl} controls className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]" />
                        )}
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none rounded-[1.5rem] md:rounded-[3rem]" />
                        
                        {/* Glassmorphic Overlay for Play State (conceptual) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    </div>

                    <div className="flex justify-center pt-8">
                         <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-gold-main/20 to-transparent" />
                    </div>
                </div>
            </RevealSection>
        </section>
    );
}

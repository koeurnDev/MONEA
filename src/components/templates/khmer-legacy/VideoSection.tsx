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
        <section className="py-24 px-8 md:px-12 bg-white relative overflow-hidden">
            <RevealSection>
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <p className="font-khmer text-[10px] md:text-sm tracking-[0.4em] text-gray-400 uppercase font-bold">
                            {wedding.themeSettings?.customLabels?.videoBadge || "វីដេអូអនុស្សាវរីយ៍"}
                        </p>
                        <h3 className="font-khmer-moul text-lg md:text-xl text-gold/80">
                            {wedding.themeSettings?.customLabels?.videoTitle || "វីដេអូអនុស្សាវរីយ៍"}
                        </h3>
                    </div>
                    
                    <div className="rounded-2xl overflow-hidden shadow-2xl aspect-video bg-black relative border-lux group">
                        {videoId ? (
                            <iframe
                                title="Wedding Video"
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="eager"
                            />
                        ) : (
                            <video src={videoUrl} controls className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none rounded-2xl" />
                    </div>
                </div>
            </RevealSection>
        </section>
    );
}

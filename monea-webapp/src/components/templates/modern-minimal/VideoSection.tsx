"use client";
import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from '../types';

export function VideoSection({ wedding }: { wedding: WeddingData }) {
    const videoUrl = wedding.themeSettings?.videoUrl;
    if (!videoUrl) return null;

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYoutubeId(videoUrl);

    return (
        <section className="py-24 md:py-32 bg-slate-900 relative">
            <div className="max-w-5xl mx-auto px-6">
                <m.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-kantumruy font-black text-white tracking-widest uppercase mb-4">
                        វីដេអូអនុស្សាវរីយ៍
                    </h2>
                    <div className="w-12 h-1 bg-white/30 mx-auto mb-6" />
                    <p className="text-white/50 text-xs font-bold tracking-[0.4em] uppercase">
                        Cinematic Memory
                    </p>
                </m.div>

                <m.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative bg-black group"
                >
                    {videoId ? (
                        <iframe
                            title="Wedding Video"
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        />
                    ) : (
                        <video src={videoUrl} controls className="w-full h-full object-cover" />
                    )}
                </m.div>
            </div>
        </section>
    );
}

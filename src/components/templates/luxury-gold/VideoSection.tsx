import React from 'react';
import { getYoutubeId } from './shared';

interface VideoSectionProps {
    videoUrl: string | undefined;
}

export default function VideoSection({ videoUrl }: VideoSectionProps) {
    if (!videoUrl) return null;

    return (
        <section className="bg-black py-10 px-0">
            <div className="aspect-[16/9] w-full border-y border-[#D4AF37]/30">
                {getYoutubeId(videoUrl) ? (
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${getYoutubeId(videoUrl)}?color=white&controls=0`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <video src={videoUrl} controls className="w-full h-full" />
                )}
            </div>
        </section>
    );
}

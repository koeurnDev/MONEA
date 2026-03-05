import React from 'react';
import { getYoutubeId } from './shared';

interface VideoSectionProps {
    videoUrl: string | undefined;
}

export default function VideoSection({ videoUrl }: VideoSectionProps) {
    if (!videoUrl) return null;

    return (
        <section className="px-4 py-8">
            <div className="rounded-xl overflow-hidden shadow-lg aspect-video bg-black relative">
                {getYoutubeId(videoUrl) ? (
                    <iframe
                        title="Wedding Video"
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${getYoutubeId(videoUrl)}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                    />
                ) : (
                    <video src={videoUrl} controls className="w-full h-full" />
                )}
            </div>
        </section>
    );
}

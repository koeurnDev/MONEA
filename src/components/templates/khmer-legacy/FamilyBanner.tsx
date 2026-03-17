"use client";

import { m } from 'framer-motion';
import Image from 'next/image';
import { RevealSection, CinematicPlaceholder } from '../shared/CinematicComponents';

interface FamilyBannerProps {
    galleryImages: string[];
    bannerPan: any;
}

export function FamilyBanner({ galleryImages, bannerPan }: FamilyBannerProps) {
    return (
        <section className="w-full py-24 md:py-48 flex flex-col items-center bg-white space-y-16">
            <div className="max-w-6xl mx-auto w-full px-8">
                <RevealSection>
                    <div className="text-center space-y-6 mb-12">
                        <p className="font-khmer text-xl md:text-3xl text-gray-300 font-bold uppercase tracking-widest">គ្រឹះនៃក្ដីស្រឡាញ់</p>
                    </div>
                </RevealSection>
            </div>
            <div 
                className="w-full aspect-[16/9] md:aspect-[21/7] overflow-hidden grayscale-[5%] hover:grayscale-0 transition-all [transition-duration:2s] bg-gold/5 flex items-center justify-center relative shadow-inner md:shadow-none"
            >
                {galleryImages[6] ? (
                    <Image 
                        src={galleryImages[6]} 
                        className={`w-full h-full object-cover grayscale-[0.5] contrast-125 transition-all duration-1000 ${bannerPan.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-110'}`} 
                        style={{ 
                            objectPosition: `${bannerPan.localX} ${bannerPan.localY}`,
                            userSelect: 'none',
                            touchAction: 'none'
                        }}
                        onMouseDown={bannerPan.onStart}
                        onTouchStart={bannerPan.onStart}
                        draggable={false}
                        alt="Golden Legacy" 
                        fill
                        sizes="100vw"
                    />
                ) : (
                    <CinematicPlaceholder label="រូបភាពគ្រួសារ" />
                )}
            </div>
        </section>
    );
}

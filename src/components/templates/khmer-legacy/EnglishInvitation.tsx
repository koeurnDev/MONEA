import * as React from "react";
import Image from 'next/image';
import { WeddingData } from "../types";
import { RevealSection, CinematicPlaceholder } from '../shared/CinematicComponents';

export function EnglishInvitation({
    wedding,
    galleryImages,
    smartColors,
    englishPan
}: {
    wedding: WeddingData;
    galleryImages: string[];
    smartColors: { primary: string; secondary: string; dark: string };
    englishPan: any;
}) {
    return (
        <section id="invitation-english" className="pt-12 md:pt-48 pb-16 md:pb-40 px-4 md:px-12 text-left md:text-left relative overflow-hidden">
            {galleryImages.length > 0 && (
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-24">
                    <div className="w-full md:flex-1 space-y-6 md:space-y-10 relative z-10 flex flex-col items-center md:items-start text-center md:text-left pt-8">
                        {/* Khmer Symbol Watermark */}
                        <div className="absolute top-0 right-0 md:-right-20 opacity-[0.07] pointer-events-none select-none -z-10 w-full aspect-square max-w-[300px] md:max-w-[500px]">
                            <Image 
                                src="/images/assets/khmer-symbol.png" 
                                fill 
                                className="object-contain" 
                                style={{ mixBlendMode: 'multiply' }}
                                alt="" 
                            />
                        </div>

                        {/* Parents Section */}
                        <RevealSection>
                            <div className="grid grid-cols-2 gap-8 md:gap-16 w-full font-gisha text-gray-700 font-bold tracking-wide text-[14px] md:text-[18px]">
                                <div className="space-y-1 flex flex-col items-center md:items-start">
                                    <p>Mr. {wedding.themeSettings?.parents?.groomFather || ""}</p>
                                    <p>& Mrs. {wedding.themeSettings?.parents?.groomMother || ""}</p>
                                </div>
                                <div className="space-y-1 flex flex-col items-center md:items-start">
                                    <p>Mr. {wedding.themeSettings?.parents?.brideFather || ""}</p>
                                    <p>& Mrs. {wedding.themeSettings?.parents?.brideMother || ""}</p>
                                </div>
                            </div>
                        </RevealSection>

                        <RevealSection delay={0.1}>
                            <div className="space-y-4 md:space-y-6 flex flex-col items-center md:items-start">
                                <p className="font-clarendon text-[14px] md:text-[18px] text-gray-600 leading-relaxed italic max-w-[450px]">
                                    Cordially Request the honour of your presence On the Auspicious Occasion of the Wedding of our Children
                                </p>
                            </div>
                        </RevealSection>

                        <RevealSection delay={0.2}>
                            <div className="grid grid-cols-2 gap-8 md:gap-16 pt-8 w-full">
                                <div className="space-y-4 flex flex-col items-center md:items-start">
                                    <p className="font-clarendon text-[11px] md:text-sm tracking-[0.4em] text-gold/50 uppercase font-black">Groom&apos;s</p>
                                    <h2
                                        style={{ color: smartColors.primary, textShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                                        className="font-gisha text-4xl xs:text-5xl md:text-7xl font-black tracking-tight leading-tight"
                                    >
                                        {wedding.groomName}
                                    </h2>
                                    <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent w-full" />
                                </div>
                                
                                <div className="space-y-4 flex flex-col items-center md:items-start">
                                    <p className="font-clarendon text-[11px] md:text-sm tracking-[0.4em] text-gold/50 uppercase font-black">Bride&apos;s</p>
                                    <h2
                                        style={{ color: smartColors.primary, textShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                                        className="font-gisha text-4xl xs:text-5xl md:text-7xl font-black tracking-tight leading-tight"
                                    >
                                        {wedding.brideName}
                                    </h2>
                                    <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent w-full" />
                                </div>
                            </div>
                        </RevealSection>

                        <RevealSection delay={0.3}>
                            <div className="pt-8 md:pt-12">
                                <p className="font-clarendon text-[16px] md:text-[18px] text-gray-700 leading-loose max-w-[500px]">
                                    Which Will Be Held On Wednesday 7th February 2009,<br />
                                    At 4:00 pm. At the Bride’s House,<br />
                                    KrangAth Village, Kampongseila Commune,<br />
                                    Kampongseila District,<br />
                                    Preahsihanouk Province. Thank You!
                                </p>
                            </div>
                        </RevealSection>
                    </div>

                    <div className="w-full md:flex-1 flex justify-center md:justify-end">
                        <div 
                            className="aspect-[3/4] w-full max-w-[280px] md:max-w-md rounded-sm overflow-hidden shadow-2xl border-lux rotate-[1deg] md:rotate-[2deg] relative bg-gold/5"
                        >
                            {galleryImages[11 % galleryImages.length] ? (
                                <Image 
                                    src={galleryImages[11 % galleryImages.length]} 
                                    fill 
                                    sizes="(max-width: 768px) 50vw, 33vw" 
                                    className={`object-cover ${englishPan?.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-105'}`} 
                                    style={{ 
                                        objectPosition: `${englishPan?.localX} ${englishPan?.localY}`,
                                        transform: `scale(${wedding.themeSettings?.englishImageScale || 1})`,
                                        userSelect: 'none',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={englishPan?.onStart}
                                    onTouchStart={englishPan?.onStart}
                                    draggable={false}
                                    decoding="async" 
                                    alt="Couple" 
                                    loading="eager" 
                                />
                            ) : (
                                <CinematicPlaceholder label="The Couple" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

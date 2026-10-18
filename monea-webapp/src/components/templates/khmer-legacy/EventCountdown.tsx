import * as React from "react";
import { m } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { RevealSection } from '../shared/CinematicComponents';
import { WeddingData } from "../types";
import { useTranslation } from "@/i18n/LanguageProvider";
import { getWeddingSectionPhoto } from "../shared/weddingPhotos";

export function EventCountdown({
    wedding,
    mounted,
    timeLeft,
    hubPan
}: {
    wedding: WeddingData;
    mounted: boolean;
    timeLeft: { days: number; hours: number; minutes: number; seconds: number };
    hubPan: any;
}) {
    const { t } = useTranslation();
    const countdownPhoto = getWeddingSectionPhoto(wedding, "couple")?.url;
    const daysStr = mounted ? String(timeLeft.days).padStart(2, '0') : '--';
    const hoursStr = mounted ? String(timeLeft.hours).padStart(2, '0') : '--';
    const minsStr = mounted ? String(timeLeft.minutes).padStart(2, '0') : '--';
    const secondsStr = mounted ? String(timeLeft.seconds).padStart(2, '0') : '--';

    return (
        <section id="countdown" className="relative overflow-hidden bg-white px-4 py-10 text-center font-kantumruy">
            {/* Background subtle luxury glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] md:w-[1000px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.04)_0%,_transparent_70%)] pointer-events-none" />

            <div className="relative z-10 mx-auto w-full max-w-sm">
                <RevealSection>
                    <div className="grid grid-cols-1 items-center gap-6">
                        {/* Left: Countdown Block */}
                        <div className="flex flex-col items-center justify-center space-y-3">
                            {/* Cursive Gold Title with proper padding to prevent right clipping */}
                            <div className="px-3 py-1">
                                <h3 className="inline-block whitespace-nowrap font-playfair text-3xl font-bold italic leading-tight text-gold-gradient drop-shadow-sm">
                                    Countdown
                                </h3>
                            </div>

                            <div className="grid w-full grid-cols-4 gap-1 pt-2">
                                {[
                                    { label: "DAYS", value: daysStr },
                                    { label: "HOURS", value: hoursStr },
                                    { label: "MINUTES", value: minsStr },
                                    { label: "SECONDS", value: secondsStr },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex min-w-0 flex-col items-center gap-1">
                                        <span className="min-h-9 whitespace-nowrap font-playfair text-2xl font-black leading-9 tabular-nums tracking-tight text-[#805C00]">
                                            {value}
                                        </span>
                                        <span className="whitespace-nowrap font-playfair text-[8px] font-black uppercase tracking-[0.12em] text-[#805C00]/80">
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Khmer Subtitle Badge */}
                            <p className="font-kantumruy text-xs text-[#805C00]/90 font-bold pt-2">
                                {wedding.themeSettings?.customLabels?.countdownLabel || "រាប់ថយក្រោយដល់ថ្ងៃសិរីមង្គល"}
                            </p>
                        </div>

                        {/* Right: Landscape Photo (Slot 1: Countdown) */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl group">
                            {countdownPhoto ? (
                                <img 
                                    src={countdownPhoto}
                                    className={`h-full w-full rounded-xl object-cover transition-all duration-1000 ${hubPan.isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'}`}
                                    style={{ 
                                        objectPosition: `${hubPan.localX || '50%'} ${hubPan.localY || '50%'}`,
                                        userSelect: 'none',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={hubPan.onStart}
                                    onTouchStart={hubPan.onStart}
                                    draggable={false}
                                    alt="Wedding Countdown" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Calendar className="w-12 h-12 text-[#9C7A3C]/40" />
                                </div>
                            )}
                        </div>
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}

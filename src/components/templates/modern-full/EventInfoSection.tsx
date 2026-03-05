import React, { useState, useEffect } from 'react';
import { WeddingData } from "../types";
import { cn } from './shared';

interface EventInfoSectionProps {
    wedding: WeddingData;
    labels: any;
    primaryColor: string;
}

export default function EventInfoSection({ wedding, labels, primaryColor }: EventInfoSectionProps) {
    const displayDate = React.useMemo(() => {
        const eventDate = wedding.date ? new Date(wedding.date) : new Date();
        const isValidDate = !isNaN(eventDate.getTime());
        return isValidDate ? eventDate : new Date();
    }, [wedding.date]);

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const diff = Math.max(0, displayDate.getTime() - now);
            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / (1000 * 60)) / 1000)
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000); // Need seconds precision now

        return () => clearInterval(timer);
    }, [displayDate.getTime()]);

    const TimeBox = ({ val, label }: { val: number, label: string }) => (
        <div className="flex flex-col items-center">
            <div className="w-10 h-12 md:w-20 md:h-24 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg transition-all duration-300">
                <span className="text-lg md:text-4xl font-bold text-white font-mono drop-shadow-md">
                    {String(val).padStart(2, '0')}
                </span>
            </div>
            <span className="text-[8px] md:text-sm text-pink-200 mt-1 md:mt-2 font-khmer drop-shadow-sm opacity-80">{label}</span>
        </div>
    );

    return (
        <section className="px-4 py-8 mx-auto max-w-lg relative z-10 -mt-16 space-y-12 transition-all duration-500">

            {/* Top Row: Date & Time Cards */}
            <div className="flex gap-3 px-2">
                {/* Date Card */}
                <div className="flex-1 bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center h-24 md:h-32 shadow-xl hover:bg-black/40 transition-colors will-change-transform">
                    <h3 className="text-2xl md:text-4xl font-bold text-white font-cinzel drop-shadow-lg leading-none mb-1">
                        {displayDate.getDate()}
                    </h3>
                    <p className="text-[8px] md:text-sm uppercase tracking-[0.1em] md:tracking-[0.2em] text-pink-200 font-cinzel opacity-90 text-center font-khmer truncate w-full">
                        {displayDate.toLocaleDateString('km-KH', { month: 'long' })}
                    </p>
                </div>

                {/* Time Card */}
                <div className="flex-1 bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center h-24 md:h-32 shadow-xl hover:bg-black/40 transition-colors will-change-transform">
                    <h3 className="text-lg md:text-2xl font-bold text-white font-cinzel drop-shadow-lg leading-none mb-1 md:mb-2">
                        {displayDate.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })}
                    </h3>
                    <p className="text-[8px] md:text-sm uppercase tracking-widest text-pink-200 font-khmer opacity-90">
                        {labels.time_label || "វេលា"}
                    </p>
                </div>
            </div>

            {/* Countdown Timer */}
            <div className="text-center">
                <h3 className="text-sm md:text-lg font-kantumruy text-pink-300 mb-6 uppercase tracking-widest drop-shadow-md opacity-90 break-words px-2 font-bold">
                    {labels.countdown_title || (wedding.eventType === 'anniversary' ? "រាប់ថយក្រោយដល់ថ្ងៃខួប" : "រាប់ថយក្រោយដល់ថ្ងៃពិសេស")}
                </h3>
                <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
                    <TimeBox val={timeLeft.days} label="ថ្ងៃ" />
                    <TimeBox val={timeLeft.hours} label="ម៉ោង" />
                    <TimeBox val={timeLeft.minutes} label="នាទី" />
                    <TimeBox val={timeLeft.seconds} label="វិនាទី" />
                </div>
            </div>

            {/* Calendar Month View */}
            <div className="border-t border-white/10 border-dashed pt-8">
                <h3 className="text-center text-xl font-bold mb-6 text-pink-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-kantumruy tracking-widest opacity-80">
                    ( {displayDate.getFullYear()} )
                </h3>

                <div className="max-w-xs mx-auto">
                    {/* Headers */}
                    <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-sm mb-4">
                        {['អា', 'ច', 'អ', 'ព', 'ព្រ', 'សុ', 'ស'].map((d, i) => (
                            <span key={i} className="text-pink-300/80 text-[10px] md:text-xs font-bold font-khmer">{d}</span>
                        ))}
                    </div>

                    {/* Dates Grid */}
                    <div className="grid grid-cols-7 gap-y-3 gap-x-1 md:gap-y-4 md:gap-x-2 text-center text-sm">
                        {/* Empty padding days for start of month */}
                        {Array.from({ length: new Date(displayDate.getFullYear(), displayDate.getMonth(), 1).getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square"></div>
                        ))}

                        {/* Actual Days */}
                        {Array.from({ length: new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                            const day = i + 1;
                            const isEventDay = day === displayDate.getDate();
                            return (
                                <div key={i} className="flex items-center justify-center relative group cursor-default h-8 md:h-10 w-full">
                                    {isEventDay && (
                                        <div className="absolute w-7 h-7 md:w-9 md:h-9 bg-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.6)] animate-pulse-slow"></div>
                                    )}
                                    <span className={cn(
                                        "relative z-10 text-[10px] md:text-sm font-cinzel transition-colors duration-300",
                                        isEventDay ? "text-white font-bold" : "text-white/50 group-hover:text-white"
                                    )}>
                                        {day}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

        </section>
    );
}

// Ensure global styles or imports cover fonts

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Heart } from 'lucide-react';
import { WeddingData } from '../types';

interface HeroSectionProps {
    wedding: WeddingData;
    primaryColor: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ wedding, primaryColor }) => {
    const isEngagement = wedding.eventType === 'anniversary';
    const groomName = wedding.groomName || "កូនកំលោះ";
    const brideName = wedding.brideName || "កូនក្រមុំ";
    const eventDate = wedding.date ? new Date(wedding.date) : new Date();

    // Countdown State
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTime = () => {
            const difference = +eventDate - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };
        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [wedding.date]);

    // Format Khmer Date
    const formatKhmerDate = (date: Date) => {
        const monthsKh = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
        const day = date.getDate();
        const month = monthsKh[date.getMonth()];
        const year = date.getFullYear();
        return `ថ្ងៃទី ${day} ខែ ${month} ឆ្នាំ ${year}`;
    };

    return (
        <section className="relative w-full min-h-[640px] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center space-y-6 pt-16 pb-12">
                {/* Header Tag */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-1"
                >
                    <span className="text-xl sm:text-2xl font-khmer-moul text-[#5d604e] tracking-wider block">
                        {isEngagement ? "សិរីសួស្តី ពិធីភ្ជាប់ពាក្យ" : "សិរីមង្គលអាពាហ៍ពិពាហ៍"}
                    </span>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#9ea58a] to-transparent mx-auto mt-1" />
                </motion.div>

                {/* Monogram / Crest */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mt-4 flex items-center justify-center gap-4 text-[#7a8f65]"
                    style={{ fontFamily: 'serif' }}
                >
                    <span className="h-px w-10 bg-[#96a087]" />
                    <span className="text-[28px] leading-none tracking-[0.2em]">◆</span>
                    <span className="h-px w-10 bg-[#96a087]" />
                </motion.div>

                {/* Couple Names */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="space-y-2 py-2"
                >
                    <h1 className="m05-font-name text-3xl sm:text-4xl font-khmer-moul text-[#2d352b]">
                        {groomName}
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                        <span className="h-px w-10 bg-[#98a78e]" />
                        <Heart size={16} className="text-[#5b6a53] fill-[#5b6a53]" />
                        <span className="h-px w-10 bg-[#98a78e]" />
                    </div>
                    <h1 className="m05-font-name text-3xl sm:text-4xl font-khmer-moul text-[#2d352b]">
                        {brideName}
                    </h1>
                </motion.div>

                {/* Date Display */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="space-y-1.5"
                >
                    <p className="text-sm sm:text-base font-bold font-khmer-moul text-[#4d5649] inline-block">
                        📅 {formatKhmerDate(eventDate)}
                    </p>
                    {wedding.themeSettings?.lunarDate && (
                        <p className="text-xs text-[#7a5d6a] font-khmer-moul">
                            {wedding.themeSettings.lunarDate}
                        </p>
                    )}
                </motion.div>

                {/* Live Countdown Timer */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex items-center justify-center gap-3 pt-2"
                >
                    {[
                        { label: "ថ្ងៃ", value: timeLeft.days },
                        { label: "ម៉ោង", value: timeLeft.hours },
                        { label: "នាទី", value: timeLeft.minutes },
                        { label: "វិនាទី", value: timeLeft.seconds },
                    ].map((item, idx) => (
                        <div key={idx} className="min-w-[54px] text-center">
                            <span className="text-lg sm:text-xl font-bold font-khmer-moul text-[#881337] block leading-none">
                                {item.value < 10 ? `0${item.value}` : item.value}
                            </span>
                            <span className="text-[10px] font-khmer-moul text-[#5d604e] block mt-1">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

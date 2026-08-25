import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
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

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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

    const formatKhmerDate = (date: Date) => {
        const monthsKh = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
        const day = date.getDate();
        const month = monthsKh[date.getMonth()];
        const year = date.getFullYear();
        return `ថ្ងៃទី ${day} ខែ ${month} ឆ្នាំ ${year}`;
    };

    return (
        <section className="relative w-full min-h-[640px] bg-[#F4F9F6] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {/* Background Image with Botanical Arch */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-95"
                style={{ backgroundImage: `url('/assets/emerald-garden/emerald-garden-bg.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/70" />

            <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center space-y-6 pt-16 pb-12">
                {/* Header Tag */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-1"
                >
                    <span className="text-xl sm:text-2xl font-khmer-moul text-[#1B4332] tracking-wider drop-shadow-sm block">
                        {isEngagement ? "សិរីមង្គលពិធីភ្ជាប់ពាក្យ" : "សិរីមង្គលអាពាហ៍ពិពាហ៍"}
                    </span>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-emerald-600 to-transparent mx-auto mt-1" />
                </motion.div>

                {/* Monogram / Crest */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="w-20 h-20 rounded-full border-2 border-emerald-300 bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-emerald-800 font-serif italic text-2xl"
                >
                    {groomName[0]} & {brideName[0]}
                </motion.div>

                {/* Couple Names */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="space-y-2 py-2"
                >
                    <h1 className="text-3xl sm:text-4xl font-khmer-moul text-[#1B4332] drop-shadow-md">
                        {groomName}
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                        <span className="h-px w-10 bg-emerald-300" />
                        <Heart size={16} className="text-emerald-600 fill-emerald-600" />
                        <span className="h-px w-10 bg-emerald-300" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-khmer-moul text-[#1B4332] drop-shadow-md">
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
                    <p className="text-sm sm:text-base font-bold font-kantumruy text-slate-800 bg-white/85 backdrop-blur-md px-5 py-2 rounded-full border border-emerald-200/80 shadow-sm inline-block">
                        📅 {formatKhmerDate(eventDate)}
                    </p>
                    {wedding.themeSettings?.lunarDate && (
                        <p className="text-xs text-emerald-900/80 font-kantumruy">
                            {wedding.themeSettings.lunarDate}
                        </p>
                    )}
                </motion.div>

                {/* Live Countdown Timer */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="grid grid-cols-4 gap-2.5 w-full max-w-xs pt-2"
                >
                    {[
                        { label: "ថ្ងៃ", value: timeLeft.days },
                        { label: "ម៉ោង", value: timeLeft.hours },
                        { label: "នាទី", value: timeLeft.minutes },
                        { label: "វិនាទី", value: timeLeft.seconds },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white/90 backdrop-blur-md border border-emerald-200/80 rounded-2xl p-2.5 shadow-sm text-center">
                            <span className="text-lg sm:text-xl font-bold font-mono text-[#1B4332] block">
                                {item.value < 10 ? `0${item.value}` : item.value}
                            </span>
                            <span className="text-[10px] font-kantumruy text-slate-600 block">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

"use client";

import * as React from "react";
import { AnimatePresence, m } from "framer-motion";

interface CountdownTimerProps {
    targetDate: string | Date;
}

export const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
    const [timeLeft, setTimeLeft] = React.useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    React.useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft(null); // Event passed or now
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) {
        return (
            <div className="text-center text-pink-500 font-bold text-xl animate-pulse">
                🎉 ថ្ងៃមង្គលការបានមកដល់ហើយ! 🎉
            </div>
        );
    }

    const timeUnits = [
        { label: "ថ្ងៃ (Days)", value: timeLeft.days },
        { label: "ម៉ោង (Hrs)", value: timeLeft.hours },
        { label: "នាទី (Mins)", value: timeLeft.minutes },
        { label: "វិនាទី (Secs)", value: timeLeft.seconds },
    ];

    return (
        <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 py-6">
            {timeUnits.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                    <m.div
                        key={item.value}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-pink-100 flex items-center justify-center text-lg sm:text-2xl md:text-3xl font-bold text-[#8E5A5A]"
                    >
                        {item.value < 10 ? `0${item.value}` : item.value}
                    </m.div>
                    <span className="text-[10px] sm:text-xs text-gray-500 mt-2 font-medium uppercase tracking-wider">
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

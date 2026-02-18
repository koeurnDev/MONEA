"use client";
import { useState, useEffect } from "react";
import { differenceInSeconds } from "date-fns";

interface CountdownProps {
    targetDate: Date | string;
}

export default function Countdown({ targetDate }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const target = new Date(targetDate);

        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = target.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    mins: Math.floor((difference / 1000 / 60) % 60),
                    secs: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    if (!isClient) return null; // Avoid hydration mismatch

    return (
        <div className="bg-zinc-900 py-12 text-white text-center font-siemreap border-y border-white/5">
            <h3 className="text-pink-500 font-bold mb-8 tracking-widest text-sm uppercase">Counting Down</h3>
            <div className="flex justify-center gap-3 sm:gap-6 px-4">
                {Object.entries(timeLeft).map(([label, value]) => (
                    <div key={label} className="flex flex-col items-center">
                        <div className="bg-gradient-to-br from-pink-600 to-pink-700 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-900/20 mb-2 border border-pink-500/20">
                            <span className="text-2xl sm:text-3xl font-bold font-mono">{value}</span>
                        </div>
                        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400">
                            {label === 'days' ? 'ថ្ងៃ' : label === 'hours' ? 'ម៉ោង' : label === 'mins' ? 'នាទី' : 'វិនាទី'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

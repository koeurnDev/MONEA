import React, { useState, useEffect } from 'react';
import { WeddingData } from "../types";
import { MapPin } from 'lucide-react';
import { MoneaBranding } from '@/components/MoneaBranding';

export default function Footer({ wedding }: { wedding: WeddingData }) {
    const targetDate = new Date(wedding.date).getTime();
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(interval);
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <footer className="relative py-24 px-6 text-center border-t border-[#D4AF37]/20 bg-[#050A08]">
            <div className="max-w-4xl mx-auto">
                <h3 className="font-cinzel text-3xl text-white mb-12">Countdown To Forever</h3>

                <div className="flex justify-center gap-8 md:gap-16 mb-16 text-[#D4AF37]">
                    <div className="flex flex-col">
                        <span className="text-4xl md:text-6xl font-cinzel font-bold">{timeLeft.days}</span>
                        <span className="text-xs uppercase tracking-widest mt-2 text-gray-400">Days</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-4xl md:text-6xl font-cinzel font-bold">{timeLeft.hours}</span>
                        <span className="text-xs uppercase tracking-widest mt-2 text-gray-400">Hours</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-4xl md:text-6xl font-cinzel font-bold">{timeLeft.minutes}</span>
                        <span className="text-xs uppercase tracking-widest mt-2 text-gray-400">Minutes</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-4xl md:text-6xl font-cinzel font-bold">{timeLeft.seconds}</span>
                        <span className="text-xs uppercase tracking-widest mt-2 text-gray-400">Seconds</span>
                    </div>
                </div>

                <div className="bg-[#1a2e25] p-8 rounded-lg border border-[#D4AF37]/30 mb-12 inline-block w-full max-w-sm">
                    <MapPin className="mx-auto text-[#D4AF37] mb-4" size={32} />
                    <h4 className="font-cinzel text-xl text-white mb-2">Location</h4>
                    <p className="font-cormorant text-gray-300 font-khmer text-lg mb-6">{wedding.location}</p>
                    <a
                        href={wedding.themeSettings?.mapLink || "#"}
                        target="_blank"
                        className="px-8 py-3 bg-[#D4AF37] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors"
                    >
                        View Map
                    </a>
                </div>

                <p className="font-vibes text-2xl text-gray-500">Thank you for celebrating with us</p>
                <p className="font-cinzel text-sm text-gray-600 mt-2 tracking-[0.3em] uppercase">{wedding.groomName} & {wedding.brideName}</p>

                <div className="mt-16 pt-8 border-t border-white/5 opacity-30 hover:opacity-100 transition-opacity duration-500">
                    <MoneaBranding />
                </div>
            </div>
        </footer>
    );
}

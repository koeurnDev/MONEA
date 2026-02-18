"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { WeddingData } from "../types";
import { CldImage } from 'next-cloudinary';

export default function Countdown({ wedding }: { wedding: WeddingData }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const targetDate = new Date(wedding.date).getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000),
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [wedding.date]);

    // Fallback image logic
    const coupleImage = wedding.galleryItems?.find(i => i.type === 'IMAGE')?.url || "/images/couple.jpg";

    return (
        <div className="text-center py-10">
            <h2 className="font-script text-4xl text-[#D4AF37] mb-2">Save The Date</h2>
            <h3 className="text-sm md:text-xl font-bold text-[#2C2C2C] mb-6 uppercase tracking-widest px-4">
                {wedding.groomName && wedding.brideName
                    ? `${wedding.groomName.charAt(0)} & ${wedding.brideName.charAt(0)} The Wedding`
                    : "L & N The Wedding"}
            </h3>

            {/* Timer Box */}
            <div className="inline-block px-4 md:px-8 py-6 rounded-none mb-8 border-y border-[#D4AF37]/20 mx-4">
                <div className="grid grid-cols-4 md:flex gap-4 md:gap-8 items-center justify-center">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-6xl font-light">{timeLeft.days}</span>
                        <span className="text-[10px] md:text-xs text-[#8E8E8E] mt-1 md:mt-2 tracking-[0.2em] uppercase">Days</span>
                    </div>
                    <span className="hidden md:block text-2xl md:text-4xl font-extralight text-[#D4AF37]/40">:</span>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-6xl font-light">{timeLeft.hours.toString().padStart(2, '0')}</span>
                        <span className="text-[10px] md:text-xs text-[#8E8E8E] mt-1 md:mt-2 tracking-[0.2em] uppercase">Hours</span>
                    </div>
                    <span className="hidden md:block text-2xl md:text-4xl font-extralight text-[#D4AF37]/40">:</span>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-6xl font-light">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                        <span className="text-[10px] md:text-xs text-[#8E8E8E] mt-1 md:mt-2 tracking-[0.2em] uppercase">Mins</span>
                    </div>
                    <span className="hidden md:block text-2xl md:text-4xl font-extralight text-[#D4AF37]/40">:</span>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-6xl font-light">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                        <span className="text-[10px] md:text-xs text-[#8E8E8E] mt-1 md:mt-2 tracking-[0.2em] uppercase">Secs</span>
                    </div>
                </div>
            </div>

            <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto rounded-full overflow-hidden border-2 border-[#D4AF37]/20 shadow-sm">
                {coupleImage.startsWith('http') || coupleImage.startsWith('/') ? (
                    <Image src={coupleImage} alt="Couple" fill className="object-cover" />
                ) : (
                    <CldImage src={coupleImage} width={400} height={400} alt="Couple" className="object-cover w-full h-full" />
                )}
            </div>
        </div>
    );
}

"use client";
import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { WeddingData } from "../types";

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Design Constants
export const THEME = {
    colors: {
        background: '#E6E6FA', // Soft Lavender
        primary: '#D4AF37',    // Gold
        text: '#4A4A4A',       // Dark Gray
        accent: '#FFB7C5',     // Pale Pink
    },
    fonts: {
        script: 'Great Vibes, cursive',
        body: 'Montserrat, sans-serif',
        header: 'Cormorant Garamond, serif',
        khmer: 'Khmer OS Battambang, sans-serif',
    }
};

interface BaseProps {
    wedding: WeddingData;
    className?: string;
}

export const SectionDivider = () => (
    <div className="flex items-center justify-center py-8 opacity-50">
        <div className="h-px w-24 bg-[#D4AF37]"></div>
        <span className="text-[#D4AF37] text-2xl px-4">❀</span>
        <div className="h-px w-24 bg-[#D4AF37]"></div>
    </div>
);

import { m } from 'framer-motion';

export const FloatingPetals = () => {
    const [petals, setPetals] = useState<any[]>([]);

    useEffect(() => {
        setPetals([...Array(12)].map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            fontSize: `${10 + Math.random() * 20}px`,
            animLeft: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            duration: 15 + Math.random() * 20,
            delay: Math.random() * 20
        })));
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {petals.map((p) => (
                <m.div
                    key={p.id}
                    className="absolute text-pink-200/40"
                    style={{
                        left: p.left,
                        top: `-10%`,
                        fontSize: p.fontSize
                    }}
                    animate={{
                        top: '110%',
                        left: p.animLeft,
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay
                    }}
                >
                    🌸
                </m.div>
            ))}
        </div>
    );
};

export const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        "bg-white/40 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_0_rgba(212,175,55,0.1)] rounded-2xl p-6 md:p-10",
        className
    )}>
        {children}
    </div>
);

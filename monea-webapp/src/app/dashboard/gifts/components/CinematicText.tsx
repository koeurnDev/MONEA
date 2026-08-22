"use client";

import { m } from 'framer-motion';
import { cn } from "@/lib/utils";

interface CinematicTextProps {
    text: string;
    className?: string;
}

/**
 * Cinematic Text Reveal Component for Khmer
 * Uses Intl.Segmenter to ensure Khmer graphemes are kept together.
 */
export const CinematicText = ({ text, className = "" }: CinematicTextProps) => {
    let characters: string[] = [];
    try {
        const segmenter = new Intl.Segmenter('km', { granularity: 'grapheme' });
        characters = Array.from(segmenter.segment(text)).map(s => s.segment);
    } catch (e) {
        characters = text.split("");
    }

    return (
        <m.div className={cn("flex flex-wrap justify-center items-center", className)}>
            {characters.map((char, index) => (
                <m.span
                    key={`${index}-${char}`}
                    initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{
                        delay: index * 0.05,
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1]
                    }}
                    className={cn(char === " " ? "w-[0.3em]" : "", "will-change-transform")}
                >
                    {char}
                </m.span>
            ))}
        </m.div>
    );
};

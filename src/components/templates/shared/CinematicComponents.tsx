"use client";
import * as React from 'react';
import { m } from 'framer-motion';
import { cn } from "@/lib/utils";


/**
 * Premium Heading with Gold Gradient
 * Benchmarked against Eternal Cinematic (ModernFullTemplate)
 */
export const PremiumHeading = React.memo(({ children, className = "", variant = "gold" }: { children: React.ReactNode, className?: string, variant?: "gold" | "white" | "floral" }) => {
    const gradients = {
        gold: "bg-gradient-to-b from-[#FFF5E1] via-[#D4AF37] to-[#8a6e1c]",
        white: "bg-gradient-to-b from-white via-white to-white/60",
        floral: "bg-gradient-to-b from-[#FFF0F0] via-[#D48B8B] to-[#8E5A5A]"
    };

    return (
        <m.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`font-moul text-3xl md:text-5xl text-center bg-clip-text text-transparent ${gradients[variant]} drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] mb-12 tracking-wide ${className}`}
        >
            {children}
        </m.h2>
    );
});
PremiumHeading.displayName = 'PremiumHeading';

/**
 * Staggered Reveal Wrapper
 * Benchmarked against Eternal Cinematic (ModernFullTemplate)
 */
export const RevealSection = React.memo(({ children, delay = 0, className = "", onClick }: { children: React.ReactNode, delay?: number, className?: string, onClick?: () => void }) => (
    <m.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay, ease: [0.21, 1, 0.36, 1] }}
        className={`w-full ${className}`}
        onClick={onClick}
    >
        {children}
    </m.div>
));
RevealSection.displayName = 'RevealSection';

/**
 * Luxury Wrapper (Transparent/Cinematic) with Hover Accents
 * Benchmarked against Eternal Cinematic (ModernFullTemplate)
 */
export const LuxurySection = React.memo(({ children, id, className = "", innerClassName = "", variant = "dark" }: { children: React.ReactNode, id?: string, className?: string, innerClassName?: string, variant?: "dark" | "glass" | "floral" }) => {
    const backgrounds = {
        dark: "bg-black/30 border-white/10 shadow-3xl",
        glass: "bg-white/40 border-white/40 shadow-xl",
        floral: "bg-pink-50/40 border-pink-100/40 shadow-xl"
    };

    const borders = {
        dark: "border-[#D4AF37]/30",
        glass: "border-[#D4AF37]/30",
        floral: "border-pink-300/30"
    };

    const hoverBorders = {
        dark: "hover:border-[#D4AF37]/20",
        glass: "hover:border-[#D4AF37]/20",
        floral: "hover:border-pink-400/20"
    };

    return (
        <section id={id} className={`w-full max-w-4xl mx-auto px-4 py-16 flex flex-col items-center relative group ${className}`}>
            {/* Luxury Corner Accents */}
            <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${borders[variant]} rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
            <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 ${borders[variant]} rounded-tr-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
            <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${borders[variant]} rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
            <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${borders[variant]} rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />

            <div className={`w-full backdrop-blur-md rounded-3xl p-8 md:p-12 border transition-colors duration-700 relative z-10 will-change-transform ${backgrounds[variant]} ${hoverBorders[variant]} ${innerClassName}`}>
                {children}
            </div>
        </section>
    );
});
LuxurySection.displayName = 'LuxurySection';

/**
 * Image Panning Hook (2D)
 * Used across multiple templates for interactive Hero image adjustment.
 */
export const useImagePan = (initialX: string = '50%', initialY: string = '50%', fieldX: string, fieldY: string) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [localX, setLocalX] = React.useState(initialX);
    const [localY, setLocalY] = React.useState(initialY);
    const startPos = React.useRef({ x: 50, y: 50 });
    const startMouse = React.useRef({ x: 0, y: 0 });

    React.useEffect(() => {
        setLocalX(initialX);
        setLocalY(initialY);
    }, [initialX, initialY]);

    React.useEffect(() => {
        if (!isDragging) return;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

            const deltaX = (clientX - startMouse.current.x) / 5;
            const deltaY = (clientY - startMouse.current.y) / 5;

            let newX = startPos.current.x + deltaX;
            let newY = startPos.current.y + deltaY;

            if (isNaN(newX)) newX = 50;
            if (isNaN(newY)) newY = 50;

            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            const finalX = `${Math.round(newX)}%`;
            const finalY = `${Math.round(newY)}%`;

            setLocalX(finalX);
            setLocalY(finalY);

            window.parent.postMessage({
                type: "SYNC_IMAGE_POSITION_2D",
                payload: { fieldX, valueX: finalX, fieldY, valueY: finalY }
            }, "*");
        };

        const handleEnd = () => setIsDragging(false);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, fieldX, fieldY]);

    const onStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (typeof window !== 'undefined' && window.self === window.top) return;
        if ('touches' in e) e.preventDefault();
        setIsDragging(true);
        const mouseX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
        const mouseY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
        startMouse.current = { x: mouseX, y: mouseY };
        const curX = parseInt(localX?.replace('%', '') || '50');
        const curY = parseInt(localY?.replace('%', '') || '50');
        const safeX = isNaN(curX) ? 50 : curX;
        const safeY = isNaN(curY) ? 50 : curY;
        startPos.current = { x: safeX, y: safeY };
    };

    return { isDragging, localX, localY, onStart };
};

/**
 * Cinematic Text with Translation Protection
 */
export const CinematicText = React.memo(({ text, className = "" }: { text: string, className?: string }) => (
    <span translate="no" className={cn("inline-block notranslate", className)}>
        {text}
    </span>
));
CinematicText.displayName = 'CinematicText';

/**
 * Premium Placeholder for empty image slots
 * Ensures "visual order" even when photos aren't uploaded yet.
 */
export const CinematicPlaceholder = React.memo(({ label = "Memory" }: { label?: string }) => (
    <div className="w-full h-full bg-[#fdfaf3] flex flex-col items-center justify-center p-4 relative overflow-hidden group/placeholder">
        {/* Subtle Gold Texture/Gradient */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center space-y-3 opacity-20 group-hover/placeholder:opacity-30 transition-opacity duration-700">
            <div className="w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center">
                 <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-gold" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                </svg>
            </div>
            <span className="font-kantumruy text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-gold">{label}</span>
        </div>

        {/* Cinematic Particles (Simulated) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.02)_0%,_transparent_70%)]" />
    </div>
));
CinematicPlaceholder.displayName = 'CinematicPlaceholder';

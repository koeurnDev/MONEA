"use client";
import { useEffect, useState } from "react";
import { m } from 'framer-motion';
import { Heart, Star, Sparkles } from "lucide-react";

interface FloatingElementsProps {
    type?: 'hearts' | 'stars' | 'confetti';
}

interface ParticleConfig {
    id: number;
    x: number;
    delay: number;
    duration: number;
    scale: number;
}

export const FloatingElements = ({ type = 'hearts' }: FloatingElementsProps) => {
    const [particles, setParticles] = useState<ParticleConfig[]>([]);

    useEffect(() => {
        const generatedParticles = [...Array(15)].map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 10,
            duration: Math.random() * 10 + 20,
            scale: Math.random() * 0.8 + 0.5,
        }));
        setParticles(generatedParticles);
    }, []);

    const getIcon = () => {
        switch (type) {
            case 'stars':
                return <Star fill="currentColor" className="text-yellow-200/40" />;
            case 'confetti':
                return <Sparkles className="text-amber-200/40" />;
            case 'hearts':
            default:
                return "❤";
        }
    };

    const getColors = () => {
        switch (type) {
            case 'stars': return "text-yellow-200/40";
            case 'confetti': return "text-amber-100/40";
            default: return "text-pink-300/30";
        }
    };

    if (particles.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <m.div
                    key={p.id}
                    initial={{ y: "110vh", x: p.x + "vw", opacity: 0, scale: 0 }}
                    animate={{
                        y: "-10vh",
                        x: p.x + "vw",
                        opacity: [0, 0.8, 0],
                        scale: [0, p.scale, 0],
                        rotate: [0, 360]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay,
                    }}
                    className={`absolute text-4xl ${getColors()} will-change-transform`}
                >
                    {type === 'hearts' ? "❤" : getIcon()}
                </m.div>
            ))}
        </div>
    );
};

export default FloatingElements;

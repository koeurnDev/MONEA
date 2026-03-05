"use client";
import { useEffect, useState } from "react";
import { m } from 'framer-motion';

interface ParticleConfig {
    id: number;
    x: number;
    delay: number;
    duration: number;
    scale: number;
}

export const FloatingHearts = () => {
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
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay,
                    }}
                    className="absolute text-pink-300/30 text-4xl will-change-transform"
                >
                    ❤
                </m.div>
            ))}
        </div>
    );
};

export default FloatingHearts;

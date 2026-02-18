"use client";
import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WishElement {
    id: number;
    x: number;
    drift: number;
    type: 'heart' | 'flower';
    size: number;
    duration: number;
}

const WishesWall = memo(({ trigger }: { trigger: any }) => {
    const [elements, setElements] = useState<WishElement[]>([]);

    useEffect(() => {
        if (!trigger) return;

        // Generate a new floating element when a trigger (new wish) occurs
        const newElement: WishElement = {
            id: Date.now(),
            x: Math.random() * 80 + 10, // 10% to 90% of width
            drift: Math.random() * 10 - 5, // Predetermined drift
            type: Math.random() > 0.5 ? 'heart' : 'flower',
            size: Math.random() * 20 + 20, // 20px to 40px
            duration: Math.random() * 4 + 4, // 4s to 8s
        };

        setElements(prev => [...prev.slice(-15), newElement]); // Limit to 15 concurrent elements for performance

        // Clean up element after animation
        const timer = setTimeout(() => {
            setElements(prev => prev.filter(e => e.id !== newElement.id));
        }, 8000);

        return () => clearTimeout(timer);
    }, [trigger]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            <AnimatePresence>
                {elements.map((el) => (
                    <motion.div
                        key={el.id}
                        initial={{ y: '110vh', opacity: 0, x: `${el.x}vw`, scale: 0.5, rotate: 0 }}
                        animate={{
                            y: '-10vh',
                            opacity: [0, 1, 1, 0],
                            x: [`${el.x}vw`, `${el.x + el.drift}vw`],
                            scale: [0.5, 1.2, 1, 0.8],
                            rotate: 360
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: el.duration, ease: "easeOut" }}
                        className="absolute will-change-transform"
                        style={{ willChange: 'transform, opacity' }}
                    >
                        {el.type === 'heart' ? (
                            <div
                                style={{ width: el.size, height: el.size }}
                                className="text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </div>
                        ) : (
                            <div
                                style={{ width: el.size, height: el.size }}
                                className="text-pink-300 drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zM12 7c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                                </svg>
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
});

WishesWall.displayName = 'WishesWall';
export default WishesWall;


"use client";
import { motion } from "framer-motion";
import { Heart, Star, Sparkles } from "lucide-react";

interface FloatingElementsProps {
    type?: 'hearts' | 'stars' | 'confetti';
}

export const FloatingElements = ({ type = 'hearts' }: FloatingElementsProps) => {

    const getIcon = () => {
        switch (type) {
            case 'stars':
                return <Star fill="currentColor" className="text-yellow-200/40" />;
            case 'confetti':
                return <Sparkles className="text-amber-200/40" />;
            case 'hearts':
            default:
                return "❤"; // Keeping text heart for original vibe, or could use lucide Heart
        }
    };

    const getColors = () => {
        switch (type) {
            case 'stars': return "text-yellow-200/40";
            case 'confetti': return "text-amber-100/40";
            default: return "text-pink-300/30";
        }
    };

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: "110vh", x: Math.random() * 100 + "vw", opacity: 0, scale: 0 }}
                    animate={{
                        y: "-10vh",
                        x: Math.random() * 100 + "vw",
                        opacity: [0, 0.8, 0],
                        scale: [0, Math.random() * 0.8 + 0.5, 0],
                        rotate: [0, 360]
                    }}
                    transition={{
                        duration: Math.random() * 10 + 20,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 10,
                    }}
                    className={`absolute text-4xl ${getColors()}`}
                >
                    {type === 'hearts' ? "❤" : getIcon()}
                </motion.div>
            ))}
        </div>
    );
};

export default FloatingElements;

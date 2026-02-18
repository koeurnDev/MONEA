
"use client";
import { motion } from "framer-motion";

export const FloatingHearts = () => {
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
                    }}
                    transition={{
                        duration: Math.random() * 10 + 20,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 10,
                    }}
                    className="absolute text-pink-300/30 text-4xl"
                >
                    ❤
                </motion.div>
            ))}
        </div>
    );
};

export default FloatingHearts;

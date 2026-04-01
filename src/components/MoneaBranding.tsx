"use client";
import { motion } from "framer-motion";
import { MoneaLogo } from "./ui/MoneaLogo";

export const MoneaBranding = ({ packageType }: { packageType?: string | null }) => {
    if (packageType === "PREMIUM") return null;

    return (
        <div className="flex flex-col items-center group cursor-default">
            {/* Animated Icon / Logo Container */}
            <div className="relative">
                <MoneaLogo size="2xl" variant="system" showText={false} className="hover:scale-110 h-48" />

                {/* Floating Sparkles moved to follow new logo center */}
                <motion.div
                    animate={{ y: [0, -5, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center text-pink-400 text-sm"
                >
                    ✦
                </motion.div>
            </div>
        </div>
    );
};

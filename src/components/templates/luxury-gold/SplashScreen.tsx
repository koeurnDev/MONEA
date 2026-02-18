import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Music, Music2 } from 'lucide-react';
import { WeddingData } from "../types";
import { GoldText } from './shared';

interface SplashScreenProps {
    wedding: WeddingData;
    labels: any;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onStartMusic: () => void;
}

export default function SplashScreen({ wedding, labels, isOpen, setIsOpen, onStartMusic }: SplashScreenProps) {
    return (
        <AnimatePresence>
            {!isOpen && (
                <motion.div
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 1.2, ease: "easeInOut" as any }}
                    className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center p-8 overflow-hidden"
                >
                    {/* Background & Particles */}
                    {wedding.themeSettings?.heroImage && (
                        <motion.div
                            initial={{ scale: 1 }}
                            animate={{ scale: 1.05 }}
                            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                            style={{ backgroundImage: `url('${wedding.themeSettings.heroImage}')` }}
                        />
                    )}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]"></div>

                    {/* Floating Gold Dust */}
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-[#D4AF37] opacity-40"
                            initial={{
                                x: Math.random() * 400 - 200,
                                y: Math.random() * 800 - 400,
                                scale: Math.random() * 0.5 + 0.5
                            }}
                            animate={{
                                y: [null, Math.random() * -100],
                                opacity: [0, 0.8, 0]
                            }}
                            transition={{
                                duration: Math.random() * 5 + 3,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                            style={{ width: Math.random() * 3 + 1, height: Math.random() * 3 + 1 }}
                        />
                    ))}

                    {/* Content */}
                    <div className="relative z-10 border border-[#D4AF37]/20 p-6 md:p-8 backdrop-blur-[2px] bg-black/20 w-full max-w-sm mx-auto">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 1 }}
                        >
                            <Sparkles className="text-[#D4AF37] mb-6 mx-auto animate-pulse" size={40} />
                        </motion.div>

                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-lg mb-6 text-[#D4AF37] tracking-[0.4em] uppercase font-light"
                        >
                            {labels.invite_title}
                        </motion.h2>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mb-12"
                        >
                            <GoldText className="text-4xl sm:text-6xl font-bold font-serif block mb-2">{wedding.groomName}</GoldText>
                            <span className="text-2xl text-white/50 font-serif italic">&amp;</span>
                            <GoldText className="text-4xl sm:text-6xl font-bold font-serif block mt-2">{wedding.brideName}</GoldText>
                        </motion.div>

                        <motion.button
                            onClick={() => { setIsOpen(true); onStartMusic(); }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(212,175,55,0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative px-10 py-4 bg-transparent overflow-hidden"
                        >
                            <span className="absolute inset-0 w-full h-full border border-[#D4AF37] group-hover:bg-[#D4AF37] transition-all duration-500 ease-out opacity-100 group-hover:opacity-10"></span>
                            <span className="absolute inset-0 w-full h-full border border-[#D4AF37] scale-105 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out"></span>
                            <span className="relative text-[#D4AF37] group-hover:text-white transition-colors duration-300 uppercase tracking-[0.2em] text-xs font-bold font-header">{labels.button_open}</span>
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

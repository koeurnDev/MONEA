"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface EnvelopeProps {
    onOpen: () => void;
    guestName?: string;
}

export const Envelope = ({ onOpen, guestName = "ភ្ញៀវកិត្តិយស" }: EnvelopeProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
        // Wait for animation to finish before calling onOpen (which likely hides the envelope)
        setTimeout(() => {
            onOpen();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fdf2f4] overflow-hidden">
            <AnimatePresence>
                {!isOpen ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0, rotate: -10 }}
                        transition={{ duration: 0.8 }}
                        className="relative w-[90vw] max-w-[350px] aspect-[7/5] cursor-pointer perspective-1000 group"
                        onClick={handleOpen}
                    >
                        {/* Envelope Body */}
                        <div className="absolute inset-0 bg-[#eec8c8] shadow-2xl rounded-lg flex items-center justify-center border-2 border-[#8E5A5A]/20">
                            <div className="text-center">
                                <p className="font-serif text-[#8E5A5A] text-lg mb-2">សូមគោរពជូនចំពោះ</p>
                                <h2 className="font-bold text-2xl text-[#8E5A5A]">{guestName}</h2>
                                <p className="mt-6 text-sm text-[#8E5A5A]/60 animate-pulse">សូមចុចដើម្បីបើកសំបុត្រ</p>
                            </div>
                        </div>

                        {/* Envelope Flap (Top Triangle) - Creating a CSS triangle look */}
                        <div
                            className="absolute top-0 left-0 w-full h-1/2 bg-[#dfb4b4] origin-top rounded-t-lg z-10 transition-transform duration-700 group-hover:rotate-x-180"
                            style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)" }}
                        ></div>

                        {/* Wax Seal */}
                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-[#c44d4d] rounded-full flex items-center justify-center text-white font-serif text-2xl shadow-lg border-4 border-[#a63737]">
                            ក
                        </div>

                    </motion.div>
                ) : (
                    // Animation for "Letter" coming out roughly
                    <motion.div
                        initial={{ y: 0, opacity: 1 }}
                        animate={{ y: -500, opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="bg-white w-[85vw] max-w-[300px] h-auto min-h-[400px] shadow-2xl flex items-center justify-center p-6 text-center"
                    >
                        <div>
                            <h1 className="text-3xl font-serif text-[#8E5A5A] mb-4">សិរីសួស្តី</h1>
                            <p className="text-gray-500">សូមស្វាគមន៍មកកាន់ពិធីមង្គលការរបស់យើងខ្ញុំ...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

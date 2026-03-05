import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { WeddingData } from "../types";
import { MoneaBranding } from '@/components/MoneaBranding';

interface SplashScreenProps {
    wedding: WeddingData;
    guestName?: string;
    labels: any;
    primaryColor: string;
    heroImage: string | undefined;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onStartMusic: () => void;
    onOpening?: () => void;
}

export default function SplashScreen({
    wedding,
    guestName,
    labels,
    primaryColor,
    heroImage,
    isOpen,
    setIsOpen,
    onStartMusic,
    onOpening,
}: SplashScreenProps) {
    const [animationState, setAnimationState] = useState<'closed' | 'opening' | 'opened'>('closed');

    const handleOpen = () => {
        setAnimationState('opening');
        onStartMusic();
        if (onOpening) onOpening();

        // Sequence: Open Flap (0.6s) -> Pull Card (0.8s) -> Fade Scene (1s)
        setTimeout(() => {
            setIsOpen(true);
        }, 1800);
    };

    return (
        <AnimatePresence>
            {!isOpen && (
                <m.div
                    key="splash-screen"
                    exit={{ opacity: 0, scale: 1.1, pointerEvents: "none" }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#1a0b0b] perspective-1000"
                >
                    {/* Background Layer */}
                    <div className="absolute inset-0 bg-[#050A08]">
                        <m.img
                            src="/images/bg_enchanted.jpg"
                            className="w-full h-full object-cover opacity-30"
                            initial={{ scale: 1 }}
                            animate={{ scale: 1.1 }}
                            transition={{ duration: 20, repeat: Infinity, repeatType: "mirror" }}
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>


                    {/* 3D Envelope Container */}
                    <div className="relative w-[90vw] h-[60vw] max-w-[500px] max-h-[350px] z-20 perspective-[2000px]">

                        {/* THE CARD (Inside) */}
                        <m.div
                            initial={{ y: 0, zIndex: 1 }}
                            animate={animationState === 'opening' ? { y: -220, zIndex: 30 } : { y: 0, zIndex: 1 }}
                            transition={{
                                y: { delay: 0.4, duration: 1, ease: "easeInOut" },
                                zIndex: { delay: 0.8, duration: 0 } // Switch Z-index midway to pop over if needed
                            }}
                            className="absolute top-2 left-4 right-4 bottom-2 bg-[#fffdf5] rounded-lg shadow-md flex flex-col items-center justify-center p-6 text-center border-2 border-amber-200"
                            style={{ boxShadow: "0 -5px 20px rgba(0,0,0,0.1)" }}
                        >
                            {/* Inner Border */}
                            <div className="absolute inset-2 border border-[#D4AF37]/40 rounded-sm pointer-events-none"></div>

                            <div className="flex flex-col items-center justify-center h-full w-full relative z-10">
                                <p className="text-[#a88b45] font-kantumruy text-[10px] md:text-xs mb-2 tracking-widest uppercase">
                                    {labels.invite_title || (wedding.eventType === 'anniversary' ? "ខួបអាពាហ៍ពិពាហ៍" : "សិរីមង្គលអាពាហ៍ពិពាហ៍")}
                                </p>
                                <h1 className="text-xl md:text-3xl font-vibes text-[#2c1810] leading-none mb-1">
                                    {wedding.groomName}
                                </h1>
                                <span className="text-[#D4AF37] font-serif text-base my-0">&</span>
                                <h1 className="text-xl md:text-3xl font-vibes text-[#2c1810] leading-none mt-1">
                                    {wedding.brideName}
                                </h1>

                                {guestName && (
                                    <div className="mt-3 pt-2 border-t border-[#D4AF37]/30 w-3/4">
                                        <p className="text-[#8c7b75] font-khmer text-[8px] mb-0.5">គោរពអញ្ជើញ</p>
                                        <p className="text-sm text-[#4a2525] font-kantumruy font-bold line-clamp-1">{guestName}</p>
                                    </div>
                                )}
                            </div>
                        </m.div>


                        {/* ENVELOPE BACK (Base) */}
                        <div className="absolute inset-0 bg-[#2a1212] rounded-b-xl shadow-2xl overflow-hidden" style={{ zIndex: 0 }}></div>

                        {/* ENVELOPE FLAP (Top) */}
                        <m.div
                            initial={{ rotateX: 0 }}
                            animate={animationState === 'opening' ? { rotateX: 180, zIndex: 0 } : { rotateX: 0, zIndex: 10 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            style={{ transformOrigin: "top" }}
                            className="absolute top-0 left-0 right-0 h-1/2 z-10"
                        >
                            <div className="w-full h-full bg-gradient-to-b from-[#5e2d2d] to-[#421f1f] clip-path-polygon-[0%_0%,50%_100%,100%_0%] shadow-lg relative">
                                {/* Gold Border Effect via inner shadow or pseudo element approximation */}
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                                <div className="absolute top-[2px] left-[2px] right-[2px] h-full clip-path-polygon-[0%_0%,50%_100%,100%_0%] bg-[#D4AF37]/40 -z-10 blur-[1px]"></div>
                            </div>
                        </m.div>

                        {/* ENVELOPE POCKET (Front Bottom) */}
                        <div className="absolute bottom-0 left-0 right-0 h-full z-20 pointer-events-none">
                            {/* Left Triangle */}
                            <div className="absolute bottom-0 left-0 w-full h-full bg-[#4a2525] clip-path-polygon-[0%_100%,0%_0%,50%_53%] shadow-xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                            </div>
                            {/* Right Triangle */}
                            <div className="absolute bottom-0 right-0 w-full h-full bg-[#3d1e1e] clip-path-polygon-[100%_100%,100%_0%,50%_53%] shadow-xl">
                                <div className="absolute inset-0 bg-gradient-to-bl from-black/10 to-transparent"></div>
                            </div>
                            {/* Bottom Triangle (Main Cover) */}
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-[#4a2525] to-[#592c2c] clip-path-polygon-[0%_100%,50%_53%,100%_100%] shadow-2xl">
                                {/* Gold trim on the V edge */}
                                <div className="absolute top-[53%] left-1/2 -translate-x-1/2 w-[102%] h-[2px] bg-[#D4AF37]/30 blur-[1px]"></div>
                            </div>

                            {/* WAX SEAL (Centered) */}
                            <m.button
                                onClick={handleOpen}
                                animate={animationState === 'opening' ? { opacity: 0, scale: 1.5 } : { opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                className="absolute top-[53%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto group"
                            >
                                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center relative ${wedding.eventType === 'anniversary' ? 'border-amber-400' : ''}`}>
                                    {/* Real Wax Gradient */}
                                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${wedding.eventType === 'anniversary' ? 'from-[#D4AF37] to-[#8a6e1c]' : 'from-[#c62828] to-[#6a040f]'}`}></div>
                                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]"></div>
                                    <div className={`absolute inset-1 rounded-full border-2 ${wedding.eventType === 'anniversary' ? 'border-[#8a6e1c] bg-[#b4941f]' : 'border-[#8e0000] bg-[#9b111e]'} flex items-center justify-center shadow-inner`}>
                                        <div className={`w-12 h-12 rounded-full border ${wedding.eventType === 'anniversary' ? 'border-[#8a6e1c] bg-[#cfab32]' : 'border-[#7f0e0e] bg-[#a31521]'} flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]`}>
                                            <span className={`font-kantumruy ${wedding.eventType === 'anniversary' ? 'text-white' : 'text-[#ffbaba]'} text-[10px] md:text-xs font-bold drop-shadow-md group-hover:text-white transition-colors`}>
                                                {wedding.eventType === 'anniversary' ? 'អបអរ' : 'បើកសំបុត្រ'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Gold Flakes/Dust effect (optional - just using opacity) */}
                                    <div className="absolute inset-0 rounded-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
                                </div>
                            </m.button>
                        </div>

                    </div>

                    <m.p
                        animate={animationState === 'opening' ? { opacity: 0 } : { opacity: 1 }}
                        className="mt-10 text-white/50 text-sm font-kantumruy animate-pulse"
                    >
                        សូមចុចលើត្រាដើម្បីបើកសំបុត្រ
                    </m.p>

                    {/* Platform Branding at the bottom */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={animationState === 'opening' ? { opacity: 0 } : { opacity: 0.6 }}
                        className="absolute bottom-12"
                    >
                        <MoneaBranding />
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>
    );
}

// Custom Clip Path Helper via CSS classes or inline styles
// The clip-paths above are approximated with Tailwind utilities or custom style injections.
// Since tailwind default doesn't have clip-path, we might need to add a small style block or use 'style' prop directly for complex shapes.

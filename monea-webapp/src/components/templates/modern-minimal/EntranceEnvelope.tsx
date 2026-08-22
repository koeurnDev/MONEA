"use client";
import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { WeddingData } from "../types";
import Image from 'next/image';
import { useTranslation } from "@/i18n/LanguageProvider";

export const EntranceEnvelope = ({ wedding, guestName, onReveal }: { wedding: WeddingData, guestName?: string, onReveal: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const handleOpen = () => {
        setIsOpen(true);
        // Wait for envelope animation to finish before revealing the main site
        setTimeout(() => {
            onReveal();
        }, 1200);
    };

    return (
        <AnimatePresence>
            {!isOpen && (
                <m.div
                    key="envelope"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                    transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-center overflow-hidden bg-[#FDFBF7]"
                    style={{ isolation: 'isolate' }}
                >
                    {/* Background Image Layer */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/assets/overlay-bg.webp"
                            fill
                            className="object-cover"
                            alt="Background"
                            priority
                        />
                        {/* Light overlays for text contrast */}
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white/80" />
                    </div>
                    
                    {/* The Content Card */}
                    <m.div 
                        exit={{ y: "-100vh", opacity: 0 }}
                        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                        className="relative z-10 w-full h-[100dvh] max-w-[480px] p-8 py-12 md:p-12 flex flex-col items-center justify-between overflow-y-auto"
                    >
                        
                        {/* Top Title */}
                        <div className="space-y-4">
                            <h1 className="font-khmer-moul text-[15px] md:text-lg text-[#9C7A3C] drop-shadow-sm tracking-[0.05em] leading-relaxed">
                                {wedding.themeSettings?.customLabels?.invitationTitle || 
                                 (wedding.eventType === 'anniversary' 
                                    ? t("template.khmerLegacy.overlayTitleAnniversary") 
                                    : t("template.khmerLegacy.overlayTitleWedding"))}
                            </h1>
                            <p className="font-sans text-[8px] md:text-[9px] tracking-[0.4em] text-[#8EA2B3] uppercase font-bold">THE WEDDING DAY</p>
                        </div>

                        {/* Names */}
                        {(() => {
                            const nameFontClass = wedding.themeSettings?.nameFont === 'moul' ? 'font-khmer-moul' : wedding.themeSettings?.nameFont === 'kantumruy' ? 'font-kantumruy font-bold' : 'font-suwannaphum';
                            const nameSeparator = wedding.themeSettings?.nameSeparator === 'ampersand' ? '&' : wedding.themeSettings?.nameSeparator === 'heart' ? '♥' : t("template.khmerLegacy.and");
                            return (
                                <div className="space-y-4 w-full text-center">
                                    <h2 className={`${nameFontClass} text-4xl md:text-5xl text-[#0A1226] tracking-[0.05em] drop-shadow-sm break-words whitespace-normal`}>
                                        {wedding.groomName}
                                    </h2>
                                    <p className={`${nameFontClass} text-[#8EA2B3] text-base md:text-xl`}>{nameSeparator}</p>
                                    <h2 className={`${nameFontClass} text-4xl md:text-5xl text-[#0A1226] tracking-[0.05em] drop-shadow-sm break-words whitespace-normal`}>
                                        {wedding.brideName}
                                    </h2>
                                </div>
                            );
                        })()}
                        
                        {/* Divider */}
                        <div className="h-[1px] w-12 bg-[#8EA2B3]/30" />

                        {/* Invitation Text */}
                        <div className="space-y-4 flex flex-col items-center">
                            <p className="font-khmer-moul text-[#8EA2B3] text-[10px] md:text-xs tracking-[0.1em] uppercase">{t("template.khmerLegacy.invitationGreeting")}</p>
                            
                            {guestName ? (
                                <h3 className="font-khmer-moul text-lg text-[#9C7A3C] tracking-wider drop-shadow-sm">
                                    {guestName}
                                </h3>
                            ) : (
                                <h3 className="font-khmer-content text-[13px] md:text-[14px] text-[#9C7A3C] tracking-wide max-w-[200px] leading-relaxed text-center">
                                    ឯកឧត្តម លោកជំទាវ លោក លោកស្រី
                                </h3>
                            )}
                        </div>
                            
                        {/* Open Button */}
                        <m.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-2"
                        >
                            <button
                                onClick={handleOpen}
                                className="w-full py-3.5 bg-[#0A1226] text-white rounded-full font-khmer-moul text-sm md:text-base tracking-[0.05em] transition-all shadow-md active:shadow-inner"
                            >
                                {wedding.eventType === 'anniversary' 
                                    ? t("template.khmerLegacy.heroButtonAnniversary") 
                                    : (wedding.themeSettings?.customLabels?.heroButton || t("template.khmerLegacy.heroButtonWedding"))}
                            </button>
                        </m.div>
                        
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>
    );
};

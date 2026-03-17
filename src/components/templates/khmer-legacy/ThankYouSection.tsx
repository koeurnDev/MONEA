"use client";

import { m } from 'framer-motion';
import QRCode from "react-qr-code";
import { WeddingData } from '../types';
import { RevealSection } from '../shared/CinematicComponents';

interface ThankYouSectionProps {
    wedding: WeddingData;
    smartColors: { primary: string; secondary: string; dark: string };
}

export function ThankYouSection({ wedding, smartColors }: ThankYouSectionProps) {
    return (
        <section className="py-16 md:py-64 px-8 md:px-12 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto space-y-32 md:space-y-48">
                <RevealSection delay={0.3}>
                    <div className="text-center">

                        {wedding.guestId && (
                            <m.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="mb-24 p-8 bg-white shadow-2xl rounded-[3rem] border-lux max-w-sm mx-auto flex flex-col items-center gap-6"
                            >
                                <div className="text-center space-y-2">
                                    <p className="font-khmer-moul text-sm text-gold">{wedding.themeSettings?.customLabels?.ticketHeader || "សំបុត្រឌីជីថល"}</p>
                                    <p className="font-khmer text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold">{wedding.themeSettings?.customLabels?.ticketSubtitle || "សំបុត្រឌីជីថល"}</p>
                                </div>

                                <div className="p-4 bg-white rounded-3xl ring-1 ring-gold/5 shadow-inner">
                                    <QRCode
                                        value={wedding.guestId}
                                        size={180}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                        fgColor={smartColors.dark || "#1a1a1a"}
                                    />
                                </div>

                                <div className="text-center space-y-1">
                                    <p className="font-khmer-content text-xs text-gray-700 font-bold leading-relaxed">
                                        សូមបង្ហាញ QR នេះដល់បុគ្គលិក <br /> ដើម្បីឆែកឈ្មោះចូលរួមកម្មវិធី
                                    </p>
                                </div>
                            </m.div>
                        )}

                    </div>
                </RevealSection>
            </div>
        </section>
    );
}

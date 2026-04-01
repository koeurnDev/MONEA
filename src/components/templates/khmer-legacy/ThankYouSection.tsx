"use client";
import { m } from 'framer-motion';
import QRCode from "react-qr-code";
import { WeddingData } from '../types';
import { RevealSection } from '../shared/CinematicComponents';
import { useTranslation } from '@/i18n/LanguageProvider';

interface ThankYouSectionProps {
    wedding: WeddingData;
    smartColors: { primary: string; secondary: string; dark: string };
}

export function ThankYouSection({ wedding, smartColors }: ThankYouSectionProps) {
    const { t } = useTranslation();
    return (
        <section className="py-16 md:py-64 px-8 md:px-12 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto space-y-32 md:space-y-48">
                <RevealSection delay={0.3}>
                    <div className="text-center">

                        {wedding.guestId && (
                            <m.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="mb-24 p-12 bg-white/80 backdrop-blur-xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] rounded-[3.5rem] border border-white/60 max-w-sm mx-auto flex flex-col items-center gap-10 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-gold-main/20 to-transparent" />
                                
                                <div className="text-center space-y-4">
                                    <p className="font-khmer-moul text-sm text-gold-main tracking-[0.2em] md:tracking-widest font-black uppercase leading-relaxed">
                                        {wedding.themeSettings?.customLabels?.ticketHeader || t("template.khmerLegacy.ticketHeader")}
                                    </p>
                                    <div className="w-12 h-[1px] bg-gold-main/20 mx-auto" />
                                    <p className="font-playfair text-[10px] tracking-[0.4em] text-slate-400 uppercase font-black">
                                        {wedding.themeSettings?.customLabels?.ticketSubtitle || t("template.khmerLegacy.ticketSubtitle")}
                                    </p>
                                </div>

                                <div className="p-8 bg-white rounded-[2.5rem] shadow-[inner_0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-slate-100 group-hover:scale-105 transition-transform duration-700">
                                    <QRCode
                                        value={wedding.guestId}
                                        size={200}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                        fgColor={smartColors.dark || "#1a1a1a"}
                                    />
                                </div>

                                <div className="text-center space-y-2">
                                    <p className="font-khmer-content text-base text-slate-600 font-black italic leading-relaxed">
                                        {t("template.khmerLegacy.ticketInfo")}
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

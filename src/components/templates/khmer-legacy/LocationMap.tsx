"use client";

import { m } from 'framer-motion';
import Image from 'next/image';
import { QrCode, Sparkles } from 'lucide-react';
import { RevealSection } from '../shared/CinematicComponents';
import { WeddingData, GiftRegistryItem } from '../types';
import { useTranslation } from '@/i18n/LanguageProvider';

interface LocationMapProps {
    wedding: WeddingData;
    galleryImages: string[];
    mapPan: any;
}

export function LocationMap({ wedding, galleryImages, mapPan }: LocationMapProps) {
    const { t } = useTranslation();
    const locationQr = wedding.themeSettings?.customLabels?.locationQrUrl || wedding.themeSettings?.giftRegistry?.find((r: GiftRegistryItem) => r.type === 'CASH')?.qrCodeUrl;
    const paymentQr = wedding.themeSettings?.customLabels?.giftQrUrl || wedding.themeSettings?.paymentQrUrl || (wedding.themeSettings?.giftRegistry && wedding.themeSettings.giftRegistry[0]?.qrCodeUrl);

    return (
        <section className="py-16 md:py-32 px-8 md:px-12 bg-white relative overflow-hidden">
            {/* Cinematic Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_10%,_rgba(177,147,86,0.03)_0%,_transparent_50%)] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_90%_90%,_rgba(177,147,86,0.03)_0%,_transparent_50%)] pointer-events-none" />
            
            <div className="max-w-6xl mx-auto space-y-16 md:space-y-24 relative z-10">
                {galleryImages.length > 0 && (
                    <RevealSection>
                        <div className="space-y-16">
                            <m.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center space-y-8"
                            >
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="font-playfair text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.8em] text-gold-main/80 uppercase font-black leading-relaxed">
                                        {t("invitation.location.venue")}
                                    </div>
                                    <div className="w-16 h-[1.5px] bg-gradient-to-r from-transparent via-gold-main/30 to-transparent" />
                                </div>
                                <h4 className="font-khmer-moul text-4xl md:text-6xl text-gold-gradient text-gold-embossed tracking-wider leading-relaxed">
                                    {wedding.themeSettings?.customLabels?.locationTitle || t("invitation.location.title")}
                                </h4>
                            </m.div>

                            <m.div 
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                className="w-full md:aspect-[21/9] bg-white shadow-[0_40px_100px_-20px_rgba(139,126,60,0.15)] border border-white/40 rounded-[3rem] md:rounded-[5rem] overflow-hidden relative group"
                            >
                                {galleryImages[5] ? (
                                    <>
                                        <Image 
                                            src={galleryImages[5]} 
                                            className={`w-full h-full object-cover transition-all duration-[8000ms] group-hover:scale-110 ${mapPan.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} 
                                            style={{ 
                                                objectPosition: `${mapPan.localX} ${mapPan.localY}`,
                                                userSelect: 'none', touchAction: 'none'
                                            }}
                                            onMouseDown={mapPan.onStart} onTouchStart={mapPan.onStart}
                                            draggable={false} alt="Location Banner" fill priority
                                        />
                                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-1000" />
                                        <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-[3rem] md:rounded-[5rem] pointer-events-none" />
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50 py-20">
                                        <span className="w-20 h-20 rounded-full border-2 border-gold-main/20 flex items-center justify-center text-3xl font-black italic text-gold-main/30">M</span>
                                    </div>
                                )}
                            </m.div>
                        </div>
                    </RevealSection>
                )}

                <div className="grid grid-cols-2 gap-6 md:gap-20">
                    <RevealSection delay={0.1}>
                        <m.div
                            whileHover={{ y: -12, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => wedding.themeSettings?.mapLink && window.open(wedding.themeSettings.mapLink, '_blank')}
                            className="bg-white/80 backdrop-blur-xl p-6 md:p-12 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center justify-between rounded-[2rem] md:rounded-[3rem] group hover:shadow-gold-main/10 transition-all cursor-pointer h-full min-h-[220px] md:min-h-[450px] relative overflow-hidden"
                        >
                            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-gold-main/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="space-y-6 md:space-y-12 w-full flex flex-col items-center pt-2">
                                <div className="text-[10px] md:text-[18px] font-khmer-moul text-gold-main/80 text-center leading-relaxed h-12 flex items-center justify-center font-black tracking-widest">
                                    {wedding.themeSettings?.customLabels?.locationCardLabel || t("invitation.location.venue")}
                                </div>
                                <div className="p-4 md:p-12 bg-white rounded-[2rem] md:rounded-[3.5rem] group-hover:bg-gold-main/5 transition-all duration-700 ring-1 ring-slate-100 flex items-center justify-center overflow-hidden w-28 h-28 md:w-64 md:h-64 shadow-[inner_0_4px_12px_rgba(0,0,0,0.03)] relative">
                                    {locationQr ? (
                                        <Image src={locationQr} width={300} height={300} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt="Location QR" unoptimized />
                                    ) : (
                                        <QrCode size={40} className="text-gold-main/20 md:w-20 md:h-20" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                                </div>
                            </div>
 
                            <div className="text-[9px] md:text-sm text-slate-700 text-center font-khmer-content px-2 md:px-10 mb-2 leading-relaxed min-h-[50px] flex items-center justify-center font-black italic">
                                {wedding.themeSettings?.mapLink 
                                    ? (wedding.themeSettings?.customLabels?.mapLinkText || t("invitation.location.googleMaps")) 
                                    : (wedding.themeSettings?.customLabels?.locationSoon || t("invitation.location.soon"))}
                            </div>
                        </m.div>
                    </RevealSection>
 
                    <RevealSection delay={0.2}>
                        <m.div
                            whileHover={{ y: -12, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white/80 backdrop-blur-xl p-6 md:p-12 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center justify-between rounded-[2rem] md:rounded-[3rem] group hover:shadow-gold-main/10 transition-all cursor-pointer h-full min-h-[220px] md:min-h-[450px] relative overflow-hidden"
                            onClick={() => {
                                const giftEl = document.getElementById('gift');
                                if (giftEl) giftEl.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-gold-main/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="space-y-6 md:space-y-12 w-full flex flex-col items-center pt-2">
                                <div className="text-[10px] md:text-[18px] font-khmer-moul text-gold-main/80 text-center leading-relaxed h-12 flex items-center justify-center font-black tracking-widest">
                                    {wedding.themeSettings?.customLabels?.giftCardLabel || t("invitation.location.giftBadge")}
                                </div>
                                <div className="p-4 md:p-12 bg-white rounded-[2rem] md:rounded-[3.5rem] group-hover:bg-gold-main/5 transition-all duration-700 ring-1 ring-slate-100 flex items-center justify-center overflow-hidden w-28 h-28 md:w-64 md:h-64 shadow-[inner_0_4px_12px_rgba(0,0,0,0.03)] relative">
                                    {paymentQr ? (
                                        <Image src={paymentQr} width={300} height={300} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt="Gift QR" unoptimized />
                                    ) : (
                                        <QrCode size={40} className="text-gold-main/20 md:w-20 md:h-20" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                                </div>
                            </div>
 
                            <div className="text-[9px] md:text-sm text-slate-500 text-center font-khmer-content px-2 md:px-10 mb-2 leading-relaxed min-h-[50px] flex items-center justify-center font-black italic">
                                {wedding.themeSettings?.customLabels?.giftThankYou || t("invitation.location.giftThanks")}
                            </div>
                        </m.div>
                    </RevealSection>
                </div>
            </div>
        </section>
    );
}

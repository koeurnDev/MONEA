"use client";

import { m } from 'framer-motion';
import { MapPin, QrCode } from 'lucide-react';
import { RevealSection } from '../shared/CinematicComponents';
import { WeddingData, GiftRegistryItem } from '../types';

interface LocationMapProps {
    wedding: WeddingData;
    galleryImages: string[];
    mapPan: any;
}

export function LocationMap({ wedding, galleryImages, mapPan }: LocationMapProps) {
    const locationQr = wedding.themeSettings?.customLabels?.locationQrUrl || wedding.themeSettings?.giftRegistry?.find((r: GiftRegistryItem) => r.type === 'CASH')?.qrCodeUrl;
    const paymentQr = wedding.themeSettings?.customLabels?.giftQrUrl || wedding.themeSettings?.paymentQrUrl || (wedding.themeSettings?.giftRegistry && wedding.themeSettings.giftRegistry[0]?.qrCodeUrl);

    return (
        <section className="py-16 md:py-64 px-8 md:px-12 bg-[#FAF9F6]/20 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-gold/5 rounded-full blur-[100px]" />

            <div className="max-w-6xl mx-auto space-y-32 md:space-y-48">
                {galleryImages.length > 0 && (
                    <RevealSection>
                        <div className="space-y-16">
                            <div className="text-center space-y-6">
                                <h4 className="font-khmer-moul text-lg text-gold/60 uppercase tracking-widest">
                                    {wedding.themeSettings?.customLabels?.locationTitle || "ទីតាំងកម្មវិធី"}
                                </h4>
                                <p className="font-khmer text-xs md:text-sm italic text-gray-600 tracking-widest font-bold">
                                    {wedding.themeSettings?.customLabels?.locationSubtitle || "សូមអញ្ជើញមកកាន់កម្មវិធីរបស់យើង"}
                                </p>
                            </div>
                            <div 
                                className="w-full md:aspect-[21/9] bg-white shadow-2xl border-lux rounded-sm overflow-hidden relative flex items-center justify-center bg-gold/5"
                            >
                                {galleryImages[5] ? (
                                    <>
                                        <img 
                                            src={galleryImages[5]} 
                                            className={`w-full h-full object-cover group-hover:scale-105 transition-all [transition-duration:4s] ${mapPan.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} 
                                            style={{ 
                                                objectPosition: `${mapPan.localX} ${mapPan.localY}`,
                                                userSelect: 'none',
                                                touchAction: 'none'
                                            }}
                                            onMouseDown={mapPan.onStart}
                                            onTouchStart={mapPan.onStart}
                                            draggable={false}
                                            alt="Location Banner" 
                                            loading="eager" 
                                        />
                                        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10 py-20">
                                        <span className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center text-2xl font-black italic">M</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </RevealSection>
                )}

                <div className="grid grid-cols-2 gap-4 md:gap-20">
                    <RevealSection delay={0.1}>
                        <m.div
                            whileHover={{ y: -10 }}
                            onClick={() => wedding.themeSettings?.mapLink && window.open(wedding.themeSettings.mapLink, '_blank')}
                            className="bg-white p-6 md:p-16 shadow-xl md:shadow-2xl border-lux flex flex-col items-center justify-between rounded-2xl md:rounded-[3rem] group hover:shadow-gold/10 transition-all cursor-pointer h-full min-h-[220px] md:min-h-[450px] relative overflow-hidden"
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
                            
                            <div className="space-y-4 md:space-y-8 w-full flex flex-col items-center pt-2 md:pt-4">
                                <div className="text-[9px] md:text-[16px] font-khmer-moul text-gold/60 text-center leading-relaxed h-12 flex items-center justify-center">
                                    {wedding.themeSettings?.customLabels?.locationCardLabel || "ទីតាំងកម្មវិធី"}
                                </div>
                                <div className="p-3 md:p-8 bg-gray-50 rounded-xl md:rounded-3xl group-hover:bg-ivory transition-colors ring-1 ring-gold/5 flex items-center justify-center overflow-hidden w-24 h-24 md:w-48 md:h-48 shadow-inner">
                                    {locationQr ? (
                                        <img src={locationQr} className="w-full h-full object-contain" alt="Location QR" />
                                    ) : (
                                        <QrCode size={32} className="text-gold/30 md:w-16 md:h-16" />
                                    )}
                                </div>
                            </div>

                            <div className="text-[8px] md:text-[13px] text-gray-500 text-center font-khmer px-2 md:px-6 mb-2 md:mb-4 leading-relaxed min-h-[40px] flex items-center justify-center">
                                {wedding.themeSettings?.mapLink 
                                    ? (wedding.themeSettings?.customLabels?.mapLinkText || 'ចុចទីនេះដើម្បីមើលផែនទីហ្គូហ្គល (Google Maps)') 
                                    : (wedding.themeSettings?.customLabels?.locationSoon || 'ព័ត៌មានទីតាំងនឹងដាក់បង្ហាញឆាប់ៗនេះ')}
                            </div>
                        </m.div>
                    </RevealSection>

                    <RevealSection delay={0.2}>
                        <m.div
                            whileHover={{ y: -10 }}
                            className="bg-white p-6 md:p-16 shadow-xl md:shadow-2xl border-lux flex flex-col items-center justify-between rounded-2xl md:rounded-[3rem] group hover:shadow-gold/10 transition-all cursor-pointer h-full min-h-[220px] md:min-h-[450px] relative overflow-hidden"
                            onClick={() => {
                                const giftEl = document.getElementById('gift');
                                if (giftEl) giftEl.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
                            
                            <div className="space-y-4 md:space-y-8 w-full flex flex-col items-center pt-2 md:pt-4">
                                <div className="text-[9px] md:text-[16px] font-khmer-moul text-gold/60 text-center leading-relaxed h-12 flex items-center justify-center">
                                    {wedding.themeSettings?.customLabels?.giftCardLabel || "ចំណងដៃមង្គល"}
                                </div>
                                <div className="p-3 md:p-8 bg-gray-50 rounded-xl md:rounded-3xl group-hover:bg-ivory transition-colors ring-1 ring-gold/5 flex items-center justify-center overflow-hidden w-24 h-24 md:w-48 md:h-48 shadow-inner">
                                    {paymentQr ? (
                                        <img src={paymentQr} className="w-full h-full object-contain" alt="Gift QR" />
                                    ) : (
                                        <QrCode size={32} className="text-gold/30 md:w-16 md:h-16" />
                                    )}
                                </div>
                            </div>

                            <div className="text-[8px] md:text-[13px] text-gray-500 text-center font-khmer px-2 md:px-6 mb-2 md:mb-4 leading-relaxed min-h-[40px] flex items-center justify-center">
                                {wedding.themeSettings?.customLabels?.giftThankYou || "សូមអរគុណសម្រាប់ទឹកចិត្តសប្បុរស!"}
                            </div>
                        </m.div>
                    </RevealSection>
                </div>
            </div>
        </section>
    );
}

import React, { useState } from 'react';
import { m } from 'framer-motion';
import { Copy, Check, QrCode, Gift, Sparkles } from 'lucide-react';
import type { WeddingData } from '../types';
import { getConfiguredPaymentAccounts, getWeddingSectionPhoto } from "../shared/weddingPhotos";

export const AnniversaryGift = ({ wedding }: { wedding: WeddingData }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const bankAccounts = getConfiguredPaymentAccounts(wedding.themeSettings?.bankAccounts || wedding.themeSettings?.giftRegistry);
    if (bankAccounts.length === 0) return null;

    const handleCopy = (num: string, idx: number) => {
        if (!num) return;
        navigator.clipboard.writeText(num);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const couplePhoto = getWeddingSectionPhoto(wedding, 3)?.url;

    return (
        <section className="py-16 px-4 bg-[#F1ECE5] font-kantumruy relative overflow-hidden text-center" id="gifts">
            <div className="max-w-xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#F0E3D1] flex items-center justify-center text-[#966B4E] mb-1 shadow-sm">
                        <Gift className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-khmer-moul text-[#633E42] leading-relaxed">
                        ចំណងដៃមង្គល
                    </h2>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#CBAF78] to-transparent mx-auto mt-1" />
                </div>

                {/* Clean Side-by-Side Split: Left Couple Photo + Right KHQR Card */}
                {bankAccounts.map((acc, idx) => {
                    const isCopied = copiedIndex === idx;
                    const qrSrc = acc.qrUrl || acc.qrCodeUrl;

                    return (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="bg-[#FBF9F5] p-4 sm:p-6 rounded-[2.5rem] border border-[#D9C6AA] shadow-[0_18px_45px_rgba(75,55,40,0.10)] space-y-4 text-center"
                        >
                            {/* 2-Column Side-by-Side Grid with Equal Stretched Heights */}
                            <div className={`grid ${couplePhoto ? "grid-cols-2" : "grid-cols-1"} gap-3 sm:gap-5 items-stretch`}>
                                {/* Left Column: Vertical Portrait Couple Photo (Full Height) */}
                                {couplePhoto && <div className="relative h-full min-h-[210px] sm:min-h-[240px] rounded-2xl overflow-hidden shadow-md border-2 border-purple-100 bg-slate-100 group">
                                    <img 
                                        src={couplePhoto} 
                                        alt="Couple Gift Keepsake" 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                                </div>}

                                {/* Right Column: KHQR Code Card */}
                                <div className="flex flex-col justify-between items-center p-3 sm:p-4 bg-purple-50/40 rounded-2xl border border-purple-200/80 shadow-xs space-y-2 text-center group h-full">
                                    {/* QR Code Frame */}
                                    {qrSrc && <div className="relative w-24 h-24 sm:w-32 sm:h-32 p-1.5 bg-white rounded-xl border border-purple-200/80 shadow-xs flex items-center justify-center">
                                        <img 
                                            src={qrSrc} 
                                            alt="KHQR Code" 
                                            className="w-full h-full object-contain rounded-lg" 
                                        />
                                    </div>}

                                    {/* Account Name & SCAN ME */}
                                    <div className="space-y-0.5">
                                        {qrSrc && <p className="font-sans font-black text-[10px] sm:text-[11px] text-[#3B0764] tracking-wider uppercase">SCAN ME!</p>}
                                        {acc.accountName && <p className="text-[10px] sm:text-xs font-bold text-slate-800 uppercase tracking-tight truncate max-w-[135px]">{acc.accountName}</p>}
                                        {acc.accountNumber && <p className="text-[10px] sm:text-xs font-mono text-slate-700">{acc.accountNumber}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Thank You Note */}
                            <div className="text-[11px] sm:text-xs text-amber-600/90 font-bold font-khmer-moul flex items-center justify-center gap-1.5 pt-0.5">
                                <Sparkles size={13} className="text-amber-500" />
                                <span>សូមអរគុណ</span>
                                <Sparkles size={13} className="text-amber-500" />
                            </div>
                        </m.div>
                    );
                })}
            </div>
        </section>
    );
};

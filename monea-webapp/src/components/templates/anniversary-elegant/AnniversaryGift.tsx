import React, { useState } from 'react';
import { m } from 'framer-motion';
import { Copy, Check, QrCode, Gift, Sparkles } from 'lucide-react';
import type { WeddingData } from '../types';

export const AnniversaryGift = ({ wedding }: { wedding: WeddingData }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const rawBanks = wedding.themeSettings?.bankAccounts || wedding.themeSettings?.giftRegistry || [];
    const defaultBanks = [
        {
            bankName: "ABA Bank (KHQR)",
            accountNumber: "001 234 567",
            accountName: wedding.groomName && wedding.brideName ? `${wedding.groomName} & ${wedding.brideName}` : "KAB SIN & MEAS CHANMEANA",
            qrUrl: "/images/qr.webp"
        }
    ];

    const bankAccounts = rawBanks.length > 0 ? rawBanks : defaultBanks;

    const handleCopy = (num: string, idx: number) => {
        if (!num) return;
        navigator.clipboard.writeText(num);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const couplePhoto = wedding.galleryItems?.[3]?.url || 
                        wedding.galleryItems?.[2]?.url || 
                        wedding.galleryItems?.[0]?.url || 
                        '/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg';

    return (
        <section className="py-14 px-4 bg-[#FAF7F2] font-kantumruy relative overflow-hidden text-center" id="gifts">
            <div className="max-w-xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mb-1 shadow-sm">
                        <Gift className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-khmer-moul text-[#3B0764] leading-relaxed">
                        ចំណងដៃមង្គល
                    </h2>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-1" />
                </div>

                {/* Clean Side-by-Side Split: Left Couple Photo + Right KHQR Card */}
                {bankAccounts.map((acc: any, idx: number) => {
                    const isCopied = copiedIndex === idx;
                    const qrSrc = acc.qrUrl || acc.qrCodeUrl || "/images/qr.webp";
                    const accName = acc.accountName || (wedding.groomName && wedding.brideName ? `${wedding.groomName} & ${wedding.brideName}` : "KAB SIN & MEAS CHANMEANA");
                    const accNumber = acc.accountNumber || "001 234 567";

                    return (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="bg-white p-4 sm:p-6 rounded-[2.5rem] border-2 border-purple-200/80 shadow-[0_12px_40px_rgba(76,29,149,0.08)] space-y-4 text-center"
                        >
                            {/* 2-Column Side-by-Side Grid with Equal Stretched Heights */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-5 items-stretch">
                                {/* Left Column: Vertical Portrait Couple Photo (Full Height) */}
                                <div className="relative h-full min-h-[210px] sm:min-h-[240px] rounded-2xl overflow-hidden shadow-md border-2 border-purple-100 bg-slate-100 group">
                                    <img 
                                        src={couplePhoto} 
                                        alt="Couple Gift Keepsake" 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                                </div>

                                {/* Right Column: KHQR Code Card */}
                                <div className="flex flex-col justify-between items-center p-3 sm:p-4 bg-purple-50/40 rounded-2xl border border-purple-200/80 shadow-xs space-y-2 text-center group h-full">
                                    {/* QR Code Frame */}
                                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 p-1.5 bg-white rounded-xl border border-purple-200/80 shadow-xs flex items-center justify-center">
                                        <img 
                                            src={qrSrc} 
                                            alt="KHQR Code" 
                                            className="w-full h-full object-contain rounded-lg" 
                                        />
                                    </div>

                                    {/* Account Name & SCAN ME */}
                                    <div className="space-y-0.5">
                                        <p className="font-sans font-black text-[10px] sm:text-[11px] text-[#3B0764] tracking-wider uppercase">
                                            SCAN ME!
                                        </p>
                                        <p className="text-[10px] sm:text-xs font-bold text-slate-800 uppercase tracking-tight truncate max-w-[135px]">
                                            {accName}
                                        </p>
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

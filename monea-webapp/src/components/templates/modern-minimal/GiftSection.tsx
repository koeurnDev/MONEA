"use client";
import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import Image from 'next/image';

export const GiftSection = ({ wedding }: { wedding: WeddingData }) => {
    // Collect banks from themeSettings
    const banks = wedding.themeSettings?.giftRegistry || wedding.themeSettings?.bankAccounts || [];
    
    // Pick an image from the gallery (fallback to hero image)
    const gallery = wedding.galleryItems || [];
    const decorImage = gallery.length > 1 ? gallery[1].url : (wedding.themeSettings?.heroImage || '/images/templates/modern-minimal/hero.jpg');

    return (
        <section className="py-24 md:py-32 bg-white relative border-t border-slate-100">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                    
                    {/* Left: Decorative Photo */}
                    <m.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="w-full md:w-1/2"
                    >
                        <div className="relative aspect-[3/4] w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-xl border border-slate-100">
                            <Image 
                                src={decorImage}
                                alt="Couple"
                                fill
                                className="object-cover"
                            />
                            {/* Overlay frame */}
                            <div className="absolute inset-4 border border-white/40 rounded-xl pointer-events-none" />
                        </div>
                    </m.div>

                    {/* Right: QR Codes */}
                    <m.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left"
                    >
                        <h2 className="text-3xl md:text-5xl font-kantumruy font-black text-[#805C00] tracking-widest uppercase mb-4">
                            ចំណងដៃ
                        </h2>
                        <div className="w-12 h-1 bg-slate-900 mb-8 mx-auto md:mx-0" />
                        
                        <p className="text-slate-500 font-kantumruy mb-12 max-w-md leading-relaxed">
                            សម្រាប់ឯកឧត្តម លោកជំទាវ លោក លោកស្រី ដែលមិនមានពេលវេលាអញ្ជើញមកផ្ទាល់ អាចវេរចំណងដៃតាមរយៈគណនីធនាគារខាងក្រោម។
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-8">
                            {banks.length > 0 ? (
                                banks.map((bank: any, idx: number) => (
                                    <div key={idx} className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 min-w-[200px]">
                                        <p className="font-bold text-slate-800 mb-4 tracking-wider uppercase">{bank.bankName}</p>
                                        <div className="relative w-32 h-32 mb-4 bg-white p-2 rounded-xl shadow-sm">
                                            {bank.qrCodeUrl || bank.qrUrl ? (
                                                <Image 
                                                    src={bank.qrCodeUrl || bank.qrUrl} 
                                                    alt={bank.bankName} 
                                                    fill 
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs">No QR</div>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">{bank.accountNumber}</p>
                                        <p className="text-xs text-slate-500 mt-1 uppercase">{bank.accountName}</p>
                                    </div>
                                ))
                            ) : (
                                // Placeholder if no banks added yet
                                <div className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 min-w-[200px]">
                                    <p className="font-bold text-slate-800 mb-4 tracking-wider uppercase">ABA BANK</p>
                                    <div className="w-32 h-32 mb-4 bg-white border-2 border-dashed border-slate-200 flex items-center justify-center rounded-xl text-slate-400 text-xs text-center p-2">
                                        Upload QR in Dashboard
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">000 000 000</p>
                                    <p className="text-xs text-slate-500 mt-1 uppercase">YOUR NAME</p>
                                </div>
                            )}
                        </div>
                    </m.div>

                </div>
            </div>
        </section>
    );
};

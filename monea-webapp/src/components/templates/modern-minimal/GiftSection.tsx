import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import { CreditCard } from 'lucide-react';
import { getConfiguredPaymentAccounts } from "../shared/weddingPhotos";

export const GiftSection = ({ wedding }: { wedding: WeddingData }) => {
    const banks = getConfiguredPaymentAccounts(wedding.themeSettings?.giftRegistry || wedding.themeSettings?.bankAccounts);
    if (banks.length === 0) return null;

    return (
        <section className="py-20 md:py-28 bg-white relative border-t border-slate-100" id="gift-modern">
            <div className="max-w-4xl mx-auto px-6 text-center">
                {/* Bank Cards Grid */}
                <div className="flex flex-wrap justify-center gap-8">
                    {banks.map((bank: any, idx: number) => {
                        const qrSrc = bank.qrCodeUrl || bank.qrUrl;

                        return (
                            <m.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center p-6 bg-slate-50/80 rounded-[2rem] border border-slate-200/80 shadow-sm max-w-xs w-full space-y-4 text-center hover:shadow-md transition-shadow"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/60 text-slate-700 text-xs font-bold font-kantumruy">
                                    <CreditCard size={13} />
                                    <span>{bank.bankName || "KHQR"}</span>
                                </div>

                                {bank.accountName && <div className="space-y-0.5">
                                    <h4 className="font-sans font-bold text-slate-800 text-base tracking-wide uppercase">
                                        {bank.accountName}
                                    </h4>
                                </div>}

                                {qrSrc && <div className="relative w-44 h-44 bg-white p-3 rounded-2xl shadow-inner border border-slate-200 flex items-center justify-center">
                                    <img 
                                        src={qrSrc} 
                                        alt={bank.bankName || "QR"}  
                                        className="w-full h-full object-contain rounded-lg"
                                    />
                                </div>}

                                <div className="w-full space-y-2">
                                    {bank.accountNumber && <div className="bg-white py-2 px-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-mono font-bold text-slate-800">
                                        <span className="text-slate-400 font-kantumruy">លេខគណនី:</span>
                                        <span>{bank.accountNumber}</span>
                                    </div>}

                                </div>
                            </m.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

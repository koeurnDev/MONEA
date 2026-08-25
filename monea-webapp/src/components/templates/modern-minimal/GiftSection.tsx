import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import { CreditCard, Copy, CheckCircle2, QrCode } from 'lucide-react';

export const GiftSection = ({ wedding }: { wedding: WeddingData }) => {
    const rawBanks = wedding.themeSettings?.giftRegistry || wedding.themeSettings?.bankAccounts || [];
    const defaultBanks = [
        {
            bankName: "ABA Bank (KHQR)",
            accountNumber: "001 234 567",
            accountName: wedding.groomName && wedding.brideName ? `${wedding.groomName} & ${wedding.brideName}` : "KAB SIN & MEAS CHANMEANA",
            qrUrl: "/images/qr.webp"
        }
    ];

    const banks = rawBanks.length > 0 ? rawBanks : defaultBanks;
    const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

    const handleCopy = (accNumber: string, index: number) => {
        if (!accNumber) return;
        navigator.clipboard.writeText(accNumber);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <section className="py-20 md:py-28 bg-white relative border-t border-slate-100" id="gift-modern">
            <div className="max-w-4xl mx-auto px-6 text-center">
                {/* Header */}
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-12 space-y-3"
                >
                    <p className="font-kantumruy text-xs text-slate-500 font-bold tracking-normal">
                        — សមានចិត្ត & ចំណងដៃ —
                    </p>
                    <h2 className="text-2xl md:text-4xl font-kantumruy font-bold text-slate-900 tracking-tight">
                        ចំណងដៃអាពាហ៍ពិពាហ៍
                    </h2>
                    <div className="w-12 h-1 bg-slate-900/80 rounded-full mx-auto my-3" />
                    <p className="text-slate-500 font-kantumruy text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                        លោកអ្នកអាចចូលរួមចំណងដៃតាមរយៈការស្កេន KHQR ឬផ្ទេរមកកាន់គណនីខាងក្រោម៖
                    </p>
                </m.div>

                {/* Bank Cards Grid */}
                <div className="flex flex-wrap justify-center gap-8">
                    {banks.map((bank: any, idx: number) => {
                        const isCopied = copiedIndex === idx;
                        const qrSrc = bank.qrCodeUrl || bank.qrUrl || "/images/qr.webp";

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
                                    <span>{bank.bankName || "KHQR Bank"}</span>
                                </div>

                                <div className="space-y-0.5">
                                    <h4 className="font-sans font-bold text-slate-800 text-base tracking-wide uppercase">
                                        {bank.accountName || "KAB SIN & MEAS CHANMEANA"}
                                    </h4>
                                </div>

                                <div className="relative w-44 h-44 bg-white p-3 rounded-2xl shadow-inner border border-slate-200 flex items-center justify-center">
                                    <img 
                                        src={qrSrc} 
                                        alt={bank.bankName || "QR"}  
                                        className="w-full h-full object-contain rounded-lg"
                                    />
                                </div>

                                <div className="w-full space-y-2">
                                    <div className="bg-white py-2 px-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-mono font-bold text-slate-800">
                                        <span className="text-slate-400 font-kantumruy">លេខគណនី:</span>
                                        <span>{bank.accountNumber || "001 234 567"}</span>
                                    </div>

                                    <button
                                        onClick={() => handleCopy(bank.accountNumber || "001 234 567", idx)}
                                        className={`w-full py-2.5 px-4 rounded-xl font-kantumruy font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                                            isCopied
                                                ? "bg-emerald-600 text-white"
                                                : "bg-slate-900 hover:bg-black text-white"
                                        }`}
                                    >
                                        {isCopied ? (
                                            <>
                                                <CheckCircle2 size={15} />
                                                <span>បានចម្លងរួចរាល់</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} />
                                                <span>ចម្លងលេខគណនី</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </m.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

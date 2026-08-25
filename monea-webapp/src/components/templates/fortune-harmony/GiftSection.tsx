import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { WeddingData } from '../types';

interface GiftSectionProps {
    wedding: WeddingData;
    primaryColor: string;
}

export const GiftSection: React.FC<GiftSectionProps> = ({ wedding, primaryColor }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const bankAccounts = wedding.themeSettings?.bankAccounts || [];

    const handleCopy = (num: string, idx: number) => {
        navigator.clipboard.writeText(num);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (!bankAccounts || bankAccounts.length === 0) return null;

    return (
        <section className="py-12 px-4 sm:px-6 bg-[#4A0A12] text-white font-kantumruy relative overflow-hidden text-center">
            <div className="max-w-md mx-auto space-y-6 relative z-10">
                <div className="space-y-1">
                    <span className="text-xl sm:text-2xl font-khmer-moul text-amber-300 block">
                        ចំណងដៃអាពាហ៍ពិពាហ៍
                    </span>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {bankAccounts.map((acc, idx) => (
                        <div
                            key={idx}
                            className="bg-[#6B0E1B] border border-amber-400/40 rounded-3xl p-5 shadow-md space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-300 bg-black/40 px-3 py-1 rounded-full border border-amber-400/30">
                                    {acc.bankName || "ធនាគារ"}
                                </span>
                                <span className="text-xs font-bold text-amber-100">
                                    {acc.accountName || "ឈ្មោះគណនី"}
                                </span>
                            </div>

                            {/* QR Code */}
                            {(acc.qrUrl || (acc as any).qrCodeUrl) && (
                                <div className="w-44 h-44 mx-auto p-2 bg-white rounded-2xl border border-amber-400/50 shadow-inner flex items-center justify-center">
                                    <img
                                        src={acc.qrUrl || (acc as any).qrCodeUrl}
                                        alt="KHQR Code"
                                        className="w-full h-full object-contain rounded-xl"
                                    />
                                </div>
                            )}

                            {/* Account Number with Copy */}
                            {acc.accountNumber && (
                                <div className="flex items-center justify-between bg-black/40 border border-amber-400/30 px-4 py-2.5 rounded-xl text-xs">
                                    <span className="font-mono font-bold text-amber-200 tracking-wider">
                                        {acc.accountNumber}
                                    </span>
                                    <button
                                        onClick={() => handleCopy(acc.accountNumber, idx)}
                                        className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 active:scale-95 transition-all"
                                    >
                                        {copiedIndex === idx ? (
                                            <>
                                                <Check size={14} />
                                                <span>បានចម្លង</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} />
                                                <span>ចម្លងលេខ</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

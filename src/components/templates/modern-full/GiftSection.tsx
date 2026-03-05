"use client";
import React from 'react';
import { Copy, Gift, CreditCard, ScanLine } from 'lucide-react';
import { m } from 'framer-motion';
import { WeddingData, BankAccount } from "../types";
import { cn } from './shared';

// Helper to determine Bank Colors and Gradients
const getBankStyle = (bankName: string) => {
    const name = bankName.toLowerCase();
    if (name.includes('aba')) return {
        gradient: 'from-[#005F7F] to-[#008ba8]',
        color: '#005F7F',
        label: 'ABA BANK',
        logoText: 'ABA'
    };
    if (name.includes('acleda')) return {
        gradient: 'from-[#1a472a] to-[#c5a027]',
        color: '#1a472a',
        label: 'ACLEDA BANK',
        logoText: 'ACLEDA'
    };
    if (name.includes('wing')) return {
        gradient: 'from-[#8dc63f] to-[#6da525]',
        color: '#8dc63f',
        label: 'WING BANK',
        logoText: 'WING'
    };
    return {
        gradient: 'from-[#D4AF37] to-[#8a6e1f]',
        color: '#D4AF37',
        label: bankName.toUpperCase(),
        logoText: 'BANK'
    };
};

const BankCard = ({ account }: { account: BankAccount }) => {
    const style = getBankStyle(account.bankName || 'Bank');

    const handleCopy = () => {
        navigator.clipboard.writeText(account.accountNumber);
        alert(`បានចម្លងលេខគណនី ${account.accountNumber} ទៅកាន់ Clipbroad!`);
    };

    return (
        <m.div
            whileHover={{ y: -5, scale: 1.01 }}
            className="relative w-full max-w-sm mx-auto group"
        >
            {/* Glass Card Effect */}
            <div className={cn(
                "rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden border border-white/10 h-full flex flex-col justify-between",
                "bg-gradient-to-br backdrop-blur-md will-change-transform",
                style.gradient
            )}>

                {/* Decorative Circles */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>

                {/* Card Header */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <p className="text-white/80 text-[10px] tracking-[0.2em] uppercase font-bold">{style.label}</p>
                        <h3 className="text-xl font-bold font-kantumruy mt-1">{account.accountName}</h3>
                    </div>
                    <CreditCard className="text-white/50 w-8 h-8" />
                </div>

                {/* Card Body (QR or Number) */}
                <div className="flex flex-col items-center justify-center relative z-10 mb-6">
                    {account.qrUrl ? (
                        <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-lg relative group-hover:scale-105 transition-transform duration-300">
                            <img src={account.qrUrl} alt="QR Code" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-xl backdrop-blur-[2px]">
                                <ScanLine className="text-white w-8 h-8 animate-pulse" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-full py-8 flex flex-col items-center justify-center border-2 border-white/20 border-dashed rounded-xl bg-white/5">
                            <span className="text-white/60 font-kantumruy text-sm mb-2">លេខគណនី</span>
                            <span className="text-2xl font-mono font-bold tracking-widest text-shadow-md">{account.accountNumber}</span>
                        </div>
                    )}
                </div>

                {/* Card Footer (Account Number & Copy) */}
                {account.qrUrl && (
                    <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/10 backdrop-blur-sm">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/50 uppercase tracking-wider font-kantumruy">លេខគណនី</span>
                            <span className="font-mono text-lg font-bold tracking-wide">{account.accountNumber}</span>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="p-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-lg transition-all"
                            title="ចម្លង"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                )}

                {!account.qrUrl && (
                    <div className="flex justify-center">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-6 py-2 bg-white text-black font-bold rounded-full text-sm hover:bg-gray-100 transition-colors shadow-lg font-kantumruy"
                        >
                            ចម្លងលេខគណនី <Copy size={14} />
                        </button>
                    </div>
                )}

            </div>
        </m.div>
    );
}

export default function GiftSection({ wedding }: { wedding?: WeddingData }) {
    // Default mock data if no real data exists
    const defaultAccounts = [
        {
            bankName: 'ABA Bank',
            accountName: 'Groom Name',
            accountNumber: '000 123 456',
            qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example'
        },
        {
            bankName: 'ACLEDA',
            accountName: 'Bride Name',
            accountNumber: '000 987 654',
            qrUrl: null
        }
    ];

    const bankAccounts = wedding?.themeSettings?.bankAccounts?.length ? wedding.themeSettings.bankAccounts : [];

    // If no specific bank accounts, but we have a generic QR code from settings
    if (bankAccounts.length === 0 && wedding?.themeSettings?.paymentQrUrl) {
        bankAccounts.push({
            bankName: "QR Code",
            accountName: wedding.groomName + " & " + wedding.brideName,
            accountNumber: "",
            qrUrl: wedding.themeSettings.paymentQrUrl
        });
    }

    // Fallback only if absolutely nothing is provided
    if (bankAccounts.length === 0) {
        // Optional: We can leave it empty or show a placeholder. 
        // User asked "why enter again?", so better to show nothing if they really didn't enter anything,
        // OR show the placeholder but make it clear it is a sample.
        // Let's keep the sample but only if NO data exists.
        bankAccounts.push(
            {
                bankName: 'ABA Bank',
                accountName: 'ឈ្មោះគណនី (Account Name)',
                accountNumber: '000 000 000',
                qrUrl: null
            });
    }

    return (
        <section className="py-24 px-4 relative z-10 space-y-12" id="gift">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent pointer-events-none"></div>

            {/* Section Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#ffd700]/10 text-[#D4AF37] backdrop-blur-md mb-4 border border-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.2)] animate-pulse-slow will-change-transform">
                    <Gift size={32} />
                </div>
                <h2 className="text-3xl md:text-5xl font-kantumruy text-[#D4AF37] drop-shadow-md font-bold">
                    {wedding?.eventType === 'anniversary' ? "កាដូអនុស្សាវរីយ៍" : "ចំណងដៃ"}
                </h2>
                <p className="text-sm md:text-base text-white/70 font-kantumruy max-w-lg mx-auto leading-relaxed">
                    ការចូលរួមរបស់អ្នកគឺជាកិត្តិយសដ៏ធំបំផុតរបស់យើង។ ប៉ុន្តែប្រសិនបើអ្នកចង់ផ្តល់កាដូ អ្នកអាចប្រើ QR កូដ ឬលេខគណនីខាងក្រោមបាន។
                </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {bankAccounts.map((account, idx) => (
                    <BankCard key={idx} account={account} />
                ))}
            </div>
        </section>
    );
}

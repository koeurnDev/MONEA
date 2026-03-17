"use client";
import React from 'react';
import { Copy, Gift, CreditCard, ScanLine, CheckCircle2, XCircle } from 'lucide-react';
import NextImage from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { WeddingData, BankAccount } from '../types';

const BankCard = ({ account, isAnniversary, onOpen, customLabels }: { account: BankAccount, isAnniversary: boolean, onOpen: (acc: BankAccount) => void, customLabels: any }) => {
    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            onClick={() => onOpen(account)}
            className="bg-white border-lux p-10 rounded-[3.5rem] shadow-xl relative group cursor-pointer overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2"
        >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-700">
                <Gift size={160} className="text-gold" />
            </div>

            <div className="relative z-10 space-y-8 text-center">
                <div className="space-y-2">
                    <span className="text-[10px] tracking-[0.4em] font-black text-gold uppercase block">{account.bankName}</span>
                    <h4 className="font-khmer-moul text-gray-800 text-lg tracking-wide">{account.accountName}</h4>
                </div>

                <div className="w-24 h-24 mx-auto relative">
                    <div className="absolute inset-0 bg-gold/5 rounded-full animate-ping opacity-20" />
                    <div className="relative w-full h-full bg-gold/10 rounded-full flex items-center justify-center text-gold">
                        <ScanLine size={32} />
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="font-khmer-content text-xs text-gray-400">សូមចុចលើរូបសំបុត្រ ដើម្បីពិនិត្យគណនី</p>
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gold text-white text-[10px] font-bold uppercase tracking-widest">
                        {customLabels?.giftCheckBtn || "ពិនិត្យមើល"}
                    </div>
                </div>
            </div>
        </m.div>
    );
};

const EnvelopeModal = ({ account, isOpen, onClose, customLabels }: { account: BankAccount | null, isOpen: boolean, onClose: () => void, customLabels: any }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        if (!account) return;
        navigator.clipboard.writeText(account.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!account) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <m.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-stone-900/90 backdrop-blur-xl" 
                    />
                    
                    <m.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[4rem] shadow-2xl overflow-hidden"
                    >
                        <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-gray-900 transition-colors z-20">
                            <XCircle size={24} />
                        </button>

                        <div className="p-12 md:p-16 text-center space-y-10">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-gold/10 text-gold text-[10px] font-black tracking-[0.2em] uppercase">
                                    <CreditCard size={12} />
                                    {account.bankName}
                                </div>
                                <h3 className="font-khmer-moul text-2xl text-gray-900">{account.accountName}</h3>
                            </div>

                            <div className="relative group">
                                {account.qrUrl ? (
                                    <m.div 
                                        initial={{ filter: 'blur(10px)', opacity: 0 }}
                                        animate={{ filter: 'blur(0px)', opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="w-64 h-64 mx-auto p-4 bg-white rounded-3xl shadow-inner ring-1 ring-gold/10 flex items-center justify-center"
                                    >
                                        <NextImage src={account.qrUrl} alt="QR Code" width={256} height={256} className="w-full h-full object-contain" unoptimized />
                                    </m.div>
                                ) : (
                                    <div className="w-full py-16 border-2 border-dashed border-stone-100 rounded-[3rem] bg-stone-50/50">
                                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-4 block">Account Number</span>
                                        <span className="text-3xl font-mono font-bold tracking-[0.2em] text-gray-900">{account.accountNumber}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-8">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="font-mono text-lg font-bold tracking-widest text-gray-800 bg-stone-50 px-8 py-3 rounded-2xl border border-stone-100">
                                        {account.accountNumber}
                                    </div>
                                    <button 
                                        onClick={handleCopy}
                                        className={clsx(
                                            "flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs tracking-widest transition-all",
                                            copied ? "bg-emerald-500 text-white shadow-lg" : "bg-gray-900 text-gold hover:bg-black"
                                        )}
                                    >
                                        {copied ? <><CheckCircle2 size={16} /> {customLabels?.giftCopied || "ចម្លងរួចរាល់"}</> : <><Copy size={16} /> {customLabels?.giftCopyBtn || "ចម្លងលេខគណនី"}</>}
                                    </button>
                                </div>

                                <div className="space-y-4 pt-8 border-t border-stone-100">
                                    <p className="font-khmer-content text-gold italic text-base leading-relaxed">
                                        &quot;សូមជូនពរសទ្ធាជ្រះថ្លារបស់លោកអ្នក <br /> ឱ្យសម្រេចបាននូវសេចក្ដីសុខគ្រប់ប្រការ!&quot;
                                    </p>
                                </div>
                            </div>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default function GiftSection({ wedding }: { wedding: WeddingData }) {
    const bankAccounts = wedding.themeSettings?.bankAccounts || [];
    const isAnniversary = wedding.eventType === 'anniversary';
    const [selectedAccount, setSelectedAccount] = React.useState<BankAccount | null>(null);

    if (bankAccounts.length === 0) return null;

    return (
        <section className="py-24 bg-white px-6 relative overflow-hidden" id="gift">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A027 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="max-w-6xl mx-auto space-y-16 relative">
                <div className="text-center space-y-4">
                    <p className="font-khmer text-[10px] md:text-sm tracking-[0.4em] text-gold/60 uppercase font-bold">
                        {wedding.themeSettings?.customLabels?.giftBadge || "ទឹកចិត្តសប្បុរស"}
                    </p>
                    <h2 className="font-khmer-moul text-3xl md:text-5xl text-gold-gradient text-gold-embossed leading-relaxed">
                        {wedding.themeSettings?.customLabels?.giftTitle || "ចំណងដៃឌីជីថល"}
                    </h2>
                    <p className="font-khmer text-gray-500 max-w-lg mx-auto text-xs md:text-sm">
                        {isAnniversary 
                            ? "លោកអ្នកអាចផ្ញើសមានចិត្តតាមរយៈការស្កេន QR កូដ ឬផ្ទេរមកកាន់លេខគណនីខាងក្រោម"
                            : "លោកអ្នកអាចធ្វើការផ្ញើចំណងដៃតាមរយៈការស្កេន QR កូដ ឬផ្ទេរមកកាន់លេខគណនីខាងក្រោម"}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bankAccounts.map((acc, idx) => (
                        <BankCard key={idx} account={acc} isAnniversary={isAnniversary} onOpen={setSelectedAccount} customLabels={wedding.themeSettings?.customLabels} />
                    ))}
                </div>

                <div className="text-center pt-8">
                    <p className="font-khmer text-gold/60 text-xs md:text-sm italic">
                        {wedding.themeSettings?.customLabels?.giftThankYou || "សូមអរគុណសម្រាប់ទឹកចិត្តសប្បុរស!"}
                    </p>
                </div>
            </div>

            <EnvelopeModal 
                account={selectedAccount} 
                isOpen={!!selectedAccount} 
                onClose={() => setSelectedAccount(null)} 
                customLabels={wedding.themeSettings?.customLabels}
            />
        </section>
    );
}

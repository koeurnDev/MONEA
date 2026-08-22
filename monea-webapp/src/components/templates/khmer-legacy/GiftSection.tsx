"use client";
import React from 'react';
import { Copy, Gift, CreditCard, ScanLine, CheckCircle2, XCircle } from 'lucide-react';
import NextImage from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { WeddingData, BankAccount } from '../types';
import { useTranslation } from '@/i18n/LanguageProvider';

const BankCard = ({ account, onOpen, customLabels }: { account: BankAccount, onOpen: (acc: BankAccount) => void, customLabels: any }) => {
    const { t } = useTranslation();
    return (
        <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpen(account)}
            className="bg-white/60 backdrop-blur-xl border border-white/40 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative group cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)]"
        >
            <div className="absolute -top-12 -right-12 p-8 opacity-[0.03] group-hover:scale-125 group-hover:opacity-[0.08] transition-all duration-700">
                <Gift size={200} className="text-gold-main" />
            </div>

            <div className="relative z-10 space-y-8 text-center">
                <div className="space-y-3">
                    <span className="font-playfair text-[10px] tracking-[0.5em] font-black text-gold-main/80 uppercase block">{account.bankName}</span>
                    <h4 className="font-khmer-moul text-slate-800 text-lg md:text-xl tracking-wider leading-relaxed">{account.accountName}</h4>
                </div>

                <div className="w-24 h-24 mx-auto relative group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gold-main/10 rounded-full animate-ping opacity-20" />
                    <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center text-gold-main shadow-lg border border-gold-main/10">
                        <ScanLine size={36} />
                    </div>
                </div>

                <div className="space-y-6">
                    <p className="font-khmer-content text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] md:tracking-widest leading-relaxed">
                        {customLabels?.giftCheckHint || t("template.khmerLegacy.giftCheckHint")}
                    </p>
                    <div className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-[#1c1917] text-gold-main text-[11px] font-black uppercase tracking-[0.3em] shadow-xl group-hover:bg-black transition-colors">
                        {customLabels?.giftCheckBtn || t("template.khmerLegacy.giftCheckBtn")}
                    </div>
                </div>
            </div>
        </m.div>
    );
};

const EnvelopeModal = ({ account, isOpen, onClose, customLabels }: { account: BankAccount | null, isOpen: boolean, onClose: () => void, customLabels: any }) => {
    const { t } = useTranslation();
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
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" 
                    />
                    
                    <m.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden"
                    >
                        <m.button 
                            whileHover={{ rotate: 90, scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose} 
                            className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors z-20"
                        >
                            <XCircle size={32} strokeWidth={1.5} />
                        </m.button>

                        <div className="p-10 md:p-16 text-center space-y-12">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-gold-main/10 text-gold-main text-[10px] font-black tracking-[0.3em] uppercase border border-gold-main/20">
                                    <CreditCard size={14} />
                                    {account.bankName}
                                </div>
                                <h3 className="font-khmer-moul text-3xl text-slate-900 drop-shadow-sm tracking-wider leading-relaxed">{account.accountName}</h3>
                            </div>

                            <div className="relative group">
                                {account.qrUrl ? (
                                    <m.div 
                                        initial={{ filter: 'blur(10px)', opacity: 0, scale: 0.95 }}
                                        animate={{ filter: 'blur(0px)', opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2, duration: 0.8 }}
                                        className="w-72 h-72 mx-auto p-6 bg-slate-50 rounded-[2.5rem] shadow-inner ring-1 ring-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-700"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-tr from-gold-main/5 to-transparent rounded-[2.5rem] pointer-events-none" />
                                        <NextImage src={account.qrUrl} alt="QR Code" width={288} height={288} className="w-full h-full object-contain relative z-10" unoptimized />
                                    </m.div>
                                ) : (
                                    <div className="w-full py-16 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50 space-y-4">
                                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.3em] block">Account Number</span>
                                        <span className="text-4xl font-mono font-bold tracking-[0.2em] text-slate-900">{account.accountNumber}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-10">
                                <div className="flex flex-col items-center gap-6">
                                    <m.div 
                                        whileHover={{ scale: 1.02 }}
                                        className="font-mono text-xl font-bold tracking-[0.2em] text-slate-800 bg-slate-50 px-10 py-5 rounded-2xl border border-slate-100 shadow-sm min-w-[240px]"
                                    >
                                        {account.accountNumber}
                                    </m.div>
                                    <m.button 
                                        whileHover={{ scale: 1.05, y: -4 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCopy}
                                        className={clsx(
                                            "flex items-center justify-center gap-4 w-full max-w-sm py-6 rounded-2xl font-black text-xs tracking-[0.3em] uppercase transition-all duration-500 shadow-xl",
                                            copied ? "bg-emerald-500 text-white shadow-emerald-500/30" : "bg-[#1c1917] text-gold-main hover:bg-black"
                                        )}
                                    >
                                        {copied ? <><CheckCircle2 size={20} /> {customLabels?.giftCopied || t("template.khmerLegacy.giftCopied")}</> : <><Copy size={20} /> {customLabels?.giftCopyBtn || t("template.khmerLegacy.giftCopyBtn")}</>}
                                    </m.button>
                                </div>

                                <div className="pt-10 border-t border-slate-100">
                                     <p className="font-khmer-content text-gold-main italic text-base md:text-lg leading-loose font-black">
                                        &quot;{customLabels?.giftBlessing || t("template.khmerLegacy.giftBlessing")}&quot;
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
    const { t } = useTranslation();
    const bankAccounts = wedding.themeSettings?.bankAccounts || [];
    const isAnniversary = wedding.eventType === 'anniversary';
    const [selectedAccount, setSelectedAccount] = React.useState<BankAccount | null>(null);

    if (bankAccounts.length === 0) return null;

    return (
        <section className="py-16 md:py-24 bg-white px-6 relative overflow-hidden" id="gift">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#B19356 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="max-w-6xl mx-auto space-y-12 relative">
                <m.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center space-y-6"
                >
                    <p className="font-playfair text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.8em] text-gold-main/80 uppercase font-black italic leading-relaxed">
                        {wedding.themeSettings?.customLabels?.giftBadge || t("template.khmerLegacy.giftBadge")}
                    </p>
                    <h2 className="font-khmer-moul text-3xl md:text-6xl text-gold-gradient text-gold-embossed tracking-wider leading-relaxed">
                        {wedding.themeSettings?.customLabels?.giftTitle || t("template.khmerLegacy.giftTitle")}
                    </h2>
                    <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-gold-main/30 to-transparent mx-auto my-6" />
                    <p className="font-khmer-content text-slate-600 max-w-2xl mx-auto text-base md:text-lg font-black italic leading-loose md:leading-relaxed">
                        {wedding.themeSettings?.customLabels?.giftSubtitle || (isAnniversary 
                            ? t("template.khmerLegacy.giftSubtitleAnniversary")
                            : t("template.khmerLegacy.giftSubtitleWedding"))}
                    </p>
                </m.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {bankAccounts.map((acc, idx) => (
                        <BankCard key={idx} account={acc} onOpen={setSelectedAccount} customLabels={wedding.themeSettings?.customLabels} />
                    ))}
                </div>

                <m.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-center pt-8"
                >
                    <p className="font-khmer-content text-gold-main/80 text-sm md:text-base italic font-black tracking-[0.2em] md:tracking-widest uppercase leading-loose">
                        {wedding.themeSettings?.customLabels?.giftThankYou || t("template.khmerLegacy.giftThankYou")}
                    </p>
                </m.div>
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

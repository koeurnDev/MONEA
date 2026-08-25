import React from 'react';
import { Copy, CreditCard, CheckCircle2, X, QrCode, Sparkles } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { WeddingData, BankAccount } from '../types';
import { useTranslation } from '@/i18n/LanguageProvider';

interface BankCardProps {
    account: BankAccount;
    onZoom: (acc: BankAccount) => void;
    customLabels: any;
}

const BankCard = ({ account, onZoom, customLabels }: BankCardProps) => {
    const { t } = useTranslation();
    const [copied, setCopied] = React.useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!account?.accountNumber) return;
        navigator.clipboard.writeText(account.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
    };

    const qrSrc = account.qrUrl || "/images/qr.webp";

    return (
        <m.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="relative max-w-sm mx-auto w-full bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFE4] border-2 border-[#E5D7C2] rounded-[2rem] p-6 shadow-[0_15px_35px_rgba(180,140,80,0.1)] hover:shadow-[0_22px_45px_rgba(180,140,80,0.18)] transition-all duration-300 flex flex-col items-center text-center space-y-4"
        >
            {/* Top Badge: Bank Name */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-[#A27A1E] text-[11px] font-bold tracking-wider uppercase font-kantumruy">
                <CreditCard size={13} className="text-[#C5A027]" />
                <span>{account.bankName || "KHQR Bank"}</span>
            </div>

            {/* Account Holder Name */}
            <div className="space-y-0.5">
                <h4 className="font-sans font-bold text-slate-800 text-base md:text-lg tracking-wide uppercase px-2">
                    {account.accountName || "KAB SIN & MEAS CHANMEANA"}
                </h4>
                <p className="text-[11px] font-kantumruy text-slate-400">
                    {customLabels?.giftCheckHint || t("template.khmerLegacy.giftCheckHint")}
                </p>
            </div>

            {/* QR Code Container */}
            <div 
                onClick={() => onZoom(account)}
                className="relative w-48 h-48 sm:w-52 sm:h-52 bg-white rounded-2xl p-3.5 shadow-inner border border-amber-200/80 flex items-center justify-center cursor-pointer group transition-all duration-300 hover:border-amber-400"
                title="ចុចដើម្បីពង្រីក (Tap to Zoom)"
            >
                <img 
                    src={qrSrc} 
                    alt="KHQR Code" 
                    className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white gap-1 p-2 pointer-events-none">
                    <QrCode size={28} />
                    <span className="text-xs font-bold font-kantumruy">ចុចដើម្បីពង្រីក</span>
                </div>
            </div>

            {/* Account Number Box */}
            <div className="w-full space-y-2.5 pt-1">
                <div className="w-full bg-white/90 py-2.5 px-4 rounded-xl border border-amber-200/60 shadow-sm flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-kantumruy font-medium">លេខគណនី</span>
                    <span className="text-base font-bold font-mono tracking-wider text-slate-800">
                        {account.accountNumber}
                    </span>
                </div>

                {/* 1-Click Copy Button */}
                <m.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCopy}
                    className={`w-full py-3 px-4 rounded-xl font-kantumruy font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                        copied
                            ? "bg-emerald-600 text-white shadow-emerald-600/30"
                            : "bg-gradient-to-r from-[#C5A027] via-[#B8921E] to-[#A27A1E] text-white hover:brightness-105 shadow-amber-900/15"
                    }`}
                >
                    {copied ? (
                        <>
                            <CheckCircle2 size={16} />
                            <span>{customLabels?.giftCopied || t("template.khmerLegacy.giftCopied")}</span>
                        </>
                    ) : (
                        <>
                            <Copy size={15} />
                            <span>{customLabels?.giftCopyBtn || t("template.khmerLegacy.giftCopyBtn")}</span>
                        </>
                    )}
                </m.button>
            </div>
        </m.div>
    );
};

interface QRModalProps {
    account: BankAccount | null;
    isOpen: boolean;
    onClose: () => void;
    customLabels: any;
}

const QRModal = ({ account, isOpen, onClose, customLabels }: QRModalProps) => {
    const { t } = useTranslation();
    const [copied, setCopied] = React.useState(false);

    if (!account) return null;

    const handleCopy = () => {
        if (!account?.accountNumber) return;
        navigator.clipboard.writeText(account.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
    };

    const qrSrc = account.qrUrl || "/images/qr.webp";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />

                    <m.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-sm bg-gradient-to-b from-white to-[#FDFBF7] rounded-[2.5rem] shadow-2xl border-2 border-[#E5D7C2] p-6 text-center space-y-5 z-10"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-1 pt-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-[#A27A1E] text-xs font-bold font-kantumruy">
                                <Sparkles size={13} className="text-[#C5A027]" />
                                <span>{account.bankName || "KHQR"}</span>
                            </div>
                            <h3 className="font-sans font-bold text-slate-800 text-lg tracking-wide uppercase pt-1">
                                {account.accountName}
                            </h3>
                        </div>

                        {/* Large High-Res QR */}
                        <div className="w-64 h-64 mx-auto bg-white p-4 rounded-2xl shadow-inner border border-amber-200 flex items-center justify-center">
                            <img src={qrSrc} alt="KHQR Code" className="w-full h-full object-contain" />
                        </div>

                        <div className="space-y-3">
                            <div className="bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
                                <span className="text-xs font-kantumruy text-slate-400">លេខគណនី</span>
                                <span className="font-mono text-lg font-bold text-slate-800 tracking-wider">
                                    {account.accountNumber}
                                </span>
                            </div>

                            <button
                                onClick={handleCopy}
                                className={`w-full py-3 rounded-xl font-kantumruy font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                                    copied
                                        ? "bg-emerald-600 text-white"
                                        : "bg-gradient-to-r from-[#C5A027] to-[#A27A1E] text-white hover:brightness-105"
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 size={16} />
                                        <span>{customLabels?.giftCopied || t("template.khmerLegacy.giftCopied")}</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={16} />
                                        <span>{customLabels?.giftCopyBtn || t("template.khmerLegacy.giftCopyBtn")}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default function GiftSection({ wedding }: { wedding: WeddingData }) {
    const { t } = useTranslation();
    const defaultAccounts: BankAccount[] = [
        {
            bankName: "ABA Bank (KHQR)",
            accountName: wedding.groomName && wedding.brideName ? `${wedding.groomName} & ${wedding.brideName}` : "KAB SIN & MEAS CHANMEANA",
            accountNumber: "001 234 567",
            qrUrl: "/images/qr.webp",
            side: "both"
        }
    ];

    const rawAccounts = wedding.themeSettings?.bankAccounts || [];
    const bankAccounts = rawAccounts.length > 0 ? rawAccounts : defaultAccounts;
    const isAnniversary = wedding.eventType === 'anniversary';
    const [zoomAccount, setZoomAccount] = React.useState<BankAccount | null>(null);

    return (
        <section className="py-16 md:py-24 bg-[#FCFAF6] px-6 relative overflow-hidden" id="gift">
            <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(#B19356 1px, transparent 1px)', backgroundSize: '36px 36px' }}
            />
            
            <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                {/* Header Title Section */}
                <m.div 
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center space-y-3"
                >
                    <p className="font-kantumruy text-xs uppercase tracking-[0.25em] text-[#B19356] font-bold">
                        — {wedding.themeSettings?.customLabels?.giftBadge || t("template.khmerLegacy.giftBadge")} —
                    </p>
                    <h2 className="font-khmer-moul text-2xl md:text-4xl text-slate-800 tracking-wide leading-relaxed">
                        {wedding.themeSettings?.customLabels?.giftTitle || t("template.khmerLegacy.giftTitle")}
                    </h2>
                    <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#C5A027] to-transparent mx-auto my-3" />
                    <p className="font-kantumruy text-slate-600 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
                        {wedding.themeSettings?.customLabels?.giftSubtitle || (isAnniversary 
                            ? t("template.khmerLegacy.giftSubtitleAnniversary")
                            : t("template.khmerLegacy.giftSubtitleWedding"))}
                    </p>
                </m.div>

                {/* Bank Account Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center max-w-2xl mx-auto">
                    {bankAccounts.map((acc, idx) => (
                        <BankCard 
                            key={idx} 
                            account={acc} 
                            onZoom={setZoomAccount} 
                            customLabels={wedding.themeSettings?.customLabels} 
                        />
                    ))}
                </div>

                {/* Footer Gratitude Note */}
                <m.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-center pt-4"
                >
                    <p className="font-kantumruy text-[#A27A1E] text-xs sm:text-sm font-medium tracking-wide">
                        ✨ {wedding.themeSettings?.customLabels?.giftThankYou || t("template.khmerLegacy.giftThankYou")} ✨
                    </p>
                </m.div>
            </div>

            {/* Full-Screen Zoom Lightbox Modal */}
            <QRModal 
                account={zoomAccount} 
                isOpen={!!zoomAccount} 
                onClose={() => setZoomAccount(null)} 
                customLabels={wedding.themeSettings?.customLabels}
            />
        </section>
    );
}

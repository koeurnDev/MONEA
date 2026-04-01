"use client";
import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, XCircle, Users, Heart } from 'lucide-react';
import { WeddingData } from '../types';
import { useTranslation } from '@/i18n/LanguageProvider';

interface RSVPSectionProps {
    wedding: WeddingData;
    guestName?: string;
}

export default function RSVPSection({ wedding, guestName }: RSVPSectionProps) {
    const { t } = useTranslation();
    const [status, setStatus] = useState<'CONFIRMED' | 'DECLINED' | null>(null);
    const [guestCount, setGuestCount] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isPending, startTransition] = React.useTransition();

    const handleStatusSelect = (newStatus: 'CONFIRMED' | 'DECLINED') => {
        startTransition(() => {
            setStatus(newStatus);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!status || !wedding.id) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/wedding/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weddingId: wedding.id,
                    guestId: (wedding as any).guestId,
                    rsvpStatus: status,
                    adultsCount: status === 'CONFIRMED' ? guestCount : 0,
                    childrenCount: 0,
                    rsvpNotes: `Name: ${guestName || "Guest"}`
                })
            });

            if (res.ok) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error("RSVP Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <section className="py-16 md:py-32 bg-white text-center px-6 relative overflow-hidden">
                {/* Studio Atmosphere */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none premium-texture" />
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                        <m.div
                            key={i}
                            initial={{ opacity: 0, y: 100, x: Math.random() * 400 - 200, scale: 0.5 }}
                            animate={{ opacity: [0, 1, 0], y: -800, x: Math.random() * 800 - 400, scale: [0.5, 1.2, 0.5], rotate: 360 }}
                            transition={{ duration: 6, delay: i * 0.4, repeat: Infinity, ease: "easeOut" }}
                            className="absolute bottom-0 left-1/2 text-gold-main/20 will-change-transform"
                        >
                            <Heart size={Math.random() * 15 + 10} fill="currentColor" />
                        </m.div>
                    ))}
                </div>

                <m.div 
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-xl mx-auto p-8 md:p-16 rounded-[4rem] border border-gold-main/10 space-y-12 relative z-10 bg-white/60 backdrop-blur-2xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] group"
                >
                    <div className="relative">
                        <m.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 bg-gold-main/10 rounded-full blur-2xl" 
                        />
                        <div className="w-24 h-24 bg-gold-gradient rounded-full flex items-center justify-center mx-auto text-white relative shadow-xl shadow-gold-main/20 border-2 border-white/50">
                            <CheckCircle2 size={40} strokeWidth={2.5} />
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex flex-col items-center gap-3">
                            <p className="font-playfair text-[10px] md:text-xs tracking-[0.6em] text-gold-main/80 uppercase font-black">
                                {t("invitation.rsvp.success")}
                            </p>
                            <div className="w-12 h-[1.5px] bg-gradient-to-r from-transparent via-gold-main/30 to-transparent" />
                        </div>
                        
                        <h3 className="font-khmer-moul text-3xl md:text-4xl text-gold-gradient text-gold-embossed tracking-wider leading-relaxed">
                            {t("invitation.rsvp.success")}
                        </h3>
                        
                        <div className="space-y-4">
                            <p className="font-khmer-content text-lg text-slate-600 leading-relaxed font-black italic">
                                {t("invitation.rsvp.received", { name: guestName || t("common.you") })}
                            </p>
                            <m.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-gold-main/5 p-6 rounded-[2rem] border border-gold-main/10"
                            >
                                <span className="text-gold-main font-khmer-content text-base font-black italic block">
                                    {status === 'CONFIRMED' 
                                        ? t(wedding.eventType === 'anniversary' ? "invitation.rsvp.wishAnniversary" : "invitation.rsvp.wishWedding")
                                        : t("invitation.rsvp.successDeclined")}
                                </span>
                            </m.div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-6 pt-6">
                        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-main/20 to-transparent" />
                        <p className="font-khmer-moul text-xs tracking-[0.2em] text-gold-main/60 uppercase drop-shadow-sm">
                            {wedding.themeSettings?.customLabels?.rsvpClosing || t("invitation.rsvp.closing")}
                        </p>
                    </div>
                </m.div>
            </section>
        );
    }

    return (
        <m.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="py-24 md:py-48 bg-[#FDFBF7] px-6 overflow-hidden relative" 
            id="rsvp"
        >
            <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white to-transparent" />
            
            <div className="max-w-3xl mx-auto relative z-10">
                <div className="text-center mb-12 space-y-6">
                    <p className="font-playfair text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.8em] text-gold-main/80 uppercase font-black mb-2 italic leading-relaxed">
                        {wedding.themeSettings?.customLabels?.rsvpBadge || t("invitation.rsvp.badge")}
                    </p>
                    <h2 className="font-khmer-moul text-4xl md:text-6xl text-gold-gradient text-gold-embossed tracking-wider leading-relaxed">
                        {wedding.themeSettings?.customLabels?.rsvpTitle || t("invitation.rsvp.title")}
                    </h2>
                    <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-gold-main/30 to-transparent mx-auto" />
                    <p className="font-khmer-content text-gray-600 text-lg italic font-black max-w-lg mx-auto leading-loose md:leading-relaxed">
                        {wedding.themeSettings?.customLabels?.rsvpSubtitle || t("invitation.rsvp.subtitle")}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12 bg-white/60 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-white/40 shadow-[0_40px_100px_rgba(0,0,0,0.08)] relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-gold-main/5 rounded-full blur-3xl" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <m.button
                            type="button"
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStatusSelect('CONFIRMED')}
                            className={`p-10 rounded-[2.5rem] border transition-all flex flex-col items-center gap-6 relative overflow-hidden shadow-sm ${
                                status === 'CONFIRMED' 
                                ? 'border-emerald-500/30 bg-emerald-50/40 text-emerald-800 ring-4 ring-emerald-500/5' 
                                : 'border-slate-100 bg-white/80 hover:border-gold-main/30'
                            }`}
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform duration-500 ${status === 'CONFIRMED' ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-50 text-slate-400'}`}>
                                <CheckCircle2 size={28} />
                            </div>
                            <span className="font-khmer-moul text-xl tracking-wider">{wedding.themeSettings?.customLabels?.rsvpConfirmBtn || t("invitation.rsvp.confirm")}</span>
                            
                            {status === 'CONFIRMED' && (
                                <m.div 
                                    layoutId="rsvp-active"
                                    className="absolute inset-0 bg-emerald-500/5 -z-10"
                                />
                            )}
                        </m.button>

                        <m.button
                            type="button"
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStatusSelect('DECLINED')}
                            className={`p-10 rounded-[2.5rem] border transition-all flex flex-col items-center gap-6 relative overflow-hidden shadow-sm ${
                                status === 'DECLINED' 
                                ? 'border-rose-400/30 bg-rose-50/40 text-rose-800 ring-4 ring-rose-500/5' 
                                : 'border-slate-100 bg-white/80 hover:border-gold-main/30'
                            }`}
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform duration-500 ${status === 'DECLINED' ? 'bg-rose-400 text-white scale-110' : 'bg-slate-50 text-slate-400'}`}>
                                <XCircle size={28} />
                            </div>
                            <span className="font-khmer-moul text-xl tracking-wider">{wedding.themeSettings?.customLabels?.rsvpDeclineBtn || t("invitation.rsvp.decline")}</span>
                            
                            {status === 'DECLINED' && (
                                <m.div 
                                    layoutId="rsvp-active"
                                    className="absolute inset-0 bg-rose-500/5 -z-10"
                                />
                            )}
                        </m.button>
                    </div>

                    <AnimatePresence>
                        {status === 'CONFIRMED' && (
                            <m.div
                                initial={{ opacity: 0, height: 0, y: 20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: 20 }}
                                className="space-y-8 overflow-hidden pt-4 relative z-10"
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <label className="font-khmer-content text-sm font-black text-slate-500 tracking-[0.2em] uppercase flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gold-main/10 flex items-center justify-center text-gold-main shadow-inner">
                                            <Users size={18} />
                                        </div>
                                        {wedding.themeSettings?.customLabels?.rsvpGuestCountLabel || t("invitation.rsvp.guestCount")}
                                    </label>
                                    <div className="flex gap-4 w-full max-w-md mx-auto">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <m.button
                                                key={n}
                                                type="button"
                                                whileHover={{ y: -4, scale: 1.05 }}
                                                whileTap={{ scale: 0.85 }}
                                                onClick={() => setGuestCount(n)}
                                                className={`flex-1 h-16 rounded-[1.25rem] border-2 font-black text-xl transition-all flex items-center justify-center shadow-sm ${
                                                    guestCount === n 
                                                    ? 'border-gold-main bg-gold-main text-white shadow-xl shadow-gold-main/30' 
                                                    : 'border-slate-100 bg-white text-slate-400 hover:border-gold-main/20'
                                                }`}
                                            >
                                                {n}
                                            </m.button>
                                        ))}
                                    </div>
                                </div>
                            </m.div>
                        )}
                    </AnimatePresence>

                    <m.button
                        type="submit"
                        disabled={!status || isSubmitting}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.96 }}
                        className="w-full py-8 bg-[#1c1917] text-gold-main font-khmer-moul text-2xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.25)] hover:bg-black transition-all disabled:opacity-30 border border-white/5 flex items-center justify-center gap-6 relative z-10 overflow-hidden group/submit"
                    >
                        {isSubmitting ? (
                            <div className="w-8 h-8 border-3 border-gold-main/30 border-t-gold-main rounded-full animate-spin" />
                        ) : (
                            <>
                                <span className="tracking-widest drop-shadow-md">
                                    {wedding.themeSettings?.customLabels?.rsvpSubmitBtn || t("invitation.rsvp.submit")}
                                </span>
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover/submit:bg-gold-main group-hover/submit:text-white transition-all">
                                    <Send size={22} className="group-hover/submit:translate-x-1 group-hover/submit:-translate-y-1 transition-transform" />
                                </div>
                            </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/submit:translate-x-full transition-transform duration-1000" />
                    </m.button>
                </form>
            </div>
        </m.section>
    );
}


"use client";
import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, XCircle, Users, Heart } from 'lucide-react';
import { WeddingData } from '../types';

interface RSVPSectionProps {
    wedding: WeddingData;
    guestName?: string;
}

export default function RSVPSection({ wedding, guestName }: RSVPSectionProps) {
    const [status, setStatus] = useState<'CONFIRMED' | 'DECLINED' | null>(null);
    const [guestCount, setGuestCount] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

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
            <section className="py-24 bg-white text-center px-6 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                        <m.div
                            key={i}
                            initial={{ opacity: 0, y: 100, x: Math.random() * 400 - 200 }}
                            animate={{ opacity: [0, 1, 0], y: -500, x: Math.random() * 600 - 300 }}
                            transition={{ duration: 4, delay: i * 0.2, repeat: Infinity }}
                            className="absolute bottom-0 left-1/2 text-pink-500/20"
                        >
                            <Heart size={24} fill="currentColor" />
                        </m.div>
                    ))}
                </div>

                <m.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl mx-auto p-12 md:p-20 rounded-[4rem] border-lux space-y-10 relative z-10 bg-white/50 backdrop-blur-md shadow-2xl"
                >
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 relative">
                        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
                        <CheckCircle2 size={48} />
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-khmer-moul text-2xl md:text-3xl text-gray-800">សូមអរគុណយ៉ាងជ្រាលជ្រៅ!</h3>
                        <p className="font-khmer-content text-lg text-gray-600 leading-relaxed">
                            {wedding.themeSettings?.customLabels?.rsvpSubmittedText || "យើងខ្ញុំបានទទួលការឆ្លើយតប"}របស់ {guestName || "លោកអ្នក"} រួចរាល់ហើយ។ <br />
                            <span className="text-gold italic mt-4 block">
                                {status === 'CONFIRMED' 
                                    ? (wedding.eventType === 'anniversary' ? "សង្ឃឹមថានឹងបានជួបគ្នានៅក្នុងថ្ងៃខួបអាពាហ៍ពិពាហ៍!" : "សង្ឃឹមថានឹងបានជួបគ្នានៅក្នុងថ្ងៃមង្គលការ!")
                                    : "ទោះមិនអាចអញ្ជើញមកក្តី ក៏យើងខ្ញុំសូមអរគុណចំពោះការផ្ដល់ដំណឹង!"}
                            </span>
                        </p>
                    </div>
                    <div className="h-[1px] w-32 bg-gold/20 mx-auto" />
                    <p className="font-khmer text-xs tracking-[0.2em] text-gold/60 uppercase font-bold">
                        {wedding.themeSettings?.customLabels?.rsvpTitle || "ដោយក្ដីស្រឡាញ់ និងអរគុណ"}
                    </p>
                </m.div>
            </section>
        );
    }

    return (
        <section className="py-24 md:py-48 bg-[#FDFBF7] px-6 overflow-hidden relative" id="rsvp">
            <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white to-transparent" />
            
            <div className="max-w-2xl mx-auto relative z-10">
                <div className="text-center mb-20 space-y-6">
                    <p className="font-khmer text-[10px] md:text-sm tracking-[0.4em] text-gold/60 uppercase font-bold mb-2">
                        {wedding.themeSettings?.customLabels?.rsvpBadge || "ការឆ្លើយតប"}
                    </p>
                    <h2 className="font-khmer-moul text-4xl md:text-5xl text-gold-gradient text-gold-embossed">
                        {wedding.themeSettings?.customLabels?.rsvpTitle || "ការឆ្លើយតប"}
                    </h2>
                    <div className="w-24 h-[1px] bg-gold/20 mx-auto" />
                    <p className="font-khmer-content text-gray-500 text-base italic">
                        សូមមេត្តាផ្ដល់ដំណឹងដល់យើងខ្ញុំអំពីការចូលរួមរបស់លោកអ្នក
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12 bg-white/40 backdrop-blur-xl p-10 md:p-16 rounded-[4rem] border-lux shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-colors" />
                    
                    <div className="grid grid-cols-2 gap-6 relative z-10">
                        <m.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setStatus('CONFIRMED')}
                            className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 relative overflow-hidden ${
                                status === 'CONFIRMED' 
                                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-lg shadow-emerald-500/10' 
                                : 'border-stone-100 bg-white hover:border-gold/30'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status === 'CONFIRMED' ? 'bg-emerald-500 text-white' : 'bg-stone-50 text-gray-400'}`}>
                                <CheckCircle2 size={24} />
                            </div>
                            <span className="font-khmer-content font-black text-lg">{wedding.themeSettings?.customLabels?.rsvpConfirmBtn || "ចូលរួម"}</span>
                            {status === 'CONFIRMED' && (
                                <m.div 
                                    layoutId="rsvp-active"
                                    className="absolute inset-0 bg-emerald-500/5 -z-10"
                                />
                            )}
                        </m.button>

                        <m.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setStatus('DECLINED')}
                            className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 relative overflow-hidden ${
                                status === 'DECLINED' 
                                ? 'border-red-400 bg-red-50 text-red-600 shadow-lg shadow-red-500/10' 
                                : 'border-stone-100 bg-white hover:border-gold/30'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status === 'DECLINED' ? 'bg-red-400 text-white' : 'bg-stone-50 text-gray-400'}`}>
                                <XCircle size={24} />
                            </div>
                            <span className="font-khmer-content font-black text-lg">{wedding.themeSettings?.customLabels?.rsvpDeclineBtn || "អភ័យទោស"}</span>
                            {status === 'DECLINED' && (
                                <m.div 
                                    layoutId="rsvp-active"
                                    className="absolute inset-0 bg-red-500/5 -z-10"
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
                                className="space-y-6 overflow-hidden pt-4 relative z-10"
                            >
                                <label className="font-khmer-content text-sm font-bold text-gray-600 block flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                                        <Users size={16} />
                                    </div>
                                    ចំនួនអ្នកចូលរួមសរុប
                                </label>
                                <div className="flex gap-3">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <m.button
                                            key={n}
                                            type="button"
                                            whileHover={{ y: -2 }}
                                            onClick={() => setGuestCount(n)}
                                            className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${
                                                guestCount === n 
                                                ? 'border-gold bg-gold text-white shadow-xl shadow-gold/20' 
                                                : 'border-stone-100 bg-white text-gray-400 hover:border-gold/20'
                                            }`}
                                        >
                                            {n}
                                        </m.button>
                                    ))}
                                </div>
                            </m.div>
                        )}
                    </AnimatePresence>

                    <m.button
                        type="submit"
                        disabled={!status || isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-6 bg-gray-900 text-gold font-khmer-moul text-lg rounded-[2rem] shadow-2xl hover:bg-black transition-all disabled:opacity-30 flex items-center justify-center gap-4 relative z-10"
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>ផ្ញើការឆ្លើយតប</span>
                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                        )}
                    </m.button>
                </form>
            </div>
        </section>
    );
}


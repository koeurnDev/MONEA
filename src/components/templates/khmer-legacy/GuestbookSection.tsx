"use client";
import * as React from 'react';
import { Send, Heart, User, MessageSquare, Sparkles } from 'lucide-react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import useSWR from "swr";
import { moneaClient } from "@/lib/api-client";
import { useTranslation } from '@/i18n/LanguageProvider';

export default function GuestbookSection({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const { t, locale } = useTranslation();
    const [name, setName] = React.useState(guestName || "");
    const [message, setMessage] = React.useState("");
    const [website, setWebsite] = React.useState(""); // Honeypot field
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    const { data: wishes = [], mutate } = useSWR(
        wedding.id ? `/api/guestbook?weddingId=${wedding.id}` : null,
        { refreshInterval: 5000 }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim() || !wedding.id) return;

        setIsSubmitting(true);
        try {
            const res = await moneaClient.post('/api/guestbook', {
                weddingId: wedding.id,
                guestName: name,
                message: message,
                website: website // Send honeypot field
            });

            if (!res.error) {
                setMessage("");
                mutate();
            }
        } catch (error) {
            console.error("Failed to submit wish:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-16 md:py-32 bg-white relative overflow-hidden" id="wishes">
            {/* Cinematic Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(177,147,86,0.05)_0%,_transparent_70%)] pointer-events-none" />
            
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                
                {/* Header */}
                <m.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 space-y-8"
                >
                    <div className="flex flex-col items-center space-y-4">
                        <p className="font-playfair text-[10px] md:text-xs tracking-[0.8em] text-gold-main/80 uppercase font-black">
                            {t("template.khmerLegacy.guestbook.badge")}
                        </p>
                        <div className="w-16 h-[1.5px] bg-gradient-to-r from-transparent via-gold-main/30 to-transparent" />
                    </div>
                    
                    <div className="relative inline-block px-8">
                        <h2 className="font-khmer-moul text-4xl md:text-7xl text-gold-gradient text-gold-embossed tracking-wider leading-relaxed">
                            {t("template.khmerLegacy.guestbook.title")}
                        </h2>
                        <m.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -left-16 top-1/2 -translate-y-1/2 hidden md:block"
                        >
                            <Sparkles size={48} className="text-gold-main" />
                        </m.div>
                        <m.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                            className="absolute -right-16 top-1/2 -translate-y-1/2 hidden md:block"
                        >
                            <Sparkles size={48} className="text-gold-main" />
                        </m.div>
                    </div>

                    <p className="font-khmer-content text-slate-600 text-lg md:text-xl leading-relaxed font-black italic max-w-2xl mx-auto">
                        {wedding.themeSettings?.customLabels?.wishesSubtitle || t("template.khmerLegacy.guestbook.subtitle")}
                    </p>
                </m.div>

                {/* Form */}
                <m.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto bg-white/60 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-white/60 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] mb-16 relative group"
                >
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-gold-main/5 rounded-full blur-3xl" />
                    
                    <div className="relative z-10 space-y-10">
                        <div className="relative group/input">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-gold-main group-focus-within/input:bg-gold-main group-focus-within/input:text-white transition-colors duration-500">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder={wedding.themeSettings?.customLabels?.wishesNamePlaceholder || t("template.khmerLegacy.guestbook.namePlaceholder")}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-18 bg-white/80 border border-slate-100 rounded-[1.25rem] pl-20 pr-6 font-khmer-content text-base font-black focus:ring-4 focus:ring-gold-main/5 focus:border-gold-main/30 outline-none transition-all duration-500 shadow-sm"
                                required
                            />
                        </div>

                        {/* Honeypot field - Hidden from users */}
                        <div className="hidden" aria-hidden="true">
                            <input 
                                type="text" 
                                name="website" 
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                tabIndex={-1} 
                                autoComplete="off"
                            />
                        </div>

                        <div className="relative group/input">
                            <div className="absolute left-6 top-6 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-gold-main group-focus-within/input:bg-gold-main group-focus-within/input:text-white transition-colors duration-500">
                                <MessageSquare size={18} />
                            </div>
                            <textarea
                                placeholder={wedding.themeSettings?.customLabels?.wishesMsgPlaceholder || t("template.khmerLegacy.guestbook.msgPlaceholder")}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full h-48 bg-white/80 border border-slate-100 rounded-[1.25rem] pl-20 pr-6 pt-7 font-khmer-content text-base font-black focus:ring-4 focus:ring-gold-main/5 focus:border-gold-main/30 outline-none transition-all duration-500 shadow-sm resize-none"
                                required
                            />
                        </div>

                        <m.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-20 bg-[#1c1917] text-gold-main font-khmer-moul text-xl rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-black transition-all duration-500 flex items-center justify-center gap-6 disabled:opacity-50 group/btn border border-white/5 overflow-hidden relative"
                        >
                            <span className="tracking-widest relative z-10">
                                {isSubmitting ? t("common.sending") : (wedding.themeSettings?.customLabels?.wishesSubmitBtn || t("template.khmerLegacy.guestbook.submit"))}
                            </span>
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover/btn:bg-gold-main group-hover/btn:text-white transition-all duration-500 relative z-10">
                                <Send size={22} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                        </m.button>
                    </div>
                </m.form>

                {/* Wishes Slider */}
                <div className="relative group/slider">
                    <div className="flex gap-10 overflow-x-auto pb-16 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                        {wishes.map((wish: any, idx: number) => (
                            <m.div
                                key={wish.id || idx}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: (idx % 3) * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                viewport={{ once: true }}
                                className="min-w-[85vw] md:min-w-[500px] bg-white/80 backdrop-blur-xl p-12 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative group overflow-hidden transition-all duration-700 snap-center hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-2"
                            >
                                <div className="absolute -top-12 -right-12 w-48 h-48 bg-gold-main/[0.03] rounded-full transition-all group-hover:bg-gold-main/[0.07] group-hover:scale-125 duration-1000" />
                                <Heart className="absolute -right-6 -top-6 text-rose-500/5 opacity-0 group-hover:opacity-100 transition-all scale-[2.5] rotate-12 duration-700" size={100} />
                                
                                <div className="flex items-center gap-6 mb-10">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 flex items-center justify-center text-gold-main font-black text-2xl font-playfair shadow-sm">
                                        {wish.guestName?.charAt(0)}
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="font-khmer-moul text-sm text-slate-800 tracking-wider font-black">{wish.guestName}</h4>
                                        <p className="font-playfair text-[10px] text-slate-400 font-black tracking-[0.2em] uppercase">
                                            {mounted ? new Date(wish.createdAt).toLocaleDateString(locale === 'km' ? 'km-KH' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Phnom_Penh' }) : '...'}
                                        </p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <p className="font-khmer-content text-lg text-slate-600 leading-relaxed italic font-black">
                                        &ldquo;{wish.message}&rdquo;
                                    </p>
                                    <div className="w-12 h-[1px] bg-gold-main/20 mt-8" />
                                </div>
                            </m.div>
                        ))}
                        {wishes.length === 0 && (
                            <m.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="w-full max-w-2xl mx-auto p-16 md:p-24 bg-white/40 backdrop-blur-xl rounded-[4rem] border border-gold-main/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] text-center space-y-8 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 premium-texture opacity-[0.03] pointer-events-none" />
                                <div className="absolute -top-20 -right-20 w-80 h-80 bg-gold-main/5 rounded-full blur-3xl group-hover:bg-gold-main/10 transition-colors duration-1000" />
                                
                                <div className="relative">
                                    <m.div 
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-24 h-24 bg-gold-main/5 rounded-[2rem] flex items-center justify-center mx-auto text-gold-main border border-gold-main/10 relative z-10"
                                    >
                                        <MessageSquare size={40} strokeWidth={1.5} />
                                        <Heart size={20} className="absolute -top-2 -right-2 text-rose-400 animate-pulse" fill="currentColor" />
                                    </m.div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gold-main/5 blur-3xl rounded-full" />
                                </div>
                                
                                <div className="space-y-4 relative z-10">
                                    <p className="font-playfair text-[10px] md:text-xs tracking-[0.8em] text-gold-main/60 uppercase font-black">Ready to receive</p>
                                    <h4 className="font-khmer-moul text-xl md:text-2xl text-gold-gradient tracking-widest leading-relaxed">
                                        {wedding.themeSettings?.customLabels?.wishesEmptyTitle || t("template.khmerLegacy.guestbook.emptyTitle")}
                                    </h4>
                                    <p className="font-khmer-content text-slate-500 text-lg md:text-xl font-black italic leading-relaxed">
                                        {wedding.themeSettings?.customLabels?.wishesEmpty || t("template.khmerLegacy.guestbook.empty")}
                                    </p>
                                </div>
                                
                                <div className="flex justify-center relative z-10 pt-4">
                                    <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-main/20 to-transparent" />
                                </div>
                            </m.div>
                        )}
                    </div>

                    {/* Hint for mobile */}
                    <m.div 
                        animate={{ x: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex justify-center mt-6 md:hidden"
                    >
                        <p className="font-playfair text-[9px] text-gold-main/40 tracking-[0.5em] uppercase font-black">
                            {t("common.scrollMore")} &rarr;
                        </p>
                    </m.div>
                </div>
            </div>
        </section>
    );
}

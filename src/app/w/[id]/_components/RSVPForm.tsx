"use client";

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Users, MessageSquare, Loader2 } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import { useTranslation } from "@/i18n/LanguageProvider";
import { moneaClient } from "@/lib/api-client";

interface RSVPFormProps {
    weddingId: string;
    guestId?: string;
    primaryColor: string;
    theme?: 'light' | 'dark';
}

export function RSVPForm({ weddingId, guestId, primaryColor, theme = 'dark' }: RSVPFormProps) {
    const { t } = useTranslation();
    const isLight = theme === 'light';
    const textColor = isLight ? 'text-stone-800' : 'text-white';
    const subTextColor = isLight ? 'text-stone-600' : 'text-white/70';
    const bgColor = isLight ? 'bg-white shadow-2xl border-lux' : 'bg-white/10 backdrop-blur-md border-white/20 shadow-2xl';
    const [step, setStep] = React.useState<'status' | 'details' | 'success'>('status');
    const [status, setStatus] = React.useState<'CONFIRMED' | 'DECLINED' | null>(null);
    const [adults, setAdults] = React.useState(1);
    const [children, setChildren] = React.useState(0);
    const [notes, setNotes] = React.useState("");
    const [website, setWebsite] = React.useState(""); // Honeypot field
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        // Track when RSVP modal/section is viewed
        if ((window as any).trackMoneaEvent) {
            (window as any).trackMoneaEvent("RSVP_OPEN");
        }
    }, []);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await moneaClient.post("/api/wedding/rsvp", {
                weddingId,
                guestId,
                rsvpStatus: status,
                adultsCount: adults,
                childrenCount: children,
                rsvpNotes: notes,
                website: website // Send honeypot field
            });

            if (res.error) throw new Error(res.error);
            
            if ((window as any).trackMoneaEvent) {
                (window as any).trackMoneaEvent("RSVP_SUBMIT");
            }
            
            setStep('success');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-center p-8 rounded-[2.5rem] border ${bgColor}`}
            >
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                    <Check className="text-white w-10 h-10" />
                </div>
                <h3 className={`text-2xl font-black font-khmer mb-2 ${textColor}`}>{t("invitation.rsvp.success")}</h3>
                <p className={`font-medium font-khmer ${subTextColor}`}>
                    {status === 'CONFIRMED' 
                        ? t("invitation.rsvp.successConfirmed") 
                        : t("invitation.rsvp.successDeclined")}
                </p>
            </m.div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto w-full">
            <AnimatePresence mode="wait">
                {step === 'status' ? (
                    <m.div
                        key="status"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="space-y-8"
                    >
                        <h3 className={`text-2xl md:text-4xl font-black font-khmer text-center leading-tight ${isLight ? 'text-stone-800' : 'text-white/95'}`}>{t("invitation.rsvp.title")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                            <button
                                onClick={() => { setStatus('CONFIRMED'); setStep('details'); }}
                                className="flex flex-col items-center gap-6 p-10 md:p-14 rounded-[3rem] bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/20 hover:border-emerald-500/40 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg shadow-emerald-500/20 relative z-10">
                                    <Check className="text-white w-10 h-10" />
                                </div>
                                <span className="text-xl font-bold text-emerald-500 font-khmer relative z-10">{t("invitation.rsvp.confirm")}</span>
                            </button>
                            <button
                                onClick={() => { setStatus('DECLINED'); handleSubmit(); }}
                                className="flex flex-col items-center gap-6 p-10 md:p-14 rounded-[3rem] bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/20 hover:border-red-500/40 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all shadow-lg shadow-red-500/20 relative z-10">
                                    <X className="text-white w-10 h-10" />
                                </div>
                                <span className="text-xl font-bold text-red-500 font-khmer relative z-10">{t("invitation.rsvp.decline")}</span>
                            </button>
                        </div>
                    </m.div>
                ) : (
                    <m.div
                        key="details"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-8 md:p-12 rounded-[3.5rem] border shadow-3xl max-w-4xl mx-auto ${isLight ? 'bg-white border-lux' : 'bg-white/[0.03] backdrop-blur-3xl border-white/10'}`}
                    >
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 text-white/80">
                                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                                            <Users size={20} className="text-primary" style={{ color: primaryColor }} />
                                        </div>
                                        <span className="text-lg font-bold font-khmer">{t("invitation.rsvp.guestCount")}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[11px] text-white/40 uppercase font-black tracking-widest ml-1">{t("invitation.rsvp.adults")}</label>
                                            <Input
                                                type="number"
                                                value={adults}
                                                onChange={(e) => setAdults(parseInt(e.target.value))}
                                                className="h-14 bg-white/5 border-white/10 rounded-2xl text-white text-center text-xl font-black focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] text-white/40 uppercase font-black tracking-widest ml-1">{t("invitation.rsvp.children")}</label>
                                            <Input
                                                type="number"
                                                value={children}
                                                onChange={(e) => setChildren(parseInt(e.target.value))}
                                                className="h-14 bg-white/5 border-white/10 rounded-2xl text-white text-center text-xl font-black focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 text-white/80">
                                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                                            <MessageSquare size={20} className="text-primary" style={{ color: primaryColor }} />
                                        </div>
                                        <span className="text-lg font-bold font-khmer">{t("invitation.rsvp.notes")}</span>
                                    </div>
                                    <Textarea
                                        placeholder={t("invitation.rsvp.notesPlaceholder")}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="bg-white/5 border-white/10 rounded-[2rem] text-white min-h-[160px] p-6 text-lg focus:ring-2 focus:ring-primary/20 placeholder:text-white/10"
                                    />
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
                                </div>
                            </div>

                            <div className="flex flex-col justify-center gap-6">
                                <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-4" style={{ borderColor: `${primaryColor}20`, backgroundColor: `${primaryColor}08` }}>
                                    <p className="text-white/60 text-sm font-medium leading-relaxed font-khmer italic">
                                        &quot;{t("invitation.rsvp.registeredGuest", { name: guestId ? 'ដែលមានឈ្មោះក្នុងបញ្ជីស្រាប់' : '' })}&quot;
                                    </p>
                                </div>
                                <Button
                                    disabled={loading}
                                    onClick={handleSubmit}
                                    className="w-full h-16 md:h-20 rounded-[2rem] text-xl font-black font-khmer shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-white hover:text-white"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : t("invitation.rsvp.submit")}
                                </Button>
                                <button
                                    onClick={() => setStep('status')}
                                    className="w-full text-white/30 text-xs font-black font-kantumruy uppercase tracking-[0.3em] hover:text-white/60 transition-colors"
                                >
                                    {t("invitation.rsvp.back")}
                                </button>
                            </div>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
}

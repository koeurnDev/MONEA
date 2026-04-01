"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LifeBuoy, Send, CheckCircle2, Loader2, AlertCircle, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { AnimatePresence, m } from 'framer-motion';
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";

function SupportForm() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const weddingId = searchParams.get("weddingId");

    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [priority, setPriority] = useState("NORMAL");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/support/ticket", {
                method: "POST",
                body: JSON.stringify({ subject, message, priority, weddingId }),
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to submit ticket");
            }

            setSubmitted(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) return (
        <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center"
        >
            <div className="relative mb-8">
                <m.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.2 }}
                    className="w-24 h-24 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center text-green-500"
                >
                    <CheckCircle2 size={48} />
                </m.div>
                <div className="absolute inset-0 bg-green-400/20 blur-3xl rounded-full animate-pulse" />
            </div>

            <h2 className="text-3xl font-black text-foreground mb-3 font-kantumruy tracking-tight">{t("support.form.success.title")}</h2>
            <p className="text-muted-foreground font-medium font-kantumruy mb-10 max-w-sm leading-relaxed">
                {t("support.form.success.desc")}
            </p>

            <Button
                onClick={() => window.location.href = `/dashboard?weddingId=${weddingId}`}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2rem] px-16 h-14 font-bold uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
                {t("support.form.success.back")}
            </Button>
        </m.div>
    );

    return (
        <div className="grid lg:grid-cols-5 gap-10 items-start">
            <m.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-3"
            >
                <Card className="shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-none rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-2xl p-1 relative border-none">
                    <div className="p-8 md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <AnimatePresence mode="wait">
                                {error && (
                                    <m.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-xs font-bold font-kantumruy flex gap-3 items-center"
                                    >
                                        <AlertCircle size={18} />
                                        {error}
                                    </m.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2 font-kantumruy">{t("support.form.subject")}</label>
                                <Input
                                    placeholder={t("support.form.subjectPlaceholder")}
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    className="h-14 rounded-2xl border-none bg-background/50 font-kantumruy text-foreground focus:ring-4 focus:ring-primary/5 focus:bg-background transition-all px-6 shadow-sm"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2 font-kantumruy">{t("support.form.priority")}</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'NORMAL', label: t("support.form.priorityNormal"), icon: Zap, color: 'text-blue-500' },
                                        { id: 'HIGH', label: t("support.form.priorityHigh"), icon: Sparkles, color: 'text-red-500' }
                                    ].map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setPriority(p.id)}
                                            className={cn(
                                                "h-14 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                                                priority === p.id
                                                    ? 'bg-primary/10 text-primary shadow-md'
                                                    : 'bg-background/40 text-muted-foreground hover:bg-background/60 shadow-sm'
                                            )}
                                        >
                                            <p.icon size={16} className={priority === p.id ? 'text-primary' : 'text-muted-foreground/40'} />
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2 font-kantumruy">{t("support.form.message")}</label>
                                <Textarea
                                    placeholder={t("support.form.messagePlaceholder")}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="min-h-[200px] rounded-[2rem] border-none bg-background/50 p-6 font-kantumruy text-foreground focus:ring-4 focus:ring-primary/5 focus:bg-background transition-all shadow-sm"
                                    required
                                />
                            </div>

                            <Button
                                className="h-16 w-full bg-primary text-primary-foreground rounded-[2rem] font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.01] active:scale-95 border-none"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> {t("support.form.submit")}</>}
                            </Button>
                        </form>
                    </div>
                </Card>
            </m.div>

            <m.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 space-y-6"
            >
                <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-black text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                    <LifeBuoy className="mb-8 text-primary" size={40} />
                    <h4 className="text-2xl font-black font-kantumruy uppercase tracking-tight mb-3">{t("support.urgentHelp.title")}</h4>
                    <p className="text-sm font-medium font-kantumruy opacity-70 leading-relaxed mb-8">
                        {t("support.urgentHelp.desc")}
                    </p>
                    <a
                        href="https://t.me/monea_support"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all active:scale-95"
                    >
                        {t("support.urgentHelp.telegram")} <Send size={16} />
                    </a>
                </div>

                <div className="p-10 rounded-[2.5rem] bg-card/30 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-none">
                    <h4 className="text-xs font-black font-kantumruy uppercase tracking-widest text-muted-foreground mb-6">{t("support.whyContact.title")}</h4>
                    <ul className="space-y-6">
                        {[
                            { text: t("support.whyContact.solve"), icon: ShieldCheck },
                            { text: t("support.whyContact.request"), icon: Zap },
                            { text: t("support.whyContact.help"), icon: Sparkles }
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 text-sm font-bold text-foreground font-kantumruy">
                                <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 shadow-sm">
                                    <item.icon size={16} />
                                </div>
                                {item.text}
                            </li>
                        ))}
                    </ul>
                </div>
            </m.div>
        </div>
    );
}

export default function SupportPage() {
    const { t, locale } = useTranslation();
    return (
        <div className="max-w-6xl mx-auto py-12 px-6 relative">
            {/* Background Glows */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none opacity-50" />

            <m.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-14 text-center md:text-left"
            >
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/5 text-primary text-[10px] font-black tracking-[0.3em] uppercase mb-6 shadow-sm">
                    <ShieldCheck size={16} /> {t("support.center")}
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight font-kantumruy uppercase mb-5 leading-[1.1]">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                        {t("support.title")}
                    </span>
                </h1>
                <p className="text-lg text-muted-foreground font-medium font-kantumruy max-w-3xl leading-relaxed">
                    {t("support.subtitle")}
                </p>
            </m.div>

            <Suspense fallback={
                <div className="min-h-[400px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            }>
                <SupportForm />
            </Suspense>
        </div>
    );
}

import { useState, Suspense } from "react";
import { useSearchParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LifeBuoy, Send, CheckCircle2, Loader2, AlertCircle, ShieldCheck, Zap, Sparkles, MessageCircle, HelpCircle } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/app/dashboard/_components/PageHeader";

function SupportForm() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
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
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#141419] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm"
        >
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 mb-6 border border-emerald-500/20">
                <CheckCircle2 size={44} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3 font-kantumruy tracking-tight">
                {t("support.form.success.title", { defaultValue: "សារត្រូវបានផ្ញើរួចរាល់!" })}
            </h2>
            <p className="text-muted-foreground font-medium font-kantumruy mb-8 max-w-md leading-relaxed text-sm">
                {t("support.form.success.desc", { defaultValue: "ក្រុមការងារបច្ចេកទេសនឹងពិនិត្យ និងឆ្លើយតបជូនអ្នកវិញឱ្យបានលឿនបំផុត។" })}
            </p>

            <Button
                onClick={() => setSubmitted(false)}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl px-8 h-11 font-bold text-xs transition-all"
            >
                {t("support.form.success.back", { defaultValue: "ផ្ញើសារថ្មីទៀត" })}
            </Button>
        </motion.div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Support Ticket Form */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-7"
            >
                <Card className="shadow-sm border border-slate-200/80 dark:border-white/10 rounded-3xl overflow-hidden bg-white dark:bg-[#141419]">
                    <div className="p-6 sm:p-8">
                        <div className="mb-6 space-y-1">
                            <h3 className="text-lg sm:text-xl font-bold font-kantumruy text-foreground">
                                {t("support.form.title", { defaultValue: "ផ្ញើសំណើសុំជំនួយ" })}
                            </h3>
                            <p className="text-xs text-muted-foreground font-kantumruy">
                                {t("support.form.desc", { defaultValue: "បំពេញព័ត៌មានខាងក្រោមដើម្បីឱ្យក្រុមការងារជួយដោះស្រាយបញ្ហាជូនអ្នក។" })}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold font-kantumruy flex gap-2.5 items-center"
                                    >
                                        <AlertCircle size={16} />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground font-kantumruy">
                                    {t("support.form.subject", { defaultValue: "ប្រធានបទ / ប្រភេទបញ្ហា" })}
                                </label>
                                <Input
                                    placeholder={t("support.form.subjectPlaceholder", { defaultValue: "តើអ្នកត្រូវការជំនួយលើផ្នែកអ្វីខ្លះ?" })}
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 font-kantumruy text-sm text-foreground focus-visible:ring-rose-500 px-4"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground font-kantumruy">
                                    {t("support.form.priority", { defaultValue: "កម្រិតអាទិភាព" })}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'NORMAL', label: t("support.form.priorityNormal", { defaultValue: "ធម្មតា" }), icon: Zap, activeColor: 'text-slate-800 dark:text-white', activeBg: 'bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/20' },
                                        { id: 'HIGH', label: t("support.form.priorityHigh", { defaultValue: "អាទិភាពខ្ពស់ (បន្ទាន់)" }), icon: Sparkles, activeColor: 'text-amber-700 dark:text-amber-300', activeBg: 'bg-amber-500/10 border-amber-500/30' }
                                    ].map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setPriority(p.id)}
                                            className={cn(
                                                "h-11 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border",
                                                priority === p.id
                                                    ? `${p.activeBg} ${p.activeColor} shadow-sm font-black`
                                                    : 'bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-muted-foreground hover:bg-slate-100'
                                            )}
                                        >
                                            <p.icon size={14} className={priority === p.id ? p.activeColor : 'text-muted-foreground/50'} />
                                            <span>{p.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground font-kantumruy">
                                    {t("support.form.message", { defaultValue: "សារពិពណ៌នាបញ្ហា" })}
                                </label>
                                <Textarea
                                    placeholder={t("support.form.messagePlaceholder", { defaultValue: "សូមរៀបរាប់លម្អិតអំពីបញ្ហា ឬសំណួររបស់អ្នកឱ្យបានច្បាស់លាស់..." })}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="min-h-[140px] rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 p-3.5 font-kantumruy text-sm text-foreground focus-visible:ring-rose-500 leading-relaxed"
                                    required
                                />
                            </div>

                            <Button
                                className="h-11 w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold font-kantumruy text-xs shadow-md shadow-rose-600/20 transition-all active:scale-98 flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <><Send size={15} /> <span>{t("support.form.submit", { defaultValue: "ផ្ញើសារឥឡូវនេះ" })}</span></>}
                            </Button>
                        </form>
                    </div>
                </Card>
            </motion.div>

            {/* Right Column: Direct Telegram Support & Info Cards */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="lg:col-span-5 space-y-5"
            >
                {/* Official Telegram Support Card (Eye-friendly, Soft & Modern) */}
                <Card className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141419] shadow-sm p-6 sm:p-7 relative overflow-hidden">
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center border border-[#229ED9]/20 shadow-sm">
                            <MessageCircle size={24} />
                        </div>

                        <div className="space-y-1.5">
                            <h4 className="text-lg font-bold font-kantumruy text-foreground">
                                {t("support.urgentHelp.title", { defaultValue: "ជំនួយបន្ទាន់តាម Telegram" })}
                            </h4>
                            <p className="text-xs text-muted-foreground font-kantumruy leading-relaxed">
                                {t("support.urgentHelp.desc", { defaultValue: "សម្រាប់ករណីបន្ទាន់ អ្នកអាចទាក់ទងផ្ទាល់ជាមួយក្រុមការងារ Support តាម Telegram ដើម្បីទទួលបានការឆ្លើយតបឆាប់រហ័ស។" })}
                            </p>
                        </div>

                        <a
                            href="https://t.me/monea_support"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 w-full h-11 bg-[#229ED9] hover:bg-[#1E88C7] text-white rounded-xl font-bold font-kantumruy text-xs shadow-md shadow-[#229ED9]/20 transition-all active:scale-98"
                        >
                            <span>{t("support.urgentHelp.telegram", { defaultValue: "ទាក់ទងតាម Telegram" })}</span>
                            <Send size={14} />
                        </a>

                        <p className="text-[10px] text-muted-foreground/60 font-kantumruy text-center">
                            {t("support.urgentHelp.replyTime", { defaultValue: "ពេលវេលាឆ្លើយតប៖ ជាទូទៅក្នុងរយៈពេល ១ ទៅ ២៤ ម៉ោង" })}
                        </p>
                    </div>
                </Card>

                {/* Why Contact Us Card */}
                <Card className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141419] shadow-sm p-6">
                    <h4 className="text-xs font-bold font-kantumruy text-foreground mb-4 flex items-center gap-2">
                        <HelpCircle size={15} className="text-muted-foreground" />
                        <span>{t("support.whyContact.title", { defaultValue: "ហេតុអ្វីត្រូវទាក់ទងមកយើង?" })}</span>
                    </h4>
                    <ul className="space-y-3.5">
                        {[
                            { text: t("support.whyContact.solve", { defaultValue: "ដោះស្រាយបញ្ហាបច្ចេកទេស និងការបង្កើតសំបុត្រ" }), icon: ShieldCheck, color: "text-emerald-600 bg-emerald-500/10" },
                            { text: t("support.whyContact.request", { defaultValue: "ស្នើសុំមុខងារបន្ថែម ឬការកែសម្រួលពិសេស" }), icon: Zap, color: "text-amber-600 bg-amber-500/10" },
                            { text: t("support.whyContact.help", { defaultValue: "ជំនួយក្នុងការរៀបចំកាលវិភាគ និងបញ្ជីភ្ញៀវ" }), icon: Sparkles, color: "text-blue-600 bg-blue-500/10" }
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300 font-kantumruy">
                                <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm", item.color)}>
                                    <item.icon size={14} />
                                </div>
                                <span className="flex-1 leading-snug">{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </motion.div>
        </div>
    );
}

export default function SupportPage() {
    const { t } = useTranslation();
    return (
        <div className="w-full space-y-6 pb-12">
            <PageHeader 
                title={t("dashboard.user.helpSupport", { defaultValue: "ជំនួយ និងការគាំទ្រ" })} 
                icon={LifeBuoy}
                iconColor="text-rose-500"
            />

            <Suspense fallback={
                <div className="min-h-[300px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-rose-500" size={32} />
                </div>
            }>
                <SupportForm />
            </Suspense>
        </div>
    );
}

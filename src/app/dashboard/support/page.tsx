"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LifeBuoy, Send, CheckCircle2, Loader2, AlertCircle, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

function SupportForm() {
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
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center"
        >
            <div className="relative mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.2 }}
                    className="w-24 h-24 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center text-green-500"
                >
                    <CheckCircle2 size={48} />
                </motion.div>
                <div className="absolute inset-0 bg-green-400/20 blur-3xl rounded-full animate-pulse" />
            </div>

            <h2 className="text-3xl font-black text-foreground mb-3 font-kantumruy tracking-tight">សំណើរបស់អ្នកត្រូវបានផ្ញើ!</h2>
            <p className="text-muted-foreground font-medium font-kantumruy mb-10 max-w-sm leading-relaxed">
                ក្រុមការងារ Superadmin ទទួលបានសំណើរបស់អ្នកហើយ។ យើងនឹងពិនិត្យមើល និងដោះស្រាយជូនឆាប់ៗបំផុត។
            </p>

            <Button
                onClick={() => window.location.href = `/dashboard?weddingId=${weddingId}`}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2rem] px-16 h-14 font-bold uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
                ត្រឡប់ទៅផ្ទាំងដើម
            </Button>
        </motion.div>
    );

    return (
        <div className="grid lg:grid-cols-5 gap-10 items-start">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-3"
            >
                <Card className="border border-border/50 shadow-2xl shadow-primary/5 dark:shadow-none rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-2xl p-1 relative">
                    <div className="p-8 md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-xs font-bold font-kantumruy flex gap-3 items-center"
                                    >
                                        <AlertCircle size={18} />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2 font-kantumruy">ប្រធានបទ / Subject</label>
                                <Input
                                    placeholder="បញ្ហាបច្ចេកទេស, សំណើថែមមុខងារ..."
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    className="h-14 rounded-2xl border-border/50 bg-background/50 font-kantumruy text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all px-6 border-2"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2 font-kantumruy">កម្រិតអាទិភាព / Priority</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'NORMAL', label: 'ធម្មតា', icon: Zap, color: 'text-blue-500' },
                                        { id: 'HIGH', label: 'បន្ទាន់', icon: Sparkles, color: 'text-red-500' }
                                    ].map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setPriority(p.id)}
                                            className={cn(
                                                "h-14 rounded-2xl font-bold text-xs uppercase tracking-widest border-2 flex items-center justify-center gap-3 transition-all",
                                                priority === p.id
                                                    ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5'
                                                    : 'border-border/50 bg-background/30 text-muted-foreground hover:border-primary/30'
                                            )}
                                        >
                                            <p.icon size={16} className={priority === p.id ? 'text-primary' : 'text-muted-foreground/40'} />
                                            {p.id}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2 font-kantumruy">សារលម្អិត / Message</label>
                                <Textarea
                                    placeholder="សូមរាយការណ៍ពីបញ្ហាដែលលោកអ្នកបានជួបប្រទះ..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="min-h-[200px] rounded-[2rem] border-border/50 bg-background/50 p-6 font-kantumruy text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all border-2"
                                    required
                                />
                            </div>

                            <Button
                                className="h-16 w-full bg-primary text-primary-foreground rounded-[2rem] font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:scale-[1.01] active:scale-95"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> ផ្ញើសំណើ (Send Request)</>}
                            </Button>
                        </form>
                    </div>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 space-y-6"
            >
                <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-black text-white shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                    <LifeBuoy className="mb-8 text-primary" size={40} />
                    <h4 className="text-2xl font-black font-kantumruy uppercase tracking-tight mb-3">ជំនួយបន្ទាន់</h4>
                    <p className="text-sm font-medium font-kantumruy opacity-70 leading-relaxed mb-8">
                        លោកអ្នកក៏អាចទាក់ទងមកកាន់ពួកយើងផ្ទាល់តាមរយៈ Telegram សម្រាប់ករណីបច្ចេកទេសបន្ទាន់បំផុត។
                    </p>
                    <a
                        href="https://t.me/monea_support"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                    >
                        Telegram Support <Send size={16} />
                    </a>
                </div>

                <div className="p-10 rounded-[2.5rem] bg-card/30 backdrop-blur-md border border-border/50 shadow-sm">
                    <h4 className="text-xs font-black font-kantumruy uppercase tracking-widest text-muted-foreground mb-6">WHY CONTACT US?</h4>
                    <ul className="space-y-6">
                        {[
                            { text: "ដោះស្រាយបញ្ហាបច្ចេកទេស", icon: ShieldCheck },
                            { text: "សំណើបន្ថែមមុខងារថ្មីៗ", icon: Zap },
                            { text: "ជំនួយក្នុងការរៀបចំធៀបការ", icon: Sparkles }
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 text-sm font-bold text-foreground font-kantumruy">
                                <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                                    <item.icon size={16} />
                                </div>
                                {item.text}
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>
        </div>
    );
}

export default function SupportPage() {
    return (
        <div className="max-w-6xl mx-auto py-12 px-6 relative">
            {/* Background Glows */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none opacity-50" />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-14 text-center md:text-left"
            >
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black tracking-[0.3em] uppercase mb-6">
                    <ShieldCheck size={16} /> OFFICIAL MONEA HELP CENTER
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight font-kantumruy uppercase mb-5 leading-[1.1]">
                    Support Center<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">មជ្ឈមណ្ឌលជំនួយ</span>
                </h1>
                <p className="text-lg text-muted-foreground font-medium font-kantumruy max-w-3xl leading-relaxed">
                    ជួបបញ្ហាបច្ចេកទេស ឬចង់បានមុខងារបន្ថែម? ផ្ញើសារមកកាន់ពួកយើងដោយផ្ទាល់។ ក្រុមការងារមនោសញ្ចេតនា (MONEA) ត្រៀមខ្លួនជានិច្ចដើម្បីជួយអ្នក។
                </p>
            </motion.div>

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

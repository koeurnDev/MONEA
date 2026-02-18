"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LifeBuoy, Send, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SupportPage({ searchParams }: { searchParams: { weddingId: string } }) {
    const weddingId = searchParams.weddingId;
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [priority, setPriority] = useState("NORMAL");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch("/api/support/ticket", {
                method: "POST",
                body: JSON.stringify({ subject, message, priority, weddingId }),
                headers: { "Content-Type": "application/json" }
            });
            setSubmitted(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6">
                <CheckCircle2 size={40} />
            </motion.div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 font-kantumruy">សំណើរបស់អ្នកត្រូវបានផ្ញើ!</h2>
            <p className="text-slate-500 font-medium font-kantumruy mb-8">ក្រុមការងារមេ (Superadmin) នឹងពិនិត្យមើល និងដោះស្រាយជូនឆាប់ៗបំផុត។</p>
            <Button onClick={() => window.location.href = `/dashboard?weddingId=${weddingId}`} className="bg-slate-900 text-white rounded-2xl px-12 h-12 font-bold uppercase tracking-widest text-xs">
                ត្រឡប់ទៅផ្ទាំងដើម
            </Button>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="mb-10">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight font-kantumruy uppercase">Support Center | មជ្ឈមណ្ឌលជំនួយ</h1>
                <p className="text-sm text-slate-500 font-medium font-kantumruy mt-1.5 leading-relaxed">
                    ប្រសិនបើលោកអ្នកជួបបញ្ហាបច្ចេកទេស ឬមានសំណូមពរផ្សេងៗ សូមផ្ញើសារមកកាន់ពួកយើង។
                </p>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 font-kantumruy">ប្រធានបទ / Subject</label>
                        <Input
                            placeholder="បញ្ហាបច្ចេកទេស, សំណើថែមមុខងារ..."
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-kantumruy"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 font-kantumruy">កម្រិតអាទិភាព / Priority</label>
                        <div className="grid grid-cols-2 gap-4">
                            {['NORMAL', 'HIGH'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={cn(
                                        "h-12 rounded-2xl font-bold text-xs uppercase tracking-widest border-2 transition-all",
                                        priority === p
                                            ? 'border-red-600 bg-red-50 text-red-600'
                                            : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 font-kantumruy">សារលម្អិត / Message</label>
                        <Textarea
                            placeholder="សូមរាយការណ៍ពីបញ្ហាដែលលោកអ្នកបានជួបប្រទះ..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="min-h-[150px] rounded-[2rem] border-slate-100 bg-slate-50/50 p-6 font-kantumruy"
                            required
                        />
                    </div>

                    <Button
                        className="h-14 w-full bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Send size={16} /> ផ្ញើសំណើ (Send Request)</>}
                    </Button>
                </form>
            </Card>

            <div className="mt-8 p-6 rounded-[2rem] bg-blue-50 border border-blue-100 flex gap-4">
                <LifeBuoy className="text-blue-600 shrink-0" size={24} />
                <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase tracking-wide">
                    លោកអ្នកក៏អាចទាក់ទងមកកាន់ពួកយើងផ្ទាល់តាមរយៈ Telegram: @monea_support សម្រាប់ករណីបន្ទាន់បំផុត។
                </p>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

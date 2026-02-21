"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Zap, Sparkles, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function UpgradePage() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [payToast, setPayToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const plans = [
        {
            id: "FREE",
            name: "ឥតគិតថ្លៃ (Basic)",
            price: "0$",
            description: "សម្រាប់ការសាកល្បងបន្ទាប់ពីបង្កើត",
            features: ["១ ព្រឹត្តិការណ៍", "ពុម្ពគំរូស្តង់ដារ", "បញ្ជីភ្ញៀវ ៥០ នាក់", "រក្សាទុកបាន ២ សប្តាហ៍"],
            disabled: true,
            theme: "bg-white border-slate-100 shadow-sm opacity-60",
            buttonStyle: "bg-slate-100 text-slate-400 cursor-not-allowed",
            label: "កញ្ចប់បច្ចុប្បន្ន"
        },
        {
            id: "PRO",
            name: "ប្រណីត (Pro)",
            price: "19$",
            description: "ពេញនិយមបំផុតសម្រាប់គូស្នេហ៍",
            features: ["គ្រប់ពុម្ពគំរូទាំងអស់", "បញ្ជីភ្ញៀវ (មិនកំណត់)", "កត់ត្រាចំណងដៃ & សារ", "រក្សទុកបានរហូត"],
            recommended: true,
            icon: Zap,
            theme: "bg-white border-red-100 shadow-xl shadow-red-500/5 ring-1 ring-red-500/10",
            buttonStyle: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100/50",
            label: "ដំឡើងឥឡូវនេះ"
        },
        {
            id: "PREMIUM",
            name: "កម្រិតខ្ពស់ (Premium)",
            price: "49$",
            description: "សម្រាប់ពិធីធំ និងសេវាកម្មពេញលេញ",
            features: ["ដក Logo MONEA ចេញ", "ជំនួយការផ្ទាល់ ២៤/៧", "ទាញយករបាយការណ៍ PDF/Excel", "មុខងារប្តូរពណ៌តាមចិត្ត"],
            icon: Crown,
            theme: "bg-white border-slate-100 shadow-2xl shadow-slate-200/50",
            buttonStyle: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200",
            label: "ជ្រើសរើស Premium"
        }
    ];

    const handleSelect = (planId: string) => {
        setSelectedPlan(planId);
        setShowPayment(true);
    };

    const confirmPayment = async () => {
        const res = await fetch("/api/payment/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ packageType: selectedPlan })
        });

        if (res.ok) {
            setShowPayment(false);
            setPayToast({ type: "success", msg: "✅ បង់ប្រាក់ជោគជ័យ! កញ្ចប់ត្រូវបានដំឡើង។ 🎉" });
            setTimeout(() => { setPayToast(null); window.location.reload(); }, 3000);
        } else {
            const data = await res.json();
            setPayToast({ type: "error", msg: `❌ ការបង់ប្រាក់បរាជ័យ៖ ${data.error || "សូមព្យាយាមម្តងទៀត"}` });
            setTimeout(() => setPayToast(null), 4000);
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfcfd] pb-20 relative overflow-hidden">
            {payToast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold ${payToast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                    }`}>
                    {payToast.msg}
                </div>
            )}
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-50/50 to-transparent -z-10" />
            <div className="absolute top-40 left-10 w-72 h-72 bg-red-100/20 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-100/20 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center space-y-4 mb-20 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-red-50 shadow-sm mb-4"
                    >
                        <Sparkles className="w-3 h-3 text-red-600" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] font-kantumruy">ដំឡើងគម្រោងរបស់អ្នក</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black font-kantumruy text-slate-900 tracking-tight"
                    >
                        កញ្ចប់សេវាកម្ម <span className="text-red-600">Premium</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 max-w-2xl mx-auto font-kantumruy text-lg font-medium"
                    >
                        ជ្រើសរើសកញ្ចប់ដែលសាកសមបំផុត ដើម្បីធ្វើឱ្យថ្ងៃពិសេសរបស់អ្នកកាន់តែមានន័យ។
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-stretch pt-4 relative">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                        >
                            <Card className={cn(
                                "relative flex flex-col h-full rounded-[2.5rem] border transition-all duration-500 group overflow-hidden",
                                plan.theme,
                                plan.id === 'PREMIUM' ? 'p-1' : 'p-2'
                            )}>
                                {plan.id === 'PREMIUM' && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 -z-10 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                                )}

                                {plan.recommended && (
                                    <div className="absolute top-6 right-8 bg-red-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-red-200">
                                        Popular
                                    </div>
                                )}

                                <CardHeader className="text-center pt-12 pb-8">
                                    <div className="flex justify-center mb-6">
                                        <div className={cn(
                                            "p-5 rounded-3xl transition-all duration-500",
                                            plan.id === 'PRO' ? 'bg-red-50 text-red-600 scale-110' :
                                                plan.id === 'PREMIUM' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'
                                        )}>
                                            {plan.icon ? <plan.icon className="h-8 w-8" strokeWidth={2.5} /> : <ShieldCheck className="h-8 w-8" />}
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-black font-kantumruy mb-3 text-slate-900 tracking-tight">{plan.name}</CardTitle>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-6xl font-black tracking-tight text-slate-900 font-mono">{plan.price}</span>
                                        <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">/ EVT</span>
                                    </div>
                                    <CardDescription className="mt-6 text-slate-500 font-medium font-kantumruy px-6">{plan.description}</CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 px-10 pb-10">
                                    <div className="w-full h-px bg-slate-50 mb-10" />
                                    <ul className="space-y-5">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="flex items-start gap-4">
                                                <div className={cn(
                                                    "mt-1 rounded-full p-1 shadow-sm",
                                                    plan.id === 'PREMIUM' ? 'bg-slate-900 text-white' :
                                                        plan.id === 'PRO' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
                                                )}>
                                                    <Check className="h-3 w-3" strokeWidth={4} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-600 font-kantumruy">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter className="px-8 pb-10 pt-4">
                                    <Button
                                        className={cn(
                                            "w-full h-16 rounded-2xl text-lg font-black font-kantumruy transition-all duration-300 active:scale-[0.98]",
                                            plan.buttonStyle
                                        )}
                                        disabled={plan.disabled}
                                        onClick={() => handleSelect(plan.id)}
                                    >
                                        {plan.label}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 text-center animate-bounce">
                    <p className="text-slate-400 text-xs font-bold font-kantumruy uppercase tracking-widest">
                        ត្រូវការជំនួយ? <a href="https://t.me/koeurn65" target="_blank" rel="noreferrer" className="text-red-600 font-black hover:underline px-2">Telegram Help</a>
                    </p>
                </div>
            </div>

            {/* Payment Modal */}
            <Dialog open={showPayment} onOpenChange={setShowPayment}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] overflow-hidden p-0 border-none shadow-2xl bg-white">
                    <div className="bg-slate-900 p-10 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse" />
                        <DialogTitle className="text-2xl font-black font-kantumruy mb-2 tracking-tight">ស្កេនដើម្បីបង់ប្រាក់</DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center">
                            ABA Mobile KHQR Payment
                        </DialogDescription>
                    </div>

                    <div className="p-10 flex flex-col items-center">
                        <div className="w-64 h-64 bg-white p-6 rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-50 relative group transition-transform duration-500 hover:scale-105">
                            {/* Mock QR Content */}
                            <div className="w-full h-full border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center space-y-4">
                                <div className="text-5xl font-black text-slate-900 tracking-tighter">ABA</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">MONEA PAY</div>
                                <div className="w-12 h-1 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                            </div>
                        </div>

                        <div className="mt-10 space-y-4 w-full">
                            <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                                    <Sparkles className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-slate-900 font-kantumruy uppercase tracking-wide">ការដំឡើងដោយស្វ័យប្រវត្តិ</p>
                                    <p className="text-xs text-slate-500 font-medium font-kantumruy mt-1 leading-relaxed">គណនីរបស់អ្នកនឹងទទួលបានមុខងារថ្មីៗភ្លាមៗ បន្ទាប់ពីការបង់ប្រាក់បានជោគជ័យ។</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 w-full space-y-4">
                            <Button size="lg" className="w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black font-kantumruy text-lg shadow-xl shadow-red-100 transition-all active:scale-95" onClick={confirmPayment}>
                                ខ្ញុំបានបង់ប្រាក់រួចរាល់ហើយ
                            </Button>
                            <Button variant="ghost" className="w-full text-slate-400 font-bold font-kantumruy hover:text-slate-900" onClick={() => setShowPayment(false)}>
                                បោះបង់ការបង់ប្រាក់
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

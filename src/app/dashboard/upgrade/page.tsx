"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Zap, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { m } from 'framer-motion';
import dynamic from "next/dynamic";
import QRCode from "react-qr-code";
const Turnstile = dynamic(() => import("@marsidev/react-turnstile").then(mod => mod.Turnstile), { ssr: false });

export default function UpgradePage() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");
    const [payToast, setPayToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [qrString, setQrString] = useState("");
    const [loadingQR, setLoadingQR] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [currentPackage, setCurrentPackage] = useState<string>("FREE");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchWedding = async () => {
            const res = await fetch("/api/wedding");
            if (res.ok) {
                const data = await res.json();
                if (data.packageType) {
                    setCurrentPackage(data.packageType);
                }
            }
        };
        fetchWedding();
    }, []);

    const plans = [
        {
            id: "FREE",
            name: "គម្រោងមូលដ្ឋាន",
            price: "0$",
            description: "សាកសមសម្រាប់អ្នកដែលចង់សាកល្បងប្រើប្រាស់ដំបូង",
            features: [
                "ចំនួនភ្ញៀវ៖ អាចបញ្ចូលបានត្រឹម ៥០ នាក់",
                "ពុម្ពគំរូ៖ ប្រើបានតែម៉ូដស្តង់ដារ (Standard)",
                "ការរក្សាទុក៖ ទិន្នន័យរក្សាទុកបានត្រឹមតែ ២ សប្តាហ៍ប៉ុណ្ណោះ"
            ],
            theme: "bg-card shadow-sm border-none",
            buttonStyle: currentPackage === "FREE" ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary/20 text-primary hover:bg-primary/30",
            label: currentPackage === "FREE" ? "កញ្ចប់បច្ចុប្បន្ន" : "កញ្ចប់មូលដ្ឋាន",
            disabled: currentPackage === "FREE" || currentPackage === "PRO" || currentPackage === "PREMIUM"
        },
        {
            id: "PRO",
            name: "គម្រោងប្រណីត",
            price: "19$",
            description: "សាកសមបំផុតសម្រាប់កម្មវិធីមង្គលការទូទៅ",
            features: [
                "ចំនួនភ្ញៀវ៖ អាចបញ្ចូលបាន មិនកំណត់ចំនួន",
                "ពុម្ពគំរូ៖ អាចប្រើប្រាស់បាន គ្រប់ម៉ូដទាំងអស់",
                "ចំណងដៃ៖ អាចកត់ត្រាចំណងដៃ និងសារជូនពរបាន",
                "ការរក្សាទុក៖ រក្សាទុកទិន្នន័យជូន រហូតដល់បច្ចុប្បន្ន (Lifetime)"
            ],
            recommended: true,
            icon: Zap,
            theme: "bg-card border-none",
            buttonStyle: currentPackage === "PRO" ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95",
            label: currentPackage === "PRO" ? "កញ្ចប់បច្ចុប្បន្ន" : (currentPackage === "PREMIUM" ? "រួចរាល់" : "ដំឡើងឥឡូវនេះ"),
            disabled: currentPackage === "PRO" || currentPackage === "PREMIUM"
        },
        {
            id: "PREMIUM",
            name: "គម្រោងកម្រិតខ្ពស់",
            price: "49$",
            description: "សាកសមសម្រាប់ភាពល្អឥតខ្ចោះ និងសេវាកម្មពេញលេញ",
            features: [
                "ដក Logo ចេញ៖ អាច ដក Logo MONEA ចេញ",
                "ការរចនា៖ ប្តូរពណ៌ឱ្យត្រូវនឹង Theme ការពិត",
                "របាយការណ៍៖ ទាញយកជាឯកសារ PDF ឬ Excel",
                "សេវាកម្ម៖ មានការគាំទ្រ និងជំនួយផ្ទាល់ ២៤/៧"
            ],
            icon: Crown,
            theme: "bg-card border-none",
            buttonStyle: currentPackage === "PREMIUM" ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md active:scale-95",
            label: currentPackage === "PREMIUM" ? "កញ្ចប់បច្ចុប្បន្ន" : "ជ្រើសរើស Premium",
            disabled: currentPackage === "PREMIUM"
        }
    ];

    const handleSelect = async (planId: string) => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        setSelectedPlan(planId);
        setShowPayment(true);
        setLoadingQR(true);
        setQrString("");

        try {
            const res = await fetch("/api/payment/generate-qr", {
                method: "POST",
                body: JSON.stringify({
                    amount: parseFloat(plan.price.replace('$', '')),
                    currency: "USD",
                    merchantName: "MONEA UPGRADE",
                    orderId: `UPG-${planId}-${Date.now()}`
                })
            });

            if (res.ok) {
                const data = await res.json();
                setQrString(data.qr);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingQR(false);
        }
    };

    const confirmPayment = async () => {
        setIsConfirming(true);
        try {
            const res = await fetch("/api/payment/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageType: selectedPlan,
                    turnstileToken
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.wedding?.packageType) {
                    setCurrentPackage(data.wedding.packageType);
                }
                setShowPayment(false);
                setPayToast({ type: "success", msg: "✅ បង់ប្រាក់ជោគជ័យ! កញ្ចប់ត្រូវបានដំឡើង។ 🎉" });
                setTimeout(() => { setPayToast(null); window.location.reload(); }, 3000);
            } else {
                const data = await res.json();
                setPayToast({ type: "error", msg: `❌ ការបង់ប្រាក់បរាជ័យ៖ ${data.error || "សូមព្យាយាមម្តងទៀត"}` });
                setTimeout(() => setPayToast(null), 4000);
            }
        } catch (e) {
            console.error(e);
            setPayToast({ type: "error", msg: "❌ បញ្ហាបច្ចេកទេស! សូមព្យាយាមម្តងទៀត។" });
        } finally {
            setIsConfirming(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
            {payToast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold ${payToast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                    }`}>
                    {payToast.msg}
                </div>
            )}
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-50/50 dark:from-red-950/20 to-transparent -z-10" />
            <div className="absolute top-40 left-10 w-72 h-72 bg-red-100/20 dark:bg-red-900/10 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center space-y-4 mb-20 relative">
                    <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-card px-4 py-1.5 rounded-full shadow-sm mb-4 border-none"
                    >
                        <Sparkles className="w-3 h-3 text-red-600" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] font-kantumruy">ដំឡើងគម្រោងរបស់អ្នក</span>
                    </m.div>
                    <m.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black font-kantumruy text-foreground tracking-tight"
                    >
                        កញ្ចប់សេវាកម្ម <span className="text-red-600">Premium</span>
                    </m.h1>
                    <m.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground max-w-2xl mx-auto font-kantumruy text-lg font-medium"
                    >
                        ជ្រើសរើសកញ្ចប់ដែលសាកសមបំផុត ដើម្បីធ្វើឱ្យថ្ងៃពិសេសរបស់អ្នកកាន់តែមានន័យ។
                    </m.p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-stretch pt-4 relative">
                    {plans.map((plan, index) => (
                        <m.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                        >
                            <Card className={cn(
                                "relative flex flex-col h-full rounded-[2.5rem] transition-all duration-500 group overflow-hidden border-none shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.2)]",
                                plan.theme,
                                plan.id === 'PREMIUM' ? 'p-1' : 'p-2'
                            )}>
                                {plan.id === 'PREMIUM' && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 -z-10 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                                )}

                                {plan.recommended && (
                                    <div className="absolute top-6 right-8 bg-red-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-md">
                                        Popular
                                    </div>
                                )}

                                <CardHeader className="text-center pt-12 pb-8">
                                    <div className="flex justify-center mb-6">
                                        <div className={cn(
                                            "p-5 rounded-3xl transition-all duration-500",
                                            plan.id === 'PRO' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 scale-110' :
                                                plan.id === 'PREMIUM' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                        )}>
                                            {plan.icon ? <plan.icon className="h-8 w-8" strokeWidth={2.5} /> : <ShieldCheck className="h-8 w-8" />}
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-black font-kantumruy mb-3 text-foreground tracking-tight">{plan.name}</CardTitle>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-6xl font-black tracking-tight text-foreground font-mono">{plan.price}</span>
                                        <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest">/ EVT</span>
                                    </div>
                                    <CardDescription className="mt-6 text-muted-foreground font-medium font-kantumruy px-6">{plan.description}</CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 px-10 pb-10">
                                    <div className="w-full h-px bg-border/5 mb-10" />
                                    <ul className="space-y-5">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="flex items-start gap-4">
                                                <div className={cn(
                                                    "mt-1 rounded-full p-1 shadow-sm",
                                                    plan.id === 'PREMIUM' ? 'bg-primary text-primary-foreground' :
                                                        plan.id === 'PRO' ? 'bg-red-50 dark:bg-red-950/30 text-red-600' : 'bg-muted text-muted-foreground'
                                                )}>
                                                    <Check className="h-3 w-3" strokeWidth={4} />
                                                </div>
                                                <span className="text-sm font-bold text-muted-foreground font-kantumruy">{f}</span>
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
                        </m.div>
                    ))}
                </div>

                <div className="mt-20 text-center animate-bounce">
                    <p className="text-muted-foreground text-xs font-bold font-kantumruy uppercase tracking-widest">
                        ត្រូវការជំនួយ? <a href="https://t.me/koeurn65" target="_blank" rel="noreferrer" className="text-red-600 font-black hover:underline px-2">Telegram Help</a>
                    </p>
                </div>
            </div>

            {/* Payment Modal */}
            <Dialog open={showPayment} onOpenChange={setShowPayment}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] overflow-hidden p-0 border-none shadow-2xl bg-card">
                    <div className="bg-primary p-10 text-primary-foreground text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse" />
                        <DialogTitle className="text-2xl font-black font-kantumruy mb-2 tracking-tight">ស្កេនដើម្បីបង់ប្រាក់</DialogTitle>
                        <DialogDescription className="text-primary-foreground/60 text-xs font-bold uppercase tracking-widest text-center">
                            ABA Mobile KHQR Payment
                        </DialogDescription>
                    </div>

                    <div className="p-10 flex flex-col items-center">
                        <div className="w-64 h-64 bg-white p-6 rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.12)] relative group transition-transform duration-500 hover:scale-105 border-none flex items-center justify-center">
                            {loadingQR ? (
                                <div className="animate-pulse space-y-4 text-center">
                                    <div className="w-40 h-40 bg-slate-100 rounded-2xl mx-auto" />
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generating QR...</div>
                                </div>
                            ) : qrString ? (
                                <QRCode value={qrString} size={200} viewBox={`0 0 256 256`} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                            ) : (
                                <div className="text-center space-y-2">
                                    <p className="text-xs text-red-500 font-bold">QR Error</p>
                                    <Button variant="link" size="sm" onClick={() => selectedPlan && handleSelect(selectedPlan)}>Retry</Button>
                                </div>
                            )}
                        </div>

                        <div className="mt-10 space-y-4 w-full">
                            <div className="flex items-start gap-4 p-5 bg-muted rounded-2xl border-none shadow-sm">
                                <div className="w-10 h-10 bg-background rounded-xl shadow-sm flex items-center justify-center shrink-0 border-none">
                                    <Sparkles className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-foreground font-kantumruy uppercase tracking-wide">ការដំឡើងដោយស្វ័យប្រវត្តិ</p>
                                    <p className="text-xs text-muted-foreground font-medium font-kantumruy mt-1 leading-relaxed">គណនីរបស់អ្នកនឹងទទួលបានមុខងារថ្មីៗភ្លាមៗ បន្ទាប់ពីការបង់ប្រាក់បានជោគជ័យ។</p>
                                </div>
                            </div>

                            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
                                <div className="mt-6 scale-90 origin-center">
                                    <Turnstile
                                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                                        onSuccess={setTurnstileToken}
                                        options={{ theme: 'dark', appearance: 'always' }}
                                    />
                                </div>
                            ) : (
                                <div className="mt-6 text-[10px] text-red-500 bg-red-500/10 p-2 rounded-lg text-center font-bold">
                                    Turnstile Key Missing
                                </div>
                            )}
                        </div>

                        <div className="mt-10 w-full space-y-4">
                            <Button size="lg" disabled={!turnstileToken || isConfirming} className="w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black font-kantumruy text-lg shadow-md transition-all active:scale-95 border-none" onClick={confirmPayment}>
                                {isConfirming ? <Loader2 className="w-6 h-6 animate-spin" /> : "ខ្ញុំបានបង់ប្រាក់រួចរាល់ហើយ"}
                            </Button>
                            <Button variant="ghost" disabled={isConfirming} className="w-full text-muted-foreground font-bold font-kantumruy hover:text-foreground" onClick={() => setShowPayment(false)}>
                                បោះបង់ការបង់ប្រាក់
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

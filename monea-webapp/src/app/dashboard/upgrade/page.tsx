import { useState, useEffect, useRef } from "react";
import { Check, Loader2, Sparkles, Receipt, ArrowRight, Zap, ShieldCheck, Crown, Clock, X } from "lucide-react";
import { moneaClient } from "@/lib/api-client";
import { useTranslation } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SafeQRCode from "@/components/ui/SafeQRCode";
import confetti from "canvas-confetti";
import { PageHeader } from "@/app/dashboard/_components/PageHeader";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function UpgradePage() {
    const { t } = useTranslation();
    
    // Data States
    const [wedding, setWedding] = useState<any>(null);
    const [pricing, setPricing] = useState({ standard: 9.00, pro: 19.00 });
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Payment UI States
    const [selectedPlan, setSelectedPlan] = useState<"PRO" | "PREMIUM">("PRO");
    const [showPayment, setShowPayment] = useState(false);
    const [qrString, setQrString] = useState("");
    const [qrMd5, setQrMd5] = useState("");
    const [orderId, setOrderId] = useState("");
    const [countdown, setCountdown] = useState(0);
    
    // Result States
    const [isSuccessCelebration, setIsSuccessCelebration] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);

    // Slip Upload States
    const [slipImage, setSlipImage] = useState<string | null>(null);
    const [slipRef, setSlipRef] = useState("");
    const [isSubmittingSlip, setIsSubmittingSlip] = useState(false);
    const [showSlipSuccess, setShowSlipSuccess] = useState(false);

    const isPolling = useRef(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSlipImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitSlip = async () => {
        if (!slipImage && !slipRef) {
            alert("សូមជ្រើសរើសរូបភាពវិក្កយបត្រ ឬបញ្ចូលលេខកូដប្រតិបត្តិការ (TxID/Ref)!");
            return;
        }

        setIsSubmittingSlip(true);
        try {
            const res = await moneaClient.post<{ success: boolean }>("/api/payment/submit-slip", {
                packageType: selectedPlan,
                receiptImage: slipImage,
                txRef: slipRef,
                weddingId: wedding?.id
            });

            if (res.data?.success || !res.error) {
                setShowPayment(false);
                setShowSlipSuccess(true);
                setSlipImage(null);
                setSlipRef("");
            } else {
                alert(res.error || "បរាជ័យក្នុងការដាក់ស្នើ");
            }
        } catch (e: any) {
            alert("មានបញ្ហាបច្ចេកទេស សូមព្យាយាមម្តងទៀត");
        } finally {
            setIsSubmittingSlip(false);
        }
    };

    // 1. Initial Data Fetching
    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            try {
                const [weddingRes, pricingRes] = await Promise.all([
                    moneaClient.get<any>("/api/wedding"),
                    moneaClient.get<any>("/api/pricing")
                ]);
                if (weddingRes.data) setWedding(weddingRes.data);
                if (pricingRes.data) {
                    setPricing({
                        standard: typeof pricingRes.data.standard === 'number' ? pricingRes.data.standard : 9.00,
                        pro: typeof pricingRes.data.pro === 'number' ? pricingRes.data.pro : 19.00
                    });
                }
            } catch (e) {
                console.error("Failed to fetch initial data:", e);
            }
        };
        fetchData();
    }, []);

    // 2. Recovery from SessionStorage
    useEffect(() => {
        if (!mounted) return;
        const saved = sessionStorage.getItem("monea_payment_session");
        if (saved) {
            try {
                const session = JSON.parse(saved);
                const remaining = Math.floor((session.expiresAt - Date.now()) / 1000);
                if (remaining > 5 && session.qr && session.qr.length > 10) {
                    setSelectedPlan(session.planId || "PRO");
                    setQrMd5(session.md5 || "");
                    setOrderId(session.orderId || "");
                    setQrString(session.qr);
                    setCountdown(remaining);
                    setShowPayment(true);
                } else {
                    sessionStorage.removeItem("monea_payment_session");
                }
            } catch (e) {
                sessionStorage.removeItem("monea_payment_session");
            }
        }
    }, [mounted]);

    // 3. Countdown Timer
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : 0)), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleCheckPayment = async () => {
        if (!showPayment || !qrMd5 || !orderId || isPolling.current || countdown <= 0) return;
        
        isPolling.current = true;
        try {
            const data = await moneaClient.post<{ status: string; packageType: string }>("/api/payment/check-status", {
                md5: qrMd5,
                orderId,
                packageType: selectedPlan
            });

            if (data.data?.status === "PAID") {
                setReceiptData({
                    orderId,
                    package: selectedPlan === "PRO" ? t("common.upgrade.pro_name", { defaultValue: "កញ្ចប់ពិសេស" }) : t("common.upgrade.premium_name", { defaultValue: "កញ្ចប់ល្អបំផុត" }),
                    amount: selectedPlan === "PRO" ? pricing.standard : pricing.pro,
                    date: new Date().toLocaleString()
                });
                
                setIsSuccessCelebration(true);
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                
                sessionStorage.removeItem("monea_payment_session");
                
                setTimeout(() => {
                    setIsSuccessCelebration(false);
                    setShowPayment(false);
                    setShowReceipt(true);
                }, 3000);
            } else {
                alert(t("common.upgrade.payment_not_found", { defaultValue: "មិនទាន់ទទួលបានការទូទាត់ទេ។ សូមស្កេន KHQR និងព្យាយាមម្តងទៀត។" }));
            }
        } catch (e) {
            console.warn("[Manual Check] Failed or network error.");
            alert("Network error. Please try again.");
        } finally {
            isPolling.current = false;
        }
    };

    const handleSelect = async (plan: "PRO" | "PREMIUM") => {
        setSelectedPlan(plan);
        setLoading(true);
        setQrString("");
        setShowPayment(true);
        try {
            const res = await moneaClient.post<{ qr: string, md5: string, orderId: string }>("/api/payment/generate-qr", {
                packageType: plan
            });

            if (res.data?.qr) {
                const expiry = 180;
                setQrString(res.data.qr);
                setQrMd5(res.data.md5);
                setOrderId(res.data.orderId);
                setCountdown(expiry);

                sessionStorage.setItem("monea_payment_session", JSON.stringify({
                    planId: plan,
                    md5: res.data.md5,
                    orderId: res.data.orderId,
                    qr: res.data.qr,
                    expiresAt: Date.now() + (expiry * 1000)
                }));
            } else {
                console.error("QR Generation error:", res.error);
                alert(res.error || "Failed to generate QR code. Please try again.");
                setShowPayment(false);
                sessionStorage.removeItem("monea_payment_session");
            }
        } catch (e: any) {
            console.error("QR Generation failed:", e);
            alert(e.message || "Failed to generate QR code.");
            setShowPayment(false);
            sessionStorage.removeItem("monea_payment_session");
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    const currentPlan = wedding?.packageType || "FREE";

    return (
        <div className="w-full space-y-8 pb-12">
            {/* Top Page Header */}
            <PageHeader
                title={t("common.upgrade.choose_plan", { defaultValue: "ជ្រើសរើសកញ្ចប់សេវាកម្ម" })}
                icon={Crown}
                iconColor="text-amber-500"
            />

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                
                {/* 1. FREE PLAN */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex"
                >
                    <Card className={cn(
                        "relative flex flex-col justify-between w-full rounded-3xl transition-all duration-300 bg-white dark:bg-[#141419] border border-slate-200/80 dark:border-white/10 shadow-sm p-6 sm:p-8",
                        currentPlan === "FREE" && "ring-2 ring-slate-400/30 dark:ring-white/20"
                    )}>
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                                    <ShieldCheck size={24} />
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl sm:text-4xl font-black text-foreground font-mono">$0</span>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-kantumruy mt-0.5">
                                        {t("common.upgrade.free_label", { defaultValue: "ឥតគិតថ្លៃ" })} / កម្មវិធី
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold font-kantumruy text-foreground">
                                {t("common.upgrade.free_name", { defaultValue: "កញ្ចប់ធម្មតា" })}
                            </h3>
                            <p className="text-xs text-muted-foreground font-kantumruy mt-1.5 leading-relaxed">
                                រចនាធៀបការអញ្ជើញជាមូលដ្ឋានសម្រាប់កម្មវិធីខ្នាតតូច។
                            </p>

                            <div className="space-y-3 pt-6 border-t border-border/50 mt-6">
                                {[
                                    "រចនាធៀបការអញ្ជើញកម្រិតមូលដ្ឋាន",
                                    "ទាញយកជាទម្រង់រូបភាពធម្មតា",
                                    "មាន Logo របស់ MONEA លើធៀប",
                                    "ប្រើប្រាស់ទម្រង់កំណត់",
                                ].map((feat, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-muted-foreground font-kantumruy">
                                        <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={11} strokeWidth={3} />
                                        </div>
                                        <span className="leading-tight">{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8">
                            <Button 
                                variant="outline"
                                className="w-full h-11 text-xs font-bold font-kantumruy rounded-xl border border-slate-200 dark:border-white/10 text-muted-foreground bg-muted/30 cursor-default"
                                disabled
                            >
                                {currentPlan === "FREE" ? t("common.upgrade.already_active", { defaultValue: "កញ្ចប់បច្ចុប្បន្ន" }) : "កញ្ចប់ធម្មតា"}
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* 2. PRO PLAN */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="flex"
                >
                    <Card className={cn(
                        "relative flex flex-col justify-between w-full rounded-3xl transition-all duration-300 bg-white dark:bg-[#141419] border-2 border-rose-500/40 dark:border-rose-500/30 shadow-md p-6 sm:p-8",
                        currentPlan === "PRO" && "ring-2 ring-rose-500"
                    )}>
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                    <Zap size={24} />
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl sm:text-4xl font-black text-rose-600 font-mono">
                                        ${pricing.standard.toFixed(2)}
                                    </span>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-kantumruy mt-0.5">
                                        {t("common.upgrade.single_event", { defaultValue: "ទូទាត់តែម្តង" })} / កម្មវិធី
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold font-kantumruy text-foreground">
                                {t("common.upgrade.pro_name", { defaultValue: "កញ្ចប់ពិសេស" })}
                            </h3>
                            <p className="text-xs text-muted-foreground font-kantumruy mt-1.5 leading-relaxed">
                                លទ្ធភាពរចនាគ្មានដែនកំណត់ ជាមួយទម្រង់រចនាកម្រិតខ្ពស់។
                            </p>

                            <div className="space-y-3 pt-6 border-t border-border/50 mt-6">
                                {[
                                    "ដោះសោរទម្រង់រចនាទាំងអស់",
                                    "ទាញយកជារូបភាពច្បាស់គុណភាពខ្ពស់ HD",
                                    "គ្មាន Logo របស់ MONEA នៅលើធៀប",
                                    "ផ្លាស់ប្តូរទំហំ ពណ៌ និង Font អក្សរសេរី",
                                    "ទទួលបានមុខងាររចនាមានចលនា",
                                ].map((feat, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-foreground font-kantumruy">
                                        <div className="w-4 h-4 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={11} strokeWidth={3} />
                                        </div>
                                        <span className="leading-tight">{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8">
                            <Button 
                                className="w-full h-11 text-xs font-bold font-kantumruy rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all active:scale-98"
                                onClick={() => currentPlan !== "PRO" && handleSelect("PRO")}
                                disabled={loading || currentPlan === "PRO"}
                            >
                                {loading && selectedPlan === "PRO" ? (
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : currentPlan === "PRO" ? (
                                    t("common.upgrade.already_active", { defaultValue: "កញ្ចប់បច្ចុប្បន្ន" })
                                ) : (
                                    "ជ្រើសរើសកញ្ចប់ពិសេស"
                                )}
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* 3. PREMIUM PLAN */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex"
                >
                    <Card className={cn(
                        "relative flex flex-col justify-between w-full rounded-3xl transition-all duration-300 bg-white dark:bg-[#141419] border border-slate-200/80 dark:border-white/10 shadow-sm p-6 sm:p-8",
                        currentPlan === "PREMIUM" && "ring-2 ring-amber-500"
                    )}>
                        <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                            {currentPlan === "PREMIUM" ? t("common.upgrade.current_plan", { defaultValue: "កញ្ចប់បច្ចុប្បន្ន" }) : "ពេញនិយមបំផុត"}
                        </div>

                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                    <Sparkles size={24} />
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl sm:text-4xl font-black text-foreground font-mono">
                                        ${pricing.pro.toFixed(2)}
                                    </span>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-kantumruy mt-0.5">
                                        {t("common.upgrade.unlimited_events", { defaultValue: "ប្រើគ្មានដែនកំណត់" })} / ឆ្នាំ
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold font-kantumruy text-foreground">
                                {t("common.upgrade.premium_name", { defaultValue: "កញ្ចប់ល្អបំផុត" })}
                            </h3>
                            <p className="text-xs text-muted-foreground font-kantumruy mt-1.5 leading-relaxed">
                                បទពិសោធន៍រចនាដ៏អស្ចារ្យ សម្រាប់អ្នករៀបចំកម្មវិធីអាជីព។
                            </p>

                            <div className="space-y-3 pt-6 border-t border-border/50 mt-6">
                                {[
                                    "មុខងារពិសេសរបស់កញ្ចប់ PRO ទាំងអស់",
                                    "រចនាធៀបគ្មានកំណត់ចំនួនកម្មវិធី",
                                    "ទទួលបានទម្រង់ថ្មីៗមុនគេ",
                                    "អាចរក្សាទុកធៀបដែលរចនារួចលើប្រព័ន្ធ",
                                    "ជំនួយបច្ចេកទេសជាអាទិភាព ២៤/៧",
                                ].map((feat, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-foreground font-kantumruy">
                                        <div className="w-4 h-4 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={11} strokeWidth={3} />
                                        </div>
                                        <span className="leading-tight">{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8">
                            <Button 
                                className="w-full h-11 text-xs font-bold font-kantumruy rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md transition-all active:scale-98"
                                onClick={() => currentPlan !== "PREMIUM" && handleSelect("PREMIUM")}
                                disabled={loading || currentPlan === "PREMIUM"}
                            >
                                {loading && selectedPlan === "PREMIUM" ? (
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : currentPlan === "PREMIUM" ? (
                                    t("common.upgrade.already_active", { defaultValue: "កញ្ចប់បច្ចុប្បន្ន" })
                                ) : (
                                    "ជ្រើសរើសកញ្ចប់ល្អបំផុត"
                                )}
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Payment Modal */}
            <Dialog open={showPayment} onOpenChange={(open) => !isSuccessCelebration && setShowPayment(open)}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-[#141419] border border-slate-200/80 dark:border-white/10 rounded-3xl p-0 overflow-hidden shadow-2xl font-kantumruy">
                    <DialogHeader className="p-6 pb-4 bg-muted/30 border-b border-border/40 text-center">
                        <DialogTitle className="text-lg font-bold text-foreground">
                            {t("common.upgrade.secure_payment", { defaultValue: "ទូទាត់ប្រាក់ប្រកបដោយសុវត្ថិភាព" })}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {t("common.upgrade.scan_khqr", { defaultValue: "សូមស្កេន QR Code ខាងក្រោមតាមរយៈ App ធនាគាររបស់អ្នក (Bakong / KHQR)" })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6 text-center">
                        {/* QR Code Container */}
                        <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-inner">
                            {qrString && countdown > 0 ? (
                                <SafeQRCode value={qrString} size={190} />
                            ) : countdown <= 0 && qrString ? (
                                <div className="w-[190px] h-[190px] flex flex-col items-center justify-center space-y-3">
                                    <Clock className="w-8 h-8 text-rose-500" />
                                    <p className="text-xs font-bold text-slate-800">{t("common.upgrade.qr_expired", { defaultValue: "QR Code ផុតកំណត់" })}</p>
                                    <Button
                                        size="sm"
                                        onClick={() => handleSelect(selectedPlan)}
                                        className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold h-8 px-3"
                                    >
                                        {t("common.upgrade.regenerate_qr", { defaultValue: "បង្កើត QR ថ្មី" })}
                                    </Button>
                                </div>
                            ) : (
                                <div className="w-[190px] h-[190px] flex flex-col items-center justify-center space-y-3">
                                    <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
                                    <span className="text-xs font-bold text-muted-foreground">{t("common.upgrade.generating_qr", { defaultValue: "កំពុងបង្កើត QR..." })}</span>
                                </div>
                            )}
                        </div>

                        {/* Amount and Timer */}
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200/80 dark:border-white/10">
                            <div className="text-left">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                                    {t("common.upgrade.payable_amount", { defaultValue: "ចំនួនទឹកប្រាក់" })}
                                </span>
                                <span className="text-xl font-bold text-foreground font-mono">
                                    ${selectedPlan === "PRO" ? pricing.standard.toFixed(2) : pricing.pro.toFixed(2)}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                                    {t("common.upgrade.time_remaining", { defaultValue: "ពេលវេលានៅសល់" })}
                                </span>
                                <span className={cn("text-xl font-bold font-mono", countdown < 30 ? "text-rose-500 animate-pulse" : "text-foreground")}>
                                    {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
                            {countdown > 0 && qrString && (
                                <Button 
                                    onClick={handleCheckPayment}
                                    disabled={countdown <= 0 || !qrString || loading || isPolling.current}
                                    className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
                                >
                                    {isPolling.current ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <span>{t("common.upgrade.check_payment", { defaultValue: "ផ្ទៀងផ្ទាត់ស្វ័យប្រវត្តិ" })}</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            )}

                            {/* Option 2: Upload Payment Slip / Receipt */}
                            <div className="pt-3 border-t border-border/60 text-left space-y-2.5">
                                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                                    <span>ឬផ្ញើរូបភាពវិក្កយបត្រ (Upload Slip)</span>
                                    <span className="text-[10px] text-rose-500 font-normal">សម្រាប់ Admin ផ្ទៀងផ្ទាត់</span>
                                </label>
                                
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 dark:file:bg-rose-500/10 dark:file:text-rose-400 cursor-pointer"
                                    />
                                    {slipImage && (
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-rose-500/30">
                                            <img src={slipImage} alt="Slip Preview" className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => setSlipImage(null)}
                                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        placeholder="លេខកូដប្រតិបត្តិការ (TxID / Ref) ឬចំណាំ..."
                                        value={slipRef}
                                        onChange={(e) => setSlipRef(e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs outline-none focus:border-rose-500"
                                    />
                                    <Button
                                        onClick={handleSubmitSlip}
                                        disabled={isSubmittingSlip || (!slipImage && !slipRef)}
                                        variant="outline"
                                        className="w-full h-10 rounded-xl text-xs font-bold border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center gap-2"
                                    >
                                        {isSubmittingSlip ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>កំពុងផ្ញើ...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>ដាក់ស្នើវិក្កយបត្រជូន Admin</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Animation Overlay */}
            {isSuccessCelebration && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-[#141419] p-8 rounded-3xl text-center space-y-4 shadow-2xl border border-slate-200/80 dark:border-white/10 max-w-sm mx-4 animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                            <Check className="w-8 h-8" strokeWidth={3} />
                        </div>
                        <h2 className="text-2xl font-bold font-kantumruy text-foreground">{t("common.upgrade.payment_received", { defaultValue: "ទូទាត់ជោគជ័យ!" })}</h2>
                        <p className="text-xs text-muted-foreground font-kantumruy">{t("common.upgrade.upgrading_wait", { defaultValue: "កំពុងដំឡើងកញ្ចប់សេវាកម្មរបស់អ្នក..." })}</p>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-[#141419] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-2xl font-kantumruy">
                    <DialogHeader className="text-center pb-4 border-b border-border/40">
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Receipt size={24} />
                        </div>
                        <DialogTitle className="text-xl font-bold text-foreground">
                            {t("common.upgrade.digital_receipt", { defaultValue: "វិក្កយបត្រអេឡិចត្រូនិច" })}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {t("common.upgrade.trans_success", { defaultValue: "ប្រតិបត្តិការបានបញ្ចប់ដោយជោគជ័យ" })}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-3 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t("common.upgrade.receipt_order", { defaultValue: "លេខកូដបញ្ជាទិញ" })}</span>
                            <span className="font-bold text-foreground font-mono">{receiptData?.orderId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t("common.upgrade.receipt_package", { defaultValue: "កញ្ចប់សេវាកម្ម" })}</span>
                            <span className="font-bold text-foreground">{receiptData?.package}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t("common.upgrade.receipt_amount", { defaultValue: "ចំនួនទឹកប្រាក់" })}</span>
                            <span className="font-bold text-emerald-600 text-sm font-mono">${receiptData?.amount?.toFixed(2)}</span>
                        </div>
                    </div>

                    <Button 
                        className="w-full h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs mt-2"
                        onClick={() => window.location.href = "/dashboard"}
                    >
                        {t("common.upgrade.continue_btn", { defaultValue: "ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង" })}
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Slip Submitted Confirmation Dialog */}
            <Dialog open={showSlipSuccess} onOpenChange={setShowSlipSuccess}>
                <DialogContent className="sm:max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl font-kantumruy text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 mb-3">
                        <Check className="w-8 h-8" strokeWidth={3} />
                    </div>
                    <DialogTitle className="text-xl font-bold text-foreground">
                        បានដាក់ស្នើវិក្កយបត្រដោយជោគជ័យ!
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                        យើងខ្ញុំបានទទួលរូបភាពវិក្កយបត្ររបស់អ្នករួចហើយ។ ក្រុមការងារ Admin នឹងពិនិត្យផ្ទៀងផ្ទាត់ និងដំឡើងកញ្ចប់សេវាជូនលោកអ្នកក្នុងពេលឆាប់ៗនេះ។
                    </DialogDescription>
                    <Button
                        className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs mt-4"
                        onClick={() => window.location.href = "/dashboard"}
                    >
                        យល់ព្រម និងត្រឡប់ទៅ Dashboard
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}

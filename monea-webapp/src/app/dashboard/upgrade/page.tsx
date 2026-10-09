import { useState, useEffect, useRef } from "react";
import { Check, Loader2, Sparkles, Receipt, ArrowRight, Zap, ShieldCheck, Crown, Clock, X, AlertCircle, RefreshCw } from "lucide-react";
import { moneaClient } from "@/lib/api-client";
import { useTranslation } from "@/i18n/LanguageProvider";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SafeQRCode from "@/components/ui/SafeQRCode";
import confetti from "canvas-confetti";
import { PageHeader } from "@/app/dashboard/_components/PageHeader";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { deleteMedia } from "@/lib/multi-cdn";

const MAX_RECEIPT_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_RECEIPT_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PAYMENT_SESSION_KEY = "monea_payment_session";
const PAYMENT_QR_VALIDITY_SECONDS = 9 * 60;
const PAYMENT_STATUS_CHECK_COOLDOWN_SECONDS = 5;

export default function UpgradePage() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    
    // Data States
    const [wedding, setWedding] = useState<any>(null);
    const [pricing, setPricing] = useState({ standard: 0, pro: 0 });
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [plansLoading, setPlansLoading] = useState(true);
    const [plansLoadError, setPlansLoadError] = useState(false);
    const [plansRetryKey, setPlansRetryKey] = useState(0);
    
    // Payment UI States
    const [selectedPlan, setSelectedPlan] = useState<"PRO" | "PREMIUM">("PRO");
    const [showPayment, setShowPayment] = useState(false);
    const [qrString, setQrString] = useState("");
    const [qrMd5, setQrMd5] = useState("");
    const [orderId, setOrderId] = useState("");
    const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
    const [countdown, setCountdown] = useState(0);
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);
    const [paymentCheckCooldown, setPaymentCheckCooldown] = useState(0);
    
    // Result States
    const [isSuccessCelebration, setIsSuccessCelebration] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);

    // Slip Upload States
    const [slipImage, setSlipImage] = useState<string | null>(null);
    const [slipImageFile, setSlipImageFile] = useState<File | null>(null);
    const [slipImageError, setSlipImageError] = useState("");
    const [slipRef, setSlipRef] = useState("");
    const [isSubmittingSlip, setIsSubmittingSlip] = useState(false);
    const [showSlipSuccess, setShowSlipSuccess] = useState(false);

    const isPolling = useRef(false);
    const isGeneratingQr = useRef(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        const file = e.target.files?.[0];
        input.value = "";
        if (!file) return;

        setSlipImageError("");
        if (!ALLOWED_RECEIPT_IMAGE_TYPES.has(file.type.toLowerCase())) {
            setSlipImage(null);
            setSlipImageFile(null);
            setSlipImageError(t("common.upgrade.payment.slipInvalidType"));
            return;
        }
        if (file.size <= 0 || file.size > MAX_RECEIPT_IMAGE_SIZE) {
            setSlipImage(null);
            setSlipImageFile(null);
            setSlipImageError(t("common.upgrade.payment.slipInvalidSize"));
            return;
        }

        setSlipImageFile(file);
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setSlipImage(reader.result);
            } else {
                setSlipImage(null);
                setSlipImageFile(null);
                setSlipImageError(t("common.upgrade.payment.slipReadError", {
                    defaultValue: "We couldn't read this image. Please choose another file."
                }));
            }
        };
        reader.onerror = () => {
            setSlipImage(null);
            setSlipImageFile(null);
            setSlipImageError(t("common.upgrade.payment.slipReadError", {
                defaultValue: "We couldn't read this image. Please choose another file."
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmitSlip = async () => {
        if (!slipImage && !slipRef.trim()) {
            showToast({
                title: t("common.upgrade.payment.slipRequiredTitle"),
                description: t("common.upgrade.payment.slipRequiredDescription"),
                type: "error"
            });
            return;
        }
        if (slipRef.trim().length > 200) {
            showToast({
                title: t("common.upgrade.payment.slipReferenceTooLongTitle"),
                description: t("common.upgrade.payment.slipReferenceTooLongDescription"),
                type: "error"
            });
            return;
        }

        setIsSubmittingSlip(true);
        let uploadedReceipt: { url: string; publicId: string } | null = null;
        try {
            if (slipImageFile) {
                if (!wedding?.id) throw new Error("Wedding is required to submit a receipt");
                uploadedReceipt = await uploadToCloudinary(slipImageFile, wedding.id);
            }
            const res = await moneaClient.post<{ success: boolean }>("/api/payment/submit-slip", {
                packageType: selectedPlan,
                receiptImage: uploadedReceipt?.url ?? null,
                txRef: slipRef.trim(),
                weddingId: wedding?.id
            });

            if (res.data?.success === true) {
                setShowPayment(false);
                setShowSlipSuccess(true);
                setSlipImage(null);
                setSlipImageFile(null);
                setSlipImageError("");
                setSlipRef("");
            } else {
                if (uploadedReceipt && res.status >= 400 && res.status < 500) {
                    const deleted = await deleteMedia(uploadedReceipt.publicId);
                    if (!deleted) console.warn("[Upgrade] Could not clean up receipt upload after rejection.");
                }
                showToast({
                    title: t("common.upgrade.payment.errorTitle", { defaultValue: "Payment submission failed" }),
                    description: res.error || t("common.upgrade.payment.techError", {
                        defaultValue: "A technical issue occurred. Please try again."
                    }),
                    type: "error"
                });
            }
        } catch (e: any) {
            console.error("[Upgrade] Failed to submit payment slip:", e);
            if (uploadedReceipt) {
                const deleted = await deleteMedia(uploadedReceipt.publicId);
                if (!deleted) console.warn("[Upgrade] Could not clean up receipt upload after submission error.");
            }
            showToast({
                title: t("common.upgrade.payment.errorTitle", { defaultValue: "Payment submission failed" }),
                description: t("common.upgrade.payment.techError", {
                    defaultValue: "A technical issue occurred. Please try again."
                }),
                type: "error"
            });
        } finally {
            setIsSubmittingSlip(false);
        }
    };

    // 1. Initial Data Fetching
    useEffect(() => {
        setMounted(true);
        let active = true;
        const fetchData = async () => {
            setPlansLoading(true);
            setPlansLoadError(false);
            try {
                const [weddingRes, pricingRes] = await Promise.all([
                    moneaClient.get<any>("/api/wedding"),
                    moneaClient.get<any>("/api/pricing")
                ]);
                if (weddingRes.error) throw new Error(`Could not load wedding plan: ${weddingRes.error}`);
                if (pricingRes.error || !pricingRes.data) {
                    throw new Error(`Could not load plan pricing: ${pricingRes.error || "Empty pricing response"}`);
                }
                const { standard, pro } = pricingRes.data;
                if (![standard, pro].every((price) => typeof price === "number" && Number.isFinite(price) && price >= 0)) {
                    throw new Error("Plan pricing response contains invalid prices");
                }
                if (!active) return;
                setWedding(weddingRes.data || null);
                setPricing({ standard, pro });
            } catch (error) {
                console.error("[Upgrade] Failed to load plan data:", error);
                if (active) setPlansLoadError(true);
            } finally {
                if (active) setPlansLoading(false);
            }
        };
        void fetchData();
        return () => {
            active = false;
        };
    }, [plansRetryKey]);

    // 2. Recovery from SessionStorage
    useEffect(() => {
        if (!mounted) return;
        let saved: string | null;
        try {
            saved = sessionStorage.getItem(PAYMENT_SESSION_KEY);
        } catch (error) {
            console.warn("[Upgrade] Could not access saved payment session:", error);
            return;
        }
        if (saved) {
            try {
                const session = JSON.parse(saved);
                const remaining = Math.floor((session.expiresAt - Date.now()) / 1000);
                const validSession = (session.planId === "PRO" || session.planId === "PREMIUM")
                    && typeof session.qr === "string"
                    && session.qr.length > 10
                    && typeof session.md5 === "string"
                    && session.md5.length > 0
                    && typeof session.orderId === "string"
                    && session.orderId.length > 0
                    && typeof session.amount === "number"
                    && Number.isFinite(session.amount)
                    && session.amount >= 0
                    && Number.isFinite(session.expiresAt)
                    && remaining > 5;
                if (validSession) {
                    setSelectedPlan(session.planId);
                    setQrMd5(session.md5);
                    setOrderId(session.orderId);
                    setPaymentAmount(session.amount);
                    setQrString(session.qr);
                    setCountdown(Math.min(PAYMENT_QR_VALIDITY_SECONDS, remaining));
                    setShowPayment(true);
                } else {
                    sessionStorage.removeItem(PAYMENT_SESSION_KEY);
                }
            } catch (e) {
                console.warn("[Upgrade] Could not restore saved payment session:", e);
                try {
                    sessionStorage.removeItem(PAYMENT_SESSION_KEY);
                } catch (storageError) {
                    console.warn("[Upgrade] Could not clear invalid payment session:", storageError);
                }
            }
        }
    }, [mounted]);

    // 3. Countdown Timer
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : 0)), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    useEffect(() => {
        if (paymentCheckCooldown <= 0) return;
        const timer = setInterval(() => {
            setPaymentCheckCooldown((seconds) => Math.max(0, seconds - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [paymentCheckCooldown]);

    const handleCheckPayment = async () => {
        if (!showPayment || !qrMd5 || !orderId || isPolling.current || countdown <= 0 || paymentCheckCooldown > 0) return;
        
        isPolling.current = true;
        setIsCheckingPayment(true);
        try {
            const data = await moneaClient.post<{
                status: "PAID" | "PENDING";
                packageType?: "PRO" | "PREMIUM" | string;
            }>("/api/payment/manual-verify");
            if (data.error) {
                throw new Error(`Payment status request failed (${data.status}): ${data.error}`);
            }
            if (!data.data || !["PAID", "PENDING"].includes(data.data.status)) {
                throw new Error("Payment status service returned an invalid response");
            }

            if (data.data?.status === "PAID") {
                const confirmedPlan = data.data.packageType;
                if (confirmedPlan !== "PRO" && confirmedPlan !== "PREMIUM") {
                    throw new Error("Payment status returned an invalid confirmed plan");
                }
                setReceiptData({
                    orderId,
                    package: confirmedPlan === "PRO" ? t("common.upgrade.pro_name", { defaultValue: "កញ្ចប់ពិសេស" }) : t("common.upgrade.premium_name", { defaultValue: "កញ្ចប់ល្អបំផុត" }),
                    amount: paymentAmount,
                    date: new Date().toLocaleString()
                });
                setSelectedPlan(confirmedPlan);
                
                setIsSuccessCelebration(true);
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                
                try {
                    sessionStorage.removeItem(PAYMENT_SESSION_KEY);
                } catch (error) {
                    console.warn("[Upgrade] Could not clear completed payment session:", error);
                }
                setQrString("");
                setQrMd5("");
                setOrderId("");
                setPaymentAmount(null);
                setCountdown(0);
                
                setTimeout(() => {
                    setIsSuccessCelebration(false);
                    setShowPayment(false);
                    setShowReceipt(true);
                }, 3000);
            } else {
                showToast({
                    title: t("common.upgrade.payment.paymentPendingTitle"),
                    description: t("common.upgrade.payment_not_found", { defaultValue: "មិនទាន់ទទួលបានការទូទាត់ទេ។ សូមស្កេន KHQR និងព្យាយាមម្តងទៀត។" }),
                    type: "info"
                });
            }
        } catch (e) {
            console.error("[Manual Check] Failed or network error:", e);
            showToast({
                title: t("common.upgrade.payment.statusCheckFailedTitle"),
                description: t("common.upgrade.payment.statusCheckErrorDescription"),
                type: "error"
            });
        } finally {
            isPolling.current = false;
            setIsCheckingPayment(false);
            if (showPayment && countdown > 0) {
                setPaymentCheckCooldown(PAYMENT_STATUS_CHECK_COOLDOWN_SECONDS);
            }
        }
    };

    const handleSelect = async (plan: "PRO" | "PREMIUM") => {
        if (isGeneratingQr.current) return;
        isGeneratingQr.current = true;
        setSelectedPlan(plan);
        setLoading(true);
        setQrString("");
        setQrMd5("");
        setOrderId("");
        setPaymentAmount(null);
        setCountdown(0);
        try {
            sessionStorage.removeItem(PAYMENT_SESSION_KEY);
        } catch (error) {
            console.warn("[Upgrade] Could not clear previous payment session:", error);
        }
        setShowPayment(true);
        try {
            const res = await moneaClient.post<{ success?: boolean; qr?: string; md5?: string; orderId?: string; amount?: number; expiresAt?: number }>("/api/payment/generate-qr", {
                packageType: plan
            });
            const remainingValidity = typeof res.data?.expiresAt === "number"
                ? Math.floor((res.data.expiresAt - Date.now()) / 1000)
                : 0;

            if (res.data?.success === true
                && typeof res.data.qr === "string"
                && res.data.qr.length > 10
                && typeof res.data.md5 === "string"
                && res.data.md5.length > 0
                && typeof res.data.orderId === "string"
                && res.data.orderId.length > 0
                && typeof res.data.amount === "number"
                && Number.isFinite(res.data.amount)
                && res.data.amount >= 0
                && Number.isFinite(res.data.expiresAt)
                && remainingValidity > 5) {
                const expiry = Math.min(PAYMENT_QR_VALIDITY_SECONDS, remainingValidity);
                setQrString(res.data.qr);
                setQrMd5(res.data.md5);
                setOrderId(res.data.orderId);
                setPaymentAmount(res.data.amount);
                setCountdown(expiry);
                setPaymentCheckCooldown(0);

                try {
                    sessionStorage.setItem(PAYMENT_SESSION_KEY, JSON.stringify({
                        planId: plan,
                        md5: res.data.md5,
                        orderId: res.data.orderId,
                        amount: res.data.amount,
                        qr: res.data.qr,
                        expiresAt: res.data.expiresAt
                    }));
                } catch (error) {
                    console.warn("[Upgrade] Could not save payment session:", error);
                    showToast({
                        title: t("common.upgrade.payment.sessionSaveWarningTitle"),
                        description: t("common.upgrade.payment.sessionSaveWarningDescription"),
                        type: "info"
                    });
                }
            } else {
                const errorMessage = res.error || t("common.upgrade.payment.invalidQrResponse");
                console.error("[Upgrade] QR generation returned an incomplete response:", {
                    error: res.error,
                    status: res.status,
                    hasData: Boolean(res.data)
                });
                showToast({
                    title: t("common.upgrade.payment.qrGenerationFailedTitle"),
                    description: errorMessage,
                    type: "error"
                });
                setQrString("");
                setQrMd5("");
                setOrderId("");
                setPaymentAmount(null);
                setCountdown(0);
                setShowPayment(false);
                try {
                    sessionStorage.removeItem(PAYMENT_SESSION_KEY);
                } catch (error) {
                    console.warn("[Upgrade] Could not clear failed payment session:", error);
                }
            }
        } catch (e: any) {
            console.error("QR Generation failed:", e);
            showToast({
                title: t("common.upgrade.payment.qrGenerationFailedTitle"),
                description: t("common.upgrade.payment.networkError"),
                type: "error"
            });
            setShowPayment(false);
            try {
                sessionStorage.removeItem(PAYMENT_SESSION_KEY);
            } catch (error) {
                console.warn("[Upgrade] Could not clear failed payment session:", error);
            }
        } finally {
            setLoading(false);
            isGeneratingQr.current = false;
        }
    };

    if (!mounted) return null;

    const currentPlan = wedding?.packageType || "FREE";

    return (
        <div className="w-full space-y-5 sm:space-y-8 pb-12">
            {/* Top Page Header */}
            <PageHeader
                title={t("common.upgrade.choose_plan", { defaultValue: "ជ្រើសរើសកញ្ចប់សេវាកម្ម" })}
                icon={Crown}
                iconColor="text-amber-500"
            />

            {plansLoading ? (
                <Card className="rounded-3xl border border-border/60 bg-card">
                    <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-600" aria-hidden="true" />
                        <p className="text-sm font-medium text-muted-foreground" role="status">
                            {t("common.upgrade.planLoadLoading")}
                        </p>
                    </CardContent>
                </Card>
            ) : plansLoadError ? (
                <Card className="rounded-3xl border border-rose-200 bg-rose-50/50 dark:border-rose-500/20 dark:bg-rose-500/5">
                    <CardContent className="flex min-h-48 flex-col items-center justify-center gap-4 px-5 py-8 text-center" role="alert">
                        <AlertCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                        <div className="space-y-1">
                            <h2 className="font-bold text-foreground">{t("common.upgrade.planLoadError")}</h2>
                            <p className="text-sm text-muted-foreground">{t("common.upgrade.planLoadErrorDescription")}</p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPlansRetryKey((key) => key + 1)}
                            className="h-11 rounded-xl font-bold"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                            {t("common.upgrade.planLoadRetry")}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
            <>
            {!wedding?.id ? (
                <Card className="rounded-3xl border border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5">
                    <CardContent className="flex min-h-56 flex-col items-center justify-center gap-4 px-5 py-8 text-center">
                        <Crown className="h-10 w-10 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                        <div className="space-y-1">
                            <h2 className="font-bold text-foreground">{t("common.upgrade.noWedding.title")}</h2>
                            <p className="max-w-md text-sm text-muted-foreground">{t("common.upgrade.noWedding.desc")}</p>
                        </div>
                        <Button asChild className="h-11 rounded-xl bg-teal-600 px-5 font-bold text-white hover:bg-teal-700">
                            <Link to="/dashboard/create">{t("common.upgrade.noWedding.cta")}</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                
                {/* 1. FREE PLAN */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex"
                >
                    <Card className={cn(
                        "relative flex flex-col justify-between w-full rounded-2xl sm:rounded-3xl transition-all duration-300 bg-white dark:bg-[#141419] border border-slate-200/80 dark:border-white/10 shadow-sm p-4 sm:p-8",
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
                                        {t("common.upgrade.free_label", { defaultValue: "ឥតគិតថ្លៃ" })} / {t("common.upgrade.planCards.perEvent", { defaultValue: "កម្មវិធី" })}
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold font-kantumruy text-foreground">
                                {t("common.upgrade.free_name", { defaultValue: "កញ្ចប់ធម្មតា" })}
                            </h3>
                            <p className="text-xs text-muted-foreground font-kantumruy mt-1.5 leading-relaxed">
                                {t("common.upgrade.planCards.free.description", { defaultValue: "រចនាធៀបការអញ្ជើញជាមូលដ្ឋានសម្រាប់កម្មវិធីខ្នាតតូច។" })}
                            </p>

                            <div className="space-y-2.5 sm:space-y-3 pt-4 sm:pt-6 border-t border-border/50 mt-4 sm:mt-6">
                                {[1, 2, 3, 4].map((idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-muted-foreground font-kantumruy">
                                        <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={11} strokeWidth={3} />
                                        </div>
                                        <span className="leading-tight">{t(`common.upgrade.planCards.free.features.${idx}`)}</span>
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
                                {currentPlan === "FREE"
                                    ? t("common.upgrade.already_active", { defaultValue: "កញ្ចប់បច្ចុប្បន្ន" })
                                    : t("common.upgrade.planCards.free.select", { defaultValue: "កញ្ចប់ធម្មតា" })}
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
                        "relative flex flex-col justify-between w-full rounded-2xl sm:rounded-3xl transition-all duration-300 bg-white dark:bg-[#141419] border-2 border-teal-500/40 dark:border-teal-500/30 shadow-md p-4 sm:p-8",
                        currentPlan === "PRO" && "ring-2 ring-teal-500"
                    )}>
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                                    <Zap size={24} />
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl sm:text-4xl font-black text-teal-600 font-mono">
                                        ${pricing.standard.toFixed(2)}
                                    </span>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-kantumruy mt-0.5">
                                        {t("common.upgrade.single_event", { defaultValue: "ទូទាត់តែម្តង" })} / {t("common.upgrade.planCards.perEvent", { defaultValue: "កម្មវិធី" })}
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold font-kantumruy text-foreground">
                                {t("common.upgrade.pro_name", { defaultValue: "កញ្ចប់ពិសេស" })}
                            </h3>
                            <p className="text-xs text-muted-foreground font-kantumruy mt-1.5 leading-relaxed">
                                {t("common.upgrade.planCards.pro.description", { defaultValue: "លទ្ធភាពរចនាគ្មានដែនកំណត់ ជាមួយទម្រង់រចនាកម្រិតខ្ពស់។" })}
                            </p>

                            <div className="space-y-2.5 sm:space-y-3 pt-4 sm:pt-6 border-t border-border/50 mt-4 sm:mt-6">
                                {[1, 2, 3, 4, 5].map((idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-foreground font-kantumruy">
                                        <div className="w-4 h-4 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={11} strokeWidth={3} />
                                        </div>
                                        <span className="leading-tight">{t(`common.upgrade.planCards.pro.features.${idx}`)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8">
                            <Button 
                                className="w-full h-11 text-xs font-bold font-kantumruy rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all active:scale-98"
                                onClick={() => currentPlan !== "PRO" && handleSelect("PRO")}
                                disabled={loading || currentPlan === "PRO"}
                            >
                                {loading && selectedPlan === "PRO" ? (
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : currentPlan === "PRO" ? (
                                    t("common.upgrade.already_active", { defaultValue: "កញ្ចប់បច្ចុប្បន្ន" })
                                ) : (
                                    t("common.upgrade.planCards.pro.select", { defaultValue: "ជ្រើសរើសកញ្ចប់ពិសេស" })
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
                        "relative flex flex-col justify-between w-full rounded-2xl sm:rounded-3xl transition-all duration-300 bg-white dark:bg-[#141419] border border-slate-200/80 dark:border-white/10 shadow-sm p-4 sm:p-8",
                        currentPlan === "PREMIUM" && "ring-2 ring-amber-500"
                    )}>
                        <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                            {currentPlan === "PREMIUM"
                                ? t("common.upgrade.current_plan", { defaultValue: "កញ្ចប់បច្ចុប្បន្ន" })
                                : t("common.upgrade.best_value", { defaultValue: "ពេញនិយមបំផុត" })}
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
                                        {t("common.upgrade.unlimited_events", { defaultValue: "ប្រើគ្មានដែនកំណត់" })} / {t("common.upgrade.planCards.perYear", { defaultValue: "ឆ្នាំ" })}
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold font-kantumruy text-foreground">
                                {t("common.upgrade.premium_name", { defaultValue: "កញ្ចប់ល្អបំផុត" })}
                            </h3>
                            <p className="text-xs text-muted-foreground font-kantumruy mt-1.5 leading-relaxed">
                                {t("common.upgrade.planCards.premium.description", { defaultValue: "បទពិសោធន៍រចនាដ៏អស្ចារ្យ សម្រាប់អ្នករៀបចំកម្មវិធីអាជីព។" })}
                            </p>

                            <div className="space-y-2.5 sm:space-y-3 pt-4 sm:pt-6 border-t border-border/50 mt-4 sm:mt-6">
                                {[1, 2, 3, 4, 5].map((idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-foreground font-kantumruy">
                                        <div className="w-4 h-4 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={11} strokeWidth={3} />
                                        </div>
                                        <span className="leading-tight">{t(`common.upgrade.planCards.premium.features.${idx}`)}</span>
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
                                    t("common.upgrade.planCards.premium.select", { defaultValue: "ជ្រើសរើសកញ្ចប់ល្អបំផុត" })
                                )}
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
            )}
            </>
            )}

            {!showPayment && qrString && (
                <Card className="border border-teal-200 bg-teal-50/60 shadow-sm dark:border-teal-500/20 dark:bg-teal-500/5">
                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="space-y-1">
                            <p className="font-bold text-foreground">
                                {countdown > 0
                                    ? t("common.upgrade.payment.resumeTitle")
                                    : t("common.upgrade.payment.expiredTitle")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {countdown > 0
                                    ? t("common.upgrade.payment.resumeDescription", {
                                        amount: paymentAmount?.toFixed(2) ?? "—",
                                        time: `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`
                                    })
                                    : t("common.upgrade.payment.expiredDescription")}
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={() => countdown > 0 ? setShowPayment(true) : handleSelect(selectedPlan)}
                            disabled={countdown <= 0 && loading}
                            className="h-11 shrink-0 rounded-xl bg-teal-600 font-bold text-white hover:bg-teal-700"
                        >
                            {countdown > 0
                                ? t("common.upgrade.payment.resumeAction")
                                : t("common.upgrade.regenerate_qr", { defaultValue: "បង្កើត QR ថ្មី" })}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Payment Modal */}
            <Dialog open={showPayment} onOpenChange={(open) => !isSuccessCelebration && setShowPayment(open)}>
                <DialogContent className="w-[94vw] sm:max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-[#141419] border border-slate-200/80 dark:border-white/10 rounded-3xl p-0 shadow-2xl font-kantumruy">
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
                                    <Clock className="w-8 h-8 text-teal-500" />
                                    <p className="text-xs font-bold text-slate-800">{t("common.upgrade.qr_expired", { defaultValue: "QR Code ផុតកំណត់" })}</p>
                                    <Button
                                        size="sm"
                                        onClick={() => handleSelect(selectedPlan)}
                                        disabled={loading}
                                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-8 px-3"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                                {t("common.upgrade.generating_qr", { defaultValue: "កំពុងបង្កើត QR..." })}
                                            </>
                                        ) : (
                                            t("common.upgrade.regenerate_qr", { defaultValue: "បង្កើត QR ថ្មី" })
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="w-[190px] h-[190px] flex flex-col items-center justify-center space-y-3">
                                    <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
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
                                    {paymentAmount === null ? "—" : `$${paymentAmount.toFixed(2)}`}
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
                                    disabled={countdown <= 0 || !qrString || loading || isCheckingPayment || paymentCheckCooldown > 0}
                                    className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
                                    aria-live="polite"
                                >
                                    {isCheckingPayment ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                            <span>{t("common.upgrade.messages.verifying")}</span>
                                        </>
                                    ) : paymentCheckCooldown > 0 ? (
                                        <span>
                                            {t("common.upgrade.payment.checkAgainIn", { seconds: paymentCheckCooldown })}
                                        </span>
                                    ) : (
                                        <>
                                            <span>{t("common.upgrade.check_payment", { defaultValue: "ផ្ទៀងផ្ទាត់ស្វ័យប្រវត្តិ" })}</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            )}

                            {/* Option 2: Upload Payment Slip / Receipt */}
                            <div className="pt-3 border-t border-border/60 text-left space-y-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground">
                                        {t("common.upgrade.payment.slipTitle", { defaultValue: "ឬផ្ញើរូបភាពវិក្កយបត្រ" })}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t("common.upgrade.payment.slipDescription", { defaultValue: "សម្រាប់ក្រុមការងារផ្ទៀងផ្ទាត់ការទូទាត់" })}
                                    </p>
                                    <p id="payment-slip-hint" className="text-xs text-muted-foreground">
                                        {t("common.upgrade.payment.slipHint", {
                                            defaultValue: "Upload a receipt image or enter a transaction reference to request manual review."
                                        })}
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <label htmlFor="payment-slip" className="block text-sm font-medium text-foreground">
                                        {t("common.upgrade.payment.slipImage", { defaultValue: "រូបភាពវិក្កយបត្រ" })}
                                    </label>
                                    <input
                                        id="payment-slip"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleFileChange}
                                        disabled={isSubmittingSlip}
                                        aria-describedby={slipImageError
                                            ? "payment-slip-hint payment-slip-error"
                                            : "payment-slip-hint"}
                                        className="min-h-11 w-full rounded-xl border border-input bg-background px-2 py-1.5 text-sm file:mr-3 file:min-h-9 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:font-bold file:text-teal-700 hover:file:bg-teal-100 dark:file:bg-teal-500/10 dark:file:text-teal-400"
                                    />
                                    {slipImageError && (
                                        <p id="payment-slip-error" className="text-sm text-rose-600 dark:text-rose-400" role="alert">
                                            {slipImageError}
                                        </p>
                                    )}
                                    {slipImage && (
                                        <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-teal-500/30">
                                            <img
                                                src={slipImage}
                                                alt={t("common.upgrade.payment.slipImage", { defaultValue: "Payment receipt image" })}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSlipImage(null);
                                                    setSlipImageFile(null);
                                                    setSlipImageError("");
                                                }}
                                                disabled={isSubmittingSlip}
                                                aria-label={t("common.upgrade.payment.removeSlip", { defaultValue: "លុបរូបភាពវិក្កយបត្រ" })}
                                                className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full bg-black/75 text-xl text-white shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50"
                                            >
                                                <X aria-hidden="true" className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                    <label htmlFor="payment-slip-reference" className="block pt-1 text-sm font-medium text-foreground">
                                        {t("common.upgrade.payment.slipReference", { defaultValue: "លេខកូដប្រតិបត្តិការ ឬចំណាំ" })}
                                    </label>
                                    <input
                                        id="payment-slip-reference"
                                        type="text"
                                        placeholder={t("common.upgrade.payment.slipReferencePlaceholder", { defaultValue: "លេខកូដប្រតិបត្តិការ (TxID / Ref) ឬចំណាំ..." })}
                                        value={slipRef}
                                        onChange={(e) => setSlipRef(e.target.value)}
                                        disabled={isSubmittingSlip}
                                        maxLength={200}
                                        className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/20"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleSubmitSlip}
                                        disabled={isSubmittingSlip || (!slipImage && !slipRef.trim())}
                                        variant="outline"
                                        className="min-h-11 w-full rounded-xl border-teal-200 text-sm font-bold text-teal-600 dark:border-teal-900/50 dark:text-teal-400 dark:hover:bg-teal-500/10"
                                        aria-live="polite"
                                    >
                                        {isSubmittingSlip ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>{t("common.upgrade.payment.submittingSlip", { defaultValue: "កំពុងផ្ញើ..." })}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{t("common.upgrade.payment.submitSlip", { defaultValue: "ដាក់ស្នើវិក្កយបត្រជូនក្រុមការងារ" })}</span>
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
                        {t("common.upgrade.payment.slipSubmittedTitle", { defaultValue: "Receipt submitted for review" })}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                        {t("common.upgrade.payment.slipSubmittedDescription", {
                            defaultValue: "We received your payment details. Our team will verify them and update your plan shortly."
                        })}
                    </DialogDescription>
                    <Button
                        className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs mt-4"
                        onClick={() => window.location.href = "/dashboard"}
                    >
                        {t("common.upgrade.payment.slipSubmittedContinue", { defaultValue: "Back to Dashboard" })}
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}

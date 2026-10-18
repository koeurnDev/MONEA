import { useState, useEffect, useRef } from "react";
import { Check, Loader2, Sparkles, Receipt, Zap, ShieldCheck, Crown, Clock, X, AlertCircle, RefreshCw, Upload } from "lucide-react";
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
import { NETWORK_ERROR_MESSAGE } from "@/lib/network-errors";

const MAX_RECEIPT_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_RECEIPT_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PAYMENT_SESSION_KEY = "monea_payment_session";
const PAYMENT_QR_VALIDITY_SECONDS = 9 * 60;
const PAYMENT_STATUS_CHECK_COOLDOWN_SECONDS = 5;

export default function UpgradePage() {
    const { t, locale } = useTranslation();
    const isKm = locale === "km";
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
            setSlipImageError(t("dashboard.upgrade.payment.slipInvalidType"));
            return;
        }
        if (file.size <= 0 || file.size > MAX_RECEIPT_IMAGE_SIZE) {
            setSlipImage(null);
            setSlipImageFile(null);
            setSlipImageError(t("dashboard.upgrade.payment.slipInvalidSize"));
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
                setSlipImageError(t("dashboard.upgrade.payment.slipReadError", {
                    defaultValue: "We couldn't read this image. Please choose another file."
                }));
            }
        };
        reader.onerror = () => {
            setSlipImage(null);
            setSlipImageFile(null);
            setSlipImageError(t("dashboard.upgrade.payment.slipReadError", {
                defaultValue: "We couldn't read this image. Please choose another file."
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmitSlip = async () => {
        if (!slipImage && !slipRef.trim()) {
            showToast({
                title: t("dashboard.upgrade.payment.slipRequiredTitle"),
                description: t("dashboard.upgrade.payment.slipRequiredDescription"),
                type: "error"
            });
            return;
        }
        if (slipRef.trim().length > 200) {
            showToast({
                title: t("dashboard.upgrade.payment.slipReferenceTooLongTitle"),
                description: t("dashboard.upgrade.payment.slipReferenceTooLongDescription"),
                type: "error"
            });
            return;
        }

        setIsSubmittingSlip(true);
        const packageBeingSubmitted = selectedPlan;
        let uploadedReceipt: { url: string; publicId: string } | null = null;
        try {
            if (slipImageFile) {
                if (!wedding?.id) throw new Error("Wedding is required to submit a receipt");
                uploadedReceipt = await uploadToCloudinary(slipImageFile, wedding.id);
            }
            const res = await moneaClient.post<{ success: boolean }>("/api/payment/submit-slip", {
                packageType: packageBeingSubmitted,
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
                    title: t("dashboard.upgrade.payment.errorTitle", { defaultValue: "Payment submission failed" }),
                    description: res.error || t("dashboard.upgrade.payment.techError", {
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
                title: t("dashboard.upgrade.payment.errorTitle", { defaultValue: "Payment submission failed" }),
                description: t("dashboard.upgrade.payment.techError", {
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
                status: "PAID" | "PENDING" | "STALE";
                packageType?: "PRO" | "PREMIUM" | string;
            }>("/api/payment/manual-verify");
            if (data.error) {
                throw new Error(`Payment status request failed (${data.status}): ${data.error}`);
            }
            if (!data.data || !["PAID", "PENDING", "STALE"].includes(data.data.status)) {
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
            } else if (data.data.status === "STALE") {
                showToast({
                    title: t("dashboard.upgrade.payment.statusCheckFailedTitle"),
                    description: t("dashboard.upgrade.payment.staleAttemptDescription", {
                        defaultValue: "សំណើទូទាត់នេះលែងសកម្មហើយ ព្រោះមានសំណើថ្មីជាងជំនួសវា។ សូមកុំបង់ប្រាក់តាម QR ចាស់ ហើយទាក់ទងជំនួយ ប្រសិនបើអ្នកបានបង់រួច។",
                    }),
                    type: "error"
                });
            } else {
                showToast({
                    title: t("dashboard.upgrade.payment.paymentPendingTitle"),
                    description: t("common.upgrade.payment_not_found", { defaultValue: "មិនទាន់ទទួលបានការទូទាត់ទេ។ សូមស្កេន KHQR និងព្យាយាមម្តងទៀត។" }),
                    type: "info"
                });
            }
        } catch (e) {
            console.error("[Manual Check] Failed or network error:", e);
            showToast({
                title: t("dashboard.upgrade.payment.statusCheckFailedTitle"),
                description: e instanceof Error && e.message.includes(NETWORK_ERROR_MESSAGE)
                    ? NETWORK_ERROR_MESSAGE
                    : t("dashboard.upgrade.payment.statusCheckErrorDescription"),
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
                        title: t("dashboard.upgrade.payment.sessionSaveWarningTitle"),
                        description: t("dashboard.upgrade.payment.sessionSaveWarningDescription"),
                        type: "info"
                    });
                }
            } else {
                const errorMessage = res.error || t("dashboard.upgrade.payment.invalidQrResponse");
                console.error("[Upgrade] QR generation returned an incomplete response:", {
                    error: res.error,
                    status: res.status,
                    hasData: Boolean(res.data)
                });
                showToast({
                    title: t("dashboard.upgrade.payment.qrGenerationFailedTitle"),
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
                title: t("dashboard.upgrade.payment.qrGenerationFailedTitle"),
                description: t("dashboard.upgrade.payment.networkError"),
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
                        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
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
                        <Button asChild className="h-11 rounded-xl bg-primary px-5 font-bold text-primary-foreground hover:bg-primary/90">
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
                        "relative flex w-full flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 sm:rounded-3xl sm:p-8",
                        currentPlan === "FREE" && "ring-2 ring-ring/30"
                    )}>
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                    <ShieldCheck size={24} />
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl sm:text-4xl font-black text-foreground font-mono">$0</span>
                                    <p className="mt-0.5 text-xs font-bold text-muted-foreground uppercase tracking-wide font-kantumruy">
                                        {t("common.upgrade.free_label", { defaultValue: "ឥតគិតថ្លៃ" })} / {t("common.upgrade.planCards.perEvent", { defaultValue: "កម្មវិធី" })}
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold font-kantumruy text-foreground">
                                {t("common.upgrade.free_name", { defaultValue: "កញ្ចប់ធម្មតា" })}
                            </h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground font-kantumruy">
                                {t("common.upgrade.planCards.free.description", { defaultValue: "រចនាធៀបការអញ្ជើញជាមូលដ្ឋានសម្រាប់កម្មវិធីខ្នាតតូច។" })}
                            </p>

                            <div className="space-y-2.5 sm:space-y-3 pt-4 sm:pt-6 border-t border-border/50 mt-4 sm:mt-6">
                                {[1, 2, 3, 4].map((idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 text-sm font-medium leading-relaxed text-foreground/80 font-kantumruy">
                                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                            <Check size={11} strokeWidth={3} />
                                        </div>
                                        <span className="leading-relaxed">{t(`common.upgrade.planCards.free.features.${idx}`)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8">
                            <Button 
                                variant="outline"
                                className="h-11 w-full cursor-default rounded-xl border-border bg-muted/30 text-sm font-bold text-muted-foreground font-kantumruy"
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
                        "relative flex w-full flex-col justify-between rounded-2xl border-2 border-primary/40 bg-card p-4 shadow-md transition-all duration-300 sm:rounded-3xl sm:p-8",
                        currentPlan === "PRO" && "ring-2 ring-primary"
                    )}>
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
                                    <Zap size={24} />
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-primary font-mono sm:text-4xl">
                                        ${pricing.standard.toFixed(2)}
                                    </span>
                                    <p className="mt-0.5 text-xs font-bold text-muted-foreground uppercase tracking-wide font-kantumruy">
                                        {t("common.upgrade.single_event", { defaultValue: "ទូទាត់តែម្តង" })} / {t("common.upgrade.planCards.perEvent", { defaultValue: "កម្មវិធី" })}
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold font-kantumruy text-foreground">
                                {t("common.upgrade.pro_name", { defaultValue: "កញ្ចប់ពិសេស" })}
                            </h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground font-kantumruy">
                                {t("common.upgrade.planCards.pro.description", { defaultValue: "លទ្ធភាពរចនាគ្មានដែនកំណត់ ជាមួយទម្រង់រចនាកម្រិតខ្ពស់។" })}
                            </p>

                            <div className="space-y-2.5 sm:space-y-3 pt-4 sm:pt-6 border-t border-border/50 mt-4 sm:mt-6">
                                {[1, 2, 3, 4, 5].map((idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 text-sm font-medium leading-relaxed text-foreground font-kantumruy">
                                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                                            <Check size={11} strokeWidth={3} />
                                        </div>
                                        <span className="leading-relaxed">{t(`common.upgrade.planCards.pro.features.${idx}`)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8">
                            <Button 
                                className="h-11 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-98 font-kantumruy"
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
                        "relative flex w-full flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 sm:rounded-3xl sm:p-8",
                        currentPlan === "PREMIUM" && "ring-2 ring-amber-500"
                    )}>
                        <div>
                            <div className="mb-3 flex justify-end">
                                <span className="inline-flex max-w-full items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-right text-xs font-black uppercase leading-tight tracking-wide text-amber-600 dark:text-amber-400">
                                    {currentPlan === "PREMIUM"
                                        ? t("common.upgrade.current_plan", { defaultValue: "កញ្ចប់បច្ចុប្បន្ន" })
                                        : t("common.upgrade.best_value", { defaultValue: "ពេញនិយមបំផុត" })}
                                </span>
                            </div>

                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                    <Sparkles size={24} />
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl sm:text-4xl font-black text-foreground font-mono">
                                        ${pricing.pro.toFixed(2)}
                                    </span>
                                    <p className="mt-0.5 text-xs font-bold text-muted-foreground uppercase tracking-wide font-kantumruy">
                                        {t("common.upgrade.unlimited_events", { defaultValue: "ប្រើគ្មានដែនកំណត់" })} / {t("common.upgrade.planCards.perYear", { defaultValue: "ឆ្នាំ" })}
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold font-kantumruy text-foreground">
                                {t("common.upgrade.premium_name", { defaultValue: "កញ្ចប់ល្អបំផុត" })}
                            </h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground font-kantumruy">
                                {t("common.upgrade.planCards.premium.description", { defaultValue: "បទពិសោធន៍រចនាដ៏អស្ចារ្យ សម្រាប់អ្នករៀបចំកម្មវិធីអាជីព។" })}
                            </p>

                            <div className="space-y-2.5 sm:space-y-3 pt-4 sm:pt-6 border-t border-border/50 mt-4 sm:mt-6">
                                {[1, 2, 3, 4, 5].map((idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 text-sm font-medium leading-relaxed text-foreground font-kantumruy">
                                        <div className="w-4 h-4 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={11} strokeWidth={3} />
                                        </div>
                                        <span className="leading-relaxed">{t(`common.upgrade.planCards.premium.features.${idx}`)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8">
                            <Button 
                                className="h-11 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-98 font-kantumruy"
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
                <Card className="border border-primary/20 bg-accent/40 shadow-sm">
                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="space-y-1">
                            <p className="font-bold text-foreground">
                                {countdown > 0
                                    ? t("dashboard.upgrade.payment.resumeTitle")
                                    : t("dashboard.upgrade.payment.expiredTitle")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {countdown > 0
                                    ? t("dashboard.upgrade.payment.resumeDescription", {
                                        amount: paymentAmount?.toFixed(2) ?? "—",
                                        time: `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`
                                    })
                                    : t("dashboard.upgrade.payment.expiredDescription")}
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={() => countdown > 0 ? setShowPayment(true) : handleSelect(selectedPlan)}
                            disabled={countdown <= 0 && loading}
                            className="h-11 shrink-0 rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                        >
                            {countdown > 0
                                ? t("dashboard.upgrade.payment.resumeAction")
                                : t("common.upgrade.regenerate_qr", { defaultValue: "បង្កើត QR ថ្មី" })}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Payment Modal */}
            <Dialog open={showPayment} onOpenChange={(open) => !isSuccessCelebration && setShowPayment(open)}>
                <DialogContent className="w-[94vw] max-h-[90dvh] overflow-y-auto rounded-3xl border border-border bg-card p-0 shadow-2xl font-kantumruy gap-0 sm:max-w-2xl">
                    <DialogHeader className="border-b border-border/60 bg-muted/25 px-5 py-5 pr-14 text-left sm:px-7 sm:py-6">
                        <div className="flex items-start gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 space-y-1">
                                <DialogTitle className="text-lg font-bold leading-relaxed text-foreground sm:text-xl">
                                    {t("common.upgrade.secure_payment", { defaultValue: "ទូទាត់ប្រាក់ប្រកបដោយសុវត្ថិភាព" })}
                                </DialogTitle>
                                <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                                    {t("common.upgrade.scan_khqr", { defaultValue: "សូមស្កេន QR Code ខាងក្រោមតាមរយៈ App ធនាគាររបស់អ្នក (Bakong / KHQR)" })}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="grid gap-5 p-4 sm:gap-6 sm:p-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <section className="flex flex-col items-center gap-4 rounded-2xl border border-border/70 bg-muted/20 p-4 text-center sm:p-5">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground">KHQR</p>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    {t("common.upgrade.scan_khqr", { defaultValue: "សូមស្កេន QR Code ខាងក្រោមតាមរយៈ App ធនាគាររបស់អ្នក (Bakong / KHQR)" })}
                                </p>
                            </div>

                            <div className="flex min-h-[220px] w-full items-center justify-center rounded-2xl border border-border/70 bg-white p-3 shadow-sm sm:min-h-[248px]">
                                {qrString && countdown > 0 ? (
                                    <SafeQRCode value={qrString} size={220} className="max-w-full" />
                                ) : countdown <= 0 && qrString ? (
                                    <div className="flex min-h-[196px] flex-col items-center justify-center gap-3 text-center">
                                        <Clock className="h-8 w-8 text-destructive" />
                                        <p className="text-sm font-bold text-foreground">{t("common.upgrade.qr_expired", { defaultValue: "QR Code ផុតកំណត់" })}</p>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSelect(selectedPlan)}
                                            disabled={loading}
                                            className="h-9 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
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
                                    <div className="flex min-h-[196px] flex-col items-center justify-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <span className="text-sm font-bold text-muted-foreground">{t("common.upgrade.generating_qr", { defaultValue: "កំពុងបង្កើត QR..." })}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid w-full grid-cols-2 gap-3">
                                <div className="rounded-xl border border-border/70 bg-background px-3 py-3 text-left">
                                    <span className="block text-xs font-semibold text-muted-foreground">
                                        {t("common.upgrade.payable_amount", { defaultValue: "ចំនួនទឹកប្រាក់" })}
                                    </span>
                                    <span className="mt-1 block font-mono text-xl font-bold text-foreground">
                                        {paymentAmount === null ? "—" : `$${paymentAmount.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-border/70 bg-background px-3 py-3 text-right">
                                    <span className="block text-xs font-semibold text-muted-foreground">
                                        {t("common.upgrade.time_remaining", { defaultValue: "ពេលវេលានៅសល់" })}
                                    </span>
                                    <span className={cn("mt-1 block font-mono text-xl font-bold", countdown < 30 ? "animate-pulse text-rose-500" : "text-foreground")}>
                                        {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section className="min-w-0 rounded-2xl border border-border/70 bg-background p-4 sm:p-5">
                            <div className="mb-4 flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Receipt className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <div className="min-w-0 space-y-1">
                                    <h3 className="text-sm font-bold leading-relaxed text-foreground">
                                        {t("dashboard.upgrade.payment.slipTitle", { defaultValue: "ឬផ្ញើរូបភាពវិក្កយបត្រ" })}
                                    </h3>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        {t("dashboard.upgrade.payment.slipDescription", { defaultValue: "សម្រាប់ក្រុមការងារផ្ទៀងផ្ទាត់ការទូទាត់" })}
                                    </p>
                                </div>
                            </div>

                            <p className="mb-4 rounded-xl border border-primary/15 bg-accent/50 px-3 py-2.5 text-xs font-semibold leading-relaxed text-foreground">
                                {isKm
                                    ? <>កញ្ចប់ដែលអ្នកកំពុងស្នើ៖ <strong>{selectedPlan === "PRO" ? "PRO" : "PREMIUM"}</strong></>
                                    : <>Package being submitted: <strong>{selectedPlan}</strong></>}
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="payment-slip" className="mb-1.5 block text-xs font-semibold text-foreground">
                                        {t("dashboard.upgrade.payment.slipImage", { defaultValue: "រូបភាពវិក្កយបត្រ" })}
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
                                        className="peer sr-only"
                                    />
                                    <label
                                        htmlFor="payment-slip"
                                        className={cn(
                                            "flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-3 py-4 text-center transition-colors hover:border-primary/50 hover:bg-accent/40 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                                            isSubmittingSlip && "pointer-events-none opacity-60",
                                            slipImage && "border-primary/40 bg-primary/5",
                                        )}
                                    >
                                        {slipImage ? (
                                            <span className="text-sm font-semibold text-primary">
                                                {t("dashboard.upgrade.payment.slipImage", { defaultValue: "រូបភាពវិក្កយបត្រ" })} ✓
                                            </span>
                                        ) : (
                                            <>
                                                <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
                                                <span className="text-sm font-semibold text-foreground">
                                                    {t("dashboard.upgrade.payment.slipImage", { defaultValue: "រូបភាពវិក្កយបត្រ" })}
                                                </span>
                                            </>
                                        )}
                                        <span id="payment-slip-hint" className="text-xs leading-relaxed text-muted-foreground">
                                            {t("dashboard.upgrade.payment.slipHint", {
                                                defaultValue: "Upload a receipt image or enter a transaction reference to request manual review."
                                            })}
                                        </span>
                                    </label>
                                    {slipImageError && (
                                        <p id="payment-slip-error" className="mt-2 text-sm text-destructive" role="alert">
                                            {slipImageError}
                                        </p>
                                    )}
                                </div>

                                {slipImage && (
                                    <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-primary/30">
                                        <img
                                            src={slipImage}
                                            alt={t("dashboard.upgrade.payment.slipImage", { defaultValue: "Payment receipt image" })}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSlipImage(null);
                                                setSlipImageFile(null);
                                                setSlipImageError("");
                                            }}
                                            disabled={isSubmittingSlip}
                                            aria-label={t("dashboard.upgrade.payment.removeSlip", { defaultValue: "លុបរូបភាពវិក្កយបត្រ" })}
                                            className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full bg-black/75 text-xl text-white shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50"
                                        >
                                            <X aria-hidden="true" className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label htmlFor="payment-slip-reference" className="block text-xs font-semibold text-foreground">
                                        {t("dashboard.upgrade.payment.slipReference", { defaultValue: "លេខកូដប្រតិបត្តិការ ឬចំណាំ" })}
                                    </label>
                                    <input
                                        id="payment-slip-reference"
                                        type="text"
                                        placeholder={t("dashboard.upgrade.payment.slipReferencePlaceholder", { defaultValue: "លេខកូដប្រតិបត្តិការ (TxID / Ref) ឬចំណាំ..." })}
                                        value={slipRef}
                                        onChange={(e) => setSlipRef(e.target.value)}
                                        disabled={isSubmittingSlip}
                                        maxLength={200}
                                        className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                                    />
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleSubmitSlip}
                                    disabled={isSubmittingSlip || (!slipImage && !slipRef.trim())}
                                    variant="outline"
                                    className="min-h-11 w-full rounded-xl border-primary/30 text-sm font-bold text-primary hover:bg-accent"
                                    aria-live="polite"
                                >
                                    {isSubmittingSlip ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>{t("dashboard.upgrade.payment.submittingSlip", { defaultValue: "កំពុងផ្ញើ..." })}</span>
                                        </>
                                    ) : (
                                        <span>{t("dashboard.upgrade.payment.submitSlip", { defaultValue: "ដាក់ស្នើវិក្កយបត្រជូនក្រុមការងារ" })}</span>
                                    )}
                                </Button>
                            </div>
                        </section>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Animation Overlay */}
            {isSuccessCelebration && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="mx-4 max-w-sm space-y-4 rounded-3xl border border-border bg-card p-8 text-center shadow-2xl animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                            <Check className="w-8 h-8" strokeWidth={3} />
                        </div>
                        <h2 className="text-2xl font-bold font-kantumruy text-foreground">{t("common.upgrade.payment_received", { defaultValue: "ទូទាត់ជោគជ័យ!" })}</h2>
                        <p className="text-sm text-muted-foreground font-kantumruy">{t("common.upgrade.upgrading_wait", { defaultValue: "កំពុងដំឡើងកញ្ចប់សេវាកម្មរបស់អ្នក..." })}</p>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
                <DialogContent className="rounded-3xl border border-border bg-card p-6 shadow-2xl font-kantumruy sm:max-w-md">
                    <DialogHeader className="text-center pb-4 border-b border-border/40">
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Receipt size={24} />
                        </div>
                        <DialogTitle className="text-xl font-bold text-foreground">
                            {t("common.upgrade.digital_receipt", { defaultValue: "វិក្កយបត្រអេឡិចត្រូនិច" })}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {t("common.upgrade.trans_success", { defaultValue: "ប្រតិបត្តិការបានបញ្ចប់ដោយជោគជ័យ" })}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-3 py-4 text-sm">
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
                        className="mt-2 h-11 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground"
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
                        {t("dashboard.upgrade.payment.slipSubmittedTitle", { defaultValue: "Receipt submitted for review" })}
                    </DialogTitle>
                    <DialogDescription className="pt-1 text-sm leading-relaxed text-muted-foreground">
                        {t("dashboard.upgrade.payment.slipSubmittedDescription", {
                            defaultValue: "We received your payment details. Our team will verify them and update your plan shortly."
                        })}
                    </DialogDescription>
                    <Button
                        className="mt-4 h-11 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90"
                        onClick={() => window.location.href = "/dashboard"}
                    >
                        {t("dashboard.upgrade.payment.slipSubmittedContinue", { defaultValue: "Back to Dashboard" })}
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}

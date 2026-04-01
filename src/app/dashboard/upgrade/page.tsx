"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Loader2, Sparkles, Receipt, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { moneaClient } from "@/lib/api-client";
import { useTranslation } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import confetti from "canvas-confetti";

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

    const isPolling = useRef(false);

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
                if (pricingRes.data) setPricing(pricingRes.data);
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
                if (remaining > 5) {
                    setSelectedPlan(session.planId);
                    setQrMd5(session.md5);
                    setOrderId(session.orderId);
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

    // 3. Independent Countdown Logic
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown(c => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    // 4. Robust Polling Logic (Fixed: No countdown dependency)
    useEffect(() => {
        if (!showPayment || !qrMd5 || !orderId ) return;

        const poll = async () => {
            // Check if countdown expired inside the poll
            if (isPolling.current || countdown <= 0) return;
            
            isPolling.current = true;
            try {
                const data = await moneaClient.post<{ status: string; packageType: string }>("/api/payment/check-status", {
                    md5: qrMd5,
                    orderId,
                    packageType: selectedPlan
                });

                if (data.data?.status === "PAID") {
                    // Success Celebration Flow
                    setReceiptData({
                        orderId,
                        package: selectedPlan === "PRO" ? t("common.upgrade.pro_name") : t("common.upgrade.premium_name"),
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
                }
            } catch (e) {
                console.warn("[Polling] Cycle failed or network error.");
            } finally {
                isPolling.current = false;
            }
        };

        const interval = setInterval(poll, 1800); // Snapier 1.8s polling
        return () => clearInterval(interval);
    }, [showPayment, qrMd5, orderId, selectedPlan, pricing, countdown, t]);

    const handleSelect = async (plan: "PRO" | "PREMIUM") => {
        setSelectedPlan(plan);
        setLoading(true);
        try {
            const res = await moneaClient.post<{ qr: string, md5: string, orderId: string }>("/api/payment/generate-qr", {
                packageType: plan
            });

            if (res.data) {
                const expiry = 180;
                setQrString(res.data.qr);
                setQrMd5(res.data.md5);
                setOrderId(res.data.orderId);
                setCountdown(expiry);
                setShowPayment(true);

                sessionStorage.setItem("monea_payment_session", JSON.stringify({
                    planId: plan,
                    md5: res.data.md5,
                    orderId: res.data.orderId,
                    qr: res.data.qr,
                    expiresAt: Date.now() + (expiry * 1000)
                }));
            }
        } catch (e) {
            console.error("QR Generation failed:", e);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="container max-w-6xl py-12 px-4 space-y-12">
            <div className="text-center space-y-4">
                <Badge variant="outline" className="px-4 py-1 text-red-600 border-red-200 bg-red-50 animate-bounce">
                     {t("common.upgrade.special_offer")}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 uppercase">
                    {t("common.upgrade.title").split(' ').map((word: string, i: number) => 
                        word.toLowerCase() === 'power' || word === 'កម្លាំង' ? <span key={i} className="text-red-600 ml-2">{word}</span> : (i === 0 ? word : ` ${word}`)
                    )}
                </h1>
                <p className="text-slate-500 max-w-xl mx-auto font-medium">
                    {t("common.upgrade.subtitle")}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* FREE PLAN */}
                <Card className={`relative overflow-hidden transition-all duration-500 border-2 ${wedding?.packageType === "FREE" || !wedding?.packageType ? "border-slate-400 shadow-lg" : "border-slate-200 hover:border-slate-300 opacity-60 hover:opacity-100"}`}>
                    {(wedding?.packageType === "FREE" || !wedding?.packageType) && (
                        <div className="absolute top-0 right-0 bg-slate-500 text-white px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest z-10">{t("common.upgrade.current_plan")}</div>
                    )}
                    <CardHeader className="p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black text-slate-900">$0</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Forever Free</p>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-black uppercase tracking-tight">{t("common.upgrade.free_name")}</CardTitle>
                        <CardDescription className="text-slate-500 font-medium pt-2">Standard tools to get you started.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-4">
                        {[
                            "Basic Digital Invitation",
                            "Standard Gallery",
                            "Digital Gift List",
                            "1 Wedding Event",
                            "MONEA Branding"
                        ].map((feat) => (
                            <div key={feat} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                <div className="p-1 bg-slate-100 text-slate-400 rounded-full"><Check className="w-3.5 h-3.5" strokeWidth={3} /></div>
                                {feat}
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                        <Button 
                            className="w-full h-14 text-sm font-black uppercase tracking-wider bg-slate-100 text-slate-400 rounded-2xl cursor-default"
                            disabled
                        >
                            {(wedding?.packageType === "FREE" || !wedding?.packageType) ? t("common.upgrade.already_active") : t("common.upgrade.free_name")}
                        </Button>
                    </CardFooter>
                </Card>

                {/* PRO PLAN */}
                <Card className={`relative overflow-hidden transition-all duration-500 border-2 ${selectedPlan === "PRO" ? "border-red-600 shadow-2xl scale-[1.02]" : "border-slate-200 hover:border-slate-300"} ${wedding?.packageType === "PRO" ? "ring-2 ring-red-500/20" : ""}`}>
                    {wedding?.packageType === "PRO" && (
                        <div className="absolute top-0 right-0 bg-red-600 text-white px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest z-10">{t("common.upgrade.current_plan")}</div>
                    )}
                    <CardHeader className="p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                                <Zap className="w-6 h-6" fill="currentColor" />
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black text-slate-900">${pricing.standard.toFixed(2)}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Single Event</p>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-black uppercase tracking-tight">{t("common.upgrade.pro_name")}</CardTitle>
                        <CardDescription className="text-slate-500 font-medium pt-2">Essential tools for professional events.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-4">
                        {[
                            "Unlimited QR Check-ins",
                            "Real-time Guest Analytics",
                            "Digital Gift Tracking",
                            "Team Collaboration (3 Staff)",
                            "Public Gallery Access",
                        ].map((feat) => (
                            <div key={feat} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                <div className="p-1 bg-green-100 text-green-600 rounded-full"><Check className="w-3.5 h-3.5" strokeWidth={3} /></div>
                                {feat}
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                        <Button 
                            className={`w-full h-14 text-sm font-black uppercase tracking-wider transition-all rounded-2xl group ${wedding?.packageType === "PRO" ? "bg-slate-100 text-slate-400 cursor-default" : "bg-slate-900 hover:bg-red-600 text-white"}`}
                            onClick={() => wedding?.packageType !== "PRO" && handleSelect("PRO")}
                            disabled={loading || wedding?.packageType === "PRO"}
                        >
                            {loading && selectedPlan === "PRO" ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : wedding?.packageType === "PRO" ? t("common.upgrade.already_active") : <><ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" /> {t("common.upgrade.upgrade_now")}</>}
                        </Button>
                    </CardFooter>
                </Card>

                {/* PREMIUM PLAN */}
                <Card className={`relative overflow-hidden transition-all duration-500 border-2 ${selectedPlan === "PREMIUM" ? "border-red-600 shadow-2xl scale-[1.02]" : "border-slate-200 hover:border-slate-300"} ${wedding?.packageType === "PREMIUM" ? "ring-2 ring-red-500/20" : ""}`}>
                    <div className="absolute top-0 right-0 bg-red-600 text-white px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest z-10">{wedding?.packageType === "PREMIUM" ? t("common.upgrade.current_plan") : t("common.upgrade.best_value")}</div>
                    <CardHeader className="p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg">
                                <Sparkles className="w-6 h-6" fill="currentColor" />
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black text-slate-900">${pricing.pro.toFixed(2)}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unlimited Events</p>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-black uppercase tracking-tight">{t("common.upgrade.premium_name")}</CardTitle>
                        <CardDescription className="text-slate-500 font-medium pt-2">Full control and white-label experience.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-4">
                        {[
                            "Everything in PRO",
                            "Unlimited Team Staff",
                            "Custom Template Engine",
                            "Priority System Support",
                            "Data Export (Excel/PDF)",
                            "No MONEA Branding"
                        ].map((feat) => (
                            <div key={feat} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                <div className="p-1 bg-red-100 text-red-600 rounded-full"><Check className="w-3.5 h-3.5" strokeWidth={3} /></div>
                                {feat}
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                        <Button 
                            className={`w-full h-14 text-sm font-black uppercase tracking-wider shadow-xl transition-all rounded-2xl ${wedding?.packageType === "PREMIUM" ? "bg-slate-100 text-slate-400 cursor-default shadow-none" : "bg-red-600 hover:bg-slate-900 shadow-red-200 text-white"}`}
                            onClick={() => wedding?.packageType !== "PREMIUM" && handleSelect("PREMIUM")}
                            disabled={loading || wedding?.packageType === "PREMIUM"}
                        >
                            {loading && selectedPlan === "PREMIUM" ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : wedding?.packageType === "PREMIUM" ? t("common.upgrade.already_active") : t("common.upgrade.unlock_elite")}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Payment Modal */}
            <Dialog open={showPayment} onOpenChange={(open) => !isSuccessCelebration && setShowPayment(open)}>
                <DialogContent className="sm:max-w-md bg-slate-950 text-white border-slate-800 rounded-[3rem] overflow-hidden p-0 shadow-2xl">
                    <div className="bg-red-600 p-8 text-center space-y-2">
                        <ShieldCheck className="w-12 h-12 text-white mx-auto mb-2 animate-pulse" />
                        <DialogTitle className="text-2xl font-black uppercase tracking-widest text-white">{t("common.upgrade.secure_payment")}</DialogTitle>
                        <DialogDescription className="sr-only">{t("common.upgrade.scan_khqr")}</DialogDescription>
                        <p className="text-red-100 text-xs font-medium">{t("common.upgrade.scan_khqr")}</p>
                    </div>

                    <div className="p-10 space-y-8 text-center">
                        <div className="bg-white p-6 rounded-[2.5rem] inline-block shadow-inner relative group">
                            {qrString ? (
                                <QRCode value={qrString} size={220} />
                            ) : (
                                <div className="w-[220px] h-[220px] flex items-center justify-center bg-slate-50 rounded-2xl">
                                    <Loader2 className="w-10 h-10 text-slate-300 animate-spin" />
                                </div>
                            )}
                            <div className="absolute inset-0 border-4 border-dashed border-red-200 rounded-[2.5rem] pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            
                            {/* Live Status Indicator */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 px-4 py-1.5 rounded-full border border-slate-800 shadow-xl flex items-center gap-2 whitespace-nowrap">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Live Checking Status...</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                             <div className="flex justify-between items-center bg-slate-100/5 p-5 rounded-2xl border border-white/5">
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t("common.upgrade.payable_amount")}</p>
                                    <p className="text-2xl font-black text-white">${selectedPlan === "PRO" ? pricing.standard.toFixed(2) : pricing.pro.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t("common.upgrade.time_remaining")}</p>
                                    <p className={`text-xl font-bold ${countdown < 30 ? "text-red-500 animate-pulse" : "text-white"}`}>
                                        {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                                    </p>
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 italic">{t("common.upgrade.do_not_close")}</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Animation Overlay */}
            {isSuccessCelebration && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
                    <div className="text-center space-y-6 animate-in zoom-in duration-500">
                        <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                            <Check className="w-16 h-16" strokeWidth={4} />
                        </div>
                        <h2 className="text-5xl font-black uppercase tracking-tighter text-slate-900">{t("common.upgrade.payment_received")}</h2>
                        <p className="text-xl font-bold text-slate-500">{t("common.upgrade.upgrading_wait")}</p>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
                <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-[2.5rem] overflow-hidden p-0">
                    <div className="bg-slate-900 p-8 text-white text-center">
                        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
                            <Receipt className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-widest text-white">{t("common.upgrade.digital_receipt")}</DialogTitle>
                        <DialogDescription className="sr-only">{t("common.upgrade.receipt_package")}</DialogDescription>
                        <p className="text-slate-400 text-[10px] font-bold mt-1 tracking-widest uppercase">{t("common.upgrade.trans_success")}</p>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">{t("common.upgrade.receipt_order")}</span>
                                <span className="font-bold text-slate-900 font-mono">{receiptData?.orderId}</span>
                            </div>
                            <hr className="border-slate-100" />
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">{t("common.upgrade.receipt_package")}</span>
                                <span className="font-black text-slate-900 text-lg tracking-tighter uppercase">{receiptData?.package}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">{t("common.upgrade.receipt_amount")}</span>
                                <span className="font-black text-red-600 text-xl tracking-tighter">${receiptData?.amount?.toFixed(2)}</span>
                            </div>
                        </div>
                        <Button 
                            className="w-full h-14 bg-slate-900 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
                            onClick={() => window.location.href = "/dashboard"}
                        >
                            {t("common.upgrade.continue_btn")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

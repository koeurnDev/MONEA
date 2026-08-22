"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CreditCard,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    User,
    Clock,
    Package,
    Loader2,
    DollarSign,
    ShieldCheck,
    ExternalLink,
    RefreshCcw,
    Zap,
    TrendingUp,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from "framer-motion";
import { moneaClient } from "@/lib/api-client";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";

export default function MasterPaymentsPage() {
    const { t, locale } = useTranslation();
    const { showToast } = useToast();
    const isKm = locale === 'km';

    const [weddings, setWeddings] = useState<any[]>([]);
    const [pricing, setPricing] = useState({ standard: 9, pro: 19 });
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await moneaClient.get("/api/admin/master/payments") as any;
            // The global api-client will redirect to sign-in on 401. Don't show toast.
            if (res.status === 401) return;
            if (res.error || !res.data) throw new Error(res.error || "Failed");
            
            setWeddings(res.data.weddings || []);
            setPricing(res.data.pricing || { standard: 9, pro: 19 });
        } catch (error) {
            showToast({
                title: isKm ? "បរាជ័យក្នុងការទាញយកទិន្នន័យ" : "Sync Failed",
                description: isKm ? "មិនអាចភ្ជាប់ទៅកាន់ប្រព័ន្ធបានទេ។" : "Could not connect to the verification engine.",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    }, [isKm, showToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleApprove = async (weddingId: string, packageType: string) => {
        setProcessing(weddingId);
        try {
            await moneaClient.post("/api/admin/master/payments", { 
                weddingId, 
                status: "PAID", 
                packageType 
            });
            
            showToast({
                title: t('admin.payments.success'),
                description: t('admin.payments.successDesc'),
                type: "success"
            });
            
            // Refresh local state by removing the approved wedding
            setWeddings(prev => prev.filter(w => w.id !== weddingId));
        } catch (error) {
            showToast({
                title: "Approval Error",
                description: "Critical failure during activation protocol.",
                type: "error"
            });
        } finally {
            setProcessing(null);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0A0A0A] p-4 md:p-8">
            <m.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-[1400px] mx-auto space-y-8"
            >
                {/* Header Section */}
                <m.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <Link href="/admin/master">
                            <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 backdrop-blur-xl shadow-sm">
                                    <ArrowLeft size={18} />
                                </Button>
                            </m.div>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-kantumruy italic">
                                {t('admin.payments.title')}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.2em]",
                                    isKm ? "text-red-500" : "text-slate-400"
                                )}>
                                    {t('admin.payments.subtitle')}
                                </span>
                                <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-white/10" />
                                <span className="text-[10px] font-bold text-slate-300 dark:text-white/20 uppercase tracking-widest font-mono">
                                    VERIFICATION_v2.4
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <m.div 
                            whileHover={{ y: -2 }}
                            className="px-6 py-3 bg-white dark:bg-white/5 backdrop-blur-xl rounded-[1.5rem] border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-4"
                        >
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0A0A0A] bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-slate-50 dark:from-white/5 dark:to-white/20" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                    {t('admin.payments.awaitingApproval', { count: '' }).replace('{count}', '').trim()}
                                </span>
                                <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                                    {weddings.length} {isKm ? "សំណើ" : "Requests"}
                                </span>
                            </div>
                        </m.div>
                        <Button 
                            onClick={loadData}
                            variant="ghost" 
                            size="icon" 
                            className="rounded-2xl h-12 w-12 border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50"
                        >
                            <RefreshCcw size={18} className={cn(loading && "animate-spin text-red-500")} />
                        </Button>
                    </div>
                </m.div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {loading && weddings.length === 0 ? (
                        <div className="py-32 text-center flex flex-col items-center justify-center">
                            <div className="relative mb-8">
                                <Loader2 className="w-16 h-16 animate-spin text-red-500/20" />
                                <ShieldCheck className="w-8 h-8 text-red-600 absolute inset-0 m-auto" />
                            </div>
                            <h3 className="text-sm font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.3em] animate-pulse">
                                {t('admin.payments.loading')}
                            </h3>
                        </div>
                    ) : weddings.length === 0 ? (
                        <m.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] bg-white/50 dark:bg-white/[0.02] p-24 text-center"
                        >
                            <div className="w-24 h-24 bg-gradient-to-tr from-slate-50 to-white dark:from-white/5 dark:to-white/10 rounded-[2rem] flex items-center justify-center text-slate-300 dark:text-white/20 mx-auto mb-8 shadow-xl border border-white dark:border-white/5">
                                <Clock size={42} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 font-kantumruy">
                                {t('admin.payments.empty')}
                            </h3>
                            <p className="max-w-md mx-auto text-slate-500 dark:text-white/40 font-medium font-kantumruy text-sm">
                                {t('admin.payments.emptyDesc')}
                            </p>
                            
                            {/* Decorative Background Elements */}
                            <div className="absolute top-10 right-10 w-32 h-32 bg-red-500/5 blur-[80px] rounded-full" />
                            <div className="absolute bottom-10 left-10 w-32 h-32 bg-amber-500/5 blur-[80px] rounded-full" />
                        </m.div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {weddings.map((w, index) => (
                                <m.div
                                    key={w.id}
                                    layout
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                    className="group"
                                >
                                    <Card className="border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_20px_60px_rgb(0,0,0,0.04)] dark:bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] overflow-hidden transition-all duration-500">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100/50 dark:divide-white/5">
                                                {/* Section 1: Wedding Brand */}
                                                <div className="p-10 lg:w-[35%] space-y-6 relative overflow-hidden">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
                                                            <Package size={20} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-lg w-fit">
                                                                    {w.packageType} {isKm ? "កញ្ចប់" : "Plan"}
                                                                </span>
                                                                {w.bakongTrxId && (
                                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                                                                        <CheckCircle2 size={10} className="text-emerald-500" />
                                                                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Auto-Verified</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Tier Level Access</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-1">
                                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-kantumruy leading-tight">
                                                            {w.groomName} <span className="text-red-500">&</span> {w.brideName}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                            <User size={14} className="text-slate-300 dark:text-white/20" />
                                                            <span className="font-medium">{isKm ? "សាមីខ្លួន:" : "Owner:"}</span>
                                                            <span className="text-slate-900 dark:text-white/80">{w.user?.name || w.user?.email}</span>
                                                        </div>
                                                    </div>

                                                    {/* Background Glow */}
                                                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-500/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                                </div>

                                                {/* Section 2: Metadata & Pricing */}
                                                <div className="p-10 lg:flex-1 space-y-8 flex flex-col justify-center bg-slate-50/20 dark:bg-transparent">
                                                    <div className="grid grid-cols-2 gap-10">
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em] mb-2">{t('admin.payments.registrationDate')}</p>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={14} className="text-red-500" />
                                                                <p className="text-sm font-black text-slate-900 dark:text-white/90 font-mono">
                                                                    {new Date(w.createdAt).toLocaleDateString(isKm ? 'km-KH' : 'en-US', { 
                                                                        year: 'numeric', month: 'long', day: 'numeric' 
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em] mb-2">
                                                                {w.bakongTrxId ? "Bakong Ref" : t('admin.payments.weddingId')}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                {w.bakongTrxId ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <ExternalLink size={14} className="text-emerald-500" />
                                                                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight uppercase">
                                                                            {w.bakongTrxId.substring(0, 16)}...
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <ShieldCheck size={14} className="text-amber-500" />
                                                                        <p className="text-sm font-bold text-slate-900 dark:text-white/90 font-mono tracking-widest uppercase">
                                                                            ID-{w.id.substring(0, 8)}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-white shadow-xl">
                                                                <DollarSign size={24} strokeWidth={2.5} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.payments.planCost')}</p>
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                                                        ${w.packageType === "PRO" ? pricing.pro : pricing.standard}
                                                                    </span>
                                                                    <span className="text-xs font-black text-slate-300 uppercase tracking-widest">USD</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-col items-end gap-2">
                                                            {w.paymentStatus === "PAID" ? (
                                                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                                                        {isKm ? "បានទូទាត់រួចរាល់" : "Verified & Paid"}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-500/5 rounded-full border border-amber-100 dark:border-amber-500/20">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                                                                        {t('admin.payments.awaitingVerification')}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {isKm && !w.bakongTrxId && w.paymentStatus !== "PAID" && (
                                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">ផ្ទៀងផ្ទាត់ដោយដៃ</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Section 3: High-Vis Actions */}
                                                <div className="p-10 lg:w-[25%] flex flex-col justify-center gap-4 bg-slate-50/40 dark:bg-white/[0.01]">
                                                    {w.paymentStatus !== "PAID" && (
                                                        <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                        <Button
                                                            onClick={() => handleApprove(w.id, w.packageType)}
                                                            disabled={processing === w.id}
                                                            className={cn(
                                                                "w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-2xl transition-all duration-300",
                                                                processing === w.id 
                                                                    ? "bg-slate-100 text-slate-400" 
                                                                    : "bg-slate-900 dark:bg-white text-white dark:text-black hover:shadow-red-500/20"
                                                            )}
                                                        >
                                                            {processing === w.id ? (
                                                                <RefreshCcw className="animate-spin" size={20} />
                                                            ) : (
                                                                <>
                                                                    <Zap size={20} className="text-red-500" />
                                                                    {t('admin.payments.approve')}
                                                                </>
                                                            )}
                                                        </Button>
                                                        </m.div>
                                                    )}
                                                    
                                                    {w.paymentStatus === "PAID" && (
                                                        <div className="p-4 rounded-[1.5rem] bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 text-center">
                                                            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Status Active</p>
                                                            <p className="text-[9px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-tight">Manual override disabled</p>
                                                        </div>
                                                    )}
                                                    <Link href={`/dashboard?weddingId=${w.id}`} target="_blank" className="w-full">
                                                        <Button variant="ghost" className="w-full h-12 text-slate-400 dark:text-white/30 hover:text-slate-900 dark:hover:text-white font-black uppercase tracking-[0.25em] text-[9px] group/link">
                                                            {t('admin.payments.preview')}
                                                            <ExternalLink size={12} className="ml-2 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </m.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Footer Insight */}
                <m.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-12 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <TrendingUp size={16} className="text-green-500" />
                        <span className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.3em]">
                            Revenue Optimization Protocol Active
                        </span>
                    </div>
                    <Link href="/admin/master">
                        <span className="text-[10px] font-black text-slate-400 hover:text-red-500 cursor-pointer transition-colors uppercase tracking-[0.3em]">
                            {t('admin.payments.return')}
                        </span>
                    </Link>
                </m.div>
            </m.div>
        </div>
    );
}

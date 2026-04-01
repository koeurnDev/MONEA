"use client";
import React, { useState, useEffect } from 'react';
import { moneaClient } from "@/lib/api-client";
import Image from "next/image";
import Link from "next/link";
import { 
    ArrowLeft, 
    Save, 
    Loader2, 
    ShieldAlert, 
    History as HistoryIcon,
    Zap,
    LayoutGrid,
    CheckCircle2,
    Settings2,
    Lock,
    Globe,
    Cpu,
    Calendar
} from "lucide-react";
import { m } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { SecurityAuditFeed } from "@/components/admin/SecurityAuditFeed";
import { useTranslation } from "@/i18n/LanguageProvider";
import { CreditCard, Mail, Building2, Terminal, ExternalLink } from "lucide-react";

export default function MasterSettingsPage() {
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // 2FA States
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [twoFactorToken, setTwoFactorToken] = useState("");
    const [is2FASetupLoading, setIs2FASetupLoading] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [showPasswordPromptFor2FA, setShowPasswordPromptFor2FA] = useState(false);
    const [passwordFor2FA, setPasswordFor2FA] = useState("");

    // Bakong States
    const [bakongStep, setBakongStep] = useState(1);
    const [bakongEmail, setBakongEmail] = useState("");
    const [bakongOrg, setBakongOrg] = useState("MONEA Platform");
    const [bakongProject, setBakongProject] = useState("Wedding Integration");
    const [bakongCode, setBakongCode] = useState("");
    const [bakongManualToken, setBakongManualToken] = useState("");
    const [isBakongManual, setIsBakongManual] = useState(false);
    const [isBakongLoading, setIsBakongLoading] = useState(false);
    const [bakongInfo, setBakongInfo] = useState<{
        email?: string;
        organization?: string;
        project?: string;
        isConnected?: boolean;
        updatedAt?: string;
    } | null>(null);

    useEffect(() => {
        moneaClient.get("/api/admin/master/settings")
            .then(res => setConfig(res.data))
            .finally(() => setLoading(false));

        // Fetch Bakong Status
        moneaClient.get("/api/admin/bakong/status")
            .then(res => {
                const data = res.data as any;
                setBakongInfo(data);
                if (data?.email) setBakongEmail(data.email);
                if (data?.organization) setBakongOrg(data.organization);
                if (data?.project) setBakongProject(data.project);
            });
    }, []);

    const handleAutoSave = async (updatedFields: Partial<any>) => {
        if (!config) return;
        const newConfig = { ...config, ...updatedFields };
        setConfig(newConfig); // optimistic update
        try {
            const res = await moneaClient.post("/api/admin/master/settings", newConfig);
            if (!res.error) {
                showToast({ title: t("admin.settings.saveSuccess"), type: "success" });
                
                // Refresh explicitly when System Status or Lockout state changes
                if ('maintenanceMode' in updatedFields || 'globalCheckIn' in updatedFields) {
                    setTimeout(() => {
                        window.location.href = window.location.href;
                    }, 500);
                }
            } else {
                showToast({ title: t("admin.settings.saveFailed"), description: res.error, type: "error" });
                setConfig(config); // revert on error
            }
        } catch (e) {
            console.error(e);
            showToast({ title: t("admin.settings.saveFailed"), type: "error" });
            setConfig(config); // revert
        }
    };

    const handleSetup2FA = async () => {
        if (!passwordFor2FA) {
            showToast({ title: "Password Required", type: "error" });
            return;
        }
        setIs2FASetupLoading(true);
        try {
            const res = await moneaClient.post<any>("/api/auth/2fa/setup", { password: passwordFor2FA });
            if (res.data?.qrCodeDataUrl) {
                setQrCode(res.data.qrCodeDataUrl);
                setShowPasswordPromptFor2FA(false); // Hide the prompt
            } else if (res.error) {
                showToast({ title: "Verification Failed", description: res.error, type: "error" });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIs2FASetupLoading(false);
        }
    };

    const handleVerify2FA = async () => {
        setIs2FASetupLoading(true);
        try {
            const res = await moneaClient.post<any>("/api/auth/2fa/verify", { token: twoFactorToken });
            if (res.data?.success) {
                setIs2FAEnabled(true);
                setQrCode(null);
            } else {
                showToast({
                    title: t("admin.settings.2faInvalid"),
                    description: res.data?.error || t("admin.settings.2faCheckCode"),
                    type: "info"
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIs2FASetupLoading(false);
        }
    };

    const handleBakongRequest = async () => {
        setIsBakongLoading(true);
        try {
            const res = await moneaClient.post<any>("/api/admin/bakong/request-token", {
                email: bakongEmail,
                organization: bakongOrg,
                project: bakongProject
            });
            if (!res.error) {
                showToast({ title: "Request Sent", description: "Check your email for the verification code.", type: "success" });
                setBakongStep(2);
            } else {
                const details = (res as any).details?.responseMessage || "";
                showToast({ 
                    title: "Request Failed", 
                    description: details ? `${res.error}: ${details}` : res.error, 
                    type: "error" 
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsBakongLoading(false);
        }
    };

    const handleBakongVerify = async () => {
        setIsBakongLoading(true);
        try {
            const res = await moneaClient.post<any>("/api/admin/bakong/verify-token", { code: bakongCode });
            if (!res.error) {
                showToast({ title: "Connected", description: "Bakong API successfully integrated!", type: "success" });
                setBakongInfo({ ...bakongInfo, isConnected: true });
                setBakongStep(1);
            } else {
                const details = (res as any).details?.responseMessage || "";
                showToast({ 
                    title: "Verification Failed", 
                    description: details ? `${res.error}: ${details}` : res.error, 
                    type: "error" 
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsBakongLoading(false);
        }
    };

    const handleBakongManualSave = async () => {
        if (!bakongManualToken) return;
        setIsBakongLoading(true);
        try {
            const res = await moneaClient.post<any>("/api/admin/bakong/manual-token", { token: bakongManualToken });
            if (!res.error) {
                showToast({ title: "Saved", description: "Bakong Token updated manually.", type: "success" });
                setBakongInfo({ ...bakongInfo, isConnected: true });
                setIsBakongManual(false);
                setBakongManualToken("");
            } else {
                showToast({ title: "Save Failed", description: res.error, type: "error" });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsBakongLoading(false);
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] dark:bg-slate-950">
                <Loader2 className="w-10 h-10 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-slate-950 p-6 md:p-12">
            <m.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto space-y-12"
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin">
                                <m.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                        <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                                    </Button>
                                </m.div>
                            </Link>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
                                    <ShieldAlert size={14} />
                                    {t("admin.settings.securityAuthority")}
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t("admin.settings.masterController")}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            className="h-12 px-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] border border-slate-200 dark:border-slate-800"
                        >
                            {t("admin.settings.logsHistory")}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12">
                    {/* Column 1: Platform Economics */}
                    <m.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-8">
                        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-indigo-600 to-red-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-8 lg:p-10">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="p-3 bg-red-600/10 rounded-2xl text-red-600">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tight">{t("admin.settings.pricingTitle")}</h3>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t("admin.settings.pricingSubtitle")}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Standard (PRO) Plan Price */}
                                    <div className="group relative p-8 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-slate-200 transition-all duration-500 overflow-hidden">
                                        <div className="relative z-10 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">{t("admin.settings.standardTier")}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t("admin.settings.standardBadge")}</p>
                                                </div>
                                                <Zap className="w-10 h-10 text-slate-200 dark:text-white/10 group-hover:text-red-500/20 transition-colors" />
                                            </div>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-2xl">$</div>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    className="h-20 w-full pl-12 pr-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 text-3xl font-black text-slate-900 dark:text-white focus:border-red-600 focus:ring-4 focus:ring-red-600/10 outline-none tabular-nums bg-white dark:bg-slate-950 shadow-inner transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
                                                    value={config?.stadPrice || 0}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9.]/g, ''); 
                                                        setConfig({ ...config, stadPrice: val });
                                                    }}
                                                    onBlur={(e) => handleAutoSave({ stadPrice: parseFloat(e.target.value || "0") })}
                                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pro Master (PREMIUM) Plan Price */}
                                    <div className="group relative p-8 rounded-[2.5rem] bg-slate-950 border border-slate-800 hover:border-red-500 transition-all duration-500 overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-red-600/20 transition-colors" />
                                        <div className="relative z-10 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="font-black text-white text-lg uppercase tracking-tight">{t("admin.settings.proTier")}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t("admin.settings.proBadge")}</p>
                                                    </div>
                                                </div>
                                                <Zap className="w-10 h-10 text-red-500/20 group-hover:text-red-500 transition-colors" />
                                            </div>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 font-black text-2xl">$</div>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    className="h-20 w-full pl-12 pr-6 rounded-3xl border-2 border-slate-800 text-3xl font-black white focus:border-red-600 focus:ring-4 focus:ring-red-600/10 outline-none tabular-nums bg-slate-900 shadow-inner transition-all hover:bg-slate-800"
                                                    value={config?.proPrice || 0}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                                        setConfig({ ...config, proPrice: val });
                                                    }}
                                                    onBlur={(e) => handleAutoSave({ proPrice: parseFloat(e.target.value || "0") })}
                                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">{t("admin.settings.activeSince")}</p>
                            </CardContent>
                        </Card>
                    </m.div>

                    {/* Column 2: Security & Authority Control */}
                    <m.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="space-y-8">
                        {/* 2FA Card */}
                        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-black/50 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                            <CardContent className="p-8 lg:p-10">
                                <div className="flex flex-col space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl text-indigo-600">
                                            <Lock size={24} />
                                        </div>
                                        <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">{t("admin.settings.2faTitle")}</h3>
                                    </div>
                                    
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed font-kantumruy">
                                        {t("admin.settings.2faSubtitle")}
                                    </p>

                                    {is2FAEnabled ? (
                                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20">
                                                    <CheckCircle2 size={16} className="text-white" />
                                                </div>
                                                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">{t("admin.settings.2faActive")}</span>
                                            </div>
                                        </div>
                                    ) : !qrCode ? (
                                        showPasswordPromptFor2FA ? (
                                            <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[2rem]">
                                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("admin.settings.verifyIdentity") || "Verify Identity to Continue"}</p>
                                                <input
                                                    type="password"
                                                    placeholder="Enter your Master Password"
                                                    className="h-14 w-full px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold focus:border-indigo-500 outline-none"
                                                    value={passwordFor2FA}
                                                    onChange={(e) => setPasswordFor2FA(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSetup2FA()}
                                                />
                                                <div className="flex gap-2">
                                                    <Button onClick={() => setShowPasswordPromptFor2FA(false)} variant="outline" className="h-12 flex-1 rounded-xl text-xs font-black uppercase tracking-widest">Cancel</Button>
                                                    <Button onClick={handleSetup2FA} disabled={is2FASetupLoading || !passwordFor2FA} className="h-12 flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest">
                                                        {is2FASetupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => setShowPasswordPromptFor2FA(true)}
                                                disabled={is2FASetupLoading}
                                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20"
                                            >
                                                {is2FASetupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("admin.settings.2faInit")}
                                            </Button>
                                        )
                                    ) : (
                                        <div className="space-y-6 p-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[2rem]">
                                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mx-auto w-36 h-36">
                                                <Image src={qrCode} alt="2FA QR Code" width={120} height={120} className="rounded-xl object-contain mx-auto" unoptimized />
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder={t("admin.settings.2faPlaceholder")}
                                                    className="h-14 flex-1 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-lg font-black text-center focus:border-indigo-500 outline-none tracking-widest"
                                                    value={twoFactorToken}
                                                    onChange={(e) => setTwoFactorToken(e.target.value)}
                                                    maxLength={6}
                                                />
                                                <Button
                                                    onClick={handleVerify2FA}
                                                    disabled={is2FASetupLoading || twoFactorToken.length < 6}
                                                    className="h-14 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-widest text-[10px]"
                                                >
                                                    {t("admin.settings.2faVerify")}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-black/50 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl text-amber-600">
                                            <ShieldAlert className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{t("admin.settings.lockoutTitle")}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t("admin.settings.lockoutSubtitle")}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={!config?.globalCheckIn}
                                        onCheckedChange={(val) => handleAutoSave({ globalCheckIn: !val })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bakong API Setup Card */}
                        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-800 opacity-20 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-8 lg:p-10">
                                <div className="flex flex-col space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600">
                                                <CreditCard size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white font-kantumruy">Bakong API</h4>
                                                <p className="text-[10px] text-slate-400 font-bold">Manage Connection</p>
                                            </div>
                                        </div>
                                        {bakongInfo?.isConnected && (
                                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Connected</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                    <Terminal size={12} className="text-red-600" /> API Token (JWT)
                                                </label>
                                                <a 
                                                    href="https://api-bakong.nbc.gov.kh" 
                                                    target="_blank" 
                                                    className="text-[9px] font-black text-red-600 hover:text-red-700 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                                >
                                                    Portal <ExternalLink size={10} />
                                                </a>
                                            </div>
                                            <textarea
                                                placeholder="Paste your production JWT token here..."
                                                className="w-full p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-mono focus:border-red-600 focus:ring-4 focus:ring-red-600/5 outline-none transition-all min-h-[140px] resize-none shadow-inner"
                                                value={bakongManualToken}
                                                onChange={(e) => setBakongManualToken(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            onClick={handleBakongManualSave}
                                            disabled={isBakongLoading || !bakongManualToken}
                                            className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            {isBakongLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                                            Update Connection Token
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </m.div>

                    {/* Column 3: System Status & Audit Feed */}
                    <m.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="space-y-8 lg:col-span-2 xl:col-span-1">
                        {/* Status Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-8">
                            {/* Maintenance Card */}
                            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-black/50 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[100px] rounded-full -mr-24 -mt-24 group-hover:bg-white/10 transition-colors" />
                                <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-3 h-3 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]",
                                                    config?.maintenanceMode ? "bg-red-500 animate-pulse" : "bg-emerald-500 shadow-emerald-500/50"
                                                )} />
                                                <h3 className="font-black text-xl tracking-tight">{t("admin.settings.statusTitle")}</h3>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                {config?.maintenanceMode ? t("admin.settings.statusHalt") : t("admin.settings.statusOnline")}
                                            </p>
                                        </div>
                                        <Switch
                                            className="data-[state=checked]:bg-red-500"
                                            checked={config?.maintenanceMode}
                                            onCheckedChange={(val) => handleAutoSave({ maintenanceMode: val })}
                                        />
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed font-kantumruy mt-6">
                                        {config?.maintenanceMode ? t("admin.settings.maintenanceDesc") : t("admin.settings.onlineDesc")}
                                    </p>

                                    <div className="mt-8 space-y-4 pt-6 border-t border-white/5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                                                <Calendar size={10} /> {isKm ? "ម៉ោងចាប់ផ្តើមបិទ (ប្រព័ន្ធនឹងបិទស្វ័យប្រវត្តិ)" : "Maintenance Start (Auto-Halt)"}
                                            </label>
                                            <input
                                                type="datetime-local"
                                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold outline-none focus:border-red-500 transition-colors"
                                                value={config?.maintenanceStart ? new Date(new Date(config.maintenanceStart).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                                                onChange={(e) => setConfig({ ...config, maintenanceStart: e.target.value })}
                                                onBlur={(e) => handleAutoSave({ maintenanceStart: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                                                <LayoutGrid size={10} /> {isKm ? "ម៉ោងបើកវិញ (ប្រព័ន្ធនឹងបើកស្វ័យប្រវត្តិ)" : "Opening Hour (Auto-Resume)"}
                                            </label>
                                            <input
                                                type="datetime-local"
                                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold outline-none focus:border-red-500 transition-colors"
                                                value={config?.maintenanceEnd ? new Date(new Date(config.maintenanceEnd).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                                                onChange={(e) => setConfig({ ...config, maintenanceEnd: e.target.value })}
                                                onBlur={(e) => handleAutoSave({ maintenanceEnd: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Security Audit Feed (Integrated Component) */}
                            <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 h-[450px] overflow-hidden">
                                <CardContent className="p-8 h-full">
                                    <SecurityAuditFeed />
                                </CardContent>
                            </Card>

                            {/* Engine Branding */}
                            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-black/50 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-black text-white p-8 group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-2xl group-hover:rotate-12 transition-transform">
                                        <Cpu className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-500">{t("admin.settings.engineTitle")}</h4>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-black text-white leading-none">{t("admin.settings.engineVersion")}</span>
                                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{t("admin.settings.engineVersionBadge")}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </m.div>
                </div>

                {/* Footer Warning Protocol */}
                <m.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-10 rounded-[3rem] bg-amber-500/5 border border-amber-500/20 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left"
                >
                    <div className="p-4 bg-amber-500/20 rounded-3xl text-amber-600">
                        <ShieldAlert size={28} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-black text-amber-900 dark:text-amber-400 text-lg uppercase tracking-tight">{t("admin.settings.overrideTitle")}</h4>
                        <p className="text-sm text-amber-800/60 dark:text-amber-500/60 font-medium leading-relaxed max-w-2xl font-kantumruy">
                            {t("admin.settings.overrideDesc")}
                        </p>
                    </div>
                </m.div>
            </m.div>
        </div>
    );
}

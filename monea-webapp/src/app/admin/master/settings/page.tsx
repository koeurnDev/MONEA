"use client";
import React, { useState, useEffect } from 'react';
import { moneaClient } from "@/lib/api-client";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldAlert, Cpu } from "lucide-react";
import { m } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/Toast";
import { SecurityAuditFeed } from "@/components/admin/SecurityAuditFeed";
import { useTranslation } from "@/i18n/LanguageProvider";

import { EconomicsCard } from "./components/EconomicsCard";
import { SecurityCard } from "./components/SecurityCard";
import { BakongCard } from "./components/BakongCard";
import { StatusMaintenanceCard } from "./components/StatusMaintenanceCard";

export default function MasterSettingsPage() {
    const { t } = useTranslation();
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
    const [showPasswordFor2FA, setShowPasswordFor2FA] = useState(false);

    // Bakong States
    const [bakongEmail, setBakongEmail] = useState("");
    const [bakongOrg, setBakongOrg] = useState("MONEA Platform");
    const [bakongProject, setBakongProject] = useState("Wedding Integration");
    const [bakongCode, setBakongCode] = useState("");
    const [bakongManualToken, setBakongManualToken] = useState("");
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
                
                if ('maintenanceMode' in updatedFields || 'globalCheckIn' in updatedFields) {
                    setTimeout(() => {
                        window.location.href = window.location.href;
                    }, 500);
                }
            } else {
                showToast({ title: t("admin.settings.saveFailed"), description: res.error, type: "error" });
                setConfig(config); // revert
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
                setShowPasswordPromptFor2FA(false);
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

    const handleBakongManualSave = async () => {
        if (!bakongManualToken) return;
        setIsBakongLoading(true);
        try {
            const res = await moneaClient.post<any>("/api/admin/bakong/manual-token", { token: bakongManualToken });
            if (!res.error) {
                showToast({ title: "Saved", description: "Bakong Token updated manually.", type: "success" });
                setBakongInfo({ ...bakongInfo, isConnected: true });
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
                        <EconomicsCard config={config} setConfig={setConfig} handleAutoSave={handleAutoSave} />
                    </m.div>

                    {/* Column 2: Security & Authority Control */}
                    <m.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="space-y-8">
                        <SecurityCard 
                            config={config} 
                            handleAutoSave={handleAutoSave} 
                            is2FAEnabled={is2FAEnabled} 
                            qrCode={qrCode} 
                            showPasswordPromptFor2FA={showPasswordPromptFor2FA} 
                            setShowPasswordPromptFor2FA={setShowPasswordPromptFor2FA} 
                            passwordFor2FA={passwordFor2FA} 
                            setPasswordFor2FA={setPasswordFor2FA} 
                            showPasswordFor2FA={showPasswordFor2FA} 
                            setShowPasswordFor2FA={setShowPasswordFor2FA} 
                            is2FASetupLoading={is2FASetupLoading} 
                            handleSetup2FA={handleSetup2FA} 
                            twoFactorToken={twoFactorToken} 
                            setTwoFactorToken={setTwoFactorToken} 
                            handleVerify2FA={handleVerify2FA} 
                        />

                        <BakongCard 
                            bakongInfo={bakongInfo} 
                            bakongManualToken={bakongManualToken} 
                            setBakongManualToken={setBakongManualToken} 
                            handleBakongManualSave={handleBakongManualSave} 
                            isBakongLoading={isBakongLoading} 
                        />
                    </m.div>

                    {/* Column 3: System Status & Audit Feed */}
                    <m.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="space-y-8 lg:col-span-2 xl:col-span-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-8">
                            <StatusMaintenanceCard config={config} setConfig={setConfig} handleAutoSave={handleAutoSave} />

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

"use client";
import React from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Lock, ShieldAlert, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

interface SecurityCardProps {
    config: any;
    handleAutoSave: (fields: Partial<any>) => void;
    is2FAEnabled: boolean;
    qrCode: string | null;
    showPasswordPromptFor2FA: boolean;
    setShowPasswordPromptFor2FA: (val: boolean) => void;
    passwordFor2FA: string;
    setPasswordFor2FA: (val: string) => void;
    showPasswordFor2FA: boolean;
    setShowPasswordFor2FA: (val: boolean) => void;
    is2FASetupLoading: boolean;
    handleSetup2FA: () => void;
    twoFactorToken: string;
    setTwoFactorToken: (val: string) => void;
    handleVerify2FA: () => void;
}

export function SecurityCard({
    config,
    handleAutoSave,
    is2FAEnabled,
    qrCode,
    showPasswordPromptFor2FA,
    setShowPasswordPromptFor2FA,
    passwordFor2FA,
    setPasswordFor2FA,
    showPasswordFor2FA,
    setShowPasswordFor2FA,
    is2FASetupLoading,
    handleSetup2FA,
    twoFactorToken,
    setTwoFactorToken,
    handleVerify2FA
}: SecurityCardProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-8">
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
                                    <div className="relative">
                                        <input
                                            type={showPasswordFor2FA ? "text" : "password"}
                                            placeholder="Enter your Master Password"
                                            className="h-14 w-full pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold focus:border-indigo-500 outline-none"
                                            value={passwordFor2FA}
                                            onChange={(e) => setPasswordFor2FA(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSetup2FA()}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordFor2FA(!showPasswordFor2FA)}
                                            className="absolute right-3 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                        >
                                            {showPasswordFor2FA ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
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
        </div>
    );
}

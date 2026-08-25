import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Lock, ShieldAlert, CheckCircle2, Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
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
        <div className="space-y-6 font-kantumruy">
            {/* 2FA Card */}
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/40 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden">
                <CardContent className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 flex items-center justify-center">
                            <Lock size={22} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white text-lg">
                                {t("admin.settings.2faTitle", { defaultValue: "ផ្ទៀងផ្ទាត់ចូល (2FA Setup)" })}
                            </h3>
                            <p className="text-xs text-slate-400 font-bold">
                                {t("admin.settings.2faSubtitle", { defaultValue: "ការការពារគណនី SuperAdmin ជាមួយ Google Authenticator" })}
                            </p>
                        </div>
                    </div>

                    {is2FAEnabled ? (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <CheckCircle2 size={18} className="text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                    {t("admin.settings.2faActive", { defaultValue: "បានបើកមុខងារ 2FA រួចរាល់" })}
                                </span>
                            </div>
                        </div>
                    ) : !qrCode ? (
                        showPasswordPromptFor2FA ? (
                            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                    បញ្ចូល Master Password ដើម្បីបន្ត៖
                                </p>
                                <div className="relative">
                                    <input
                                        type={showPasswordFor2FA ? "text" : "password"}
                                        placeholder="Master Password"
                                        className="h-11 w-full pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:border-red-500 outline-none"
                                        value={passwordFor2FA}
                                        onChange={(e) => setPasswordFor2FA(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSetup2FA()}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordFor2FA(!showPasswordFor2FA)}
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        {showPasswordFor2FA ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => setShowPasswordPromptFor2FA(false)} variant="outline" className="h-10 flex-1 rounded-xl text-xs font-bold">
                                        បោះបង់
                                    </Button>
                                    <Button onClick={handleSetup2FA} disabled={is2FASetupLoading || !passwordFor2FA} className="h-10 flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold">
                                        {is2FASetupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ផ្ទៀងផ្ទាត់"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={() => setShowPasswordPromptFor2FA(true)}
                                disabled={is2FASetupLoading}
                                className="w-full h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/20"
                            >
                                {is2FASetupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("admin.settings.2faInit", { defaultValue: "ចាប់ផ្តើមរៀបចំប្រព័ន្ធ 2FA" })}
                            </Button>
                        )
                    ) : (
                        <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mx-auto w-32 h-32 flex items-center justify-center">
                                <img src={qrCode} alt="2FA QR Code" width={110} height={110} className="rounded-xl object-contain" />
                            </div>
                            <p className="text-xs text-slate-500 font-medium">ស្កេន QR Code ក្នុង Google Authenticator App</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="000000"
                                    className="h-11 flex-1 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base font-bold text-center focus:border-red-500 outline-none tracking-widest font-mono"
                                    value={twoFactorToken}
                                    onChange={(e) => setTwoFactorToken(e.target.value)}
                                    maxLength={6}
                                />
                                <Button
                                    onClick={handleVerify2FA}
                                    disabled={is2FASetupLoading || twoFactorToken.length < 6}
                                    className="h-11 px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs"
                                >
                                    ផ្ទៀងផ្ទាត់
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lockout Switch Card */}
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/40 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                                <ShieldAlert size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white text-sm">
                                    {t("admin.settings.lockoutTitle", { defaultValue: "ការបិទការចូល (Global Lockout)" })}
                                </h3>
                                <p className="text-xs text-slate-400 font-bold">
                                    {t("admin.settings.lockoutSubtitle", { defaultValue: "បញ្ឈប់ការចូលប្រើប្រាស់របស់ប្រព័ន្ធ" })}
                                </p>
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

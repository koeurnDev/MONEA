import React, { useState, useEffect } from 'react';
import { moneaClient } from "@/lib/api-client";
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Loader2,
    ShieldAlert,
    Cpu,
    Settings,
    ShieldCheck,
    History,
    DollarSign,
    Lock,
    CreditCard,
    Wrench,
    FileText,
    Zap,
    Crown,
    CheckCircle2,
    Eye,
    EyeOff,
    Terminal,
    ExternalLink,
    Save,
    Calendar,
    LayoutGrid,
    AlertTriangle,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/Toast";
import { SecurityAuditFeed } from "@/components/admin/SecurityAuditFeed";
import { useTranslation } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export default function MasterSettingsPage() {
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pricing' | 'security' | 'bakong' | 'maintenance' | 'audit'>('pricing');
    const { showToast } = useToast();

    // Dedicated Pricing States (Allows typing freely e.g. 9, 19, 29.50)
    const [stadPrice, setStadPrice] = useState<string>("9");
    const [proPrice, setProPrice] = useState<string>("19");
    const [isSavingPricing, setIsSavingPricing] = useState(false);

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
    const [bakongManualToken, setBakongManualToken] = useState("");
    const [isBakongLoading, setIsBakongLoading] = useState(false);
    const [bakongInfo, setBakongInfo] = useState<{
        email?: string;
        organization?: string;
        project?: string;
        isConnected?: boolean;
        updatedAt?: string;
    } | null>(null);

    // Master Admin Profile & Password States
    const [adminName, setAdminName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [currPassword, setCurrPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPwFields, setShowPwFields] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        moneaClient.get("/api/admin/master/settings")
            .then(res => {
                const data = res.data as any;
                setConfig(data);
                if (data?.stadPrice !== undefined && data?.stadPrice !== null) {
                    setStadPrice(String(data.stadPrice));
                }
                if (data?.proPrice !== undefined && data?.proPrice !== null) {
                    setProPrice(String(data.proPrice));
                }
            })
            .finally(() => setLoading(false));

        // Fetch Current Admin Info
        fetch("/api/auth/me")
            .then(res => res.json())
            .then(data => {
                if (data?.email) setAdminEmail(data.email);
                if (data?.name) setAdminName(data.name);
                if (data?.twoFactorEnabled) setIs2FAEnabled(true);
            })
            .catch(() => {});

        // Fetch Bakong Status
        moneaClient.get("/api/admin/bakong/status")
            .then(res => {
                const data = res.data as any;
                setBakongInfo(data);
                if (data?.email) setBakongEmail(data.email);
                if (data?.organization) setBakongOrg(data.organization);
                if (data?.project) setBakongProject(data.project);
            })
            .catch(() => {});
    }, []);

    const handleAutoSave = async (updatedFields: Partial<any>) => {
        if (!config) return;
        const newConfig = { ...config, ...updatedFields };
        setConfig(newConfig); // optimistic update
        try {
            const res = await moneaClient.post("/api/admin/master/settings", newConfig);
            if (!res.error) {
                showToast({ title: t("admin.settings.saveSuccess", { defaultValue: "បានរក្សាទុកជោគជ័យ" }), type: "success" });
                
                if ('maintenanceMode' in updatedFields || 'globalCheckIn' in updatedFields) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }
            } else {
                showToast({ title: t("admin.settings.saveFailed", { defaultValue: "បរាជ័យក្នុងការរក្សាទុក" }), description: res.error, type: "error" });
                setConfig(config); // revert
            }
        } catch (e) {
            console.error(e);
            showToast({ title: t("admin.settings.saveFailed", { defaultValue: "បរាជ័យក្នុងការរក្សាទុក" }), type: "error" });
            setConfig(config); // revert
        }
    };

    const handleSavePricing = async () => {
        const sPrice = parseFloat(stadPrice.trim() || "0");
        const pPrice = parseFloat(proPrice.trim() || "0");
        
        setIsSavingPricing(true);
        try {
            const res = await moneaClient.post("/api/admin/master/settings", {
                ...config,
                stadPrice: sPrice,
                proPrice: pPrice
            });

            if (!res.error) {
                setConfig({ ...config, stadPrice: sPrice, proPrice: pPrice });
                showToast({ title: "បានរក្សាទុកតម្លៃកញ្ចប់សេវាជោគជ័យ!", type: "success" });
            } else {
                showToast({ title: "បរាជ័យក្នុងការរក្សាទុក", description: res.error, type: "error" });
            }
        } catch (e: any) {
            showToast({ title: "បរាជ័យក្នុងការរក្សាទុក", description: e?.message, type: "error" });
        } finally {
            setIsSavingPricing(false);
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
                showToast({ title: "2FA Verified Successfully", type: "success" });
            } else {
                showToast({
                    title: t("admin.settings.2faInvalid", { defaultValue: "កូដមិនត្រឹមត្រូវ" }),
                    description: res.data?.error || t("admin.settings.2faCheckCode", { defaultValue: "សូមពិនិត្យកូដ 2FA ម្តងទៀត" }),
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

    const handleUpdateProfile = async () => {
        setIsSavingProfile(true);
        try {
            const res = await fetch("/api/auth/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: adminName, email: adminEmail })
            });
            const data = await res.json();
            if (res.ok) {
                showToast({ title: "បានធ្វើបច្ចុប្បន្នភាពព័ត៌មាន Admin ជោគជ័យ!", type: "success" });
            } else {
                showToast({ title: "បរាជ័យ", description: data.error || "Failed to update profile", type: "error" });
            }
        } catch (e: any) {
            showToast({ title: "បរាជ័យ", description: e.message, type: "error" });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currPassword || !newPassword) {
            showToast({ title: "សូមបញ្ចូល Password ចាស់ និងថ្មី", type: "error" });
            return;
        }
        if (newPassword.length < 8) {
            showToast({ title: "Password ថ្មីត្រូវមានយ៉ាងតិច ៨ ខ្ទង់", type: "error" });
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast({ title: "Password ថ្មីទាំងពីរមិនដូចគ្នាទេ", type: "error" });
            return;
        }

        setIsChangingPassword(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: currPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                showToast({ title: "បានផ្លាស់ប្តូរ Password ជោគជ័យ!", type: "success" });
                setCurrPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                showToast({ title: "បរាជ័យ", description: data.error || "Failed to change password", type: "error" });
            }
        } catch (e: any) {
            showToast({ title: "បរាជ័យ", description: e.message, type: "error" });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const tabs = [
        { id: 'pricing', label: "កញ្ចប់តម្លៃ", enLabel: "Pricing", icon: DollarSign },
        { id: 'security', label: "សុវត្ថិភាព & គណនី", enLabel: "Security & Account", icon: Lock },
        { id: 'bakong', label: "Bakong KHQR", enLabel: "Gateway", icon: CreditCard },
        { id: 'maintenance', label: "ការថែទាំប្រព័ន្ធ", enLabel: "Maintenance", icon: Wrench },
        { id: 'audit', label: "កំណត់ត្រាសវនកម្ម", enLabel: "Audit Logs", icon: FileText },
    ] as const;

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center font-kantumruy">
                <Loader2 className="w-10 h-10 animate-spin text-rose-600" />
            </div>
        );
    }

    return (
        <div className="w-full min-h-full font-kantumruy pb-16">
            {/* Top Bar Header */}
            <div className="bg-card/80 backdrop-blur-md border-b border-border/80 sticky top-0 z-20">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-border bg-card shadow-xs hover:bg-muted">
                                <ArrowLeft size={17} className="text-muted-foreground" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                <ShieldCheck size={13} />
                                <span>Master Config</span>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold text-foreground">
                                {t("admin.overview.globalSettings", { defaultValue: "ការកំណត់ប្រព័ន្ធរួម" })}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/60 text-xs font-medium text-muted-foreground">
                            <Cpu size={14} className="text-rose-500" />
                            <span>Engine v1.2.3</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-6">
                {/* Clean Segmented Tab Navigation */}
                <div className="flex items-center gap-1.5 p-1.5 bg-muted/50 border border-border/80 rounded-2xl overflow-x-auto scrollbar-none">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 select-none",
                                    isActive
                                        ? "bg-card text-foreground shadow-xs border border-border/80 font-bold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                                )}
                            >
                                <Icon size={16} className={cn(isActive ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground")} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* ─── TAB 1: PRICING (កញ្ចប់តម្លៃ) ─── */}
                {activeTab === 'pricing' && (
                    <div className="space-y-6 max-w-4xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Standard Plan */}
                            <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                                <CardContent className="p-6 sm:p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base text-foreground">កញ្ចប់ STANDARD</h3>
                                                <p className="text-xs text-muted-foreground">Pro Tier Wedding Invitation</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                                            TIER 01
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground">
                                            តម្លៃក្នុងមួយកម្មវិធី (USD):
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">$</span>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="9"
                                                className="h-12 w-full pl-9 pr-4 rounded-xl border border-input bg-background text-xl font-bold text-foreground focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none font-mono"
                                                value={stadPrice}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                                    setStadPrice(val);
                                                }}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSavePricing()}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        តម្លៃនេះនឹងត្រូវគិតប្រាក់ដោយស្វ័យប្រវត្តិកាលណាអតិថិជនជ្រើសរើសកញ្ចប់ Standard។
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Pro Master Plan */}
                            <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                                <CardContent className="p-6 sm:p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                                <Crown size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base text-foreground">កញ្ចប់ PRO MASTER</h3>
                                                <p className="text-xs text-muted-foreground">Premium White-Label Wedding</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                                            PREMIUM
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground">
                                            តម្លៃក្នុងមួយកម្មវិធី (USD):
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">$</span>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="19"
                                                className="h-12 w-full pl-9 pr-4 rounded-xl border border-input bg-background text-xl font-bold text-foreground focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none font-mono"
                                                value={proPrice}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                                    setProPrice(val);
                                                }}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSavePricing()}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        កញ្ចប់ពេញលេញគ្មាន Watermark, មុខងារ RSVP គ្មានដែនកំណត់ និង Custom Domain។
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Save Pricing Action Button */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                onClick={handleSavePricing}
                                disabled={isSavingPricing}
                                className="h-12 px-8 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-md shadow-rose-500/20 flex items-center gap-2"
                            >
                                {isSavingPricing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>កំពុងរក្សាទុក...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>រក្សាទុកតម្លៃកញ្ចប់សេវា (Save Pricing)</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ─── TAB 2: SECURITY & 2FA (សុវត្ថិភាព) ─── */}
                {activeTab === 'security' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 2FA Setup Card */}
                        <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                            <CardContent className="p-6 sm:p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-foreground">ផ្ទៀងផ្ទាត់ចូល (2FA Setup)</h3>
                                        <p className="text-xs text-muted-foreground">ការពារគណនី SuperAdmin ជាមួយ Google Authenticator</p>
                                    </div>
                                </div>

                                {is2FAEnabled ? (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5">
                                        <CheckCircle2 size={18} className="text-emerald-600" />
                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                            បានបើកមុខងារ 2FA រួចរាល់
                                        </span>
                                    </div>
                                ) : !qrCode ? (
                                    showPasswordPromptFor2FA ? (
                                        <div className="space-y-3 p-4 bg-muted/40 border border-border/80 rounded-xl">
                                            <p className="text-xs font-bold text-foreground">
                                                បញ្ចូល Master Password ដើម្បីបន្ត៖
                                            </p>
                                            <div className="relative">
                                                <input
                                                    type={showPasswordFor2FA ? "text" : "password"}
                                                    placeholder="Master Password"
                                                    className="h-11 w-full pl-4 pr-10 rounded-xl border border-input bg-background text-sm font-medium focus:border-rose-500 outline-none"
                                                    value={passwordFor2FA}
                                                    onChange={(e) => setPasswordFor2FA(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSetup2FA()}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordFor2FA(!showPasswordFor2FA)}
                                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPasswordFor2FA ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => setShowPasswordPromptFor2FA(false)} variant="outline" className="h-10 flex-1 rounded-xl text-xs font-bold">
                                                    បោះបង់
                                                </Button>
                                                <Button onClick={handleSetup2FA} disabled={is2FASetupLoading || !passwordFor2FA} className="h-10 flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold">
                                                    {is2FASetupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ផ្ទៀងផ្ទាត់"}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => setShowPasswordPromptFor2FA(true)}
                                            disabled={is2FASetupLoading}
                                            className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs"
                                        >
                                            {is2FASetupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ចាប់ផ្តើមរៀបចំប្រព័ន្ធ 2FA"}
                                        </Button>
                                    )
                                ) : (
                                    <div className="space-y-4 p-4 bg-muted/40 border border-border/80 rounded-xl text-center">
                                        <div className="bg-white p-2 rounded-xl border border-border mx-auto w-32 h-32 flex items-center justify-center">
                                            <img src={qrCode} alt="2FA QR Code" width={110} height={110} className="rounded-lg object-contain" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">ស្កេន QR Code ក្នុង Google Authenticator App</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="000000"
                                                className="h-11 flex-1 px-4 rounded-xl border border-input bg-background text-base font-bold text-center focus:border-rose-500 outline-none font-mono"
                                                value={twoFactorToken}
                                                onChange={(e) => setTwoFactorToken(e.target.value)}
                                                maxLength={6}
                                            />
                                            <Button
                                                onClick={handleVerify2FA}
                                                disabled={is2FASetupLoading || twoFactorToken.length < 6}
                                                className="h-11 px-5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs"
                                            >
                                                ផ្ទៀងផ្ទាត់
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Master Admin Profile & Email Card */}
                        <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                            <CardContent className="p-6 sm:p-8 space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-foreground">គណនី និង អ៊ីមែល Master Admin</h3>
                                        <p className="text-xs text-muted-foreground">ផ្លាស់ប្តូរឈ្មោះ និង Email សម្រាប់ចូលប្រើប្រាស់</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground">ឈ្មោះ Admin:</label>
                                        <input
                                            type="text"
                                            value={adminName}
                                            onChange={(e) => setAdminName(e.target.value)}
                                            placeholder="Master Admin"
                                            className="h-11 w-full px-4 rounded-xl border border-input bg-background text-sm font-medium focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground">អ៊ីមែល (Email):</label>
                                        <input
                                            type="email"
                                            value={adminEmail}
                                            onChange={(e) => setAdminEmail(e.target.value)}
                                            placeholder="admin@monea.com"
                                            className="h-11 w-full px-4 rounded-xl border border-input bg-background text-sm font-medium focus:border-blue-500 outline-none font-mono"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleUpdateProfile}
                                        disabled={isSavingProfile}
                                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2"
                                    >
                                        {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={15} />}
                                        <span>រក្សាទុកព័ត៌មានគណនី (Save Profile)</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Master Admin Change Password Card */}
                        <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                            <CardContent className="p-6 sm:p-8 space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-foreground">ផ្លាស់ប្តូរលេខសម្ងាត់ (Password)</h3>
                                        <p className="text-xs text-muted-foreground">កំណត់ Password ថ្មីយ៉ាងតិច ៨ ខ្ទង់</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type={showPwFields ? "text" : "password"}
                                            placeholder="លេខសម្ងាត់បច្ចុប្បន្ន (Current Password)"
                                            className="h-11 w-full pl-4 pr-10 rounded-xl border border-input bg-background text-xs font-medium focus:border-rose-500 outline-none"
                                            value={currPassword}
                                            onChange={(e) => setCurrPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPwFields(!showPwFields)}
                                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPwFields ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>

                                    <input
                                        type={showPwFields ? "text" : "password"}
                                        placeholder="លេខសម្ងាត់ថ្មី (New Password - យ៉ាងតិច 8 ខ្ទង់)"
                                        className="h-11 w-full px-4 rounded-xl border border-input bg-background text-xs font-medium focus:border-rose-500 outline-none"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />

                                    <input
                                        type={showPwFields ? "text" : "password"}
                                        placeholder="ផ្ទៀងផ្ទាត់លេខសម្ងាត់ថ្មី (Confirm New Password)"
                                        className="h-11 w-full px-4 rounded-xl border border-input bg-background text-xs font-medium focus:border-rose-500 outline-none"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />

                                    <Button
                                        onClick={handleChangePassword}
                                        disabled={isChangingPassword || !currPassword || !newPassword}
                                        className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2"
                                    >
                                        {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck size={15} />}
                                        <span>ផ្លាស់ប្តូរលេខសម្ងាត់ថ្មី (Change Password)</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ─── TAB 3: BAKONG KHQR GATEWAY ─── */}
                {activeTab === 'bakong' && (
                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs max-w-2xl">
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-foreground">Bakong KHQR Gateway</h3>
                                        <p className="text-xs text-muted-foreground">Manage NBC Bakong Payment Connection</p>
                                    </div>
                                </div>
                                {bakongInfo?.isConnected && (
                                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Connected</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                        <Terminal size={14} className="text-rose-600" />
                                        <span>API Token (JWT)</span>
                                    </label>
                                    <a
                                        href="https://api-bakong.nbc.gov.kh"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
                                    >
                                        <span>NBC Portal</span>
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                                <textarea
                                    placeholder="Paste your production JWT token here..."
                                    className="w-full p-4 rounded-xl border border-input bg-background text-xs font-mono focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none transition-all min-h-[120px] resize-none"
                                    value={bakongManualToken}
                                    onChange={(e) => setBakongManualToken(e.target.value)}
                                />
                                <Button
                                    onClick={handleBakongManualSave}
                                    disabled={isBakongLoading || !bakongManualToken}
                                    className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                                >
                                    {isBakongLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>កំពុងរក្សាទុក...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={15} />
                                            <span>រក្សាទុក Bakong Token</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ─── TAB 4: MAINTENANCE (ការថែទាំប្រព័ន្ធ) ─── */}
                {activeTab === 'maintenance' && (
                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs max-w-2xl">
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        config?.maintenanceMode ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
                                    )}>
                                        <Wrench size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-foreground">ស្ថានភាពប្រព័ន្ធ (System Maintenance)</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {config?.maintenanceMode ? "ប្រព័ន្ធកំពុងបិទថែទាំ (Maintenance Mode Active)" : "ប្រព័ន្ធដំណើរការជាធម្មតា (Online)"}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={config?.maintenanceMode}
                                    onCheckedChange={(val) => handleAutoSave({ maintenanceMode: val })}
                                />
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {config?.maintenanceMode
                                    ? "រាល់សេវាកម្មទាំងអស់ត្រូវបានផ្អាកបណ្តោះអាសន្នសម្រាប់អតិថិជន។"
                                    : "រាល់សេវាកម្មទាំងអស់ និងការគ្រប់គ្រងរបស់អតិថិជនកំពុងដំណើរការជាធម្មតា។"}
                            </p>

                            <div className="space-y-4 pt-4 border-t border-border/80">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                        <Calendar size={13} className="text-rose-500" />
                                        <span>{isKm ? "ម៉ោងចាប់ផ្តើមបិទ (Auto-Halt)" : "Maintenance Start"}</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full h-11 px-3 rounded-xl bg-background border border-input text-xs font-medium text-foreground outline-none focus:border-rose-500"
                                        value={config?.maintenanceStart ? new Date(new Date(config.maintenanceStart).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                                        onChange={(e) => setConfig({ ...config, maintenanceStart: e.target.value })}
                                        onBlur={(e) => handleAutoSave({ maintenanceStart: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                        <LayoutGrid size={13} className="text-emerald-500" />
                                        <span>{isKm ? "ម៉ោងបើកវិញ (Auto-Resume)" : "Opening Hour"}</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full h-11 px-3 rounded-xl bg-background border border-input text-xs font-medium text-foreground outline-none focus:border-rose-500"
                                        value={config?.maintenanceEnd ? new Date(new Date(config.maintenanceEnd).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                                        onChange={(e) => setConfig({ ...config, maintenanceEnd: e.target.value })}
                                        onBlur={(e) => handleAutoSave({ maintenanceEnd: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ─── TAB 5: AUDIT LOGS (កំណត់ត្រាសវនកម្ម) ─── */}
                {activeTab === 'audit' && (
                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                        <CardContent className="p-6 sm:p-8">
                            <SecurityAuditFeed />
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}

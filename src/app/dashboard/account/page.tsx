"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Save, RefreshCw, Lock, CheckCircle2, LogOut, History, MapPin, Monitor, User, Smartphone, AlertCircle, KeyRound, Mail, Eye, EyeOff, ShieldOff } from "lucide-react";
import { m, AnimatePresence } from 'framer-motion';
import { TwoFactorSetup } from "@/components/admin/TwoFactorSetup";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useSWR from "swr";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
};

export default function AccountSettingsPage() {
    const { data: user, mutate, error } = useSWR("/api/auth/me", fetcher);
    const [saving, setSaving] = useState(false);
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [securityLogs, setSecurityLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [revoking, setRevoking] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    // Change Password States
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [pwError, setPwError] = useState("");

    // 2FA Disable state
    const [showDisable2FA, setShowDisable2FA] = useState(false);
    const [disablePassword, setDisablePassword] = useState("");
    const [disabling2FA, setDisabling2FA] = useState(false);
    const [disableError, setDisableError] = useState("");

    useEffect(() => {
        if (error?.status === 401) {
            fetch("/api/auth/logout", { method: "POST" }).finally(() => {
                window.location.href = "/login";
            });
        }
    }, [error]);

    const fetchLogs = useCallback(async () => {
        setLoadingLogs(true);
        try {
            const res = await fetch("/api/admin/security/logs");
            if (res.status === 401) return;
            if (!res.ok) throw new Error("Failed to fetch logs");
            const data = await res.json();
            if (Array.isArray(data)) setSecurityLogs(data);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        } finally {
            setLoadingLogs(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "security") {
            fetchLogs();
        }
    }, [activeTab, fetchLogs]);

    const handleRevokeSessions = async () => {
        if (!confirm("តើអ្នកពិតជាចង់ចាកចេញពីគ្រប់ឧបករណ៍មែនទេ?")) return;
        setRevoking(true);
        try {
            const res = await fetch("/api/admin/security/revoke", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetType: "SELF" })
            });
            const data = await res.json();
            if (data.success) {
                alert("បានចាកចេញពីគ្រប់ឧបករណ៍ដោយជោគជ័យ។ លោកអ្នកត្រូវចូលប្រព័ន្ធម្ដងទៀត។");
                window.location.href = "/login";
            }
        } catch (err) {
            alert("មានបញ្ហាក្នុងការចាកចេញ។");
        } finally {
            setRevoking(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError("");

        if (newPassword !== confirmPassword) {
            setPwError("លេខសម្ងាត់ថ្មីមិនស៊ីគ្នាទេ");
            return;
        }

        if (newPassword.length < 8) {
            setPwError("លេខសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ ខ្ទង់");
            return;
        }

        setChangingPassword(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                alert("ប្តូរលេខសម្ងាត់បានជោគជ័យ។ ដើម្បីសុវត្ថិភាព លោកអ្នកត្រូវចូលប្រព័ន្ធម្ដងទៀត។");
                window.location.href = "/login";
            } else {
                setPwError(data.error || "មានបញ្ហាក្នុងការប្តូរលេខសម្ងាត់");
            }
        } catch (err) {
            setPwError("មានបញ្ហាបច្ចេកទេស");
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDisable2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setDisableError("");
        setDisabling2FA(true);
        try {
            const res = await fetch("/api/auth/2fa/disable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: disablePassword })
            });
            const data = await res.json();
            if (res.ok) {
                alert("បានបិទប្រព័ន្ធការពារ ២ ជាន់ដោយជោគជ័យ។");
                setShowDisable2FA(false);
                setDisablePassword("");
                mutate();
            } else {
                setDisableError(data.error || "មានបញ្ហាក្នុងការបិទ 2FA");
            }
        } catch (err) {
            setDisableError("មានបញ្ហាបច្ចេកទេស");
        } finally {
            setDisabling2FA(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <TwoFactorSetup
                open={show2FASetup}
                onOpenChange={setShow2FASetup}
                onSuccess={() => mutate()}
            />

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2">
                        <User size={12} />
                        Personal Account
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground font-kantumruy">
                        ការកំណត់គណនី (Account Settings)
                    </h2>
                    <p className="text-muted-foreground font-medium text-sm font-kantumruy max-w-lg mt-2 opacity-60">
                        គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន និងការកំណត់សុវត្ថិភាពសម្រាប់គណនី MONEA របស់អ្នក។
                    </p>
                </div>
            </div>

            {/* Main Tabs Layout */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-muted/50 border-none h-auto p-1 rounded-2xl inline-flex shadow-sm">
                    <TabsTrigger value="profile" className="rounded-xl px-6 py-3 font-bold text-sm data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all gap-2 font-kantumruy">
                        <User size={16} /> កម្រងព័ត៌មាន
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-xl px-6 py-3 font-bold text-sm data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all gap-2 font-kantumruy">
                        <Shield size={16} /> សុវត្ថិភាព
                    </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    {/* Tab: Profile */}
                    {activeTab === "profile" && (
                        <TabsContent key="profile" value="profile" className="mt-0 outline-none">
                            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                <Card className="bg-card border-none shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-none rounded-[2.5rem] overflow-hidden p-1">
                                    <CardHeader className="p-8 pb-4">
                                        <CardTitle className="text-xl font-black text-foreground font-kantumruy">ព័ត៌មានផ្ទាល់ខ្លួន</CardTitle>
                                        <CardDescription className="font-kantumruy text-sm mt-1 opacity-60">
                                            ព័ត៌មានមូលដ្ឋានដែលប្រើក្នុងកម្មវិធី MONEA។
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-4 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">ឈ្មោះអ្នកប្រើប្រាស់</Label>
                                                <div className="h-14 bg-muted/40 rounded-2xl px-5 flex items-center font-bold text-foreground">
                                                    {user?.name || "..."}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">អាសយដ្ឋានអ៊ីមែល</Label>
                                                <div className="h-14 bg-muted/40 rounded-2xl px-5 flex items-center font-bold text-foreground gap-3">
                                                    <Mail size={16} className="text-muted-foreground opacity-40" />
                                                    {user?.email || "..."}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-border/5">
                                            <div className="flex items-center gap-4 p-5 bg-muted/30 rounded-2xl">
                                                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl text-indigo-600">
                                                    <KeyRound size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold font-kantumruy">ប្តូរលេខសម្ងាត់?</p>
                                                    <p className="text-xs text-muted-foreground font-kantumruy mt-0.5 opacity-60">ផ្លាស់ប្ដូរលេខសម្ងាត់ផ្ទាល់ខ្លួនរបស់អ្នកដើម្បីសុវត្ថិភាព។</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-xl font-bold font-kantumruy text-xs px-5 hover:bg-white/50 dark:hover:bg-white/10"
                                                    onClick={() => setShowChangePassword(true)}
                                                >
                                                    ប្តូរឥឡូវនេះ
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </m.div>
                        </TabsContent>
                    )}

                    {/* Tab: Security */}
                    {activeTab === "security" && (
                        <TabsContent key="security" value="security" className="mt-0 outline-none">
                            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                <Card className="bg-card border-none shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-none rounded-[2.5rem] overflow-hidden p-1">
                                    <CardHeader className="p-8 pb-4">
                                        <CardTitle className="text-xl font-black text-foreground font-kantumruy flex items-center gap-2">
                                            <Lock size={20} className="text-red-600" />
                                            សុវត្ថិភាពខ្ពស់បំផុត
                                        </CardTitle>
                                        <CardDescription className="font-kantumruy text-sm mt-1 opacity-60">
                                            ការការពារគណនីរបស់អ្នកពីការលួចចូលដោយខុសច្បាប់។
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-4 space-y-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl bg-muted/30 gap-6">
                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-base font-bold text-foreground font-kantumruy">រៀបចំប្រព័ន្ធការពារ ២ ជាន់ (2FA)</Label>
                                                    {user?.twoFactorEnabled && (
                                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-2 h-5 text-[9px] font-black uppercase tracking-wider">
                                                            បើករួច (Active)
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground font-kantumruy mt-1 opacity-60 leading-relaxed max-w-lg">
                                                    បង្កើនសុវត្ថិភាពខ្ពស់បំផុតសម្រាប់គណនីរបស់អ្នក។
                                                </p>
                                            </div>
                                            <div className="shrink-0">
                                                {user?.twoFactorEnabled ? (
                                                    <Button
                                                        onClick={() => setShowDisable2FA(true)}
                                                        className="bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-800 text-white rounded-xl font-bold font-kantumruy text-xs flex items-center gap-2 px-6 h-10 shadow-md transition-all active:scale-95"
                                                    >
                                                        <ShieldOff size={14} /> បិទដំណើរការ
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => setShow2FASetup(true)}
                                                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold font-kantumruy text-xs flex items-center gap-2 px-6 h-10 shadow-md transition-all active:scale-95 border-none"
                                                    >
                                                        <Shield size={14} /> រៀបចំឥឡូវនេះ
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-border/5">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between p-6 rounded-3xl bg-red-500/5 border border-red-500/10 gap-6">
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <LogOut size={18} className="text-red-500" />
                                                        <Label className="text-base font-bold text-foreground font-kantumruy">ចាកចេញពីគ្រប់ឧបករណ៍</Label>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-kantumruy mt-1 opacity-60 leading-relaxed max-w-lg">
                                                        ប្រសិនបើអ្នកសង្ស័យថាមានគេលួចប្រើគណនីរបស់អ្នក លោកអ្នកអាចចាកចេញពីគ្រប់ឧបករណ៍ភ្លាមៗ។
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    onClick={handleRevokeSessions}
                                                    disabled={revoking}
                                                    className="rounded-xl font-bold font-kantumruy text-xs bg-red-600 hover:bg-red-700 shadow-md transition-all active:scale-95 border-none px-6 h-10 shrink-0"
                                                >
                                                    {revoking ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Shield size={14} className="mr-2" />}
                                                    ចាកចេញពីគ្រប់ឧបករណ៍
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="pt-10 space-y-4">
                                            <div className="flex items-center justify-between px-1">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                                    <History size={12} /> សកម្មភាពចុងក្រោយ
                                                </h4>
                                                <Button variant="ghost" size="sm" onClick={fetchLogs} className="h-8 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                                    <RefreshCw size={10} className={`mr-1.5 ${loadingLogs ? 'animate-spin' : ''}`} /> Update
                                                </Button>
                                            </div>

                                            <div className="rounded-3xl overflow-hidden bg-muted/20">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="bg-muted/40">
                                                                <th className="px-5 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Event</th>
                                                                <th className="px-5 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Detail</th>
                                                                <th className="px-5 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Time</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/5">
                                                            {loadingLogs ? (
                                                                <tr>
                                                                    <td colSpan={3} className="px-5 py-12 text-center text-xs text-muted-foreground font-kantumruy font-bold opacity-60">កំពុងទាញយក...</td>
                                                                </tr>
                                                            ) : securityLogs.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={3} className="px-5 py-12 text-center text-xs text-muted-foreground font-kantumruy font-bold opacity-40">មិនមានសកម្មភាព</td>
                                                                </tr>
                                                            ) : securityLogs.slice(0, 5).map((log) => (
                                                                <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                                                                    <td className="px-5 py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`p-1.5 rounded-lg ${log.event === 'LOGIN_SUCCESS' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                                                                {log.event === 'LOGIN_SUCCESS' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                                            </div>
                                                                            <span className="text-xs font-bold text-foreground font-kantumruy">{log.event === 'LOGIN_SUCCESS' ? 'ចូលប្រព័ន្ធ' : 'បរាជ័យ'}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-5 py-4">
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                                                                                    <MapPin size={10} className="opacity-40" /> {log.geoIp || "Phnom Penh"}
                                                                                </div>
                                                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                                                                                    <Monitor size={10} className="opacity-40" /> {log.ip}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-5 py-4 text-right">
                                                                        <div className="text-[10px] font-bold text-foreground">{new Date(log.createdAt).toLocaleString('km-KH', { hour: '2-digit', minute: '2-digit' })}</div>
                                                                        <div className="text-[9px] text-muted-foreground font-medium opacity-60">{new Date(log.createdAt).toLocaleDateString()}</div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                                                <Smartphone size={16} className="text-orange-500 shrink-0" />
                                                <p className="text-[10px] text-orange-600/80 font-bold font-kantumruy italic">
                                                    ប្រសិនបើអ្នកឃើញសកម្មភាពមិនធម្មតា សូមផ្លាស់ប្ដូរលេខសម្ងាត់ជាបន្ទាន់។
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </m.div>
                        </TabsContent>
                    )}
                </AnimatePresence>
            </Tabs>

            {/* Change Password Dialog */}
            <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none rounded-[2rem] bg-card shadow-2xl">
                    <DialogHeader className="p-8 pb-0">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 mb-4">
                            <KeyRound size={24} />
                        </div>
                        <DialogTitle className="text-2xl font-black font-kantumruy">ប្តូរលេខសម្ងាត់ថ្មី</DialogTitle>
                        <DialogDescription className="text-sm font-medium font-kantumruy opacity-60">
                            សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីផ្លាស់ប្ដូរលេខសម្ងាត់របស់អ្នក។
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleChangePassword} className="p-8 space-y-6">
                        {pwError && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold font-kantumruy flex items-center gap-2">
                                <AlertCircle size={14} /> {pwError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">លេខសម្ងាត់បច្ចុប្បន្ន</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 group-focus-within:text-indigo-500 transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <Input
                                        type={showPasswords ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-12 pl-11 pr-11 bg-muted/40 border-none rounded-xl font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">លេខសម្ងាត់ថ្មី</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 group-focus-within:text-indigo-500 transition-colors">
                                        <KeyRound size={16} />
                                    </div>
                                    <Input
                                        type={showPasswords ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-12 pl-11 pr-11 bg-muted/40 border-none rounded-xl font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">បញ្ជាក់លេខសម្ងាត់ថ្មី</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 group-focus-within:text-indigo-500 transition-colors">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <Input
                                        type={showPasswords ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-12 pl-11 bg-muted/40 border-none rounded-xl font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="submit"
                                disabled={changingPassword}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black font-kantumruy shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {changingPassword ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>រក្សាទុកការផ្លាស់ប្តូរ <Save size={18} /></>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Disable 2FA Dialog */}
            <Dialog open={showDisable2FA} onOpenChange={setShowDisable2FA}>
                <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none rounded-[2rem] bg-card shadow-2xl">
                    <DialogHeader className="p-8 pb-0">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 mb-4">
                            <ShieldOff size={24} />
                        </div>
                        <DialogTitle className="text-2xl font-black font-kantumruy text-red-600">បិទប្រព័ន្ធការពារ ២ ជាន់</DialogTitle>
                        <DialogDescription className="text-sm font-medium font-kantumruy opacity-70 mt-2">
                            តើអ្នកប្រាកដថាចង់បិទ 2FA មែនទេ? នេះនឹងធ្វើឱ្យគណនីរបស់អ្នកងាយរងគ្រោះជាងមុន។
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDisable2FA} className="p-8 space-y-6">
                        {disableError && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold font-kantumruy flex items-center gap-2">
                                <AlertCircle size={14} /> {disableError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">បញ្ចូលលេខសម្ងាត់ដើម្បីបញ្ជាក់</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 group-focus-within:text-red-500 transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <Input
                                        type="password"
                                        value={disablePassword}
                                        onChange={(e) => setDisablePassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-12 pl-11 bg-muted/40 border-none rounded-xl font-bold focus:ring-2 focus:ring-red-500/20 transition-all"
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowDisable2FA(false)}
                                className="w-full h-11 rounded-xl font-bold font-kantumruy"
                            >
                                បោះបង់
                            </Button>
                            <Button
                                type="submit"
                                disabled={disabling2FA || !disablePassword}
                                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black font-kantumruy shadow-lg shadow-red-500/20 transition-all active:scale-95"
                            >
                                {disabling2FA ? <RefreshCw className="w-4 h-4 animate-spin" /> : "បិទដំណើរការឥឡូវនេះ"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

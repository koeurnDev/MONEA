import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    ShieldAlert, 
    AlertTriangle, 
    Users, 
    Loader2, 
    RefreshCcw, 
    ArrowLeft, 
    Ban,
    Lock,
    Eye,
    History,
    Unlock,
    ShieldCheck,
    CheckCircle2,
    Globe,
    Clock,
    UserX,
    Trash2
} from "lucide-react";
import { Link } from 'react-router-dom';
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/Toast";
import { m, AnimatePresence } from 'framer-motion';
import { useTranslation } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { moneaClient } from "@/lib/api-client";

export default function SecurityDashboardPage() {
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState(false);
    const { showToast } = useToast();
    const [unblockingIp, setUnblockingIp] = useState<string | null>(null);
    const [unlockingId, setUnlockingId] = useState<string | null>(null);
    const [newIp, setNewIp] = useState("");
    const [reason, setReason] = useState("");

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await moneaClient.get("/api/admin/master/security/stats", { cache: "no-store" });
            if (res.data) {
                setStats(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleRevokeAllSessions = async () => {
        if (!confirm(isKm ? "តើអ្នកពិតជាចង់ផ្តាច់ Session របស់អ្នកប្រើប្រាស់ទាំងអស់មែនទេ?" : "Are you sure you want to revoke all active user sessions?")) return;

        setRevoking(true);
        try {
            const res = await moneaClient.post("/api/admin/master/security/revoke", {});
            if (!res.error) {
                showToast({
                    title: isKm ? "បានផ្តាច់ Session ទាំងអស់ជោគជ័យ" : "All Sessions Revoked",
                    description: isKm ? "អ្នកប្រើប្រាស់ទាំងអស់ត្រូវបានតម្រូវឱ្យចូលគណនីឡើងវិញ។" : "All users are now required to log in again.",
                    type: "success"
                });
                fetchStats();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setRevoking(false);
        }
    };

    const handleAddIp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIp.trim()) return;
        
        try {
            const res = await moneaClient.post("/api/admin/master/security/blacklist", { ip: newIp.trim(), reason: reason.trim() });
            if (!res.error) {
                setNewIp("");
                setReason("");
                fetchStats();
                showToast({ 
                    title: isKm ? "បានរារាំង IP ជោគជ័យ" : "IP Blacklisted", 
                    type: "success" 
                });
            } else {
                showToast({ title: "បរាជ័យ", description: res.error, type: "error" });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleUnblockIp = async (ip: string, id: string) => {
        setUnblockingIp(ip);
        try {
            const res = await moneaClient.delete(`/api/admin/master/security/blacklist?id=${id}`);
            if (!res.error) {
                fetchStats();
                showToast({ 
                    title: isKm ? "បានដោះការរារាំង IP" : "IP Unblocked", 
                    type: "success" 
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUnblockingIp(null);
        }
    };

    const handleUnlockAccount = async (accountId: string, type: string) => {
        setUnlockingId(accountId);
        try {
            const res = await moneaClient.post("/api/admin/master/security/unlock", { accountId, type });
            if (!res.error) {
                fetchStats();
                showToast({ 
                    title: isKm ? "បានដោះសោគណនីជោគជ័យ" : "Account Unlocked", 
                    type: "success" 
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUnlockingId(null);
        }
    };

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
                                <ShieldAlert size={13} />
                                <span>Security & Firewall</span>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold text-foreground">
                                {isKm ? "ការត្រួតពិនិត្យសុវត្ថិភាព & រនាំងការពារ IP" : "Security & IP Firewall Monitoring"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={fetchStats}
                            variant="outline"
                            disabled={loading}
                            className="h-10 px-4 rounded-xl font-bold text-xs border border-border bg-card shadow-xs flex items-center gap-2"
                        >
                            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                            <span>{isKm ? "ផ្ទុកឡើងវិញ" : "Refresh"}</span>
                        </Button>
                        <Button
                            onClick={handleRevokeAllSessions}
                            disabled={revoking}
                            className="h-10 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-2"
                        >
                            {revoking ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                            <span>{isKm ? "ផ្តាច់ការចូលប្រើទាំងអស់" : "Revoke All Sessions"}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground">{isKm ? "គណនីដែលត្រូវបានចាក់សោ" : "Locked Accounts"}</p>
                                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats?.lockedAccountsCount || 0}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                                <Lock size={22} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground">{isKm ? "IP ដែលត្រូវបានហាមឃាត់" : "Blacklisted IPs"}</p>
                                <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats?.blacklistedIPsCount || 0}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                                <Ban size={22} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground">{isKm ? "ការចូលមិនបានសម្រេច (សកម្ម)" : "Failed Login Attempts"}</p>
                                <h3 className="text-2xl font-black text-foreground mt-1">{stats?.failedLoginsCount || 0}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center font-bold">
                                <AlertTriangle size={22} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Manual Restriction IP Form Card */}
                <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                    <CardHeader className="p-6 pb-3 border-b border-border/50">
                        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                            <Ban size={18} className="text-rose-500" />
                            <span>{isKm ? "ការគ្រប់គ្រងការចូលប្រើតាម IP (Manual IP Restriction)" : "Manual IP Blacklist"}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleAddIp} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                            <div className="sm:col-span-4 space-y-1.5">
                                <label className="text-xs font-bold text-foreground">
                                    {isKm ? "អាសយដ្ឋាន IP (ឧទាហរណ៍ 192.168.1.1)" : "IP Address"}
                                </label>
                                <Input
                                    placeholder="0.0.0.0"
                                    value={newIp}
                                    onChange={e => setNewIp(e.target.value)}
                                    className="h-10 rounded-xl bg-background border-input text-xs font-mono"
                                    required
                                />
                            </div>
                            <div className="sm:col-span-6 space-y-1.5">
                                <label className="text-xs font-bold text-foreground">
                                    {isKm ? "មូលហេតុនៃការរារាំង (Reason / Notes)" : "Reason / Notes"}
                                </label>
                                <Input
                                    placeholder="e.g. Brute Force Attempt, Spamming"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    className="h-10 rounded-xl bg-background border-input text-xs font-kantumruy"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Button 
                                    type="submit"
                                    className="w-full h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
                                >
                                    <Ban size={15} />
                                    <span>{isKm ? "រារាំង IP" : "Block IP"}</span>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Grid of 2 tables: Failed Logins & Blacklisted IPs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Failed Logins List */}
                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                        <CardHeader className="p-5 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Users size={16} className="text-amber-500" />
                                <span>{isKm ? "គណនីដែលមានការចូលមិនបានសម្រេច" : "Failed Login Accounts"}</span>
                            </CardTitle>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {stats?.failedAccounts?.length || 0} គណនី
                            </span>
                        </CardHeader>
                        <CardContent className="p-0">
                            {stats?.failedAccounts?.length > 0 ? (
                                <div className="divide-y divide-border/60 max-h-[420px] overflow-y-auto">
                                    {stats.failedAccounts.map((acc: any, i: number) => (
                                        <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                            <div className="space-y-1 min-w-0 pr-3">
                                                <p className="text-xs font-bold text-foreground truncate">{acc.email || acc.name}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    ប្រភេទ: <span className="font-bold">{acc.type}</span> • ចំនួនបរាជ័យ: <span className="text-rose-500 font-bold">{acc.failedAttempts} ដង</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {acc.lockedUntil && new Date(acc.lockedUntil) > new Date() && (
                                                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-md text-[9px] font-black uppercase">
                                                        ចាក់សោ
                                                    </span>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleUnlockAccount(acc.id, acc.type)}
                                                    disabled={unlockingId === acc.id}
                                                    className="h-8 px-3 rounded-xl text-[10px] font-bold border-border text-foreground hover:bg-muted"
                                                >
                                                    {unlockingId === acc.id ? <Loader2 size={12} className="animate-spin" /> : <Unlock size={12} className="mr-1" />}
                                                    ដោះសោ
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center space-y-2">
                                    <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-foreground">មិនមានការប៉ុនប៉ងចូលដោយខុសច្បាប់ឡើយ</p>
                                    <p className="text-[11px] text-muted-foreground">ប្រព័ន្ធដំណើរការប្រកបដោយសុវត្ថិភាពខ្ពស់។</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Blacklisted IPs List */}
                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                        <CardHeader className="p-5 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Ban size={16} className="text-rose-500" />
                                <span>{isKm ? "បញ្ជី IP ដែលត្រូវបានហាមឃាត់" : "Blacklisted IP Addresses"}</span>
                            </CardTitle>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {stats?.blacklistedIPs?.length || 0} IPs
                            </span>
                        </CardHeader>
                        <CardContent className="p-0">
                            {stats?.blacklistedIPs?.length > 0 ? (
                                <div className="divide-y divide-border/60 max-h-[420px] overflow-y-auto">
                                    {stats.blacklistedIPs.map((ipRec: any, i: number) => (
                                        <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                            <div className="space-y-1 min-w-0 pr-3">
                                                <p className="text-xs font-mono font-bold text-foreground">{ipRec.ip}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {ipRec.reason || "គ្មានមូលហេតុ"} • {new Date(ipRec.createdAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleUnblockIp(ipRec.ip, ipRec.id)}
                                                disabled={unblockingIp === ipRec.ip}
                                                className="h-8 px-3 rounded-xl text-[10px] font-bold border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                            >
                                                {unblockingIp === ipRec.ip ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} className="mr-1" />}
                                                ដោះការរារាំង
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center space-y-2">
                                    <div className="mx-auto w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
                                        <Globe size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-foreground">មិនមាន IP ជាប់ក្នុងបញ្ជីខ្មៅទេ</p>
                                    <p className="text-[11px] text-muted-foreground">រាល់ IP ទាំងអស់អាចចូលដំណើរការប្រព័ន្ធបានធម្មតា។</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

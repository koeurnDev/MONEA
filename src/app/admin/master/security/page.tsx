"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, AlertTriangle, Users, Loader2, Slash, RefreshCcw, ArrowLeft, Ban } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

export default function SecurityDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState(false);
    const [unblockingIp, setUnblockingIp] = useState<string | null>(null);
    const [newIp, setNewIp] = useState("");
    const [reason, setReason] = useState("");

    const fetchStats = () => {
        setLoading(true);
        fetch("/api/admin/master/security/stats")
            .then(res => res.json())
            .then(setStats)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleRevokeAllSessions = async () => {
        if (!confirm("តើអ្នកពិតជាចង់ផ្តាច់រាល់ Login ទាំងអស់របស់ Staff មែនទេ? (Are you sure you want to revoke ALL staff sessions?)")) return;

        setRevoking(true);
        try {
            await fetch("/api/admin/master/security/revoke", { method: "POST" });
            alert("Sessions Revoked Successfully.");
            fetchStats();
        } catch (e) {
            console.error(e);
        } finally {
            setRevoking(false);
        }
    };

    const handleAddIp = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/admin/master/security/blacklist", {
            method: "POST",
            body: JSON.stringify({ ip: newIp, reason }),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            setNewIp("");
            setReason("");
            fetchStats();
        }
    };

    const handleUnblockIp = async (ip: string, id: string) => {
        setUnblockingIp(ip);
        try {
            await fetch(`/api/admin/master/security/blacklist?id=${id}`, { method: "DELETE" });
            fetchStats();
        } catch (e) {
            console.error(e);
        } finally {
            setUnblockingIp(null);
        }
    };

    if (loading && !stats) return (
        <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-100 bg-white shadow-sm">
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                Security Monitoring
                            </h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                Threat Detection & Access Control
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={fetchStats}
                            className="h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-widest border-slate-200"
                        >
                            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                        </Button>
                        <Button
                            onClick={handleRevokeAllSessions}
                            disabled={revoking}
                            className="h-10 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-red-200"
                        >
                            {revoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle size={16} />}
                            Revoke ALL Staff Sessions
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2rem] bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Locked Accounts</p>
                                    <h3 className="text-3xl font-black text-slate-900">{stats?.lockedAccountsCount || 0}</h3>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-2xl text-orange-500">
                                    <Users size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2rem] bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Blacklisted IPs</p>
                                    <h3 className="text-3xl font-black text-slate-900">{stats?.blacklistedIPsCount || 0}</h3>
                                </div>
                                <div className="p-4 bg-red-50 rounded-2xl text-red-500">
                                    <Slash size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2rem] bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Failed Logins (Active)</p>
                                    <h3 className="text-3xl font-black text-slate-900">{stats?.failedLoginsCount || 0}</h3>
                                </div>
                                <div className="p-4 bg-slate-100 rounded-2xl text-slate-500">
                                    <AlertTriangle size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Add new blacklist form inline */}
                <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                        <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest">Add New UI Restriction</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleAddIp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input
                                placeholder="IP Address (e.g. 192.168.1.1)"
                                value={newIp}
                                onChange={e => setNewIp(e.target.value)}
                                className="h-10 rounded-xl bg-slate-50 border-transparent font-mono text-sm md:col-span-1"
                                required
                            />
                            <Input
                                placeholder="Reason for blocking"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                className="h-10 rounded-xl bg-slate-50 border-transparent text-sm md:col-span-2"
                            />
                            <Button className="h-10 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs md:col-span-1">
                                <Ban size={16} className="mr-2" /> Block IP
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Failed Logins Table */}
                    <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2rem] bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Users size={16} className="text-orange-500" />
                                Accounts with Failed Logins
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {stats?.failedAccounts?.length > 0 ? (
                                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                                    {stats.failedAccounts.map((acc: any, i: number) => (
                                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{acc.email || acc.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">{acc.type} • Failed: {acc.failedAttempts} times</p>
                                            </div>
                                            {acc.lockedUntil && new Date(acc.lockedUntil) > new Date() && (
                                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                    Locked
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-sm font-medium">No accounts with recent failed logins.</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Blacklisted IPs Table */}
                    <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2rem] bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Slash size={16} className="text-red-500" />
                                Blacklisted IPs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {stats?.blacklistedIPs?.length > 0 ? (
                                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                                    {stats.blacklistedIPs.map((ipRec: any, i: number) => (
                                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{ipRec.ip}</p>
                                                <p className="text-xs text-slate-500 font-medium">Blocked on: {format(new Date(ipRec.createdAt), 'PP p')}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleUnblockIp(ipRec.ip, ipRec.id)}
                                                disabled={unblockingIp === ipRec.ip}
                                                className="text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                            >
                                                {unblockingIp === ipRec.ip ? "Unblocking..." : "Unblock"}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-sm font-medium">No blacklisted IPs found.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

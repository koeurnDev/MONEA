"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    History, ShieldCheck, Save, RotateCcw, Activity, ArrowLeft, Loader2,
    Server, ShieldAlert, HelpCircle, Layers, Database, GitBranch,
    Eye, TrendingUp, Clock, User, Zap, AlertTriangle, CheckCircle2, X, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { AnimatePresence, m } from 'framer-motion';

export default function GovernancePage() {
    const [data, setData] = useState<any>({ history: [], logs: [], templateVersions: [], templateUsage: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [publishing, setPublishing] = useState(false);
    const [rollingBack, setRollingBack] = useState<string | null>(null);
    const [versionName, setVersionName] = useState("");
    const [description, setDescription] = useState("");
    const [activeTab, setActiveTab] = useState<"system" | "templates" | "audit">("system");
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; versionId: string; versionName: string }>({
        open: false, versionId: "", versionName: ""
    });
    const [successModal, setSuccessModal] = useState(false);
    const [publishError, setPublishError] = useState("");

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setRefreshing(true);
        try {
            const res = await fetch("/api/admin/governance");
            if (!res.ok) {
                console.error("[Governance] API error:", res.status, res.statusText);
                return;
            }
            const json = await res.json();
            // Guard: only update state if the response has the expected shape
            if (json && Array.isArray(json.history)) {
                setData({
                    history: json.history ?? [],
                    logs: json.logs ?? [],
                    templateVersions: json.templateVersions ?? [],
                    templateUsage: json.templateUsage ?? [],
                });
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error("[Governance] Fetch failed:", err);
        } finally {
            if (!silent) setRefreshing(false);
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        // Quick role check before fetching
        const checkRole = async () => {
            try {
                const me = await fetch("/api/auth/me").then(r => r.json());
                if (me.role !== "SUPERADMIN") {
                    window.location.href = "/admin";
                    return;
                }
                fetchData(true);
            } catch (err) {
                console.error("Auth check failed", err);
            }
        };
        checkRole();
    }, [fetchData]);

    // Auto-refresh every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => fetchData(true), 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handlePublish = async () => {
        if (!versionName) { setPublishError("Please enter a version name"); return; }
        setPublishing(true);
        try {
            const res = await fetch("/api/admin/governance", {
                method: "POST",
                body: JSON.stringify({ versionName, description }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                const newVersion = await res.json();
                setData((prev: any) => ({ ...prev, history: [newVersion, ...prev.history] }));
                setVersionName("");
                setDescription("");
            }
        } finally {
            setPublishing(false);
        }
    };

    const handleRollback = async (versionId: string) => {
        setRollingBack(versionId);
        try {
            const res = await fetch("/api/admin/governance", {
                method: "PATCH",
                body: JSON.stringify({ versionId }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                setConfirmModal({ open: false, versionId: "", versionName: "" });
                setSuccessModal(true);
                setTimeout(() => {
                    setSuccessModal(false);
                    window.location.reload();
                }, 2000);
            }
        } finally {
            setRollingBack(null);
        }
    };

    const stats = [
        { label: "System Versions", value: data.history?.length ?? 0, icon: GitBranch, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Template Snapshots", value: data.templateVersions?.length ?? 0, icon: Layers, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Audit Events", value: data.logs?.length ?? 0, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "System Status", value: "Healthy", icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
    ];

    if (loading) return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Governance Data...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F7F6F3]">

            {/* ===== ROLLBACK CONFIRM MODAL ===== */}
            <AnimatePresence>
                {confirmModal.open && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => !rollingBack && setConfirmModal({ open: false, versionId: "", versionName: "" })}
                    >
                        <m.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-[2rem] shadow-2xl shadow-black/20 w-full max-w-md overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Red danger header */}
                            <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 flex flex-col items-center gap-3 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-[-20%] right-[-20%] w-48 h-48 rounded-full bg-white" />
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                    <RotateCcw size={28} className="text-white" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-xl font-black text-white">ការ Rollback ប្រព័ន្ធ</h2>
                                    <p className="text-red-100 text-xs mt-1 font-bold uppercase tracking-widest">System Rollback Confirmation</p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-8 space-y-6">
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 space-y-2">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <AlertTriangle size={16} />
                                        <span className="text-xs font-black uppercase tracking-widest">ការព្រមាន (Warning)</span>
                                    </div>
                                    <p className="text-sm text-red-600 leading-relaxed">
                                        ការ Rollback នឹងធ្វើឱ្យការកំណត់ប្រព័ន្ធ <strong>ទាំងអស់</strong>ត្រឡប់ទៅ <strong>"{confirmModal.versionName}"</strong> ភ្លាមៗ រួមទាំង Maintenance Mode និងការរឹតបន្តឹងការចុះឈ្មោះ។
                                    </p>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                                        <GitBranch size={18} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rollback Target</p>
                                        <p className="text-sm font-black text-slate-900">{confirmModal.versionName}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-12 rounded-2xl border-2 border-slate-200 font-black text-slate-600 hover:bg-slate-50"
                                        onClick={() => setConfirmModal({ open: false, versionId: "", versionName: "" })}
                                        disabled={!!rollingBack}
                                    >
                                        <X size={16} className="mr-1.5" /> Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black gap-2 shadow-lg shadow-red-200"
                                        onClick={() => handleRollback(confirmModal.versionId)}
                                        disabled={!!rollingBack}
                                    >
                                        {rollingBack ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                                        {rollingBack ? "Rolling Back..." : "Yes, Rollback"}
                                    </Button>
                                </div>
                            </div>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* ===== SUCCESS TOAST ===== */}
            <AnimatePresence>
                {successModal && (
                    <m.div
                        initial={{ opacity: 0, y: -80 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -80 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-200"
                    >
                        <CheckCircle2 size={20} className="text-emerald-200" />
                        <div>
                            <p className="font-black text-sm">Rollback ជោគជ័យ! ✅</p>
                            <p className="text-emerald-200 text-[11px]">System is reverting, reloading...</p>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* TOP HEADER BANNER */}
            <div className="bg-slate-950 text-white">
                <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Link href="/admin/master/settings">
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-white/10 text-white hover:bg-white/10">
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center">
                                    <ShieldAlert size={16} className="text-white" />
                                </div>
                                <h1 className="text-xl font-black tracking-tight">ការគ្រប់គ្រងប្រព័ន្ធ (Governance)</h1>
                            </div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 pl-11">Version Control · Audit Layer · Template Oversight</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-black uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            System Operational
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        {/* Live refresh indicator */}
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                                <span className="text-[10px] text-sky-400 font-black uppercase tracking-widest">Live</span>
                            </div>
                            {lastUpdated && (
                                <span className="text-[10px] text-slate-500 font-bold">
                                    {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
                                </span>
                            )}
                            <button
                                onClick={() => fetchData(false)}
                                disabled={refreshing}
                                className="ml-1 w-5 h-5 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50"
                                title="Refresh now"
                            >
                                <RefreshCw size={11} className={`text-white ${refreshing ? "animate-spin" : ""}`} />
                            </button>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <span className="text-[10px] text-slate-500 font-bold">PLATFORM OWNER ACCESS</span>
                    </div>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="max-w-7xl mx-auto px-8 -mt-2 py-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                                <s.icon className={`w-5 h-5 ${s.color}`} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900">{s.value}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Actions */}
                    <div className="space-y-6">

                        {/* Publish Snapshot */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                            <div className="p-6 border-b border-slate-50">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
                                        <Save size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-sm">បោះពុម្ពផ្សាយ Version ថ្មី</h3>
                                        <p className="text-[10px] text-slate-400 font-bold">Create System Snapshot</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Version Name</label>
                                    <Input
                                        placeholder="e.g. v1.2.0-stable"
                                        className="h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-slate-900 font-bold text-sm"
                                        value={versionName}
                                        onChange={e => setVersionName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Release Notes</label>
                                    <Input
                                        placeholder="What changed in this version?"
                                        className="h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-slate-900 text-sm"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    />
                                </div>
                                <Button
                                    onClick={handlePublish}
                                    disabled={publishing || !versionName}
                                    className="w-full h-11 bg-slate-900 hover:bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs gap-2"
                                >
                                    {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap size={15} />}
                                    Publish Snapshot
                                </Button>
                            </div>
                        </div>

                        {/* Simple Info Card */}
                        <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 text-white p-6 space-y-4 shadow-2xl shadow-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <ShieldCheck size={16} className="text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm">ប្រព័ន្ធសុវត្ថិភាព</h4>
                                    <p className="text-[10px] text-slate-400">Security & Tracking</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                រាល់សកម្មភាពសំខាន់ៗរបស់អ្នកប្រើប្រាស់ត្រូវបានកត់ត្រាទុកដោយស្វ័យប្រវត្តិ ដើម្បីធានាបាននូវតម្លាភាព និងសុវត្ថិភាពទិន្នន័យ។
                            </p>
                            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <span>Status: Active</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    Monitoring
                                </div>
                            </div>
                        </div>

                        {/* Quick Guide */}
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-5">
                                <HelpCircle size={16} className="text-blue-500" />
                                <h4 className="font-black text-sm text-slate-900">មគ្គុទ្ទេសក៍រហ័ស</h4>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { n: "១", text: "ចុច **Publish Snapshot** ដើម្បីថតចម្លងទិន្នន័យចំណុចសំខាន់ៗទុកជាឯកសារយោង។" },
                                    { n: "២", text: "មើល **ប្រវត្តិ System Version** ដើម្បីដឹងថាតើមានការផ្លាស់ប្តូរអ្វីខ្លះកាលពីមុនសៗ។" },
                                    { n: "៣", text: "ចូលមើល **Audit Logs** ដើម្បីតាមដានរាល់សកម្មភាពរបស់អ្នកប្រើប្រាស់ក្នុងប្រព័ន្ធ។" },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 flex-shrink-0 mt-0.5">{item.n}</div>
                                        <p className="text-[11px] text-slate-600 leading-snug" dangerouslySetInnerHTML={{ __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900">$1</strong>') }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Content + Tabs */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Tabs */}
                        <div className="flex gap-1 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm w-fit">
                            {[
                                { id: "system", label: "System Versions", icon: Server },
                                { id: "templates", label: "Template Snapshots", icon: Layers },
                                { id: "audit", label: "Audit Logs", icon: Activity },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                        ? "bg-slate-900 text-white shadow-sm"
                                        : "text-slate-400 hover:text-slate-700"
                                        }`}
                                >
                                    <tab.icon size={13} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* TAB: System Versions */}
                        {activeTab === "system" && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                        <History size={16} className="text-red-500" />
                                        ប្រវត្តិ System Version ({data.history.length})
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Latest first</span>
                                </div>
                                {data.history.length === 0 ? (
                                    <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 p-16 text-center">
                                        <Database className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 text-sm font-bold">មិនទាន់មានទិន្នន័យ Version ទេ</p>
                                        <p className="text-[11px] text-slate-300 mt-1">អ្នកអាចបង្កើត Version ថ្មីបាននៅផ្នែកខាងឆ្វេង។</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {/* Timeline line */}
                                        <div className="absolute left-6 top-6 bottom-6 w-px bg-slate-100" />
                                        <div className="space-y-3">
                                            {data.history.map((v: any, idx: number) => (
                                                <div key={v.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group pl-14 pr-6 py-5 relative">
                                                    {/* Timeline dot */}
                                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${idx === 0 ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                                                        <div className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-emerald-500" : "bg-slate-300"}`} />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-black text-slate-900 text-sm">{v.versionName}</h4>
                                                                {idx === 0 && <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] uppercase font-black">Latest</Badge>}
                                                                {v.isStable && <Badge className="bg-blue-100 text-blue-700 border-none text-[9px] uppercase font-black">Stable</Badge>}
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2">
                                                                <Clock size={10} />
                                                                {format(new Date(v.createdAt), "MMM d, yyyy • h:mm a")} · {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                                                            </p>
                                                            {v.description && <p className="text-[11px] text-slate-500 mt-2 italic">"{v.description}"</p>}
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={rollingBack === v.id}
                                                            onClick={() => setConfirmModal({ open: true, versionId: v.id, versionName: v.versionName })}
                                                            className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-1.5 border-2 transition-all border-red-100 text-red-600 bg-red-50/50 hover:bg-red-600 hover:text-white hover:border-red-600"
                                                        >
                                                            {rollingBack === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw size={12} />}
                                                            Rollback
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: Template Snapshots */}
                        {activeTab === "templates" && (
                            <div className="space-y-6">
                                {/* Template Popularity Summary */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {data.templateUsage?.map((t: any) => (
                                        <div key={t.templateId} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-center items-center gap-1 group hover:border-indigo-100 transition-colors">
                                            <span className="text-2xl font-black text-indigo-600 group-hover:scale-110 transition-transform">{t.count}</span>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{t.templateId}</span>
                                        </div>
                                    ))}
                                    {(!data.templateUsage || data.templateUsage.length === 0) && (
                                        <div className="col-span-full p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white rounded-2xl border border-slate-100 border-dashed">
                                            Loading Usage Data...
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                            <Layers size={16} className="text-indigo-500" />
                                            ប្រវត្តិ Template Snapshot ({data.templateVersions?.length || 0})
                                        </h3>
                                    </div>
                                    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                                        {["Wedding", "Version Name", "Template", "Saved By", "Date"].map(h => (
                                                            <th key={h} className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {!data.templateVersions?.length ? (
                                                        <tr>
                                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                                <Layers className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                                                <p className="text-sm text-slate-400 font-bold">មិនទាន់មានការថតចម្លង Template ណាទេ</p>
                                                            </td>
                                                        </tr>
                                                    ) : data.templateVersions.map((ver: any) => (
                                                        <tr key={ver.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">
                                                                        {ver.wedding?.groomName?.[0] || "W"}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-black text-slate-800 leading-tight">{ver.wedding?.groomName} & {ver.wedding?.brideName}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <span className="text-xs font-bold text-slate-700">{ver.versionName}</span>
                                                                {ver.description && <p className="text-[10px] text-slate-400 italic mt-0.5">{ver.description}</p>}
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] uppercase font-black tracking-widest">
                                                                    {ver.templateId}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-1.5">
                                                                    <User size={11} className="text-slate-400" />
                                                                    <span className="text-[11px] font-bold text-slate-500">{ver.createdBy}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <p className="text-[11px] font-bold text-slate-500 whitespace-nowrap">{format(new Date(ver.createdAt), "MMM d, yyyy")}</p>
                                                                <p className="text-[9px] text-slate-400">{formatDistanceToNow(new Date(ver.createdAt), { addSuffix: true })}</p>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === "audit" && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                        <Activity size={16} className="text-emerald-500" />
                                        Audit Logs ({data.logs.length})
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">System-wide events</span>
                                </div>
                                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                                    {["Time", "Actor", "Action", "Details"].map(h => (
                                                        <th key={h} className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {!data.logs.length ? (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-12 text-center">
                                                            <Activity className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                                            <p className="text-sm text-slate-400 font-bold">No audit events yet</p>
                                                        </td>
                                                    </tr>
                                                ) : data.logs.map((log: any) => (
                                                    <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                                            <p className="text-[11px] font-black text-slate-600">{format(new Date(log.createdAt), "HH:mm:ss")}</p>
                                                            <p className="text-[9px] text-slate-400 font-bold">{format(new Date(log.createdAt), "MMM d")}</p>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                                                                    {log.actorName?.[0] || "?"}
                                                                </div>
                                                                <span className="text-xs font-black text-slate-700">{log.actorName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <Badge className={`border-none text-[9px] uppercase font-black tracking-widest ${log.action === "PUBLISH" ? "bg-blue-50 text-blue-700" :
                                                                log.action === "ROLLBACK" ? "bg-red-50 text-red-700" :
                                                                    log.action === "CONFIG_UPDATE" ? "bg-amber-50 text-amber-700" :
                                                                        "bg-slate-50 text-slate-600"
                                                                }`}>
                                                                {log.action}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <p className="text-[11px] text-slate-500 font-medium max-w-[200px] truncate">{log.details}</p>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

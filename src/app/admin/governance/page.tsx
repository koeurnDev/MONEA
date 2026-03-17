"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ShieldCheck, Save, Activity, ArrowLeft, Loader2,
    Server, ShieldAlert, HelpCircle, Layers, GitBranch,
    Zap, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useGovernance } from "./hooks/useGovernance";
import { SystemVersionsTab } from "./components/SystemVersionsTab";
import { TemplateSnapshotsTab } from "./components/TemplateSnapshotsTab";
import { AuditLogsTab } from "./components/AuditLogsTab";
import { RollbackModal } from "./components/RollbackModal";

export default function GovernancePage() {
    const {
        data,
        loading,
        refreshing,
        lastUpdated,
        publishing,
        rollingBack,
        versionName,
        setVersionName,
        description,
        setDescription,
        activeTab,
        setActiveTab,
        confirmModal,
        setConfirmModal,
        successModal,
        fetchData,
        handlePublish,
        handleRollback
    } = useGovernance();

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
            <RollbackModal
                confirmModal={confirmModal}
                setConfirmModal={setConfirmModal}
                rollingBack={rollingBack}
                successModal={successModal}
                handleRollback={handleRollback}
            />

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
                                    {lastUpdated.toLocaleTimeString("km-KH", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Phnom_Penh" })}
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
                                        <p className="text-[11px] text-slate-600 leading-snug">
                                            {item.text.split('**').map((part, index) => 
                                                index % 2 === 1 ? <strong key={index} className="text-slate-900">{part}</strong> : part
                                            )}
                                        </p>
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

                        {activeTab === "system" && (
                            <SystemVersionsTab
                                history={data.history}
                                rollingBack={rollingBack}
                                setConfirmModal={setConfirmModal}
                            />
                        )}

                        {activeTab === "templates" && (
                            <TemplateSnapshotsTab
                                templateUsage={data.templateUsage}
                                templateVersions={data.templateVersions}
                            />
                        )}

                        {activeTab === "audit" && (
                            <AuditLogsTab logs={data.logs} />
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

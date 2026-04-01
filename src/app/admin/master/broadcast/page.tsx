"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Megaphone,
    ArrowLeft,
    Plus,
    Trash2,
    Calendar,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Info
} from "lucide-react";
import Link from "next/link";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { moneaClient } from "@/lib/api-client";

export default function MasterBroadcastPage() {
    const { locale } = useTranslation();
    const isKm = locale === 'km';
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("INFO");
    const [scheduledAt, setScheduledAt] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; label: string }>({
        open: false, id: "", label: ""
    });
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const res = await moneaClient.get<any[]>("/api/admin/master/broadcast");
        if (Array.isArray(res.data)) setBroadcasts(res.data);
        else console.error(res.error);
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await moneaClient.post("/api/admin/master/broadcast", { 
                title, 
                message, 
                type,
                scheduledAt: scheduledAt || null,
                expiresAt: expiresAt || null
            });
            
            if (res.error) {
                alert(res.error || "Failed to publish announcement. Please try again.");
                return;
            }

            setTitle("");
            setMessage("");
            setScheduledAt("");
            setExpiresAt("");
            loadData();
        } catch (e) {
            alert("Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, label: string) => {
        setDeleteConfirm({ open: true, id, label });
    };

    const confirmDelete = async () => {
        setDeleteLoading(true);
        try {
            await moneaClient.delete(`/api/admin/master/broadcast?id=${deleteConfirm.id}`);
            setDeleteConfirm({ open: false, id: "", label: "" });
            loadData();
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-slate-950 p-8 transition-colors">
            <ConfirmModal
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: "", label: "" })}
                onConfirm={confirmDelete}
                loading={deleteLoading}
                title={isKm ? "លុបសេចក្តីប្រកាស" : "Delete Announcement"}
                description={isKm ? "សារនេះនឹងត្រូវដកចេញពីប្រព័ន្ធភ្លាមៗ។" : "This broadcast will be removed entirely."}
                confirmLabel={isKm ? "លុបចោល" : "Delete"}
                detail={deleteConfirm.label}
                variant="danger"
            />
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 group">
                                <ArrowLeft size={18} className="text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{isKm ? "ប្រព័ន្ធផ្សព្វផ្សាយសារ" : "Global Broadcast System"}</h1>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">{isKm ? "សេចក្តីប្រកាសផ្លូវការ" : "Platform Announcements"}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Create Form */}
                    <Card className="lg:col-span-12 border-none shadow-sm shadow-slate-200/50 dark:shadow-none rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                        <CardHeader className="p-8">
                            <CardTitle className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                <Plus className="text-red-500" size={20} /> {isKm ? "បង្កើតសារប្រកាសថ្មី" : "Create Announcement"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{isKm ? "ចំណងជើង" : "Title"}</label>
                                        <Input
                                            placeholder={isKm ? "ឧ. ប្រព័ន្ធនឹងធ្វើការអាប់ដេតយប់នេះ" : "e.g. System Update Tonight"}
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{isKm ? "ប្រភេទសារ" : "Alert Type"}</label>
                                        <select
                                            className="w-full h-12 px-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none"
                                            value={type}
                                            onChange={e => setType(e.target.value)}
                                        >
                                            <option value="INFO">{isKm ? "ព័ត៌មានទូទៅ (ពណ៌ខៀវ)" : "Information (Blue)"}</option>
                                            <option value="WARNING">{isKm ? "សំខាន់ (ពណ៌លឿង)" : "Important (Amber)"}</option>
                                            <option value="SUCCESS">{isKm ? "ជោគជ័យ (ពណ៌បៃតង)" : "Success (Green)"}</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-1 flex items-center gap-1">
                                            <Calendar size={10} /> {isKm ? "កំណត់ម៉ោងផ្សាយ (ជម្រើស)" : "Scheduled Time (Optional)"}
                                        </label>
                                        <Input
                                            type="datetime-local"
                                            value={scheduledAt}
                                            onChange={e => setScheduledAt(e.target.value)}
                                            className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-emerald-50/20 dark:bg-emerald-900/10 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{isKm ? "ខ្លឹមសារ" : "Message Content"}</label>
                                    <Textarea
                                        placeholder={isKm ? "ពិពណ៌នាខ្លឹមសារអោយបានច្បាស់លាស់..." : "Describe the broadcast clearly..."}
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        className="min-h-[120px] rounded-[2rem] border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-6 dark:text-white"
                                        required
                                    />
                                </div>
                                <Button
                                    className="h-12 w-full md:w-auto px-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition-colors hover:bg-slate-800 dark:hover:bg-slate-100 rounded-2xl font-bold uppercase tracking-widest text-xs"
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="animate-spin" /> : (isKm ? "ផ្សព្វផ្សាយ" : "Publish")}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Active Broadcasts */}
                    <div className="lg:col-span-12 space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-4">{isKm ? "សេចក្តីប្រកាសបច្ចុប្បន្ន" : "Active Announcements"}</h3>
                        {loading ? (
                            <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
                        ) : broadcasts.length === 0 ? (
                            <div className="py-20 text-center text-slate-300 dark:text-slate-600 font-bold uppercase tracking-widest text-xs bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                                {isKm ? "មិនមានការប្រកាសទេ" : "No active broadcasts"}
                            </div>
                        ) : (
                            broadcasts.map((b) => (
                                <Card key={b.id} className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 transition-all hover:scale-[1.01] duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                                    b.type === 'WARNING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' :
                                                        b.type === 'SUCCESS' ? 'bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400' :
                                                            'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                                                )}>
                                                    <Megaphone size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 dark:text-white tracking-tight">{b.title}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 pr-10">{b.message}</p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                                            <Calendar size={10} /> {new Date(b.createdAt).toLocaleDateString(isKm ? 'km-KH' : 'en-US', { timeZone: 'Asia/Phnom_Penh' })}
                                                        </span>
                                                        {b.scheduledAt && (
                                                            <span className={cn(
                                                                "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1",
                                                                new Date(b.scheduledAt) > new Date() ? "text-emerald-500 animate-pulse" : "text-slate-400"
                                                            )}>
                                                                <Info size={10} /> {isKm ? "ម៉ោងផ្សាយ៖" : "Scheduled:"} {new Date(b.scheduledAt).toLocaleString(isKm ? 'km-KH' : 'en-US', { timeZone: 'Asia/Phnom_Penh' })}
                                                            </span>
                                                        )}
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                                            b.type === 'WARNING' ? 'border-amber-100 text-amber-600 dark:border-amber-900/50 dark:text-amber-400' :
                                                                b.type === 'SUCCESS' ? 'border-green-100 text-green-600 dark:border-green-900/50 dark:text-green-400' :
                                                                    'border-blue-100 text-blue-600 dark:border-blue-900/50 dark:text-blue-400'
                                                        )}>
                                                            {b.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-full shrink-0"
                                                onClick={() => handleDelete(b.id, b.title)}
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

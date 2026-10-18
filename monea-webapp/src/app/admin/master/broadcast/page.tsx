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
    Info
} from "lucide-react";
import { Link } from 'react-router-dom';
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { moneaClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

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
            alert("សូមពិនិត្យសេវាអ៊ីនធឺណិតរបស់អ្នក ហើយព្យាយាមម្ដងទៀត។");
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
        <div className="min-h-screen bg-background p-4 transition-colors sm:p-8">
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
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <Link to="/admin/master">
                            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl border-border bg-card">
                                <ArrowLeft size={18} className="text-muted-foreground" />
                            </Button>
                        </Link>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-700/15 bg-teal-700/10 text-teal-800 dark:text-teal-300">
                            <Megaphone size={21} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-800 dark:text-teal-300">
                                {isKm ? "សេចក្តីប្រកាសផ្លូវការ" : "Platform Announcements"}
                            </p>
                            <h1 className="mt-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">
                                {isKm ? "ប្រព័ន្ធផ្សព្វផ្សាយសារ" : "Global Broadcast System"}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    {/* Create Form */}
                    <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm lg:col-span-5">
                        <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-4">
                            <CardTitle className="flex items-center gap-3 text-base font-black tracking-tight text-foreground">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700/10 text-teal-800 dark:text-teal-300">
                                    <Plus size={18} />
                                </span>
                                {isKm ? "បង្កើតសារប្រកាសថ្មី" : "Create Announcement"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 pt-2 sm:p-6 sm:pt-2">
                            <form onSubmit={handleCreate} className="space-y-5">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="ml-1 text-xs font-bold text-foreground">{isKm ? "ចំណងជើង" : "Title"}</label>
                                        <Input
                                            placeholder={isKm ? "ឧ. ប្រព័ន្ធនឹងធ្វើការអាប់ដេតយប់នេះ" : "e.g. System Update Tonight"}
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            className="h-11 rounded-xl border-input bg-background focus-visible:ring-teal-700"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ml-1 text-xs font-bold text-foreground">{isKm ? "ប្រភេទសារ" : "Alert Type"}</label>
                                        <select
                                            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                                            value={type}
                                            onChange={e => setType(e.target.value)}
                                        >
                                            <option value="INFO">{isKm ? "ព័ត៌មានទូទៅ (ពណ៌ខៀវ)" : "Information (Blue)"}</option>
                                            <option value="WARNING">{isKm ? "សំខាន់ (ពណ៌លឿង)" : "Important (Amber)"}</option>
                                            <option value="SUCCESS">{isKm ? "ជោគជ័យ (ពណ៌បៃតង)" : "Success (Green)"}</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ml-1 flex items-center gap-1.5 text-xs font-bold text-foreground">
                                            <Calendar size={13} className="text-teal-800 dark:text-teal-300" /> {isKm ? "កំណត់ម៉ោងផ្សាយ (ជម្រើស)" : "Scheduled Time (Optional)"}
                                        </label>
                                        <Input
                                            type="datetime-local"
                                            value={scheduledAt}
                                            onChange={e => setScheduledAt(e.target.value)}
                                            className="h-11 rounded-xl border-input bg-background focus-visible:ring-teal-700"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="ml-1 text-xs font-bold text-foreground">{isKm ? "ខ្លឹមសារ" : "Message Content"}</label>
                                    <Textarea
                                        placeholder={isKm ? "ពិពណ៌នាខ្លឹមសារអោយបានច្បាស់លាស់..." : "Describe the broadcast clearly..."}
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        className="min-h-32 resize-y rounded-xl border-input bg-background p-3 focus-visible:ring-teal-700"
                                        required
                                    />
                                </div>
                                <Button
                                    className="h-11 w-full rounded-xl bg-teal-800 px-5 text-sm font-bold text-white shadow-sm hover:bg-teal-900 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 sm:w-auto"
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="mr-2 animate-spin" /> : <Megaphone size={16} className="mr-2" />}
                                    {saving ? (isKm ? "កំពុងផ្សព្វផ្សាយ..." : "Publishing...") : (isKm ? "ផ្សព្វផ្សាយ" : "Publish")}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Active Broadcasts */}
                    <div className="space-y-4 lg:col-span-7">
                        <div className="flex items-center justify-between gap-3 px-1">
                            <h3 className="text-sm font-black text-foreground">{isKm ? "សេចក្តីប្រកាសបច្ចុប្បន្ន" : "Active Announcements"}</h3>
                            {!loading && (
                                <span className="shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground">
                                    {broadcasts.length} {isKm ? "សារ" : broadcasts.length === 1 ? "announcement" : "announcements"}
                                </span>
                            )}
                        </div>
                        {loading ? (
                            <div className="rounded-2xl border border-border/80 bg-card py-16 text-center shadow-sm">
                                <Loader2 className="mx-auto animate-spin text-teal-800 dark:text-teal-300" />
                                <p className="mt-3 text-xs font-medium text-muted-foreground">{isKm ? "កំពុងទាញយកសារ..." : "Loading announcements..."}</p>
                            </div>
                        ) : broadcasts.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-16 text-center">
                                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                    <Megaphone size={20} />
                                </span>
                                <p className="mt-3 text-sm font-bold text-foreground">{isKm ? "មិនមានការប្រកាសទេ" : "No announcements yet"}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{isKm ? "បង្កើតសារថ្មីដោយប្រើទម្រង់ខាងលើ។" : "Create an announcement using the form."}</p>
                            </div>
                        ) : (
                            broadcasts.map((b) => (
                                <Card key={b.id} className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm transition-colors hover:border-teal-700/30">
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 gap-3">
                                                <div className={cn(
                                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                                    b.type === 'WARNING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' :
                                                        b.type === 'SUCCESS' ? 'bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400' :
                                                            'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                                                )}>
                                                    <Megaphone size={18} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="break-words text-sm font-bold tracking-tight text-foreground">{b.title}</h4>
                                                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{b.message}</p>
                                                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                                                        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                            <Calendar size={12} /> {new Date(b.createdAt).toLocaleDateString(isKm ? 'km-KH' : 'en-US', { timeZone: 'Asia/Phnom_Penh' })}
                                                        </span>
                                                        {b.scheduledAt && (
                                                            <span className={cn(
                                                                "flex items-center gap-1.5 text-xs font-medium",
                                                                new Date(b.scheduledAt) > new Date() ? "text-teal-800 dark:text-teal-300" : "text-muted-foreground"
                                                            )}>
                                                                <Info size={12} /> {isKm ? "ម៉ោងផ្សាយ៖" : "Scheduled:"} {new Date(b.scheduledAt).toLocaleString(isKm ? 'km-KH' : 'en-US', { timeZone: 'Asia/Phnom_Penh' })}
                                                            </span>
                                                        )}
                                                        <span className={cn(
                                                            "rounded-md border px-2 py-0.5 text-xs font-black uppercase tracking-widest",
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
                                                aria-label={isKm ? `លុបសារប្រកាស ${b.title}` : `Delete announcement ${b.title}`}
                                                className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
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

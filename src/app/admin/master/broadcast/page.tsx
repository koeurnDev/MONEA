"use client";
import { useEffect, useState } from "react";
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

export default function MasterBroadcastPage() {
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("INFO");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        fetch("/api/admin/master/broadcast")
            .then(res => res.json())
            .then(setBroadcasts)
            .finally(() => setLoading(false));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetch("/api/admin/master/broadcast", {
                method: "POST",
                body: JSON.stringify({ title, message, type }),
                headers: { "Content-Type": "application/json" }
            });
            setTitle("");
            setMessage("");
            loadData();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await fetch(`/api/admin/master/broadcast?id=${id}`, { method: "DELETE" });
        loadData();
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-100 bg-white">
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Global Broadcast System</h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Platform Announcements</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Create Form */}
                    <Card className="lg:col-span-12 border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="p-8">
                            <CardTitle className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Plus className="text-red-500" size={20} /> Create Global Announcement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title</label>
                                        <Input
                                            placeholder="e.g. System Update Tonight"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            className="h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Alert Type</label>
                                        <select
                                            className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-700 outline-none"
                                            value={type}
                                            onChange={e => setType(e.target.value)}
                                        >
                                            <option value="INFO">Information (Blue)</option>
                                            <option value="WARNING">Important (Amber)</option>
                                            <option value="SUCCESS">Success (Green)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Content</label>
                                    <Textarea
                                        placeholder="Describe the update or announcement clearly for Hirers..."
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        className="min-h-[120px] rounded-[2rem] border-slate-100 bg-slate-50/50 p-6"
                                        required
                                    />
                                </div>
                                <Button
                                    className="h-12 w-full md:w-auto px-12 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs"
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="animate-spin" /> : "Publish Announcement"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Active Broadcasts */}
                    <div className="lg:col-span-12 space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Current Announcements</h3>
                        {loading ? (
                            <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
                        ) : broadcasts.length === 0 ? (
                            <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                No active broadcasts
                            </div>
                        ) : (
                            broadcasts.map((b) => (
                                <Card key={b.id} className="border-none shadow-sm shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                                    b.type === 'WARNING' ? 'bg-amber-50 text-amber-600' :
                                                        b.type === 'SUCCESS' ? 'bg-green-50 text-green-600' :
                                                            'bg-blue-50 text-blue-600'
                                                )}>
                                                    <Megaphone size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 tracking-tight">{b.title}</h4>
                                                    <p className="text-xs text-slate-500 font-medium mt-1">{b.message}</p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-1">
                                                            <Calendar size={10} /> {new Date(b.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                                            b.type === 'WARNING' ? 'border-amber-100 text-amber-600' :
                                                                b.type === 'SUCCESS' ? 'border-green-100 text-green-600' :
                                                                    'border-blue-100 text-blue-600'
                                                        )}>
                                                            {b.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-300 hover:text-red-500 rounded-full"
                                                onClick={() => handleDelete(b.id)}
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

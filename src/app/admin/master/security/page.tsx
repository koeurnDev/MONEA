"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Globe, Shield, Trash2, Plus, Ban, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MasterSecurityPage() {
    const [blacklist, setBlacklist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newIp, setNewIp] = useState("");
    const [reason, setReason] = useState("");

    const loadData = () => {
        setLoading(true);
        fetch("/api/admin/master/security/blacklist")
            .then(res => res.json())
            .then(setBlacklist)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/admin/master/security/blacklist", {
            method: "POST",
            body: JSON.stringify({ ip: newIp, reason }),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            setNewIp("");
            setReason("");
            loadData();
        }
    };

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/admin/master/security/blacklist?id=${id}`, { method: "DELETE" });
        if (res.ok) loadData();
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-100 bg-white">
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">IP Blacklist Management</h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Global Security Control</p>
                        </div>
                    </div>
                </div>

                <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="p-8 border-b border-slate-50">
                        <CardTitle className="text-lg font-black text-slate-900">Add New Restriction</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                placeholder="IP Address (e.g. 192.168.1.1)"
                                value={newIp}
                                onChange={e => setNewIp(e.target.value)}
                                className="h-12 rounded-xl bg-slate-50 border-transparent font-mono text-sm"
                                required
                            />
                            <Input
                                placeholder="Reason for blocking"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                className="h-12 rounded-xl bg-slate-50 border-transparent text-sm"
                            />
                            <Button className="h-12 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs">
                                <Ban size={16} className="mr-2" /> Block IP
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">Active Blocks</h3>
                    {blacklist.map((item) => (
                        <Card key={item.id} className="border-none shadow-sm shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <p className="font-mono font-bold text-slate-900">{item.ip}</p>
                                        <p className="text-xs text-slate-400 font-medium">{item.reason || "No reason specified"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                        Added {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                    <Button
                                        onClick={() => handleDelete(item.id)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {blacklist.length === 0 && !loading && (
                        <div className="p-12 text-center opacity-20">
                            <Globe size={48} className="mx-auto mb-4" />
                            <p className="font-bold">No active IP restrictions</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

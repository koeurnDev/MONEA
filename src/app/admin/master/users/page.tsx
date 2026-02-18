"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Users,
    ArrowLeft,
    Search,
    Shield,
    UserCog,
    Ban,
    CheckCircle2,
    Loader2,
    Mail,
    Calendar,
    Heart
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MasterUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadData();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const loadData = () => {
        setLoading(true);
        fetch(`/api/admin/master/users?search=${search}`)
            .then(res => res.json())
            .then(setUsers)
            .finally(() => setLoading(false));
    };

    const handleAction = async (userId: string, data: any) => {
        setProcessing(userId);
        try {
            await fetch("/api/admin/master/users", {
                method: "PATCH",
                body: JSON.stringify({ userId, ...data }),
                headers: { "Content-Type": "application/json" }
            });
            loadData();
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-100 bg-white">
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-kantumruy">Master User Directory</h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Platform Account Control</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="ឯកសារអ្នកប្រើប្រាស់ (Name, Email)..."
                            className="h-12 pl-12 rounded-2xl border-none shadow-sm shadow-slate-200/50 bg-white font-kantumruy"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
                    ) : users.length === 0 ? (
                        <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs bg-white rounded-[2.5rem]">
                            No users found
                        </div>
                    ) : (
                        users.map((u) => (
                            <Card key={u.id} className="border-none shadow-sm shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white group">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-6 flex-1">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-500">
                                                {u.role === 'SUPERADMIN' ? <Shield size={24} /> : <UserCog size={24} />}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{u.name || "Unnamed User"}</h3>
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-md border",
                                                        u.role === 'SUPERADMIN' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-600'
                                                    )}>
                                                        {u.role}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1"><Mail size={12} /> {u.email}</span>
                                                    <span className="flex items-center gap-1"><Heart size={12} className="text-red-500" /> {u._count.weddings} Weddings</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right mr-4 hidden lg:block">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Joined</p>
                                                <p className="text-[11px] font-bold text-slate-900">{new Date(u.createdAt).toLocaleDateString()}</p>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAction(u.id, { revokeSessions: true })}
                                                disabled={processing === u.id}
                                                className="border-slate-100 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600 hover:border-amber-100"
                                            >
                                                Revoke Sessions
                                            </Button>

                                            {u.role !== 'SUPERADMIN' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAction(u.id, { role: 'SUPERADMIN' })}
                                                    disabled={processing === u.id}
                                                    className="border-slate-100 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white"
                                                >
                                                    Promote
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

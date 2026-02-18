"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CreditCard,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    User,
    Clock,
    Package,
    Loader2,
    DollarSign,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MasterPaymentsPage() {
    const [weddings, setWeddings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        fetch("/api/admin/master/payments")
            .then(res => res.json())
            .then(setWeddings)
            .finally(() => setLoading(false));
    };

    const handleApprove = async (weddingId: string, packageType: string) => {
        setProcessing(weddingId);
        try {
            await fetch("/api/admin/master/payments", {
                method: "POST",
                body: JSON.stringify({ weddingId, status: "PAID", packageType }),
                headers: { "Content-Type": "application/json" }
            });
            loadData();
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-8">
            <div className="max-w-[1400px] mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-100 bg-white">
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-kantumruy">Payment Verification Center</h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Pending Activations</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">{weddings.length} Awaiting Approval</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
                            Loading Payment Requests...
                        </div>
                    ) : weddings.length === 0 ? (
                        <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] bg-white p-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                                <Clock size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2 font-kantumruy">គ្មានសំណើបង់ប្រាក់នៅឡើយទេ</h3>
                            <p className="text-slate-500 font-medium font-kantumruy italic">"Everything is up to date."</p>
                        </Card>
                    ) : (
                        weddings.map((w) => (
                            <Card key={w.id} className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-50">
                                        <div className="p-8 lg:w-1/3 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Package className="text-red-500" size={16} />
                                                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest px-2 py-1 bg-red-50 rounded-lg">
                                                    {w.packageType} Request
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight font-kantumruy">
                                                {w.groomName} & {w.brideName}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                <User size={14} className="text-slate-300" />
                                                By: <span className="font-bold text-slate-800">{w.user?.name || w.user?.email}</span>
                                            </div>
                                        </div>

                                        <div className="p-8 lg:flex-1 space-y-6 flex flex-col justify-center bg-slate-50/30">
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registration Date</p>
                                                    <p className="text-xs font-bold text-slate-900">{new Date(w.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wedding ID</p>
                                                    <p className="text-xs font-mono font-bold text-slate-900">{w.id.substring(0, 12)}...</p>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 font-black">
                                                        $
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Cost</p>
                                                        <p className="text-sm font-black text-slate-900">
                                                            {w.packageType === "PRO" ? "$25.00" : "$45.00"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                                                    Awaiting Verification
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-8 lg:w-1/4 flex flex-col justify-center gap-3">
                                            <Button
                                                onClick={() => handleApprove(w.id, w.packageType)}
                                                disabled={processing === w.id}
                                                className="w-full h-12 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-slate-200"
                                            >
                                                {processing === w.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                                Approve Payment
                                            </Button>
                                            <Link href={`/dashboard?weddingId=${w.id}`} target="_blank" className="w-full">
                                                <Button variant="ghost" className="w-full h-12 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[9px]">
                                                    Preview Wedding Context
                                                </Button>
                                            </Link>
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

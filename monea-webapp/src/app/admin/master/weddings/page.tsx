import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Search, 
    ArrowLeft, 
    ArrowUpRight, 
    Users, 
    Gift, 
    Loader2, 
    Crown, 
    Sparkles, 
    DollarSign,
    CheckCircle2
} from "lucide-react";
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function MasterWeddingsPage() {
    const { showToast } = useToast();
    const [weddings, setWeddings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState<any>(null);
    const [pricing, setPricing] = useState<{ standard: number; pro: number }>({ standard: 9, pro: 19 });
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Manual Upgrade Modal State
    const [upgradeTarget, setUpgradeTarget] = useState<{
        weddingId: string;
        coupleName: string;
        currentPackage: string;
        userEmail: string;
    } | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<string>("PRO");

    const loadData = useCallback((page = 1) => {
        setLoading(true);
        fetch(`/api/admin/master/weddings?search=${encodeURIComponent(search)}&page=${page}`)
            .then(res => res.json())
            .then(data => {
                setWeddings(data.weddings || []);
                setPagination(data.pagination);
                if (data.pricing) {
                    setPricing({
                        standard: Number(data.pricing.standard) || 9,
                        pro: Number(data.pricing.pro) || 19
                    });
                }
            })
            .catch(() => {
                showToast({ title: "បរាជ័យក្នុងការទាញយកទិន្នន័យ", type: "error" });
            })
            .finally(() => setLoading(false));
    }, [search, showToast]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadData(1);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, loadData]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadData(1);
    };

    const getPackageKhmerName = (pkg: string) => {
        if (pkg === 'FREE') return 'ឥតគិតថ្លៃ';
        if (pkg === 'PRO') return 'ស្តង់ដារ';
        if (pkg === 'PREMIUM') return 'ពិសេស VIP';
        return pkg;
    };

    const handleManualUpgrade = async () => {
        if (!upgradeTarget) return;
        setProcessingId(upgradeTarget.weddingId);

        try {
            const res = await fetch("/api/admin/master/weddings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    weddingId: upgradeTarget.weddingId,
                    packageType: selectedPackage,
                    paymentStatus: selectedPackage === 'FREE' ? 'PENDING' : 'PAID',
                    status: 'ACTIVE'
                })
            });

            const data = await res.json();
            if (data.success) {
                showToast({
                    title: `បានដំឡើងកញ្ចប់ ${getPackageKhmerName(selectedPackage)} ជោគជ័យ!`,
                    description: `កម្មវិធីរបស់ ${upgradeTarget.coupleName} ត្រូវបានដំឡើងទៅជាកញ្ចប់ ${getPackageKhmerName(selectedPackage)} ដោយជោគជ័យ។`,
                    type: "success"
                });

                // Update local state immediately
                setWeddings(prev => prev.map(w => {
                    if (w.id === upgradeTarget.weddingId) {
                        return { ...w, packageType: selectedPackage, paymentStatus: selectedPackage === 'FREE' ? 'PENDING' : 'PAID' };
                    }
                    return w;
                }));
                setUpgradeTarget(null);
            } else {
                throw new Error(data.error || "Failed");
            }
        } catch (error: any) {
            showToast({
                title: "បរាជ័យក្នុងការដំឡើងកញ្ចប់",
                description: error.message || "មានបញ្ហាបច្ចេកទេស សូមព្យាយាមម្តងទៀត។",
                type: "error"
            });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-4 sm:p-8 font-kantumruy">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-100 bg-white shadow-xs">
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <span>គ្រប់គ្រងកម្មវិធីមង្គលការ</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase">
                                    Super Admin
                                </span>
                            </h1>
                            <p className="text-xs text-slate-400 font-bold tracking-wide mt-0.5">
                                បញ្ជីកម្មវិធីមង្គលការទាំងអស់ និងមុខងារដំឡើងកញ្ចប់សេវាដោយដៃ
                            </p>
                        </div>
                    </div>

                    {/* Search & Quick Action */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="ស្វែងរកតាមឈ្មោះ, កូដ ឬអ៊ីមែល..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-12 h-12 rounded-2xl bg-white border-slate-100 shadow-xs text-xs font-bold"
                            />
                        </form>

                        <Link to="/admin/master/payments">
                            <Button className="h-12 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2 shrink-0">
                                <DollarSign size={16} />
                                <span className="hidden sm:inline">ផ្ទៀងផ្ទាត់វិក្កយបត្រ</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ឈ្មោះសាមីខ្លួន / កាលបរិច្ឆេទ</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">កញ្ចប់សេវា</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ភ្ញៀវ / ចំណងដៃ</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ម្ចាស់គណនី</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">សកម្មភាព</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600 mb-4" />
                                            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">កំពុងទាញយកទិន្នន័យ...</p>
                                        </td>
                                    </tr>
                                ) : weddings.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-xs font-bold text-slate-400">
                                            មិនមានទិន្នន័យមង្គលការដែលត្រូវស្វែងរកឡើយ
                                        </td>
                                    </tr>
                                ) : weddings.map((w) => {
                                    const isPremium = w.packageType === 'PREMIUM';
                                    const isPro = w.packageType === 'PRO';

                                    return (
                                        <tr key={w.id} className="hover:bg-slate-50/60 transition-colors group">
                                            {/* Couple Name */}
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 text-sm">
                                                        {w.groomName} & {w.brideName}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                        {new Date(w.date).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Package Plan Badge + Manual Upgrade Trigger */}
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <button
                                                        onClick={() => {
                                                            setUpgradeTarget({
                                                                weddingId: w.id,
                                                                coupleName: `${w.groomName} & ${w.brideName}`,
                                                                currentPackage: w.packageType || 'FREE',
                                                                userEmail: w.user?.email || ''
                                                            });
                                                            setSelectedPackage(w.packageType === 'PREMIUM' ? 'PREMIUM' : 'PRO');
                                                        }}
                                                        title="ចុចដើម្បីដំឡើងកញ្ចប់ដោយដៃ"
                                                        className={cn(
                                                            "text-[10px] font-black uppercase px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-105 active:scale-95",
                                                            isPremium 
                                                                ? 'bg-amber-100 border-amber-300 text-amber-800' 
                                                                : (isPro ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200')
                                                        )}
                                                    >
                                                        {isPremium ? <Crown size={12} className="text-amber-600" /> : (isPro ? <Sparkles size={12} className="text-blue-600" /> : null)}
                                                        <span>{getPackageKhmerName(w.packageType || 'FREE')}</span>
                                                    </button>
                                                    <span className="text-[10px] font-mono font-bold text-slate-400">
                                                        #{w.weddingCode || '---'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Guests & Gifts Count */}
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <Users size={13} className="text-slate-400 mb-0.5" />
                                                        <span className="text-xs font-black text-slate-700">{w._count?.guests || 0}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <Gift size={13} className="text-slate-400 mb-0.5" />
                                                        <span className="text-xs font-black text-slate-700">{w._count?.gifts || 0}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Owner */}
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-800">{w.user?.name || "No User"}</span>
                                                    <span className="text-[11px] text-slate-400 font-mono">{w.user?.email || "No Email"}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {w.userId || w.user?.id || '---'}</span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setUpgradeTarget({
                                                                weddingId: w.id,
                                                                coupleName: `${w.groomName} & ${w.brideName}`,
                                                                currentPackage: w.packageType || 'FREE',
                                                                userEmail: w.user?.email || ''
                                                            });
                                                            setSelectedPackage(w.packageType === 'PREMIUM' ? 'PREMIUM' : 'PRO');
                                                        }}
                                                        className="h-8 px-3 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 hover:text-purple-900 border border-purple-200 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                                                    >
                                                        <Crown size={13} className="text-purple-600 shrink-0" />
                                                        <span>ដំឡើងកញ្ចប់</span>
                                                    </button>

                                                    <Link 
                                                        to={`/dashboard?weddingId=${w.id}`} 
                                                        target="_blank"
                                                        className="h-8 px-3 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                                                    >
                                                        <span>មើលធៀប</span>
                                                        <ArrowUpRight size={13} className="text-blue-600 shrink-0" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: pagination.pages }).map((_, i) => (
                            <Button
                                key={i}
                                onClick={() => loadData(i + 1)}
                                variant={pagination.currentPage === i + 1 ? "default" : "outline"}
                                className={cn(
                                    "w-10 h-10 rounded-xl font-bold text-xs",
                                    pagination.currentPage === i + 1 ? "bg-slate-900 text-white" : "border-slate-100 bg-white"
                                )}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Manual Package Upgrade Modal */}
            <Dialog open={!!upgradeTarget} onOpenChange={(open) => !open && setUpgradeTarget(null)}>
                <DialogContent className="sm:max-w-md rounded-3xl p-6 font-kantumruy bg-white">
                    <DialogHeader className="space-y-2 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs mb-1">
                            <Crown size={24} />
                        </div>
                        <DialogTitle className="text-lg font-black text-slate-900">
                            ដំឡើងកញ្ចប់សេវាកម្មដោយដៃ
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 font-medium">
                            ជ្រើសរើសកញ្ចប់ដែលអ្នកចង់ដំឡើងជូនសាមីដើមការ៖ <strong className="text-slate-900">{upgradeTarget?.coupleName}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    {/* Plan Selection Cards */}
                    <div className="space-y-3 py-4">
                        {[
                            {
                                id: 'FREE',
                                title: 'កញ្ចប់ឥតគិតថ្លៃ',
                                price: '$0.00',
                                desc: 'កញ្ចប់សាកល្បងធម្មតា មុខងារមូលដ្ឋាន',
                                icon: Sparkles,
                                color: 'border-slate-200 bg-slate-50/50 text-slate-700'
                            },
                            {
                                id: 'PRO',
                                title: 'កញ្ចប់ស្តង់ដារ',
                                price: `$${Number(pricing.standard || 9).toFixed(2)}`,
                                desc: 'បើកគ្រប់មុខងារពិសេស គ្មានកំណត់ចំនួនភ្ញៀវ',
                                icon: Sparkles,
                                color: 'border-blue-300 bg-blue-50/60 text-blue-900'
                            },
                            {
                                id: 'PREMIUM',
                                title: 'កញ្ចប់ពិសេស VIP',
                                price: `$${Number(pricing.pro || 19).toFixed(2)}`,
                                desc: 'បើកគ្រប់មុខងារពិសេស គ្មានកំណត់ចំនួនភ្ញៀវ VIP',
                                icon: Crown,
                                color: 'border-amber-300 bg-amber-50/60 text-amber-900'
                            }
                        ].map(plan => {
                            const isSelected = selectedPackage === plan.id;
                            const Icon = plan.icon;

                            return (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPackage(plan.id)}
                                    className={cn(
                                        "p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between shadow-xs",
                                        isSelected 
                                            ? 'border-purple-600 bg-purple-50/80 shadow-md ring-2 ring-purple-600/20' 
                                            : 'border-slate-100 hover:border-slate-200 bg-white'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                            plan.color
                                        )}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-black text-slate-900">
                                                {plan.title}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                {plan.desc}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right pl-2">
                                        <span className="font-mono text-xs font-black text-slate-900 block">
                                            {plan.price}
                                        </span>
                                        {isSelected && (
                                            <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                ជ្រើសរើស
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <DialogFooter className="flex gap-2 sm:gap-0 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setUpgradeTarget(null)}
                            disabled={!!processingId}
                            className="rounded-xl font-bold text-xs"
                        >
                            បោះបង់
                        </Button>
                        <Button
                            onClick={handleManualUpgrade}
                            disabled={!!processingId}
                            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20"
                        >
                            {processingId ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            <span>បញ្ជាក់ការដំឡើងទៅ {getPackageKhmerName(selectedPackage)}</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

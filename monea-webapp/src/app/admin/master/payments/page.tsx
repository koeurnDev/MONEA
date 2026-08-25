import React, { useEffect, useState, useCallback } from "react";
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
    ShieldCheck,
    ExternalLink,
    RefreshCcw,
    Zap,
    TrendingUp,
    Calendar,
    Image as ImageIcon,
    Eye,
    Check,
    X,
    Filter,
    Crown,
    FileCheck
} from "lucide-react";
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from "framer-motion";
import { moneaClient } from "@/lib/api-client";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function MasterPaymentsPage() {
    const { t, locale } = useTranslation();
    const { showToast } = useToast();
    const isKm = locale === 'km';

    const [weddings, setWeddings] = useState<any[]>([]);
    const [pricing, setPricing] = useState({ standard: 9, pro: 19 });
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<'pending' | 'paid' | 'rejected' | 'all'>('pending');
    
    // Receipt Modal State
    const [viewingReceipt, setViewingReceipt] = useState<{
        imageUrl: string;
        coupleName: string;
        userEmail: string;
        packageType: string;
        amount: number;
        date: string;
        ref: string;
    } | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await moneaClient.get("/api/admin/master/payments") as any;
            if (res.status === 401) return;
            if (res.error || !res.data) throw new Error(res.error || "Failed");
            
            setWeddings(res.data.weddings || []);
            setPricing(res.data.pricing || { standard: 9, pro: 19 });
        } catch (error) {
            showToast({
                title: isKm ? "បរាជ័យក្នុងការទាញយកទិន្នន័យ" : "Sync Failed",
                description: isKm ? "មិនអាចភ្ជាប់ទៅកាន់ប្រព័ន្ធបានទេ។" : "Could not connect to verification engine.",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    }, [isKm, showToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpdatePayment = async (weddingId: string, status: 'PAID' | 'REJECTED' | 'PENDING', packageType?: string) => {
        setProcessing(weddingId);
        try {
            const res = await moneaClient.post("/api/admin/master/payments", { 
                weddingId, 
                status, 
                packageType 
            });
            
            if (!res.error) {
                showToast({
                    title: status === 'PAID' ? "បានអនុម័ត និងដំឡើងកញ្ចប់ជោគជ័យ!" : (status === 'REJECTED' ? "បានបដិសេធវិក្កយបត្រ" : "បានផ្លាស់ប្តូរស្ថានភាព"),
                    description: status === 'PAID' ? `កញ្ចប់សេវាត្រូវបានដំឡើងទៅជា ${packageType || 'PRO'} រួចរាល់។` : undefined,
                    type: status === 'PAID' ? "success" : "info"
                });
                
                // Update local state directly
                setWeddings(prev => prev.map(w => {
                    if (w.id === weddingId) {
                        return {
                            ...w,
                            paymentStatus: status,
                            packageType: packageType || w.packageType,
                            status: status === 'PAID' ? 'ACTIVE' : w.status
                        };
                    }
                    return w;
                }));
            } else {
                showToast({ title: "បរាជ័យ", description: res.error, type: "error" });
            }
        } catch (error) {
            showToast({ title: "Error", description: "Operation failed", type: "error" });
        } finally {
            setProcessing(null);
        }
    };

    // Filter weddings by tab
    const pendingList = weddings.filter(w => w.paymentStatus === 'AWAITING_VERIFICATION' || w.paymentStatus === 'PENDING');
    const paidList = weddings.filter(w => w.paymentStatus === 'PAID');
    const rejectedList = weddings.filter(w => w.paymentStatus === 'REJECTED');

    const displayedWeddings = 
        selectedTab === 'pending' ? pendingList :
        selectedTab === 'paid' ? paidList :
        selectedTab === 'rejected' ? rejectedList :
        weddings;

    const totalRevenue = paidList.reduce((acc, w) => {
        const cost = w.packageType === 'PREMIUM' ? pricing.pro : (w.packageType === 'PRO' ? pricing.standard : 0);
        return acc + cost;
    }, 0);

    return (
        <div className="w-full min-h-full font-kantumruy pb-16">
            {/* Top Bar Header */}
            <div className="bg-card/80 backdrop-blur-md border-b border-border/80 sticky top-0 z-20">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-border bg-card shadow-xs hover:bg-muted">
                                <ArrowLeft size={17} className="text-muted-foreground" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                <ShieldCheck size={13} />
                                <span>Verification Hub</span>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold text-foreground">
                                {isKm ? "មជ្ឈមណ្ឌលផ្ទៀងផ្ទាត់ការបង់ប្រាក់ & វិក្កយបត្រ" : "Payment & Slip Verification"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={loadData}
                            variant="outline"
                            disabled={loading}
                            className="h-10 px-4 rounded-xl font-bold text-xs border border-border bg-card shadow-xs flex items-center gap-2"
                        >
                            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                            <span>{isKm ? "ផ្ទុកឡើងវិញ" : "Refresh"}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground">{isKm ? "រង់ចាំការផ្ទៀងផ្ទាត់" : "Pending Slips"}</p>
                                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingList.length}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                                <Clock size={24} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground">{isKm ? "បានអនុម័តរួចរាល់" : "Approved Payments"}</p>
                                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{paidList.length}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                                <CheckCircle2 size={24} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground">{isKm ? "ចំណូលសរុប (USD)" : "Estimated Revenue"}</p>
                                <h3 className="text-2xl font-black text-foreground mt-1">${totalRevenue.toFixed(2)}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                                <DollarSign size={24} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Tabs Bar */}
                <div className="flex items-center gap-1.5 p-1.5 bg-muted/50 border border-border/80 rounded-2xl overflow-x-auto scrollbar-none">
                    {[
                        { id: 'pending', label: "រង់ចាំការផ្ទៀងផ្ទាត់", count: pendingList.length, icon: Clock, color: "text-amber-500" },
                        { id: 'paid', label: "បានអនុម័ត (Paid)", count: paidList.length, icon: CheckCircle2, color: "text-emerald-500" },
                        { id: 'rejected', label: "បានបដិសេធ (Rejected)", count: rejectedList.length, icon: XCircle, color: "text-rose-500" },
                        { id: 'all', label: "ទាំងអស់ (All)", count: weddings.length, icon: Filter, color: "text-muted-foreground" },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = selectedTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 select-none",
                                    isActive
                                        ? "bg-card text-foreground shadow-xs border border-border/80 font-bold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                                )}
                            >
                                <Icon size={16} className={tab.color} />
                                <span>{tab.label}</span>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded-md text-[10px] font-black",
                                    isActive ? "bg-muted text-foreground" : "bg-muted/70 text-muted-foreground"
                                )}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Main List */}
                {loading && weddings.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                        <p className="text-xs font-bold text-muted-foreground">{isKm ? "កំពុងទាញយកទិន្នន័យ..." : "Loading requests..."}</p>
                    </div>
                ) : displayedWeddings.length === 0 ? (
                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs py-20 text-center">
                        <CardContent className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                                <FileCheck size={26} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-foreground">
                                    {selectedTab === 'pending' ? "គ្មានសំណើដែលរង់ចាំផ្ទៀងផ្ទាត់ទេ" : "មិនមានទិន្នន័យនៅក្នុងបញ្ជីនេះទេ"}
                                </h3>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    {selectedTab === 'pending' 
                                        ? "នៅពេលអតិថិជនស្កេនបង់ប្រាក់ និងផ្ញើរូបភាពវិក្កយបត្រ សំណើនឹងបង្ហាញនៅត្រង់នេះដើម្បីឱ្យ Admin ពិនិត្យផ្ទៀងផ្ទាត់។"
                                        : "ទិន្នន័យប្រតិបត្តិការនឹងបង្ហាញនៅទីនេះ។"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {displayedWeddings.map((w) => {
                                const isPending = w.paymentStatus === 'AWAITING_VERIFICATION' || w.paymentStatus === 'PENDING';
                                const isPaid = w.paymentStatus === 'PAID';
                                const isRejected = w.paymentStatus === 'REJECTED';
                                const amount = w.packageType === 'PREMIUM' ? pricing.pro : (w.packageType === 'PRO' ? pricing.standard : 0);
                                const hasSlipImage = w.paymentInfo && (w.paymentInfo.startsWith('data:image') || w.paymentInfo.startsWith('http'));

                                return (
                                    <m.div
                                        key={w.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        layout
                                    >
                                        <Card className={cn(
                                            "bg-card border rounded-2xl shadow-xs overflow-hidden transition-all",
                                            isPending ? "border-amber-400/60 dark:border-amber-500/40 bg-amber-500/[0.02]" : "border-border/80"
                                        )}>
                                            <CardContent className="p-6">
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                                    {/* Left: Couple & User Info */}
                                                    <div className="space-y-3 flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2.5">
                                                            {/* Status Badge */}
                                                            <span className={cn(
                                                                "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1",
                                                                isPending ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30 animate-pulse" :
                                                                isPaid ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30" :
                                                                "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/30"
                                                            )}>
                                                                {isPending ? "⏳ រង់ចាំផ្ទៀងផ្ទាត់ (Pending Review)" : (isPaid ? "✅ បានអនុម័ត (Paid)" : "❌ បានបដិសេធ (Rejected)")}
                                                            </span>

                                                            {/* Package Requested */}
                                                            <span className={cn(
                                                                "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                                                                w.packageType === 'PREMIUM' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                                                                w.packageType === 'PRO' ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
                                                                "bg-muted text-muted-foreground"
                                                            )}>
                                                                {w.packageType} PLAN (${amount})
                                                            </span>

                                                            <span className="text-xs text-muted-foreground font-mono">
                                                                ID: {w.id.slice(0, 10)}
                                                            </span>
                                                        </div>

                                                        {/* Couple Name */}
                                                        <div>
                                                            <h3 className="text-lg font-bold text-foreground">
                                                                {w.groomName} <span className="text-rose-500">&</span> {w.brideName}
                                                            </h3>
                                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                                                                <span className="flex items-center gap-1">
                                                                    <User size={13} className="text-muted-foreground" />
                                                                    <span className="font-medium text-foreground">{w.user?.name || "User"}</span>
                                                                    <span>({w.user?.email})</span>
                                                                </span>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar size={13} />
                                                                    <span>{new Date(w.createdAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}</span>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Slip or Ref Note */}
                                                        {w.paymentHash && (
                                                            <div className="text-xs font-mono bg-muted/40 p-2 rounded-lg border border-border/60 text-muted-foreground">
                                                                <span className="font-bold text-foreground">Ref / TxID:</span> {w.paymentHash}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Center: Receipt Slip Preview Thumbnail */}
                                                    <div className="flex items-center gap-4 shrink-0">
                                                        {hasSlipImage ? (
                                                            <div 
                                                                onClick={() => setViewingReceipt({
                                                                    imageUrl: w.paymentInfo,
                                                                    coupleName: `${w.groomName} & ${w.brideName}`,
                                                                    userEmail: w.user?.email,
                                                                    packageType: w.packageType,
                                                                    amount,
                                                                    date: new Date(w.createdAt).toLocaleString('km-KH', { timeZone: 'Asia/Phnom_Penh' }),
                                                                    ref: w.paymentHash || w.id
                                                                })}
                                                                className="relative group/slip cursor-pointer w-24 h-24 rounded-xl border-2 border-rose-500/30 overflow-hidden bg-muted hover:border-rose-500 transition-all shadow-xs"
                                                            >
                                                                <img 
                                                                    src={w.paymentInfo} 
                                                                    alt="Payment Slip Receipt" 
                                                                    className="w-full h-full object-cover group-hover/slip:scale-105 transition-transform" 
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/slip:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                                                                    <Eye size={20} />
                                                                    <span className="text-[9px] font-black uppercase mt-1">មើលវិក្កយបត្រ</span>
                                                                </div>
                                                                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[8px] font-bold">
                                                                    SLIP 🧾
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="w-24 h-24 rounded-xl border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
                                                                <ImageIcon size={20} className="text-muted-foreground/60 mb-1" />
                                                                <span className="text-[9px] font-bold text-muted-foreground">គ្មានរូបភាព</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right: Actions */}
                                                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
                                                        {isPending ? (
                                                            <>
                                                                <Button
                                                                    onClick={() => handleUpdatePayment(w.id, 'PAID', w.packageType === 'PREMIUM' ? 'PREMIUM' : 'PRO')}
                                                                    disabled={processing === w.id}
                                                                    className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
                                                                >
                                                                    {processing === w.id ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <Check size={16} />
                                                                            <span>អនុម័ត & ដំឡើង ({w.packageType || 'PRO'})</span>
                                                                        </>
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleUpdatePayment(w.id, 'REJECTED')}
                                                                    disabled={processing === w.id}
                                                                    variant="outline"
                                                                    className="h-10 px-4 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl font-bold text-xs flex items-center gap-1.5"
                                                                >
                                                                    <X size={15} />
                                                                    <span>បដិសេធ (Reject)</span>
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                {w.packageType !== 'PREMIUM' && (
                                                                    <Button
                                                                        onClick={() => handleUpdatePayment(w.id, 'PAID', 'PREMIUM')}
                                                                        disabled={processing === w.id}
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-9 px-3 text-amber-600 border-amber-500/30 hover:bg-amber-500/10 rounded-xl font-bold text-xs flex items-center gap-1"
                                                                    >
                                                                        <Crown size={14} />
                                                                        <span>ដំឡើងទៅ Premium</span>
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    onClick={() => handleUpdatePayment(w.id, 'REJECTED')}
                                                                    disabled={processing === w.id}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-9 px-3 text-muted-foreground hover:text-rose-600 rounded-xl font-bold text-xs"
                                                                >
                                                                    ដកសិទ្ធិ
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </m.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Receipt Modal (Full Screen Inspection) */}
            <Dialog open={!!viewingReceipt} onOpenChange={(open) => !open && setViewingReceipt(null)}>
                <DialogContent className="sm:max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl font-kantumruy">
                    <DialogHeader className="pb-3 border-b border-border/60">
                        <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                            <FileCheck className="text-emerald-500" size={20} />
                            <span>ពិនិត្យផ្ទៀងផ្ទាត់វិក្កយបត្រ (Payment Slip Receipt)</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {viewingReceipt?.coupleName} • {viewingReceipt?.userEmail}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        {/* Image Canvas */}
                        <div className="rounded-2xl border border-border overflow-hidden bg-slate-950 flex items-center justify-center max-h-[420px] shadow-inner">
                            <img 
                                src={viewingReceipt?.imageUrl} 
                                alt="Payment Slip Full Size" 
                                className="w-full h-auto max-h-[420px] object-contain" 
                            />
                        </div>

                        {/* Metadata Details */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-3.5 rounded-xl border border-border/60">
                            <div>
                                <span className="text-muted-foreground block text-[10px] font-bold uppercase">កញ្ចប់សេវា</span>
                                <span className="font-bold text-foreground">{viewingReceipt?.packageType} PLAN (${viewingReceipt?.amount})</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[10px] font-bold uppercase">កាលបរិច្ឆេទ</span>
                                <span className="font-bold text-foreground">{viewingReceipt?.date}</span>
                            </div>
                        </div>

                        {/* Close button */}
                        <div className="flex justify-end pt-1">
                            <Button 
                                onClick={() => setViewingReceipt(null)}
                                className="h-10 px-5 rounded-xl font-bold text-xs bg-foreground text-background hover:opacity-90"
                            >
                                បិទផ្ទាំងពិនិត្យ
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

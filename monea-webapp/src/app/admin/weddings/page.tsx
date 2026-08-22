"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Globe, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { moneaClient } from "@/lib/api-client";
interface Wedding {
    id: string;
    groomName: string;
    brideName: string;
    packageType: "FREE" | "PRO" | "PREMIUM";
    status: "ACTIVE" | "ARCHIVED";
    expiresAt: string | null;
    user: {
        email: string;
    };
    paymentStatus: "PENDING" | "AWAITING_VERIFICATION" | "PAID";
}

export default function AdminWeddingsPage() {
    const [weddings, setWeddings] = useState<Wedding[]>([]);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);
    const { showToast } = useToast();
    const [visibleCount, setVisibleCount] = useState(15);

    // Edit Form State
    const [editForm, setEditForm] = useState({
        packageType: "FREE",
        status: "ACTIVE",
        expiresAt: "",
        paymentStatus: "PENDING"
    });

    useEffect(() => {
        fetchWeddings();
    }, []);

    async function fetchWeddings() {
        setLoading(true);
        try {
            const res = await moneaClient.get<any>("/api/admin/weddings");
            if (!res.error) {
                setWeddings(res.data?.data || []);
            } else {
                console.error("Failed to fetch weddings:", res.error);
            }
        } catch (error) {
            console.error("Error fetching weddings:", error);
        } finally {
            setLoading(false);
        }
    }

    const openEdit = (wedding: Wedding) => {
        setSelectedWedding(wedding);

        let formattedDate = "";
        if (wedding.expiresAt) {
            try {
                const date = new Date(wedding.expiresAt);
                if (!isNaN(date.getTime())) {
                    formattedDate = date.toISOString().split('T')[0];
                }
            } catch (e) {
                console.error("Invalid date:", wedding.expiresAt);
            }
        }

        setEditForm({
            packageType: wedding.packageType,
            status: wedding.status,
            expiresAt: formattedDate,
            paymentStatus: wedding.paymentStatus || "PENDING"
        });
    };

    const saveChanges = async () => {
        if (!selectedWedding) return;
        setSaving(true);

        try {
            const res = await moneaClient.put("/api/admin/weddings", {
                id: selectedWedding.id,
                ...editForm
            });

            if (res.error) {
                throw new Error(res.error || "Failed to update wedding");
            }

            const updatedWeddings = weddings.map(w =>
                w.id === selectedWedding.id
                    ? {
                        ...w,
                        ...editForm,
                        packageType: editForm.packageType as any,
                        status: editForm.status as any,
                        paymentStatus: editForm.paymentStatus as any
                    }
                    : w
            );

            setWeddings(updatedWeddings);
            setSelectedWedding(null);
            showToast({
                title: "រក្សាទុកដោយជោគជ័យ!",
                description: `ព័ត៌មានរបស់ ${selectedWedding.groomName} ត្រូវបានធ្វើបច្ចុប្បន្នភាព។`,
                type: "success"
            });
        } catch (error) {
            console.error("Error saving changes:", error);
            showToast({
                title: "ការរក្សាទុកមានបញ្ហា",
                description: "សូមព្យាយាមម្ដងទៀតនៅពេលក្រោយ។",
                type: "info"
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-600 mb-1">
                    <Globe size={14} />
                    EVENT MANAGEMENT
                </div>
                <h1 className="text-3xl font-black text-foreground tracking-tight font-kantumruy">គ្រប់គ្រងមង្គលការ</h1>
                <p className="text-muted-foreground font-medium font-kantumruy text-base opacity-70">មើល កែប្រែគម្រោង និងគ្រប់គ្រងស្ថានភាពមង្គលការទាំងអស់ក្នុងប្រព័ន្ធ MONEA ។</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider py-4 px-6">អ្នកប្រើប្រាស់</TableHead>
                            <TableHead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">ឈ្មោះប្តីប្រពន្ធ</TableHead>
                            <TableHead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">កញ្ចប់សេវាកម្ម</TableHead>
                            <TableHead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">ថ្ងៃផុតកំណត់</TableHead>
                            <TableHead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">ស្ថានភាព</TableHead>
                            <TableHead className="text-right text-slate-500 font-semibold uppercase text-[10px] tracking-wider px-6">សកម្មភាព</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="relative w-12 h-12">
                                            <div className="absolute inset-0 border-4 border-muted rounded-full" />
                                            <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                        <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">កំពុងទាញយកទិន្នន័យ...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : weddings.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground font-bold uppercase tracking-widest text-xs">មិនមានទិន្នន័យឡើយ</TableCell></TableRow>
                        ) : (
                            weddings.slice(0, visibleCount).map((w) => (
                                <TableRow 
                                    key={w.id} 
                                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/admin/weddings/${w.id}`)}
                                >
                                    <TableCell className="font-medium text-slate-500 dark:text-slate-400 px-6 font-mono text-xs">{w.user?.email || "N/A"}</TableCell>
                                    <TableCell className="text-slate-900 dark:text-white font-medium font-kantumruy">{w.groomName} & {w.brideName}</TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase border",
                                            w.packageType === 'PREMIUM' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' :
                                                w.packageType === 'PRO' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                                                    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                        )}>
                                            {w.packageType}
                                        </span>
                                    </TableCell>
                                    <TableCell className={cn(
                                        "text-xs font-mono",
                                        w.expiresAt && new Date(w.expiresAt) < new Date() ? "text-red-500 font-medium" : "text-slate-500 dark:text-slate-400"
                                    )}>
                                        {w.expiresAt ? new Date(w.expiresAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' }) : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase inline-flex items-center gap-1.5 border w-fit",
                                                w.status === 'ACTIVE' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                                                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                            )}>
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full", 
                                                    w.status === 'ACTIVE' ? "bg-emerald-500" : "bg-red-500"
                                                )} />
                                                {w.status === 'ACTIVE' ? 'Active' : 'Archived'}
                                            </span>
                                            {w.paymentStatus === 'AWAITING_VERIFICATION' && (
                                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-[9px] font-semibold uppercase tracking-wider w-fit">
                                                    Need Proof
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-6">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-lg border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-kantumruy text-xs font-medium h-8"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEdit(w);
                                            }}
                                        >
                                            គ្រប់គ្រង
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {weddings.length > visibleCount && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-center">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg font-medium font-kantumruy border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            onClick={() => setVisibleCount(prev => prev + 15)}
                        >
                            បង្ហាញបន្ថែមទៀត ({weddings.length - visibleCount})
                        </Button>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <Dialog open={!!selectedWedding} onOpenChange={(open) => {
                if (!open && !saving) setSelectedWedding(null);
            }}>
                <DialogContent className="bg-card border-border text-foreground rounded-3xl max-w-md shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="text-2xl font-black font-kantumruy tracking-tight">កែប្រែព័ត៌មានមង្គលការ</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">កំណត់គម្រោងសេវាកម្ម និងស្ថានភាពសម្រាប់: {selectedWedding?.groomName}</DialogDescription>
                    </DialogHeader>
                    <div className="px-8 py-4 space-y-6 font-kantumruy">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">គម្រោងសេវាកម្ម</Label>
                            <Select
                                value={editForm.packageType}
                                onValueChange={(v) => setEditForm({ ...editForm, packageType: v })}
                                disabled={saving}
                            >
                                <SelectTrigger className="bg-muted/50 border-border rounded-xl h-12 text-foreground shadow-sm"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-card border-border rounded-xl">
                                    <SelectItem value="FREE">គម្រោងឥតគិតថ្លៃ (Free)</SelectItem>
                                    <SelectItem value="PRO">គម្រោង Pro</SelectItem>
                                    <SelectItem value="PREMIUM">គម្រោង Premium</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">ស្ថានភាព</Label>
                            <Select
                                value={editForm.status}
                                onValueChange={(v) => setEditForm({ ...editForm, status: v })}
                                disabled={saving}
                            >
                                <SelectTrigger className="bg-muted/50 border-border rounded-xl h-12 text-foreground shadow-sm"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-card border-border rounded-xl">
                                    <SelectItem value="ACTIVE">បើកដំណើរការ (Active)</SelectItem>
                                    <SelectItem value="ARCHIVED">បិទម្ដងអាសន្ន (Archived)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">ស្ថានភាពថ្ងៃផុតកំណត់</Label>
                            <Input
                                type="date"
                                className="bg-muted/50 border-border rounded-xl h-12 text-foreground shadow-sm"
                                value={editForm.expiresAt}
                                onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                                disabled={saving}
                            />
                        </div>
                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <Label className="text-red-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle size={14} /> ផ្ទៀងផ្ទាត់ការបង់ប្រាក់ (Payment Status)
                            </Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={editForm.paymentStatus === 'PAID' ? 'default' : 'outline'}
                                    className={cn(
                                        "flex-1 rounded-xl h-12 text-[10px] font-black uppercase tracking-widest",
                                        editForm.paymentStatus === 'PAID' ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                                    )}
                                    onClick={() => setEditForm({ ...editForm, paymentStatus: 'PAID', status: 'ACTIVE' })}
                                >
                                    បង់រួច (PAID)
                                </Button>
                                <Button
                                    type="button"
                                    variant={editForm.paymentStatus === 'AWAITING_VERIFICATION' ? 'default' : 'outline'}
                                    className={cn(
                                        "flex-1 rounded-xl h-12 text-[10px] font-black uppercase tracking-widest",
                                        editForm.paymentStatus === 'AWAITING_VERIFICATION' ? 'bg-amber-500 hover:bg-amber-600' : ''
                                    )}
                                    onClick={() => setEditForm({ ...editForm, paymentStatus: 'AWAITING_VERIFICATION' })}
                                >
                                    រង់ចាំ (Awaiting)
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-6 flex gap-3 bg-muted/30">
                        <Button
                            variant="ghost"
                            className="flex-1 rounded-xl h-12 text-muted-foreground hover:text-foreground hover:bg-muted font-bold font-kantumruy"
                            onClick={() => setSelectedWedding(null)}
                            disabled={saving}
                        >
                            បោះបង់
                        </Button>
                        <Button
                            onClick={saveChanges}
                            disabled={saving}
                            className="flex-1 bg-red-600 text-white hover:bg-red-700 rounded-xl h-12 px-8 font-bold font-kantumruy shadow-lg shadow-red-100"
                        >
                            {saving ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>រក្សាទុក...</span>
                                </div>
                            ) : "រក្សាទុក"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

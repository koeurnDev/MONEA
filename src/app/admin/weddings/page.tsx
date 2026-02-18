"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Heart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export default function AdminWeddingsPage() {
    const [weddings, setWeddings] = useState<Wedding[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);

    // Edit Form State
    const [editForm, setEditForm] = useState({
        packageType: "FREE",
        status: "ACTIVE",
        expiresAt: ""
    });

    useEffect(() => {
        fetchWeddings();
    }, []);

    async function fetchWeddings() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/weddings");
            if (res.ok) {
                const data = await res.json();
                setWeddings(data);
            } else {
                console.error("Failed to fetch weddings");
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
            expiresAt: formattedDate
        });
    };

    const saveChanges = async () => {
        if (!selectedWedding) return;
        setSaving(true);

        try {
            const res = await fetch("/api/admin/weddings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedWedding.id,
                    ...editForm
                })
            });

            if (!res.ok) {
                throw new Error("Failed to update wedding");
            }

            const updatedWeddings = weddings.map(w =>
                w.id === selectedWedding.id
                    ? {
                        ...w,
                        ...editForm,
                        packageType: editForm.packageType as any,
                        status: editForm.status as any
                    }
                    : w
            );

            setWeddings(updatedWeddings);
            setSelectedWedding(null);
            alert("រក្សាទុកដោយជោគជ័យ!");
        } catch (error) {
            console.error("Error saving changes:", error);
            alert("ការរក្សាទុកមានបញ្ហា សូមព្យាយាមម្ដងទៀត។");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-600 mb-1">
                    <Heart size={14} />
                    EVENT MANAGEMENT
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight font-kantumruy">គ្រប់គ្រងមង្គលការ</h1>
                <p className="text-slate-500 font-medium font-kantumruy text-sm">មើល កែប្រែគម្រោង និងគ្រប់គ្រងស្ថានភាពមង្គលការទាំងអស់ក្នុងប្រព័ន្ធ MONEA ។</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-100/50">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100 hover:bg-transparent">
                            <TableHead className="text-slate-600 font-bold uppercase text-xs tracking-tight py-6 px-8">អ្នកប្រើប្រាស់</TableHead>
                            <TableHead className="text-slate-600 font-bold uppercase text-xs tracking-tight">ឈ្មោះប្តីប្រពន្ធ</TableHead>
                            <TableHead className="text-slate-600 font-bold uppercase text-xs tracking-tight">កញ្ចប់សេវាកម្ម</TableHead>
                            <TableHead className="text-slate-600 font-bold uppercase text-xs tracking-tight">ថ្ងៃផុតកំណត់</TableHead>
                            <TableHead className="text-slate-600 font-bold uppercase text-xs tracking-tight">ស្ថានភាព</TableHead>
                            <TableHead className="text-right text-slate-600 font-bold uppercase text-xs tracking-tight px-8">សកម្មភាព</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="relative w-12 h-12">
                                            <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                                            <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">កំពុងទាញយកទិន្នន័យ...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : weddings.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">មិនមានទិន្នន័យឡើយ</TableCell></TableRow>
                        ) : (
                            weddings.map((w) => (
                                <TableRow key={w.id} className="border-slate-50 hover:bg-slate-50/30 group transition-colors">
                                    <TableCell className="font-medium text-slate-500 px-8 font-mono text-xs">{w.user?.email || "N/A"}</TableCell>
                                    <TableCell className="text-slate-900 font-bold font-kantumruy">{w.groomName} & {w.brideName}</TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase border",
                                            w.packageType === 'PREMIUM' ? 'bg-purple-50 text-purple-700 border-purple-100 shadow-sm' :
                                                w.packageType === 'PRO' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    'bg-slate-100 text-slate-700 border-slate-200'
                                        )}>
                                            {w.packageType}
                                        </span>
                                    </TableCell>
                                    <TableCell className={cn(
                                        "text-xs font-mono",
                                        w.expiresAt && new Date(w.expiresAt) < new Date() ? "text-red-600 font-bold" : "text-slate-500"
                                    )}>
                                        {w.expiresAt ? new Date(w.expiresAt).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "px-2.5 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase inline-flex items-center gap-2 border",
                                            w.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200/50' : 'bg-red-50 text-red-700 border-red-200/50'
                                        )}>
                                            <span className={cn("w-2 h-2 rounded-full", w.status === 'ACTIVE' ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]")} />
                                            {w.status === 'ACTIVE' ? 'កុំពុងដំណើរការ' : 'បានបិទ'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl border-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-100 transition-all font-kantumruy text-xs font-bold h-9"
                                            onClick={() => openEdit(w)}
                                        >
                                            គ្រប់គ្រង
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Modal */}
            <Dialog open={!!selectedWedding} onOpenChange={(open) => {
                if (!open && !saving) setSelectedWedding(null);
            }}>
                <DialogContent className="bg-white border-slate-100 text-slate-900 rounded-3xl max-w-md shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="text-2xl font-black font-kantumruy tracking-tight">កែប្រែព័ត៌មានមង្គលការ</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">កំណត់គម្រោងសេវាកម្ម និងស្ថានភាពសម្រាប់: {selectedWedding?.groomName}</DialogDescription>
                    </DialogHeader>
                    <div className="px-8 py-4 space-y-6 font-kantumruy">
                        <div className="space-y-2">
                            <Label className="text-slate-500 text-xs font-black uppercase tracking-widest">គម្រោងសេវាកម្ម</Label>
                            <Select
                                value={editForm.packageType}
                                onValueChange={(v) => setEditForm({ ...editForm, packageType: v })}
                                disabled={saving}
                            >
                                <SelectTrigger className="bg-slate-50 border-slate-100 rounded-xl h-12 text-slate-900 shadow-sm"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white border-slate-100 rounded-xl">
                                    <SelectItem value="FREE">គម្រោងឥតគិតថ្លៃ (Free)</SelectItem>
                                    <SelectItem value="PRO">គម្រោង Pro</SelectItem>
                                    <SelectItem value="PREMIUM">គម្រោង Premium</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-500 text-xs font-black uppercase tracking-widest">ស្ថានភាព</Label>
                            <Select
                                value={editForm.status}
                                onValueChange={(v) => setEditForm({ ...editForm, status: v })}
                                disabled={saving}
                            >
                                <SelectTrigger className="bg-slate-50 border-slate-100 rounded-xl h-12 text-slate-900 shadow-sm"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white border-slate-100 rounded-xl">
                                    <SelectItem value="ACTIVE">បើកដំណើរការ (Active)</SelectItem>
                                    <SelectItem value="ARCHIVED">បិទម្ដងអាសន្ន (Archived)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-500 text-xs font-black uppercase tracking-widest">ថ្ងៃផុតកំណត់</Label>
                            <Input
                                type="date"
                                className="bg-slate-50 border-slate-100 rounded-xl h-12 text-slate-900 shadow-sm"
                                value={editForm.expiresAt}
                                onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                                disabled={saving}
                            />
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-6 flex gap-3 bg-slate-50/50">
                        <Button
                            variant="ghost"
                            className="flex-1 rounded-xl h-12 text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-bold font-kantumruy"
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

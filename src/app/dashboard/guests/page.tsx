"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Download, Search, Copy, Edit, Trash2, CheckCircle2, Users, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GuestForm } from "./guest-form";
import { GuestImport } from "./guest-import";

export default function GuestPage() {
    const [guests, setGuests] = useState<any[]>([]);
    const [filteredGuests, setFilteredGuests] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [editingGuest, setEditingGuest] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [unmaskedIds, setUnmaskedIds] = useState<Set<string>>(new Set());

    const toggleMask = (id: string) => {
        const newSet = new Set(unmaskedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setUnmaskedIds(newSet);
    };

    const maskPhone = (phone: string, id: string) => {
        if (!phone) return "-";
        if (unmaskedIds.has(id)) return phone;
        // Basic mask: keep first 3 and last 2 digits
        return phone.replace(/(\d{3})\d+(\d{2})/, "$1***$2");
    };

    const [wedding, setWedding] = useState<any>(null);

    async function loadData() {
        setLoading(true);
        try {
            const [guestsRes, weddingRes] = await Promise.all([
                fetch("/api/guests"),
                fetch("/api/wedding")
            ]);

            if (guestsRes.ok) {
                const data = await guestsRes.json();
                setGuests(data);
                setFilteredGuests(data);
            }
            if (weddingRes.ok) {
                const wData = await weddingRes.json();
                setWedding(wData);
            }
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!search) {
            setFilteredGuests(guests);
        } else {
            const lower = search.toLowerCase();
            setFilteredGuests(guests.filter(g =>
                g.name.toLowerCase().includes(lower) ||
                (g.source && g.source.toLowerCase().includes(lower)) ||
                (g.group && g.group.toLowerCase().includes(lower))
            ));
        }
    }, [search, guests]);

    const exportCSV = () => {
        const headers = ["ឈ្មោះ", "ទីតាំង"];
        const rows = guests.map(g => [g.name, g.source || g.group || ""]);
        const BOM = "\uFEFF";
        const csvContent = [headers, ...rows].map(e => e.map(i => `"${i}"`).join(",")).join("\n");

        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "guest_list.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const copyLink = (name: string, guestId: string) => {
        if (!wedding?.id) return;
        const link = `${window.location.origin}/invite/${wedding.id}?to=${encodeURIComponent(name)}&g=${guestId}`;
        navigator.clipboard.writeText(link);
        setCopiedId(guestId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const isArchived = wedding?.status === 'ARCHIVED';

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        // Optimistic Update
        const previousGuests = [...guests];
        const newGuests = guests.filter(g => g.id !== deleteId);
        setGuests(newGuests);
        setFilteredGuests(newGuests);
        setDeleteId(null);

        try {
            const res = await fetch(`/api/guests?id=${deleteId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            // Success - maybe show a small toast if available
        } catch (e) {
            console.error(e);
            // Rollback
            setGuests(previousGuests);
            setFilteredGuests(previousGuests);
            alert("ការលុបមិនបានជោគជ័យ! សូមព្យាយាមម្ដងទៀត។"); // Delete failed
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-1">
                        <Users size={12} />
                        Guest Management
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 font-kantumruy">
                        បញ្ជីឈ្មោះភ្ញៀវ {isArchived && <span className="ml-2 text-red-600 text-sm">(ឯកសារ)</span>}
                    </h2>
                    <p className="text-slate-500 font-medium font-kantumruy text-sm">
                        គ្រប់គ្រងបញ្ជីឈ្មោះភ្ញៀវ និងការផ្ញើតំណរភ្ជាប់អញ្ជើញ។
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {!isArchived && <GuestImport onSuccess={loadData} />}
                    <Button
                        variant="outline"
                        onClick={exportCSV}
                        className="h-11 px-6 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-kantumruy font-bold"
                    >
                        <Download className="mr-2 h-4 w-4" /> ទាញយកឯកសារ
                    </Button>
                    {!isArchived && (
                        <Dialog open={open} onOpenChange={(v) => {
                            setOpen(v);
                            if (!v) setEditingGuest(null);
                        }}>
                            <DialogTrigger asChild>
                                <Button
                                    onClick={() => setEditingGuest(null)}
                                    className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-100 transition-all font-kantumruy font-bold"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> បន្ថែមភ្ញៀវ
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl">
                                <DialogHeader className="pt-4 px-2">
                                    <DialogTitle className="text-2xl font-black font-kantumruy tracking-tight">
                                        {editingGuest ? "កែប្រែព័ត៌មានភ្ញៀវ" : "បន្ថែមភ្ញៀវថ្មី"}
                                    </DialogTitle>
                                    <DialogDescription className="font-kantumruy text-slate-500">
                                        {editingGuest ? "កែប្រែព័ត៌មានភ្ញៀវខាងក្រោម។" : "បំពេញព័ត៌មានភ្ញៀវខាងក្រោមដើម្បីបន្ថែមសមាជិកថ្មីចូលក្នុងបញ្ជី។"}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="p-2">
                                    <GuestForm
                                        initialData={editingGuest}
                                        onSuccess={() => { setOpen(false); setEditingGuest(null); loadData(); }}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
                        <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-sm">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black font-kantumruy">បញ្ជាក់ការលុប</DialogTitle>
                                <DialogDescription className="font-kantumruy">
                                    តើអ្នកពិតជាចង់លុបភ្ញៀវនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button
                                    variant="ghost"
                                    onClick={() => setDeleteId(null)}
                                    className="rounded-xl font-kantumruy font-bold h-11 flex-1"
                                >
                                    បោះបង់
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmDelete}
                                    className="rounded-xl font-kantumruy font-bold h-11 flex-1 bg-red-600 hover:bg-red-700"
                                >
                                    លុប
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filter & Table Area */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="ស្វែងរកតាមឈ្មោះ ឬទីតាំង..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-11 bg-slate-50 border-transparent focus-visible:ring-red-600/20 rounded-xl font-kantumruy"
                        />
                    </div>
                    {filteredGuests.length > 0 && (
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-auto hidden sm:block">
                            សរុប: {filteredGuests.length} នាក់
                        </div>
                    )}
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-50">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <div className="w-8 h-8 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">កំពុងផ្ទុក...</span>
                        </div>
                    ) : filteredGuests.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-2 opacity-30">
                            <Users size={40} className="mb-2" />
                            <p className="font-kantumruy font-bold">មិនមានទិន្នន័យភ្ញៀវឡើយ</p>
                        </div>
                    ) : (
                        filteredGuests.map((g: any) => (
                            <div key={g.id} className="p-4 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 font-kantumruy text-lg">{g.name}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-400 font-mono">{maskPhone(g.phone, g.id)}</span>
                                            {g.phone && (
                                                <button onClick={() => toggleMask(g.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                                                    {unmaskedIds.has(g.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                                                </button>
                                            )}
                                        </div>
                                        <div className="mt-2 text-left">
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold font-kantumruy">
                                                {g.source || g.group || "ទូទៅ"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!isArchived && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                                                    onClick={() => {
                                                        setEditingGuest(g);
                                                        setOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                                    onClick={() => handleDelete(g.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant={copiedId === g.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => copyLink(g.name, g.id)}
                                    className={cn(
                                        "w-full h-11 rounded-xl font-kantumruy font-bold text-xs transition-all",
                                        copiedId === g.id
                                            ? "bg-green-600 hover:bg-green-700 text-white border-transparent"
                                            : "border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-100 hover:bg-red-50"
                                    )}
                                >
                                    {copiedId === g.id ? (
                                        <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> ចម្លងរួច</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5"><Copy size={14} /> ចម្លងតំណរ (Copy Link)</span>
                                    )}
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-50 hover:bg-transparent">
                                <TableHead className="h-14 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">ឈ្មោះ</TableHead>
                                <TableHead className="h-14 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">មកពីណា?</TableHead>
                                <TableHead className="h-14 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">សកម្មភាព</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 boundary-spin border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">កំពុងផ្ទុក...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredGuests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <Users size={40} className="mb-2" />
                                            <p className="font-kantumruy font-bold">មិនមានទិន្នន័យភ្ញៀវឡើយ</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredGuests.map((g: any) => (
                                    <TableRow key={g.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                        <TableCell className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 font-kantumruy">{g.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-400 font-mono">{maskPhone(g.phone, g.id)}</span>
                                                    {g.phone && (
                                                        <button onClick={() => toggleMask(g.id)} className="text-slate-300 hover:text-slate-500 transition-colors opacity-0 group-hover:opacity-100">
                                                            {unmaskedIds.has(g.id) ? <EyeOff size={10} /> : <Eye size={10} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-8 py-5 text-center">
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold font-kantumruy">
                                                {g.source || g.group || "ទូទៅ"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant={copiedId === g.id ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => copyLink(g.name, g.id)}
                                                    className={cn(
                                                        "h-9 px-4 rounded-xl font-kantumruy font-bold text-[11px] transition-all",
                                                        copiedId === g.id
                                                            ? "bg-green-600 hover:bg-green-700 text-white border-transparent"
                                                            : "border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-100 hover:bg-red-50"
                                                    )}
                                                >
                                                    {copiedId === g.id ? (
                                                        <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> ចម្លងរួច</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5"><Copy size={14} /> ចម្លងតំណរ</span>
                                                    )}
                                                </Button>
                                                {!isArchived && (
                                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                                                            onClick={() => {
                                                                setEditingGuest(g);
                                                                setOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                                            onClick={() => handleDelete(g.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

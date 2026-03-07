"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Download, Search, Copy, Edit, Trash2, CheckCircle2, Users, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { GuestForm } from "./guest-form";
import { GuestImport } from "./guest-import";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { TableSkeleton } from "../_components/SkeletonComponents";

export default function GuestPage() {
    // 1. Core Data State
    const [guests, setGuests] = useState<any[]>([]);
    const [filteredGuests, setFilteredGuests] = useState<any[]>([]);
    const [wedding, setWedding] = useState<any>(null);

    // 2. UI Control State
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(20);

    // 3. Selection / Action State
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [editingGuest, setEditingGuest] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

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

    // Load initial data
    useEffect(() => {
        loadData();
    }, []);

    // Handle searching
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

    const exportCSV = async () => {
        const XLSX = await import("xlsx");
        const headers = ["នាម និង គោតមនាម", "អញ្ជើញមកពី"];
        const rows = guests.map(g => [g.name, g.source || g.group || "មិនបានបញ្ជាក់"]);
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        worksheet["!cols"] = [{ wpx: 250 }, { wpx: 200 }];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "បញ្ជីឈ្មោះភ្ញៀវ");
        XLSX.writeFile(workbook, "guest_list_formatted.xlsx");
    };

    const copyLink = (name: string, guestId: string) => {
        if (!wedding?.id) return;
        const link = `${window.location.origin}/invite/${wedding.id}?to=${encodeURIComponent(name)}&g=${guestId}`;
        navigator.clipboard.writeText(link);
        setCopiedId(guestId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const isArchived = wedding?.status === 'ARCHIVED';

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = ""; // Clear title to hide from browser print header
        window.print();
        document.title = originalTitle;
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        const previousGuests = [...guests];
        const newGuests = guests.filter(g => g.id !== deleteId);
        setGuests(newGuests);
        setFilteredGuests(newGuests);
        setDeleteId(null);

        try {
            const res = await fetch(`/api/guests?id=${deleteId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
        } catch (e) {
            console.error(e);
            setGuests(previousGuests);
            setFilteredGuests(previousGuests);
            alert("ការលុបមិនបានជោគជ័យ! សូមព្យាយាមម្ដងទៀត។");
        }
    };

    return (
        <div className="space-y-8 pb-10 print:p-0 print:m-0 print:bg-white print:text-black">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; }
                    body { 
                        padding: 0 1.5cm 1.5cm 1.5cm;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-family: 'Inter', 'Kantumruy Pro', sans-serif;
                    }
                }
            ` }} />

            {/* --- PRINT ONLY HEADER --- */}
            <div className="hidden print:block mb-8 text-center pt-[2cm]">
                <div className="flex justify-center mb-8">
                    <MoneaLogo showText size="xl" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black font-kantumruy tracking-tight">សេចក្តីសង្ខេប និងបញ្ជីរាយនាមភ្ញៀវ</h1>
                    {wedding?.groomName && wedding?.brideName && (
                        <p className="text-lg font-bold font-kantumruy text-gray-600">
                            អាពាហ៍ពិពាហ៍ {wedding.groomName} និង {wedding.brideName}
                        </p>
                    )}
                </div>
                <div className="w-32 h-1 bg-red-600 mx-auto mt-6 rounded-full opacity-20" />
            </div>

            {/* Header Area (Hidden in Print) */}
            <div className="flex flex-row justify-between items-center gap-3 print:hidden">
                <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-red-600 mb-0.5">
                        <Users size={10} />
                        Guest Management
                    </div>
                    <h2 className="text-xl md:text-3xl font-black tracking-tight text-foreground font-kantumruy leading-tight truncate">
                        បញ្ជីឈ្មោះភ្ញៀវ {isArchived && <span className="ml-1 text-red-600 text-xs">(ឯកសារ)</span>}
                    </h2>
                    <p className="text-muted-foreground font-medium font-kantumruy text-xs hidden md:block">
                        គ្រប់គ្រងបញ្ជីឈ្មោះភ្ញៀវ និងការផ្ញើតំណរភ្ជាប់អញ្ជើញ។
                    </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1.5">
                        {!isArchived && <GuestImport onSuccess={loadData} className="h-8 px-2.5 text-[10px] sm:h-9 sm:px-3 sm:text-[11px]" />}
                        <Button
                            variant="outline"
                            onClick={exportCSV}
                            className="h-8 px-2.5 sm:h-9 sm:px-3 border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl font-kantumruy font-bold transition-all text-[10px] sm:text-[11px]"
                        >
                            <Download className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" /> Excel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handlePrint}
                            className="h-8 px-2.5 sm:h-9 sm:px-3 border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl font-kantumruy font-bold transition-all text-[10px] sm:text-[11px]"
                        >
                            <Printer className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" /> PDF
                        </Button>
                    </div>
                    <div className="hidden sm:block">
                        {!isArchived && (
                            <Dialog open={open} onOpenChange={(v) => {
                                setOpen(v);
                                if (!v) setEditingGuest(null);
                            }}>
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={() => setEditingGuest(null)}
                                        className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-100 dark:shadow-none transition-all font-kantumruy font-bold"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> បន្ថែមភ្ញៀវ
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[480px] rounded-3xl border-none shadow-2xl bg-card p-4 pt-10 md:p-8 md:pt-14">
                                    <VisuallyHidden.Root>
                                        <DialogTitle>បន្ថែម/កែប្រែភ្ញៀវ (Add/Edit Guest)</DialogTitle>
                                        <DialogDescription>
                                            បំពេញព័ត៌មានភ្ញៀវ (Fill in guest details)
                                        </DialogDescription>
                                    </VisuallyHidden.Root>
                                    <div className="">
                                        <GuestForm
                                            initialData={editingGuest}
                                            onSuccess={loadData}
                                            onDone={() => { setOpen(false); setEditingGuest(null); }}
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
                        <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-sm bg-card">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black font-kantumruy">បញ្ជាក់ការលុប</DialogTitle>
                                <DialogDescription className="font-kantumruy">
                                    តើអ្នកពិតជាចង់លុបភ្ញៀវនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="ghost" onClick={() => setDeleteId(null)} className="rounded-xl font-kantumruy font-bold h-11 flex-1">
                                    បោះបង់
                                </Button>
                                <Button variant="destructive" onClick={confirmDelete} className="rounded-xl font-kantumruy font-bold h-11 flex-1 bg-red-600 hover:bg-red-700">
                                    លុប
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="bg-card rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)] overflow-hidden print:shadow-none print:rounded-none">
                <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center gap-4 print:hidden">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                            placeholder="ស្វែងរកតាមឈ្មោះ ឬទីតាំង..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-10 bg-muted border-transparent focus-visible:ring-red-600/20 rounded-xl font-kantumruy text-sm"
                        />
                    </div>
                    {filteredGuests.length > 0 && (
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest sm:ml-auto">
                            សរុប: {filteredGuests.length} នាក់
                        </div>
                    )}
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-2 p-3 print:hidden">
                    {/* Mobile Column Headers — CSS Grid aligned (matches desktop) */}
                    <div className="grid px-4 pb-1.5" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">ឈ្មោះភ្ញៀវ</span>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center opacity-50">មកពីណា / ទីតាំង</span>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right opacity-50">សកម្មភាព</span>
                    </div>
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <div className="w-8 h-8 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                            <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">កំពុងផ្ទុក...</span>
                        </div>
                    ) : filteredGuests.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-2 opacity-30">
                            <Users size={40} className="mb-2" />
                            <p className="font-kantumruy font-bold">មិនមានទិន្នន័យភ្ញៀវឡើយ</p>
                        </div>
                    ) : (
                        filteredGuests.slice(0, visibleCount).map((g: any) => (
                            <div key={g.id} className="bg-background rounded-2xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] grid items-center min-h-[52px]" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                                {/* Col 1: Name (left) */}
                                <div className="min-w-0 flex items-center">
                                    <span className="font-bold text-foreground font-kantumruy text-sm truncate leading-tight">{g.name}</span>
                                </div>

                                {/* Col 2: Location (center) */}
                                <div className="flex justify-center items-center">
                                    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-semibold truncate max-w-full text-center">
                                        {g.source || g.group || "ទូទៅ"}
                                    </span>
                                </div>

                                {/* Col 3: Actions (right — matches desktop) */}
                                <div className="flex items-center gap-2 justify-end">
                                    <Button
                                        variant={copiedId === g.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => copyLink(g.name, g.id)}
                                        className={cn(
                                            "h-8 px-3 rounded-xl font-kantumruy font-bold text-[10px] transition-all border-border",
                                            copiedId === g.id
                                                ? "bg-green-600 hover:bg-green-700 text-white border-transparent"
                                                : "text-muted-foreground hover:text-red-600 hover:border-red-100 dark:hover:border-red-900/50 hover:bg-muted/50"
                                        )}
                                    >
                                        {copiedId === g.id ? (
                                            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> ចំលង</span>
                                        ) : (
                                            <span className="flex items-center gap-1.5"><Copy size={12} /> ចំលងតំណរ</span>
                                        )}
                                    </Button>
                                    {!isArchived && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-muted rounded-xl"
                                                onClick={() => { setEditingGuest(g); setOpen(true); }}
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-muted rounded-xl"
                                                onClick={() => handleDelete(g.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {filteredGuests.length > visibleCount && (
                        <div className="pt-4 flex justify-center">
                            <Button
                                variant="outline"
                                onClick={() => setVisibleCount(prev => prev + 50)}
                                className="w-full h-12 rounded-2xl border-dashed border-2 border-border text-muted-foreground font-kantumruy font-bold hover:bg-muted/50"
                            >
                                <Plus size={16} className="mr-2" /> បង្ហាញបន្ថែម ({filteredGuests.length - visibleCount})
                            </Button>
                        </div>
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto print:block">
                    <Table className="print:text-black border-collapse print:border print:border-gray-200">
                        <TableHeader className="bg-muted/50 print:bg-gray-50 border-b border-border print:border-gray-200">
                            {/* Repeating spacer for subsequent pages */}
                            <TableRow className="hidden print:table-row border-none hover:bg-transparent">
                                <TableHead colSpan={3} className="h-[2cm] p-0 border-none" />
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-border">
                            {/* Column Titles - First Page Only */}
                            <TableRow className="border-none hover:bg-transparent hidden print:table-row">
                                <TableHead className="h-14 px-4 text-[10px] print:text-black print:font-bold font-black text-muted-foreground uppercase tracking-widest text-center w-16 border-r print:border-gray-200">ល.រ.</TableHead>
                                <TableHead className="h-14 px-8 text-[10px] print:text-black print:font-bold font-black text-muted-foreground uppercase tracking-widest border-r print:border-gray-200">
                                    នាម និង គោតមនាម
                                </TableHead>
                                <TableHead className="h-14 px-8 text-[10px] print:text-black print:font-bold font-black text-muted-foreground uppercase tracking-widest text-center border-r print:border-gray-200">
                                    អញ្ជើញមកពី
                                </TableHead>
                            </TableRow>

                            {/* Web Header Row (Hidden in Print) */}
                            <TableRow className="border-none hover:bg-transparent print:hidden">
                                <TableHead className="h-14 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center w-16 opacity-50 hidden print:table-cell">#</TableHead>
                                <TableHead className="h-14 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">
                                    ឈ្មោះភ្ញៀវ
                                </TableHead>
                                <TableHead className="h-14 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center opacity-50">
                                    មកពីណា / ទីតាំង
                                </TableHead>
                                <TableHead className="h-14 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right opacity-50">សកម្មភាព</TableHead>
                            </TableRow>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="p-8">
                                        <TableSkeleton />
                                    </TableCell>
                                </TableRow>
                            ) : filteredGuests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-64 text-center text-sm font-kantumruy font-bold text-muted-foreground/30">មិនមានទិន្នន័យភ្ញៀវឡើយ</TableCell>
                                </TableRow>
                            ) : (
                                filteredGuests.map((g: any, index: number) => (
                                    <TableRow
                                        key={g.id}
                                        className={cn(
                                            "border-none transition-colors group",
                                            index % 2 === 0 ? "bg-card" : "bg-muted/30",
                                            "print:bg-transparent print:border-b print:border-gray-100 print:even:bg-gray-50/30"
                                        )}
                                    >
                                        <TableCell className="hidden print:table-cell px-4 py-4 text-center border-r print:border-gray-200">
                                            <span className="font-bold text-foreground font-mono print:text-sm">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-8 py-4 print:border-r print:border-gray-200">
                                            <span className="font-bold text-foreground font-kantumruy text-sm">{g.name}</span>
                                        </TableCell>
                                        <TableCell className="px-8 py-4 text-center print:border-r print:border-gray-200">
                                            <span className="px-3 py-1 rounded-lg font-bold font-kantumruy text-[10px] bg-muted/60 dark:bg-white/5 text-muted-foreground print:bg-transparent print:text-sm print:text-black">
                                                {g.source || g.group || "ទូទៅ"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-8 py-4 text-right print:hidden">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant={copiedId === g.id ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => copyLink(g.name, g.id)}
                                                    className={cn(
                                                        "h-9 px-4 rounded-xl font-kantumruy font-bold text-[11px] transition-all",
                                                        copiedId === g.id ? "bg-green-600 text-white" : "text-muted-foreground"
                                                    )}
                                                >
                                                    {copiedId === g.id ? "ចម្លងរួច" : "ចម្លងតំណរ"}
                                                </Button>
                                                {!isArchived && (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => { setEditingGuest(g); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => handleDelete(g.id)}><Trash2 className="h-4 w-4" /></Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {filteredGuests.length > visibleCount && (
                        <div className="p-6 border-t border-border flex justify-center print:hidden">
                            <Button
                                variant="outline"
                                onClick={() => setVisibleCount(prev => prev + 50)}
                                className="w-full max-w-xs h-12 rounded-2xl border-dashed border-2 border-border text-muted-foreground font-kantumruy font-bold hover:bg-muted/50"
                            >
                                <Plus size={16} className="mr-2" /> បង្ហាញបន្ថែម ({filteredGuests.length - visibleCount})
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="hidden print:flex flex-col mb-10 pt-6 px-10 mt-12 font-kantumruy font-bold text-sm border-t border-gray-100">
                <div className="flex justify-between items-start italic opacity-60">
                    <div className="space-y-1">
                        <p suppressHydrationWarning className="text-gray-400 uppercase tracking-tight text-[10px]">Date of issue</p>
                        <p suppressHydrationWarning>{new Date().toLocaleDateString('km-KH')}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400 uppercase tracking-tight text-[10px]">Total Guests</p>
                        <p>សរុបអ្នកចូលរួម: {filteredGuests.length} នាក់</p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-gray-400 uppercase tracking-tight text-[10px]">Digitally Signed & Verified</p>
                        <p className="text-base text-gray-900">Monea Platform Official Report</p>
                    </div>
                </div>
                <div className="mt-20 text-center text-[10px] text-gray-300 uppercase tracking-[0.4em] font-normal">
                    End of Official Guest Record
                </div>
            </div>

            {/* Mobile Floating Action Button (FAB) */}
            {!isArchived && (
                <div className="md:hidden fixed bottom-28 right-6 z-40 print:hidden">
                    <Dialog open={open} onOpenChange={(v) => {
                        setOpen(v);
                        if (!v) setEditingGuest(null);
                    }}>
                        <DialogTrigger asChild>
                            <Button
                                className="w-14 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-[0_12px_40px_-8px_rgba(220,38,38,0.4)] flex items-center justify-center p-0 transition-all border-none"
                            >
                                <Plus size={28} strokeWidth={3} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[94vw] max-w-[480px] rounded-3xl border-none shadow-2xl p-4 pt-10 bg-card">
                            <VisuallyHidden.Root>
                                <DialogTitle>បន្ថែម/កែប្រែភ្ញៀវ (Add/Edit Guest - Mobile)</DialogTitle>
                                <DialogDescription>
                                    បំពេញព័ត៌មានភ្ញៀវ (Fill in guest details)
                                </DialogDescription>
                            </VisuallyHidden.Root>
                            <GuestForm
                                initialData={editingGuest}
                                onSuccess={loadData}
                                onDone={() => {
                                    setOpen(false);
                                    setEditingGuest(null);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    );
}

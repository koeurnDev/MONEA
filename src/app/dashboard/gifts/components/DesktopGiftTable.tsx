"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gift, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "../../_components/SkeletonComponents";

interface DesktopGiftTableProps {
    gifts: any[];
    loading: boolean;
    visibleCount: number;
    setVisibleCount: (count: number | ((prev: number) => number)) => void;
    sortConfig: { key: string; direction: string };
    toggleSort: (key?: string) => void;
    onAddClick: () => void;
    showGiftAmounts?: boolean;
}

export function DesktopGiftTable({
    gifts,
    loading,
    visibleCount,
    setVisibleCount,
    sortConfig,
    toggleSort,
    onAddClick,
    showGiftAmounts = true
}: DesktopGiftTableProps) {
    return (
        <div className="hidden md:block overflow-x-auto print:block">
            <Table className="print:border-collapse">
                <TableHeader className="bg-muted/50 print:bg-white">
                </TableHeader>
                <TableBody>
                    <TableRow className="border-none print:border-b-2 print:border-rose-100 hover:bg-transparent hidden print:table-row bg-rose-50/20">
                        <TableHead className="h-14 px-8 text-[10px] print:text-rose-600 font-black uppercase tracking-widest w-20 border-r print:border-rose-100/50">ល.រ</TableHead>
                        <TableHead className="h-14 px-8 text-[10px] print:text-rose-600 font-black uppercase tracking-widest border-r print:border-rose-100/50">ឈ្មោះភ្ញៀវ</TableHead>
                        <TableHead className="h-14 px-8 text-[10px] print:text-rose-600 font-black uppercase tracking-widest border-r print:border-rose-100/50">មកពីណា</TableHead>
                        <TableHead className="h-14 px-8 text-[10px] print:text-rose-600 font-black uppercase tracking-widest border-r print:border-rose-100/50">ចំនួនទឹកប្រាក់</TableHead>
                        <TableHead className="h-14 px-8 text-[10px] print:text-rose-600 font-black uppercase tracking-widest border-r print:border-rose-100/50">វិធីសាស្ត្រ</TableHead>
                        <TableHead className="h-14 px-8 text-[10px] print:text-rose-600 font-black uppercase tracking-widest text-center">កាលបរិច្ឆេទ</TableHead>
                    </TableRow>

                    <TableRow className="border-none print:hidden hover:bg-transparent">
                        <TableHead className="h-14 px-8 text-xs font-black text-muted-foreground uppercase tracking-widest w-20">No.</TableHead>
                        <TableHead className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/30">ឈ្មោះភ្ញៀវ</TableHead>
                        <TableHead
                            className="h-14 px-8 text-xs font-black text-muted-foreground uppercase tracking-widest cursor-pointer hover:text-foreground transition-colors group"
                            onClick={() => toggleSort('address')}
                        >
                            <div className="flex items-center gap-2">
                                មកពីណា
                                <span className={cn(
                                    "transition-colors",
                                    sortConfig.key === 'address' ? "text-rose-600" : "text-muted-foreground/30 group-hover:text-rose-300"
                                )}>
                                    {sortConfig.key === 'address' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                                </span>
                            </div>
                        </TableHead>
                        <TableHead className="h-14 px-8 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">ចំនួនទឹកប្រាក់</TableHead>
                        <TableHead className="h-14 px-8 text-xs font-black text-muted-foreground uppercase tracking-widest">វិធីសាស្ត្រ</TableHead>
                        <TableHead
                            className="h-14 px-8 text-xs font-black text-muted-foreground uppercase tracking-widest text-center cursor-pointer hover:text-foreground transition-colors select-none group"
                            onClick={() => toggleSort('createdAt')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                កាលបរិច្ឆេទ
                                <span className="text-muted-foreground/30 group-hover:text-rose-600 transition-colors">
                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                </span>
                            </div>
                        </TableHead>
                    </TableRow>

                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="p-8">
                                <TableSkeleton />
                            </TableCell>
                        </TableRow>
                    ) : gifts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="p-12">
                                <div className="max-w-md mx-auto bg-muted border-2 border-dashed border-border rounded-[2.5rem] p-10 text-center group hover:border-rose-200 dark:hover:border-rose-900/50 transition-all">
                                    <div className="w-20 h-20 bg-card shadow-sm rounded-full flex items-center justify-center text-muted-foreground/30 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <Gift className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-black text-foreground mb-2 font-kantumruy">មិនទាន់មានទិន្នន័យឡើយ</h3>
                                    <p className="text-muted-foreground mb-10 font-medium font-kantumruy">ចាប់ផ្តើមចំណងដៃដំបូងរបស់អ្នកដោយចុចប៊ូតុងខាងក្រោម។</p>

                                    <Button
                                        onClick={onAddClick}
                                        className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-12 px-10 font-bold shadow-lg shadow-rose-100 dark:shadow-none transition-all font-kantumruy"
                                    >
                                        កត់ត្រាឥឡូវនេះ
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        gifts.map((g, index) => (
                            <TableRow key={g.id} className="border-none print:border-gray-100 hover:bg-muted/50 transition-colors group">
                                <TableCell className="px-8 py-5 text-muted-foreground print:text-slate-900 font-bold font-kantumruy text-sm print:border-r print:border-gray-100 italic">
                                    {g.sequenceNumber || "-"}
                                </TableCell>
                                <TableCell className="px-8 py-5 print:border-r print:border-gray-100 max-w-[180px]">
                                    <span className="font-bold text-sm text-foreground font-kantumruy leading-tight truncate block">
                                        {g.guest?.name || <span className="text-muted-foreground/30 italic">មិនស្គាល់</span>}
                                    </span>
                                </TableCell>
                                <TableCell className="px-8 py-5 print:border-r print:border-rose-50/50 max-w-[140px]">
                                    <span className="text-sm font-bold text-muted-foreground print:text-slate-600 font-kantumruy truncate block">
                                        {g.guest?.group && g.guest.group !== "None" ? g.guest.group : (g.guest?.source && g.guest.source !== "GIFT_ENTRY" && g.guest.source !== "None" ? g.guest.source : <span className="opacity-40 italic">ទូទៅ</span>)}
                                    </span>
                                </TableCell>
                                <TableCell className="px-8 py-5 print:border-r print:border-gray-100 text-center">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-sm font-black tracking-tight shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none print:shadow-none print:bg-transparent print:text-slate-900 font-kantumruy inline-block min-w-[80px] text-center whitespace-nowrap",
                                        g.currency === "USD" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" : "bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-400"
                                    )}>
                                        {g.currency === "USD" ? "$" : "៛"} {showGiftAmounts ? g.amount.toLocaleString() : "****"}
                                    </span>
                                </TableCell>
                                <TableCell className="px-8 py-5 print:border-r print:border-gray-100">
                                    <span className="text-sm font-bold text-muted-foreground print:text-slate-900 uppercase tracking-widest bg-muted print:bg-transparent px-3 py-1 rounded-lg font-kantumruy">
                                        {g.method || "សាច់ប្រាក់"}
                                    </span>
                                </TableCell>
                                <TableCell className="px-8 py-5 text-center tabular-nums">
                                    <span className="text-sm font-bold text-foreground font-kantumruy whitespace-nowrap">
                                        {new Date(g.createdAt).toLocaleDateString("en-US", { month: '2-digit', day: '2-digit', year: 'numeric', timeZone: 'Asia/Phnom_Penh' })} {new Date(g.createdAt).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Phnom_Penh' })}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {!loading && gifts.length > visibleCount && (
                <div className="p-6 border-t border-border flex justify-center print:hidden">
                    <Button
                        variant="outline"
                        onClick={() => setVisibleCount(prev => prev + 50)}
                        className="w-full max-w-xs h-12 rounded-2xl border-dashed border-2 border-border text-muted-foreground font-kantumruy font-bold hover:bg-muted/50"
                    >
                        <Plus size={16} className="mr-2" /> បង្ហាញបន្ថែម ({gifts.length - visibleCount})
                    </Button>
                </div>
            )}
        </div>
    );
}

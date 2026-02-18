"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, UserCog, Lock, Eye, EyeOff, Sparkles, Shield, Key, UserPlus, Users, Copy, Check, QrCode as QrIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
// Force HMR rebuild due to stale state error

export default function StaffManagementPage() {
    const [staffList, setStaffList] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newStaffName, setNewStaffName] = useState("");
    const [newStaffEmail, setNewStaffEmail] = useState("");
    const [newStaffPassword, setNewStaffPassword] = useState("");
    const [createLoading, setCreateLoading] = useState(false);
    const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [qrStaff, setQrStaff] = useState<any | null>(null);

    function togglePinVisibility(id: string) {
        // Legacy: Toggle PIN visibility if it exists
        setVisiblePins(prev => ({ ...prev, [id]: !prev[id] }));
    }

    function copyLink(staff: any) {
        if (!staff.accessToken) return;
        const link = `${window.location.origin}/login?token=${staff.accessToken}`;
        navigator.clipboard.writeText(link);
        setCopiedId(staff.id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    useEffect(() => {
        fetchStaff();
    }, []);

    async function fetchStaff() {
        try {
            const res = await fetch("/api/staff");
            if (res.ok) {
                const data = await res.json();
                setStaffList(data.staff || []);
                setStaffList(data.staff || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateStaff() {
        if (!newStaffName || !newStaffEmail || !newStaffPassword) return;
        setCreateLoading(true);

        try {
            const res = await fetch("/api/staff", {
                method: "POST",
                body: JSON.stringify({
                    name: newStaffName,
                    email: newStaffEmail,
                    password: newStaffPassword
                }),
            });

            if (res.ok) {
                await fetchStaff();
                setIsDialogOpen(false);
                setNewStaffName("");
                setNewStaffEmail("");
                setNewStaffPassword("");
            } else {
                const data = await res.json();
                alert(data.error || "ការបង្កើតគណនីបានបរាជ័យ");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCreateLoading(false);
        }
    }

    async function handleDeleteStaff(id: string) {
        if (!confirm("តើអ្នកប្រាកដថាចង់លុបគណនីបុគ្គលិកនេះមែនទេ?")) return;
        try {
            await fetch("/api/staff?id=" + id, { method: "DELETE" });
            fetchStaff();
        } catch (e) {
            console.error(e);
        }
    }


    return (
        <div className="space-y-10 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-600 mb-1">
                        <UserPlus size={14} />
                        ACCESS MANAGEMENT
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 font-kantumruy">
                        គ្រប់គ្រងបុគ្គលិក
                    </h2>
                    <p className="text-slate-600 font-medium font-kantumruy text-base">
                        គ្រប់គ្រងអ្នកដែលជួយកត់ចំណងដៃ ឬស្កេនភ្ញៀវក្នុងពិធីរបស់អ្នក។
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-11 px-8 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-100 transition-all font-kantumruy font-bold">
                            <Plus className="mr-2 h-4 w-4" /> បន្ថែមបុគ្គលិក
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-4">
                            <DialogTitle className="text-2xl font-black font-kantumruy tracking-tight text-slate-900">បន្ថែមបុគ្គលិកថ្មី</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium font-kantumruy">
                                បង្កើតគណនីសម្រាប់អ្នកជួយការងារ។ ពួកគេនឹងប្រើ អ៊ីមែល និង ពាក្យសម្ងាត់ សម្រាប់ចូលប្រើ។
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-8 pt-4 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ឈ្មោះបុគ្គលិក</label>
                                <Input
                                    placeholder="ឧ. ហេង ប៊ុណ្ណា"
                                    value={newStaffName}
                                    onChange={(e) => setNewStaffName(e.target.value)}
                                    className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-kantumruy font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">អ៊ីមែល (សម្រាប់ចូលប្រើ)</label>
                                <Input
                                    placeholder="staff@example.com"
                                    value={newStaffEmail}
                                    onChange={(e) => setNewStaffEmail(e.target.value)}
                                    className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-kantumruy font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ពាក្យសម្ងាត់</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={newStaffPassword}
                                    onChange={(e) => setNewStaffPassword(e.target.value)}
                                    className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-kantumruy font-bold"
                                />
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-4">
                                <Shield className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                                <div className="text-[11px] text-slate-500 font-kantumruy leading-relaxed">
                                    <p className="font-black text-slate-900 uppercase tracking-widest mb-1">ព័ត៌មានសុវត្ថិភាព</p>
                                    <p>បុគ្គលិកម្នាក់ៗនឹងមាន PIN ផ្ទាល់ខ្លួនសម្រាប់សុវត្ថិភាពទិន្នន័យ។</p>
                                </div>
                            </div>

                            <Button
                                onClick={handleCreateStaff}
                                disabled={createLoading || !newStaffName || !newStaffEmail || !newStaffPassword}
                                className="w-full h-12 text-sm font-black uppercase tracking-widest font-kantumruy rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100 mt-4"
                            >
                                {createLoading ? "Loading..." : "យល់ព្រមបង្កើត"}
                            </Button>
                        </div>
                    </DialogContent>
                    {/* QR Code Dialog */}
                    <Dialog open={!!qrStaff} onOpenChange={(open) => !open && setQrStaff(null)}>
                        <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-8">
                            <DialogHeader>
                                <DialogTitle className="text-center text-xl font-black font-kantumruy">ស្កេនដើម្បីចូលប្រើ</DialogTitle>
                                <DialogDescription className="text-center font-kantumruy">
                                    សម្រាប់ {qrStaff?.name} Only
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-center p-6 bg-white rounded-2xl border-2 border-dashed border-slate-100">
                                {qrStaff?.accessToken && (
                                    <div className="p-2 bg-white rounded-lg">
                                        <QRCode
                                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/login?token=${qrStaff.accessToken}`}
                                            size={200}
                                        />
                                    </div>
                                )}
                            </div>
                            <p className="text-center text-xs text-slate-400 font-medium italic">
                                បុគ្គលិកអាចស្កេន QR នេះដើម្បីចូលប្រើដោយផ្ទាល់។
                            </p>
                        </DialogContent>
                    </Dialog>
                </Dialog>
            </div>



            {/* Content Area */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-50 hover:bg-transparent">
                                <TableHead className="h-14 px-8 text-sm font-bold text-slate-500 uppercase tracking-tight">ឈ្មោះ</TableHead>
                                <TableHead className="h-14 px-8 text-sm font-bold text-slate-500 uppercase tracking-tight">តួនាទី</TableHead>
                                <TableHead className="h-14 px-8 text-sm font-bold text-slate-500 uppercase tracking-tight">Email / PIN</TableHead>
                                <TableHead className="h-14 px-8 text-sm font-bold text-slate-500 uppercase tracking-tight text-right">សកម្មភាព</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">កំពុងផ្ទុក...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : staffList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="p-12">
                                        <div className="max-w-md mx-auto bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 text-center group hover:border-red-200 transition-all">
                                            <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                                                <UserCog className="w-10 h-10" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 mb-2 font-kantumruy">មិនទាន់មានបុគ្គលិក</h3>
                                            <p className="text-slate-500 mb-10 font-medium font-kantumruy">បន្ថែមបុគ្គលិកដើម្បីជួយសម្រួលការងាររបស់អ្នក។</p>

                                            <Button
                                                onClick={() => setIsDialogOpen(true)}
                                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-10 font-bold shadow-lg shadow-red-100 transition-all font-kantumruy"
                                            >
                                                បន្ថែមឥឡូវនេះ
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                staffList.map((staff) => (
                                    <TableRow key={staff.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                        <TableCell className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                                    {staff.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-black text-slate-900 font-kantumruy">{staff.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-8 py-5">
                                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight">
                                                {staff.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-8 py-5">
                                            {staff.email ? (
                                                <span className="font-bold text-slate-700 text-sm">{staff.email}</span>
                                            ) : (
                                                <div className="flex items-center gap-3 w-fit">
                                                    <span className="tracking-[0.2em] font-black font-mono text-slate-900 text-sm">
                                                        {visiblePins[staff.id] ? staff.pin : "••••••"}
                                                    </span>
                                                    <button
                                                        onClick={() => togglePinVisibility(staff.id)}
                                                        className="text-slate-300 hover:text-slate-900 transition-colors"
                                                    >
                                                        {visiblePins[staff.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </button>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-9 h-9 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    onClick={() => copyLink(staff)}
                                                    title="Copy Magic Link"
                                                >
                                                    {copiedId === staff.id ? <Check size={16} /> : <Copy size={16} />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-9 h-9 rounded-lg text-slate-300 hover:text-purple-600 hover:bg-purple-50 transition-all"
                                                    onClick={() => setQrStaff(staff)}
                                                    title="Show QR Code"
                                                >
                                                    <QrIcon size={16} />
                                                </Button>
                                                <div className="w-px h-4 bg-slate-200 mx-1" />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-9 h-9 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all"
                                                    onClick={() => handleDeleteStaff(staff.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div >
        </div >
    );
}

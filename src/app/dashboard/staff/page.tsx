"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, UserCog, Lock, Eye, EyeOff, Sparkles, Shield, Key, UserPlus, Users, Copy, Check, QrCode as QrIcon } from "lucide-react";
import { m, AnimatePresence } from 'framer-motion';
import QRCode from "react-qr-code";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TableSkeleton } from "../_components/SkeletonComponents";
import { useTranslation } from "@/i18n/LanguageProvider";

export default function StaffManagementPage() {
    const { t } = useTranslation();
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
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; staffId: string; staffName: string }>({
        open: false, staffId: "", staffName: ""
    });
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [createError, setCreateError] = useState("");

    function togglePinVisibility(id: string) {
        // Legacy: Toggle PIN visibility if it exists
        setVisiblePins(prev => ({ ...prev, [id]: !prev[id] }));
    }

    function copyLink(staff: any) {
        if (!staff.accessToken) return;
        const link = `${window.location.origin}/sign-in?token=${staff.accessToken}`;
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
                setCreateError(data.error || t("dashboard.staff.error.create"));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCreateLoading(false);
        }
    }

    async function handleDeleteStaff(id: string, name: string) {
        setDeleteConfirm({ open: true, staffId: id, staffName: name });
    }

    async function confirmDeleteStaff() {
        setDeleteLoading(true);
        try {
            await fetch("/api/staff?id=" + deleteConfirm.staffId, { method: "DELETE" });
            setDeleteConfirm({ open: false, staffId: "", staffName: "" });
            fetchStaff();
        } catch (e) {
            console.error(e);
        } finally {
            setDeleteLoading(false);
        }
    }


    return (
        <div className="space-y-10 pb-10">
            <ConfirmModal
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, staffId: "", staffName: "" })}
                onConfirm={confirmDeleteStaff}
                loading={deleteLoading}
                title={t("dashboard.staff.delete.title")}
                description={t("dashboard.staff.delete.description")}
                confirmLabel={t("dashboard.staff.delete.confirm")}
                detail={deleteConfirm.staffName}
                variant="danger"
            />
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-600 mb-1">
                        <UserPlus size={14} />
                        {t("dashboard.staff.accessManagement")}
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground font-kantumruy">
                        {t("dashboard.staff.title")}
                    </h2>
                    <p className="text-muted-foreground font-medium font-kantumruy text-base">
                        {t("dashboard.staff.subtitle")}
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-11 px-8 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all font-kantumruy font-bold">
                            <Plus className="mr-2 h-4 w-4" /> {t("dashboard.staff.addStaff")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-4">
                            <DialogTitle className="text-2xl font-black font-kantumruy tracking-tight text-foreground">{t("dashboard.staff.dialog.title")}</DialogTitle>
                            <DialogDescription className="text-muted-foreground font-medium font-kantumruy">
                                {t("dashboard.staff.dialog.description")}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-8 pt-4 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest ml-1">{t("dashboard.staff.dialog.nameLabel")}</label>
                                <Input
                                    placeholder={t("dashboard.staff.dialog.namePlaceholder")}
                                    value={newStaffName}
                                    onChange={(e) => setNewStaffName(e.target.value)}
                                    className="h-12 rounded-xl bg-muted/50 border-none shadow-sm focus:bg-background/80 transition-all font-kantumruy font-bold text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest ml-1">{t("dashboard.staff.dialog.emailLabel")}</label>
                                <Input
                                    placeholder={t("dashboard.staff.dialog.emailPlaceholder")}
                                    value={newStaffEmail}
                                    onChange={(e) => setNewStaffEmail(e.target.value)}
                                    className="h-12 rounded-xl bg-muted/50 border-none shadow-sm focus:bg-background/80 transition-all font-kantumruy font-bold text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest ml-1">{t("dashboard.staff.dialog.passwordLabel")}</label>
                                <Input
                                    type="password"
                                    placeholder={t("dashboard.staff.dialog.passwordPlaceholder")}
                                    value={newStaffPassword}
                                    onChange={(e) => setNewStaffPassword(e.target.value)}
                                    className="h-12 rounded-xl bg-muted/50 border-none shadow-sm focus:bg-background/80 transition-all font-kantumruy font-bold text-foreground"
                                />
                            </div>

                            <div className="p-4 bg-muted/30 rounded-2xl flex items-start gap-4">
                                <Shield className="w-5 h-5 text-muted-foreground/40 mt-0.5 shrink-0" />
                                <div className="text-[11px] text-muted-foreground font-kantumruy leading-relaxed">
                                    <p className="font-black text-foreground uppercase tracking-widest mb-1">{t("dashboard.staff.dialog.securityTitle")}</p>
                                    <p>{t("dashboard.staff.dialog.securityDesc")}</p>
                                </div>
                            </div>

                            <Button
                                onClick={handleCreateStaff}
                                disabled={createLoading || !newStaffName || !newStaffEmail || !newStaffPassword}
                                className="w-full h-12 text-sm font-black uppercase tracking-widest font-kantumruy rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md mt-4"
                            >
                                {createLoading ? t("dashboard.staff.dialog.creating") : t("dashboard.staff.dialog.submit")}
                            </Button>
                        </div>
                    </DialogContent>
                    {/* QR Code Dialog */}
                    <Dialog open={!!qrStaff} onOpenChange={(open) => !open && setQrStaff(null)}>
                        <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-8">
                            <DialogHeader>
                                <DialogTitle className="text-center text-xl font-black font-kantumruy">{t("dashboard.staff.dialog.qrTitle")}</DialogTitle>
                                <DialogDescription className="text-center font-kantumruy">
                                    {t("dashboard.staff.dialog.qrSubtitle", { name: qrStaff?.name })}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-center p-6 bg-white rounded-3xl shadow-inner">
                                {qrStaff?.accessToken && (
                                    <div className="p-2 bg-white rounded-lg">
                                        <QRCode
                                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/sign-in?token=${qrStaff.accessToken}`}
                                            size={200}
                                        />
                                    </div>
                                )}
                            </div>
                            <p className="text-center text-xs text-muted-foreground font-medium italic">
                                {t("dashboard.staff.dialog.qrFooter")}
                            </p>
                        </DialogContent>
                    </Dialog>
                </Dialog>
            </div>



            {/* Content Area */}
            <div className="bg-card rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.2)] overflow-hidden border-none">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="h-14 px-8 text-sm font-bold text-muted-foreground uppercase tracking-tight">{t("dashboard.staff.table.name")}</TableHead>
                                <TableHead className="h-14 px-8 text-sm font-bold text-muted-foreground uppercase tracking-tight">{t("dashboard.staff.table.role")}</TableHead>
                                <TableHead className="h-14 px-8 text-sm font-bold text-muted-foreground uppercase tracking-tight">{t("dashboard.staff.table.emailPin")}</TableHead>
                                <TableHead className="h-14 px-8 text-sm font-bold text-muted-foreground uppercase tracking-tight text-right">{t("dashboard.staff.table.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="p-8">
                                        <TableSkeleton />
                                    </TableCell>
                                </TableRow>
                            ) : staffList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="p-12">
                                        <div className="max-w-md mx-auto bg-muted/30 rounded-[2.5rem] p-10 text-center group hover:bg-muted/50 transition-all">
                                            <div className="w-20 h-20 bg-background shadow-sm rounded-full flex items-center justify-center text-muted-foreground/30 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                                                <UserCog className="w-10 h-10" />
                                            </div>
                                            <h3 className="text-xl font-black text-foreground mb-2 font-kantumruy">{t("dashboard.staff.table.empty.title")}</h3>
                                            <p className="text-muted-foreground mb-10 font-medium font-kantumruy">{t("dashboard.staff.table.empty.description")}</p>

                                            <Button
                                                onClick={() => setIsDialogOpen(true)}
                                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-10 font-bold shadow-md transition-all font-kantumruy"
                                            >
                                                {t("dashboard.staff.table.empty.button")}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                staffList.map((staff) => (
                                    <TableRow key={staff.id} className="border-none hover:bg-muted/10 transition-colors group">
                                        <TableCell className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-black text-sm group-hover:bg-red-50 dark:group-hover:bg-red-950/20 group-hover:text-red-600 transition-colors shadow-sm">
                                                    {staff.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-black text-foreground font-kantumruy">{staff.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-8 py-5">
                                            <span className="bg-muted text-muted-foreground px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight shadow-sm">
                                                {staff.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-8 py-5">
                                            {staff.email ? (
                                                <span className="font-bold text-foreground text-sm">{staff.email}</span>
                                            ) : (
                                                <div className="flex items-center gap-3 w-fit">
                                                    <span className="tracking-[0.2em] font-black font-mono text-foreground text-sm">
                                                        {visiblePins[staff.id] ? staff.pin : "••••••"}
                                                    </span>
                                                    <button
                                                        onClick={() => togglePinVisibility(staff.id)}
                                                        className="text-muted-foreground/40 hover:text-foreground transition-colors"
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
                                                    className="w-9 h-9 rounded-lg text-muted-foreground/40 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                                                    onClick={() => copyLink(staff)}
                                                    title={t("dashboard.staff.copyMagicLink")}
                                                >
                                                    {copiedId === staff.id ? <Check size={16} /> : <Copy size={16} />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-9 h-9 rounded-lg text-muted-foreground/40 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all"
                                                    onClick={() => setQrStaff(staff)}
                                                    title={t("dashboard.staff.showQrCode")}
                                                >
                                                    <QrIcon size={16} />
                                                </Button>
                                                <div className="w-px h-4 bg-muted-foreground/10 mx-1" />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-9 h-9 rounded-lg text-muted-foreground/40 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                                                    onClick={() => handleDeleteStaff(staff.id, staff.name)}
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

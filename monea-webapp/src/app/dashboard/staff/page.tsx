import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, UserCog, Lock, Eye, EyeOff, Sparkles, Shield, Key, UserPlus, Users, Copy, Check, QrCode as QrIcon } from "lucide-react";
import { m, AnimatePresence } from 'framer-motion';
import SafeQRCode from "@/components/ui/SafeQRCode";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TableSkeleton } from "../_components/SkeletonComponents";
import { useTranslation } from "@/i18n/LanguageProvider";
import { moneaClient } from "@/lib/api-client";

export default function StaffManagementPage() {
    const { t } = useTranslation();
    const [staffList, setStaffList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newStaffName, setNewStaffName] = useState("");
    const [newStaffEmail, setNewStaffEmail] = useState("");
    const [newStaffPassword, setNewStaffPassword] = useState("");
    const [showNewStaffPassword, setShowNewStaffPassword] = useState(false);
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
            const res = await moneaClient.get<any>("/api/staff");
            if (!res.error) {
                setStaffList(res.data?.staff || []);
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
            const res = await moneaClient.post<any>("/api/staff", {
                name: newStaffName,
                email: newStaffEmail,
                password: newStaffPassword
            });

            if (!res.error) {
                await fetchStaff();
                setIsDialogOpen(false);
                setNewStaffName("");
                setNewStaffEmail("");
                setNewStaffPassword("");
            } else {
                setCreateError(res.error || t("dashboard.staff.error.create"));
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
            await moneaClient.delete("/api/staff?id=" + deleteConfirm.staffId);
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
            <div className="flex flex-col md:flex-row justify-end items-end gap-6">
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
                                <div className="relative">
                                    <Input
                                        type={showNewStaffPassword ? "text" : "password"}
                                        placeholder={t("dashboard.staff.dialog.passwordPlaceholder")}
                                        value={newStaffPassword}
                                        onChange={(e) => setNewStaffPassword(e.target.value)}
                                        className="h-12 rounded-xl bg-muted/50 border-none shadow-sm focus:bg-background/80 transition-all font-kantumruy font-bold text-foreground pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewStaffPassword(!showNewStaffPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground/50 hover:text-foreground transition-colors"
                                    >
                                        {showNewStaffPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
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
                                        <SafeQRCode
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
            <div className="bg-card rounded-3xl sm:rounded-[2rem] shadow-sm border border-slate-200/80 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="h-12 sm:h-14 px-4 sm:px-8 text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-tight">{t("dashboard.staff.table.name")}</TableHead>
                                <TableHead className="h-12 sm:h-14 px-4 sm:px-8 text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-tight">{t("dashboard.staff.table.role")}</TableHead>
                                <TableHead className="h-12 sm:h-14 px-4 sm:px-8 text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-tight">{t("dashboard.staff.table.emailPin")}</TableHead>
                                <TableHead className="h-12 sm:h-14 px-4 sm:px-8 text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-tight text-right">{t("dashboard.staff.table.actions")}</TableHead>
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
                                    <TableCell colSpan={4} className="p-8 sm:p-12">
                                        <div className="max-w-md mx-auto bg-muted/30 rounded-3xl p-6 sm:p-10 text-center group hover:bg-muted/50 transition-all">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-background shadow-sm rounded-full flex items-center justify-center text-muted-foreground/30 mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500">
                                                <UserCog className="w-8 h-8 sm:w-10 sm:h-10" />
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-black text-foreground mb-2 font-kantumruy">{t("dashboard.staff.table.empty.title")}</h3>
                                            <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-10 font-medium font-kantumruy">{t("dashboard.staff.table.empty.description")}</p>

                                            <Button
                                                onClick={() => setIsDialogOpen(true)}
                                                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 px-8 font-bold shadow-md transition-all font-kantumruy text-xs"
                                            >
                                                {t("dashboard.staff.table.empty.button")}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                staffList.map((staff) => (
                                    <TableRow key={staff.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors group">
                                        <TableCell className="px-4 sm:px-8 py-3.5 sm:py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 font-bold text-xs shadow-xs flex-none">
                                                    {staff.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-foreground font-kantumruy text-xs sm:text-sm whitespace-nowrap">{staff.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 sm:px-8 py-3.5 sm:py-5">
                                            <span className="bg-muted text-muted-foreground px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-tight shadow-xs whitespace-nowrap">
                                                {staff.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 sm:px-8 py-3.5 sm:py-5">
                                            {staff.email ? (
                                                <span className="font-medium text-muted-foreground text-xs">{staff.email}</span>
                                            ) : (
                                                <div className="flex items-center gap-2 w-fit">
                                                    <span className="tracking-widest font-bold font-mono text-foreground text-xs">
                                                        {visiblePins[staff.id] ? staff.pin : "••••••"}
                                                    </span>
                                                    <button
                                                        onClick={() => togglePinVisibility(staff.id)}
                                                        className="text-muted-foreground/50 hover:text-foreground transition-colors p-1"
                                                    >
                                                        {visiblePins[staff.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                                                    </button>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 sm:px-8 py-3.5 sm:py-5 text-right">
                                            <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                                                    onClick={() => copyLink(staff)}
                                                    title={t("dashboard.staff.copyMagicLink")}
                                                >
                                                    {copiedId === staff.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all"
                                                    onClick={() => setQrStaff(staff)}
                                                    title={t("dashboard.staff.showQrCode")}
                                                >
                                                    <QrIcon size={14} />
                                                </Button>
                                                <div className="w-px h-3.5 bg-muted-foreground/20 mx-0.5" />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                                                    onClick={() => handleDeleteStaff(staff.id, staff.name)}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div >
    );
}

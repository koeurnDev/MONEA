"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, User, Save, ShieldAlert, Trash2, Heart, Clock, Mail, Fingerprint } from "lucide-react";
import { DeleteUserAdminDialog } from "../components/DeleteUserAdminDialog";
import { useToast } from "@/components/ui/Toast";

import { ROLES, ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function UserManagementPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [deleting, setDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        fetch(`/api/admin/users/${params.id}`)
            .then(res => {
                if (res.ok) {
                    res.json().then(result => {
                        setUser(result.data);
                        setSelectedRole(result.data.role);
                    });
                } else {
                    showToast({
                        title: "ចូលមិនបានសម្រេច",
                        description: "មិនអាចទាញយកព័ត៌មានអ្នកប្រើប្រាស់បានទេ។",
                        type: "info"
                    });
                    router.push("/admin/users");
                }
            })
            .catch(err => {
                console.error(err);
                router.push("/admin/users");
            })
            .finally(() => setLoading(false));
    }, [params.id, router, showToast]);

    const handleSaveRole = async () => {
        if (!user || user.role === selectedRole) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: selectedRole }),
            });

            if (res.ok) {
                showToast({
                    title: "ជោគជ័យ",
                    description: "តួនាទីរបស់អ្នកប្រើប្រាស់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ។",
                    type: "success"
                });
                setUser({ ...user, role: selectedRole });
            } else {
                const data = await res.json();
                showToast({
                    title: "បរាជ័យ",
                    description: data.error || "មិនអាចផ្លាស់ប្តូរតួនាទីបានទេ។",
                    type: "info"
                });
            }
        } catch (error) {
            showToast({ title: "Error", description: "An unexpected error occurred.", type: "info" });
        } finally {
            setSaving(false);
        }
    };

    const handleRestoreUser = async () => {
        if (!user) return;

        setSaving(true); // Reusing saving for restoration loading
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ restore: true }),
            });

            if (res.ok) {
                showToast({
                    title: "ជោគជ័យ",
                    description: "គណនីអ្នកប្រើប្រាស់ត្រូវបានយកមកវិញដោយជោគជ័យ។",
                    type: "success"
                });
                setUser({ ...user, deletedAt: null });
            } else {
                const data = await res.json();
                showToast({
                    title: "បរាជ័យ",
                    description: data.error || "មិនអាចយកគណនីមកវិញបានទេ។",
                    type: "info"
                });
            }
        } catch (error) {
            showToast({ title: "Error", description: "An unexpected error occurred.", type: "info" });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!user) return;
        
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                showToast({
                    title: "ជោគជ័យ",
                    description: "គណនីអ្នកប្រើប្រាស់ត្រូវបានផ្អាកបណ្ដោះអាសន្ន។",
                    type: "success"
                });
                const now = new Date().toISOString();
                setUser({ ...user, deletedAt: now });
                setDeleting(false);
                setShowDeleteDialog(false);
            } else {
                const data = await res.json();
                showToast({
                    title: "បរាជ័យ",
                    description: data.error || "មិនអាចផ្អាកគណនីបានទេ។",
                    type: "info"
                });
                setDeleting(false);
                setShowDeleteDialog(false);
            }
        } catch (error) {
            showToast({ title: "Error", description: "An unexpected error occurred.", type: "info" });
            setDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">កំពុងទាញយកទិន្នន័យ...</span>
            </div>
        );
    }

    if (!user) return null;

    const isPlatformOwner = user.role === ROLES.PLATFORM_OWNER;

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <Button
                    variant="ghost"
                    className="w-fit text-slate-500 hover:text-red-600 p-0 hover:bg-transparent -ml-2 gap-2 transition-colors font-bold uppercase text-[10px] tracking-widest"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={14} /> Back to Users
                </Button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-card border border-border p-8 rounded-[2.5rem] shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-red-600/10" />
                    
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-xl shadow-red-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <User size={40} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black tracking-tight text-foreground font-kantumruy">គ្រប់គ្រងគណនី</h2>
                            <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs bg-muted/50 px-3 py-1 rounded-full w-fit">
                                <Mail size={12} />
                                {user.email}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 relative z-10">
                        {user.deletedAt ? (
                            <Badge className="bg-red-600 text-white border-red-600 px-4 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase shadow-lg shadow-red-500/20 animate-pulse">
                                DEACTIVATED
                            </Badge>
                        ) : (
                            <Badge className={cn(
                                "px-4 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase border shadow-sm",
                                isPlatformOwner
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : user.role === ROLES.EVENT_MANAGER
                                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            )}>
                                {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                            </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">ID: {user.id}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Settings Box */}
                    <div className="bg-card rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600 opacity-50" />
                        <h3 className="text-xl font-black text-foreground font-kantumruy mb-8 flex items-center gap-3">
                            <Fingerprint size={24} className="text-red-500" />
                            ការកំណត់តួនាទី (Role Settings)
                        </h3>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-foreground/80 font-kantumruy flex items-center gap-2">
                                    តួនាទីអ្នកប្រើប្រាស់
                                </label>

                                {isPlatformOwner ? (
                                    <div className="flex items-start gap-4 p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10">
                                        <ShieldAlert size={20} className="text-amber-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-amber-900/80 font-kantumruy uppercase tracking-tight">Access Restricted</p>
                                            <p className="text-xs font-medium text-amber-700/80 font-kantumruy leading-relaxed">
                                                អ្នកមិនអាចផ្លាស់ប្តូរតួនាទីរបស់ {ROLE_LABELS[ROLES.PLATFORM_OWNER]} ផ្សេងទៀតបានទេ។ នេះគឺជាវិធានការសុវត្ថិភាពខ្ពស់បំផុត។
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 p-2 bg-muted/30 rounded-[2rem] border border-border/50">
                                        <div className="flex-1">
                                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                                <SelectTrigger className="h-14 rounded-2xl border-none bg-transparent shadow-none focus:ring-0 text-base font-bold">
                                                    <SelectValue placeholder="ជ្រើសរើសតួនាទី" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-border shadow-2xl">
                                                    <SelectItem value={ROLES.EVENT_MANAGER} className="rounded-xl focus:bg-red-50 font-bold">{ROLE_LABELS[ROLES.EVENT_MANAGER]}</SelectItem>
                                                    <SelectItem value={ROLES.EVENT_STAFF} className="rounded-xl focus:bg-blue-50 font-bold">{ROLE_LABELS[ROLES.EVENT_STAFF]}</SelectItem>
                                                    <SelectItem value={ROLES.PLATFORM_OWNER} disabled className="opacity-50">
                                                        {ROLE_LABELS[ROLES.PLATFORM_OWNER]} (Restricted)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            onClick={handleSaveRole}
                                            disabled={saving || selectedRole === user.role}
                                            className="h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-kantumruy font-black gap-2 px-8 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                                        >
                                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            រក្សាទុក
                                        </Button>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Event Manager</p>
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-tight">អាចគ្រប់គ្រងមង្គលការ និងភ្ញៀវទាំងអស់។</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Event Staff</p>
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-tight">ស្កេនសំបុត្រ និងកត់ត្រាអំណោយប៉ុណ្ណោះ។</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Associated Weddings */}
                    <div className="bg-card rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden">
                        <h3 className="text-xl font-black text-foreground font-kantumruy mb-8 flex items-center justify-between">
                            <span className="flex items-center gap-3">
                                <Heart size={24} className="text-rose-500" />
                                មង្គលការរបស់គណនីនេះ
                            </span>
                            <Badge variant="secondary" className="bg-muted text-foreground px-3 py-1 rounded-lg text-sm font-bold">{user.weddings?.length || 0}</Badge>
                        </h3>

                        {user.weddings && user.weddings.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {user.weddings.map((w: any) => (
                                    <div 
                                        key={w.id} 
                                        className="p-6 rounded-3xl border border-border flex items-center justify-between hover:border-red-500/30 hover:bg-red-500/5 transition-all group cursor-pointer active:scale-[0.99] shadow-sm hover:shadow-md" 
                                        onClick={() => router.push(`/admin/weddings/${w.id}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-border group-hover:bg-red-500 group-hover:text-white transition-colors shadow-sm">
                                                <Heart size={20} />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-lg font-black text-foreground font-kantumruy transition-colors">
                                                    {w.groomName} & {w.brideName}
                                                </span>
                                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">CODE: {w.weddingCode || "N/A"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline" className={cn(
                                                "uppercase tracking-widest text-[10px] font-black px-3 py-1 rounded-full",
                                                w.status === "ACTIVE" ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10" : "border-border text-muted-foreground bg-muted/50"
                                            )}>
                                                {w.status}
                                            </Badge>
                                            <ArrowLeft size={16} className="rotate-180 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-16 text-center bg-muted/20 rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground opacity-50">
                                    <Heart size={32} />
                                </div>
                                <p className="text-sm font-kantumruy text-muted-foreground font-bold">គណនីនេះមិនទាន់មានមង្គលការនៅឡើយទេ</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm">
                        <h3 className="text-xs font-black text-muted-foreground font-kantumruy mb-6 uppercase tracking-widest">System Metadata</h3>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                                    <Clock size={14} className="text-slate-500" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Joined At</label>
                                    <p className="text-sm font-bold text-foreground/80">{new Date(user.createdAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono">{new Date(user.createdAt).toLocaleTimeString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                                    <Fingerprint size={14} className="text-slate-500" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {user.deletedAt ? (
                                            <>
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                                <span className="text-xs font-black text-red-600 bg-red-500/10 px-2 py-0.5 rounded-lg">DEACTIVATED</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="text-xs font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-lg">ACTIVE</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Zone (Recovery/Danger) */}
                    <div className={cn(
                        "rounded-[2.5rem] border p-8 shadow-2xl transition-all duration-500",
                        user.deletedAt 
                            ? "bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20" 
                            : "bg-white border-red-100 shadow-red-500/5 dark:bg-slate-900 dark:border-red-950/30"
                    )}>
                        <h3 className={cn(
                            "text-base font-black font-kantumruy mb-4 flex items-center gap-2",
                            user.deletedAt ? "text-white" : "text-red-600"
                        )}>
                            {user.deletedAt ? <Clock size={18} /> : <ShieldAlert size={18} />}
                            {user.deletedAt ? "Recovery Zone" : "Danger Zone"}
                        </h3>
                        
                        <p className={cn(
                            "text-xs mb-6 font-medium leading-relaxed font-kantumruy",
                            user.deletedAt ? "text-white/80" : "text-muted-foreground"
                        )}>
                            {user.deletedAt 
                                ? "គណនីនេះត្រូវបានផ្អាក។ អ្នកអាចយកវាត្រឡប់មកប្រើប្រាស់វិញបានគ្រប់ពេលមុន ៣០ ថ្ងៃ។" 
                                : "ការលុបគណនីនឹងផ្អាកការប្រើប្រាស់រយៈពេល ៣០ ថ្ងៃ។ បន្ទាប់ពីរយៈពេលនេះ ទិន្នន័យនឹងត្រូវលុបចោលទាំងស្រុង។"}
                        </p>

                        {user.deletedAt ? (
                            <Button 
                                className="w-full rounded-2xl font-black font-kantumruy text-sm h-14 bg-white text-emerald-600 hover:bg-slate-50 shadow-xl shadow-black/10 active:scale-95 transition-all gap-2"
                                onClick={handleRestoreUser}
                                disabled={saving}
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                យកគណនីមកវិញ (RESTORE)
                            </Button>
                        ) : (
                            <Button 
                                variant="destructive" 
                                className="w-full rounded-2xl font-black font-kantumruy text-sm h-14 bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-500/20 active:scale-95 transition-all gap-2"
                                onClick={() => setShowDeleteDialog(true)}
                                disabled={deleting || isPlatformOwner}
                            >
                                <Trash2 size={18} />
                                លុបគណនីអ្នកប្រើប្រាស់
                            </Button>
                        )}
                        
                        {!user.deletedAt && isPlatformOwner && (
                            <p className="text-[10px] text-center mt-4 text-muted-foreground font-bold uppercase tracking-widest opacity-50 italic">
                                Cannot delete Platform Owners
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <DeleteUserAdminDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDeleteUser}
                isDeleting={deleting}
                userEmail={user.email}
            />
        </div>
    );
}

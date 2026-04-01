"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, Users, Globe, Search, Filter, Mail, User, ShieldAlert, Save, Trash2, ArrowRight, Clock, Fingerprint } from "lucide-react";

import { ROLES, ROLE_LABELS } from "@/lib/constants";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeleteUserAdminDialog } from "./components/DeleteUserAdminDialog";
import { useToast } from "@/components/ui/Toast";

export default function AdminUsersPage() {
    const { showToast } = useToast();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [savingRole, setSavingRole] = useState(false);
    const [deletingUser, setDeletingUser] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetch("/api/admin/users?t=" + Date.now()).then(res => {
            if (res.ok) res.json().then(result => setUsers(result.data || []));
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (!selectedUserId) {
            setSelectedUserDetails(null);
            return;
        }

        setLoadingDetails(true);
        fetch(`/api/admin/users/${selectedUserId}?t=` + Date.now())
            .then(res => {
                if (res.ok) {
                    res.json().then(result => {
                        setSelectedUserDetails(result.data);
                        setSelectedRole(result.data.role);
                    });
                } else {
                    showToast({
                        title: "ចូលមិនបានសម្រេច",
                        description: "មិនអាចទាញយកព័ត៌មានអ្នកប្រើប្រាស់បានទេ។",
                        type: "info"
                    });
                    setSelectedUserId(null);
                }
            })
            .catch(err => {
                console.error(err);
                setSelectedUserId(null);
            })
            .finally(() => setLoadingDetails(false));
    }, [selectedUserId, showToast]);

    const handleSaveRole = async () => {
        if (!selectedUserDetails || selectedUserDetails.role === selectedRole) return;

        setSavingRole(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUserDetails.id}`, {
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
                setSelectedUserDetails({ ...selectedUserDetails, role: selectedRole });
                setUsers(prev => prev.map(u => u.id === selectedUserDetails.id ? { ...u, role: selectedRole } : u));
            } else {
                const data = await res.json();
                showToast({
                    title: "បរាជ័យ",
                    description: data.error || "មិនអាចផ្លាស់ប្តូរតួនាទីបានទេ។",
                    type: "info"
                });
            }
        } catch (error) {
            showToast({ title: "Error", description: "Unexpected error while saving role.", type: "info" });
        } finally {
            setSavingRole(false);
        }
    };
    
    const handleDeleteUser = async () => {
        if (!selectedUserDetails) return;

        setDeletingUser(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUserDetails.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                showToast({
                    title: "ជោគជ័យ",
                    description: "គណនីអ្នកប្រើប្រាស់ត្រូវបានផ្អាកបណ្ដោះអាសន្ន។",
                    type: "success"
                });
                const now = new Date().toISOString();
                setUsers(prev => prev.map(u => u.id === selectedUserDetails.id ? { ...u, deletedAt: now } : u));
                setSelectedUserDetails({ ...selectedUserDetails, deletedAt: now });
                setDeletingUser(false);
                setShowDeleteDialog(false);
            } else {
                const data = await res.json();
                showToast({
                    title: "បរាជ័យ",
                    description: data.error || "មិនអាចផ្អាកគណនីបានទេ។",
                    type: "info"
                });
                setDeletingUser(false);
                setShowDeleteDialog(false);
            }
        } catch (error) {
            showToast({ title: "Error", description: "Unexpected error during deletion.", type: "info" });
            setDeletingUser(false);
            setShowDeleteDialog(false);
        }
    };

    const handleRestoreUser = async () => {
        if (!selectedUserDetails) return;

        setSavingRole(true); 
        try {
            const res = await fetch(`/api/admin/users/${selectedUserDetails.id}`, {
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
                setUsers(prev => prev.map(u => u.id === selectedUserDetails.id ? { ...u, deletedAt: null } : u));
                setSelectedUserDetails({ ...selectedUserDetails, deletedAt: null });
            } else {
                const data = await res.json();
                showToast({
                    title: "បរាជ័យ",
                    description: data.error || "មិនអាចយកគណនីមកវិញបានទេ។",
                    type: "info"
                });
            }
        } catch (error) {
            showToast({ title: "Error", description: "Unexpected error during restoration.", type: "info" });
        } finally {
            setSavingRole(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-1">
                        <Users size={14} />
                        PLATFORM CORE
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-foreground font-kantumruy">គ្រប់គ្រងអ្នកប្រើប្រាស់</h2>
                    <p className="text-muted-foreground font-medium font-kantumruy text-sm max-w-xl">មើល និងគ្រប់គ្រងគណនីប្តីប្រពន្ធទាំងអស់ដែលប្រើប្រាស់ប្រព័ន្ធ MONEA ។ អ្នកអាចកែប្រែតួនាទី ឬផ្អាកគណនីបណ្ដោះអាសន្ន។</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-red-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="ស្វែងរកអ៊ីមែល ឬឈ្មោះ..."
                            className="h-14 pl-12 pr-6 rounded-[1.25rem] border border-border bg-card focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/20 transition-all font-kantumruy font-bold text-sm w-full md:w-[300px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-14 w-14 rounded-[1.25rem] border-border bg-card text-muted-foreground hover:bg-slate-50 transition-all"
                    >
                        <Filter size={20} />
                    </Button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-2xl shadow-black/[0.02]">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest px-8 py-6">User/Identity</TableHead>
                            <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Role</TableHead>
                            <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest text-center">Weddings</TableHead>
                            <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Groom & Bride</TableHead>
                            <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Joined Date</TableHead>
                            <TableHead className="text-right text-muted-foreground font-black uppercase text-[10px] tracking-widest px-8">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                        <Users size={48} />
                                        <p className="font-kantumruy font-black uppercase text-xs tracking-widest">មិនឃើញមានអ្នកប្រើប្រាស់ឡើយ</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.map((user) => (
                            <TableRow key={user.id} className="border-border/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all group">
                                <TableCell className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-500 group-hover:from-red-500 group-hover:to-rose-600 group-hover:text-white transition-all duration-500">
                                            <User size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground font-mono text-xs">{user.email}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">ID: {user.id.substring(0, 8)}...</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={cn(
                                        "px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border whitespace-nowrap shadow-sm",
                                        user.deletedAt
                                            ? "bg-slate-100 text-slate-400 border-slate-200 shadow-none"
                                            : user.role === ROLES.PLATFORM_OWNER
                                                ? "bg-foreground text-background border-foreground"
                                                : user.role === ROLES.EVENT_MANAGER
                                                    ? "bg-red-500/10 text-red-600 border-red-500/20"
                                                    : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                    )}>
                                        {user.deletedAt ? "SUSPENDED" : (ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-xs font-black text-foreground border border-border">
                                        {user.weddings?.length || 0}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {user.role === ROLES.PLATFORM_OWNER ? (
                                        <span className="text-muted-foreground/50 italic text-[10px] font-kantumruy font-bold uppercase tracking-widest">N/A (System)</span>
                                    ) : user.weddings && user.weddings[0] ? (
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs text-foreground font-black font-kantumruy">
                                                {user.weddings[0].groomName} & {user.weddings[0].brideName}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">+{user.weddings.length - 1} other(s)</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground/50 italic text-[10px] font-kantumruy font-bold uppercase tracking-widest">N/A</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-foreground/80 font-bold font-mono">{new Date(user.createdAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono opacity-50">{new Date(user.createdAt).toLocaleTimeString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right px-8">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-xl hover:bg-red-50 hover:text-red-700 transition-all font-kantumruy text-xs font-black uppercase tracking-widest h-10 px-4 group/btn"
                                        onClick={() => setSelectedUserId(user.id)}
                                    >
                                        Manage
                                        <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Management Dialog */}
            <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
                <DialogContent className="max-w-[850px] p-0 overflow-hidden bg-background border border-border shadow-2xl rounded-[3rem] max-h-[90vh] flex flex-col">
                    <DialogTitle className="sr-only">គ្រប់គ្រងអ្នកប្រើប្រាស់</DialogTitle>
                    <DialogDescription className="sr-only">ផ្លាស់ប្តូរតួនាទី និងលេខសម្ងាត់របស់អ្នកប្រើប្រាស់។</DialogDescription>

                    {loadingDetails ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-6">
                            <div className="relative w-12 h-12">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                                <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">កំពុងទាញយកទិន្នន័យ...</span>
                        </div>
                    ) : selectedUserDetails && (
                        <div className="flex-1 overflow-y-auto">
                            {/* Modal Header */}
                            <div className="p-10 pb-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl -mr-32 -mt-32" />
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/20 rotate-3">
                                            <User size={36} strokeWidth={2.5} />
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-black tracking-tight text-foreground font-kantumruy">គ្រប់គ្រងគណនី</h2>
                                            <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm bg-background border border-border px-4 py-1.5 rounded-2xl w-fit">
                                                <Mail size={12} />
                                                {selectedUserDetails.email}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-2">
                                        {selectedUserDetails.deletedAt ? (
                                            <Badge className="bg-red-600 text-white border-red-600 px-4 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase animate-pulse shadow-lg shadow-red-500/20">
                                                SUSPENDED
                                            </Badge>
                                        ) : (
                                            <Badge className={cn(
                                                "px-4 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase border shadow-sm",
                                                selectedUserDetails.role === ROLES.PLATFORM_OWNER
                                                    ? "bg-slate-900 text-white border-slate-900"
                                                    : selectedUserDetails.role === ROLES.EVENT_MANAGER
                                                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                                                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                            )}>
                                                {ROLE_LABELS[selectedUserDetails.role as keyof typeof ROLE_LABELS] || selectedUserDetails.role}
                                            </Badge>
                                        )}
                                        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">UID: {selectedUserDetails.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                                {/* Left Side: Settings */}
                                <div className="md:col-span-2 space-y-8">
                                    {/* Role Configuration */}
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black text-foreground font-kantumruy uppercase tracking-widest flex items-center gap-2">
                                            <Fingerprint size={16} className="text-red-500" />
                                            Role Configuration
                                        </h3>
                                        
                                        <div className="p-8 rounded-[2rem] border border-border bg-card shadow-sm">
                                            <div className="space-y-4">
                                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Select Permission Level</label>
                                                
                                                {selectedUserDetails.role === ROLES.PLATFORM_OWNER ? (
                                                    <div className="flex items-start gap-4 p-5 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                                                        <ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                                        <p className="text-xs font-bold text-amber-900/70 font-kantumruy leading-relaxed">
                                                            គណនី PLATFORM OWNER គឺជាកម្រិតខ្ពស់បំផុត។ អ្នកមិនអាចផ្លាស់ប្តូរតួនាទីនេះបានឡើយសម្រាប់សុវត្ថិភាព។
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col sm:flex-row items-stretch gap-3">
                                                        <div className="flex-1">
                                                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                                                <SelectTrigger className="h-14 rounded-2xl border-border bg-slate-50/50 focus:ring-0 text-sm font-bold px-6">
                                                                    <SelectValue placeholder="ជ្រើសរើសតួនាទី" />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-2xl border-border shadow-2xl">
                                                                    <SelectItem value={ROLES.EVENT_MANAGER} className="rounded-xl font-bold">{ROLE_LABELS[ROLES.EVENT_MANAGER]}</SelectItem>
                                                                    <SelectItem value={ROLES.EVENT_STAFF} className="rounded-xl font-bold">{ROLE_LABELS[ROLES.EVENT_STAFF]}</SelectItem>
                                                                    <SelectItem value={ROLES.PLATFORM_OWNER} disabled className="opacity-50">
                                                                        {ROLE_LABELS[ROLES.PLATFORM_OWNER]} (Restricted)
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <Button
                                                            onClick={handleSaveRole}
                                                            disabled={savingRole || selectedRole === selectedUserDetails.role}
                                                            className="h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-kantumruy font-black gap-2 px-8 min-w-[120px] transition-all active:scale-95"
                                                        >
                                                            {savingRole ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                            Save
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Linked Data */}
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black text-foreground font-kantumruy uppercase tracking-widest flex items-center gap-2">
                                            <Globe size={16} className="text-blue-500" />
                                            Linked Weddings
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {selectedUserDetails.weddings && selectedUserDetails.weddings.length > 0 ? (
                                                selectedUserDetails.weddings.map((w: any) => (
                                                    <div 
                                                        key={w.id} 
                                                        className="p-5 rounded-2xl border border-border flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                                                        onClick={() => window.location.href = `/admin/weddings/${w.id}`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-blue-500 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                                <Globe size={16} strokeWidth={2.5} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black text-foreground font-kantumruy">
                                                                    {w.groomName} & {w.brideName}
                                                                </span>
                                                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{w.weddingCode || w.id.substring(0, 8)}</span>
                                                            </div>
                                                        </div>
                                                        <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-12 text-center bg-slate-50 rounded-[2rem] border border-dashed border-border opacity-50">
                                                    <p className="text-xs font-bold font-kantumruy uppercase tracking-widest">No Weddings Found</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Actions & Info */}
                                <div className="space-y-6">
                                    <div className="p-6 rounded-[2rem] border border-border bg-slate-50/50 space-y-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Clock size={16} className="text-muted-foreground" />
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Joined At</p>
                                                    <p className="text-xs font-bold">{new Date(selectedUserDetails.createdAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Fingerprint size={16} className="text-muted-foreground" />
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Status</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {selectedUserDetails.deletedAt ? (
                                                            <span className="text-[10px] font-black text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/10">SUSPENDED</span>
                                                        ) : (
                                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10">ACTIVE</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Zone */}
                                    <div className={cn(
                                        "p-6 rounded-[2rem] border transition-all duration-500",
                                        selectedUserDetails.deletedAt 
                                            ? "bg-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-600/20" 
                                            : "bg-white border-red-100 shadow-xl shadow-red-600/5 dark:bg-slate-900 dark:border-red-950/20"
                                    )}>
                                        <h3 className={cn(
                                            "text-xs font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2",
                                            selectedUserDetails.deletedAt ? "text-white" : "text-red-600"
                                        )}>
                                            {selectedUserDetails.deletedAt ? <Clock size={14} /> : <ShieldAlert size={14} />}
                                            {selectedUserDetails.deletedAt ? "Account Recovery" : "Security Actions"}
                                        </h3>
                                        <p className={cn(
                                            "text-[10px] font-bold font-kantumruy leading-relaxed mb-6",
                                            selectedUserDetails.deletedAt ? "text-white/80" : "text-muted-foreground"
                                        )}>
                                            {selectedUserDetails.deletedAt 
                                                ? "គណនីនេះត្រូវបានផ្អាក។ អ្នកអាចយកវាត្រឡប់មកប្រើប្រាស់វិញបានគ្រប់ពេលមុន ៣០ ថ្ងៃ។" 
                                                : "ការលុបគណនីនឹងផ្អាកការប្រើប្រាស់រយៈពេល ៣០ ថ្ងៃមុននឹងត្រូវលុបជាស្ថាពរ។"}
                                        </p>

                                        {selectedUserDetails.deletedAt ? (
                                            <Button 
                                                className="w-full rounded-2xl font-black font-kantumruy text-[10px] tracking-widest h-14 bg-white text-emerald-700 hover:bg-slate-50 transition-all uppercase shadow-lg shadow-black/10 active:scale-95"
                                                onClick={handleRestoreUser}
                                                disabled={savingRole}
                                            >
                                                {savingRole ? <Loader2 size={16} className="animate-spin" /> : "RESTORE ACCOUNT"}
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="destructive" 
                                                className="w-full rounded-2xl font-black font-kantumruy text-[10px] tracking-widest h-14 bg-red-600 hover:bg-red-700 transition-all uppercase shadow-lg shadow-red-600/20 active:scale-95"
                                                onClick={() => setShowDeleteDialog(true)}
                                                disabled={deletingUser || selectedUserDetails.role === ROLES.PLATFORM_OWNER}
                                            >
                                                SUSPEND ACCOUNT
                                            </Button>
                                        )}
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="w-full h-12 rounded-2xl border-border font-black uppercase tracking-widest text-[10px] opacity-40 hover:opacity-100 transition-all"
                                        onClick={() => window.location.href = `/admin/users/${selectedUserDetails.id}`}
                                    >
                                        Open Full View
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <DeleteUserAdminDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDeleteUser}
                isDeleting={deletingUser}
                userEmail={selectedUserDetails?.email || ""}
            />
        </div>
    );
}

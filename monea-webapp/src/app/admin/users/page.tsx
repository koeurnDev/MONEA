import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users, Search, Filter, User, ArrowRight } from "lucide-react";

import { ROLES, ROLE_LABELS } from "@/lib/constants";
import { DeleteUserAdminDialog } from "./components/DeleteUserAdminDialog";
import { UserDetailsDialog } from "./components/UserDetailsDialog";
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

    // Fetch All Users
    useEffect(() => {
        fetch("/api/admin/users", { cache: "no-store" }) // Use native cache control
            .then(res => {
                if (res.ok) {
                    res.json().then(result => setUsers(result.data || []));
                }
            })
            .catch(err => console.error("Failed to fetch users:", err))
            .finally(() => setLoading(false));
    }, []);

    // Fetch User Details
    useEffect(() => {
        if (!selectedUserId) {
            setSelectedUserDetails(null);
            return;
        }

        setLoadingDetails(true);
        fetch(`/api/admin/users/${selectedUserId}`, { cache: "no-store" })
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
            } else {
                const data = await res.json();
                showToast({
                    title: "បរាជ័យ",
                    description: data.error || "មិនអាចផ្អាកគណនីបានទេ។",
                    type: "info"
                });
            }
        } catch (error) {
            showToast({ title: "Error", description: "Unexpected error during deletion.", type: "info" });
        } finally {
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
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-rose-500 border-x-transparent border-b-transparent animate-spin" />
                </div>
                <span className="text-slate-400 dark:text-slate-500 text-sm font-kantumruy">កំពុងទាញយក...</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500 dark:text-blue-400 mb-1">User Management</p>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-kantumruy tracking-tight">អ្នកប្រើប្រាស់</h2>
                </div>

                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="ស្វែងរកអ្នកប្រើ..."
                        className="h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-kantumruy text-sm w-full md:w-[260px] placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40">
                        <TableRow className="border-b border-slate-200/80 dark:border-slate-700/50 hover:bg-transparent">
                            <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider px-5 py-3.5 font-kantumruy">អ្នកប្រើប្រាស់</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider font-kantumruy">តួនាទី</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider text-center font-kantumruy">ការងារ</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider font-kantumruy">ឈ្មោះ</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider font-kantumruy">ថ្ងៃចូល</TableHead>
                            <TableHead className="text-right text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider px-5"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                        <Users size={40} />
                                        <p className="font-kantumruy font-bold text-sm">គ្មានអ្នកប្រើប្រាស់</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.map((user, idx) => {
                            const avatarColors = [
                                "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
                                "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400",
                                "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400",
                                "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
                                "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
                            ];
                            const avatarColor = avatarColors[idx % avatarColors.length];
                            return (
                            <TableRow
                                key={user.id}
                                className="border-b border-slate-100/80 dark:border-slate-800/50 hover:bg-blue-50/40 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                onClick={() => setSelectedUserId(user.id)}
                            >
                                <TableCell className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm", avatarColor)}>
                                            {user.name ? user.name[0].toUpperCase() : <User size={15} />}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-slate-900 dark:text-white truncate text-sm" title={user.name}>{user.name || "N/A"}</span>
                                            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-mono" title={user.email}>{user.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={cn(
                                        "px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide border",
                                        user.role === ROLES.PLATFORM_OWNER
                                            ? "bg-slate-900 text-white border-slate-700 dark:bg-white dark:text-slate-900 dark:border-slate-200"
                                            : user.role === ROLES.EVENT_MANAGER
                                                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                                                : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                    )}>
                                        {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs">
                                        {user.weddings?.length || 0}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {user.weddings && user.weddings.length > 0 ? (
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold font-kantumruy truncate max-w-[150px] text-slate-800 dark:text-slate-200">{user.weddings[0].groomName} & {user.weddings[0].brideName}</span>
                                            {user.weddings.length > 1 && (
                                                <span className="text-[10px] text-slate-400 font-medium">+{user.weddings.length - 1} more</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-slate-300 dark:text-slate-600 text-sm">—</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                                        {new Date(user.createdAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right px-5">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 text-xs h-8 font-bold"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedUserId(user.id);
                                        }}
                                    >
                                        មើល
                                        <ArrowRight size={13} className="ml-1" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )})}
                    </TableBody>
                </Table>
            </div>

            <UserDetailsDialog
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                loadingDetails={loadingDetails}
                selectedUserDetails={selectedUserDetails}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                handleSaveRole={handleSaveRole}
                savingRole={savingRole}
                handleRestoreUser={handleRestoreUser}
                setShowDeleteDialog={setShowDeleteDialog}
                deletingUser={deletingUser}
            />

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
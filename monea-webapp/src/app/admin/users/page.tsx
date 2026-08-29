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
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="ស្វែងរកអ៊ីមែល ឬឈ្មោះ..."
                            className="h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-kantumruy font-medium text-sm w-full md:w-[300px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        <Filter size={20} />
                    </Button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider px-6 py-4">User/Identity</TableHead>
                            <TableHead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Role</TableHead>
                            <TableHead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider text-center">Weddings</TableHead>
                            <TableHead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Groom & Bride</TableHead>
                            <TableHead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Joined Date</TableHead>
                            <TableHead className="text-right text-slate-500 font-semibold uppercase text-[10px] tracking-wider px-6">Actions</TableHead>
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
                            <TableRow
                                key={user.id}
                                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                onClick={() => setSelectedUserId(user.id)}
                            >
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                            <User size={16} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-slate-900 dark:text-white truncate" title={user.name}>{user.name || "N/A"}</span>
                                            <span className="text-xs text-slate-500 truncate" title={user.email}>{user.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={cn(
                                        "px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase border",
                                        user.role === ROLES.PLATFORM_OWNER
                                            ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                                            : user.role === ROLES.EVENT_MANAGER
                                                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                                                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                                    )}>
                                        {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs font-bold">
                                        {user.weddings?.length || 0}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {user.weddings && user.weddings.length > 0 ? (
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium font-kantumruy truncate max-w-[150px]">{user.weddings[0].groomName} & {user.weddings[0].brideName}</span>
                                            {user.weddings.length > 1 && (
                                                <span className="text-[10px] text-slate-400">+{user.weddings.length - 1} more</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-xs italic">N/A</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                                        {new Date(user.createdAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-lg border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-kantumruy text-xs font-medium h-8 group/btn"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevents double firing since row is also clickable
                                            setSelectedUserId(user.id);
                                        }}
                                    >
                                        Manage
                                        <ArrowRight size={14} className="ml-1.5 group-hover/btn:translate-x-1 transition-transform opacity-70" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
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
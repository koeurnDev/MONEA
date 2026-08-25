import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Users,
    ArrowLeft,
    Search,
    Shield,
    UserCog,
    Ban,
    CheckCircle2,
    Loader2,
    Mail,
    Calendar,
    Globe,
    ShieldAlert,
    RefreshCcw,
    Lock,
    Key,
    ShieldCheck,
    Crown,
    UserCheck,
    UserX,
    ChevronLeft,
    ChevronRight,
    LogOut
} from "lucide-react";
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";

export default function MasterUsersPage() {
    const { t, locale } = useTranslation();
    const { showToast } = useToast();
    const { user: currentUser } = useAuth();
    const isKm = locale === 'km';

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [processing, setProcessing] = useState<string | null>(null);

    const loadData = useCallback((currentPage: number) => {
        setLoading(true);
        fetch(`/api/admin/master/users?search=${encodeURIComponent(search)}&page=${currentPage}`)
            .then(res => res.json())
            .then(result => {
                if (result.users) {
                    setUsers(result.users);
                    setPagination(result.pagination);
                } else {
                    setUsers([]);
                    setPagination(null);
                }
            })
            .catch(() => {
                showToast({ title: "បរាជ័យក្នុងការទាញយក", type: "error" });
            })
            .finally(() => setLoading(false));
    }, [search, showToast]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1);
            loadData(1);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, loadData]);

    useEffect(() => {
        loadData(page);
    }, [page, loadData]);

    const handleAction = async (userId: string, data: any) => {
        setProcessing(userId);
        try {
            const res = await fetch("/api/admin/master/users", {
                method: "PATCH",
                body: JSON.stringify({ userId, ...data }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                showToast({
                    title: data.role ? "បានផ្លាស់ប្តូរសិទ្ធិគណនីជោគជ័យ" : "បានផ្តាច់ Session ជោគជ័យ",
                    type: "success"
                });
                loadData(page);
            }
        } catch (e) {
            showToast({ title: "Error", description: "Action failed", type: "error" });
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="w-full min-h-full font-kantumruy pb-16">
            {/* Top Bar Header */}
            <div className="bg-card/80 backdrop-blur-md border-b border-border/80 sticky top-0 z-20">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-border bg-card shadow-xs hover:bg-muted">
                                <ArrowLeft size={17} className="text-muted-foreground" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                <Users size={13} />
                                <span>Platform Account Control</span>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold text-foreground">
                                {isKm ? "គ្រប់គ្រងគណនីអ្នកប្រើប្រាស់ (User Directory)" : "User Directory & Account Roles"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => loadData(page)}
                            variant="outline"
                            disabled={loading}
                            className="h-10 px-4 rounded-xl font-bold text-xs border border-border bg-card shadow-xs flex items-center gap-2"
                        >
                            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                            <span>{isKm ? "ផ្ទុកឡើងវិញ" : "Refresh"}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-6">
                {/* Search and Filters Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="ស្វែងរកតាមឈ្មោះ ឬ Email..."
                            className="h-11 pl-10 rounded-xl border border-input bg-card text-xs font-kantumruy"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {pagination && (
                        <div className="text-xs text-muted-foreground font-bold shrink-0">
                            សរុប {pagination.total} គណនី (ទំព័រ {pagination.currentPage}/{pagination.pages || 1})
                        </div>
                    )}
                </div>

                {/* Users List */}
                <div className="space-y-3">
                    {loading && users.length === 0 ? (
                        <div className="py-24 text-center flex flex-col items-center justify-center space-y-2">
                            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                            <span className="text-xs text-muted-foreground">កំពុងទាញយកបញ្ជីគណនី...</span>
                        </div>
                    ) : users.length === 0 ? (
                        <Card className="bg-card border border-border/80 rounded-2xl shadow-xs py-20 text-center">
                            <CardContent className="flex flex-col items-center justify-center space-y-2">
                                <Users size={32} className="text-muted-foreground/60 mb-2" />
                                <h3 className="text-sm font-bold text-foreground">រកមិនឃើញគណនីនេះទេ</h3>
                                <p className="text-xs text-muted-foreground">សូមសាកល្បងស្វែងរកដោយប្រើពាក្យគន្លឹះផ្សេង។</p>
                            </CardContent>
                        </Card>
                    ) : (
                        users.map((u) => {
                            const isSuperAdmin = u.role === 'SUPERADMIN' || u.role === 'PLATFORM_OWNER';
                            const displayName = u.name && u.name !== '-' ? u.name : (u.email ? u.email.split('@')[0] : "Unnamed User");

                            return (
                                <Card key={u.id} className="bg-card border border-border/80 rounded-2xl shadow-xs hover:border-border transition-all">
                                    <CardContent className="p-5">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            {/* Avatar & User Details */}
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border",
                                                    isSuperAdmin 
                                                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20" 
                                                        : "bg-muted text-foreground border-border/60"
                                                )}>
                                                    {isSuperAdmin ? <Crown size={20} /> : displayName.charAt(0).toUpperCase()}
                                                </div>

                                                <div className="space-y-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-sm font-bold text-foreground truncate">
                                                            {displayName}
                                                        </h3>
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-md border",
                                                            isSuperAdmin 
                                                                ? "bg-rose-500/10 text-rose-600 border-rose-500/20" 
                                                                : "bg-muted text-muted-foreground border-border/60"
                                                        )}>
                                                            {isSuperAdmin ? "👑 Super Admin" : "💒 គូស្នេហ៍ / User"}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1 font-mono text-[11px]">
                                                            <Mail size={12} /> {u.email}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-border/80">
                                                            ID: {u.id}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Globe size={12} className="text-rose-500" />
                                                            <span>{u._count?.weddings || 0} កម្មវិធីមង្គលការ</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Creation Date & Actions */}
                                            <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0">
                                                <div className="text-right mr-3 hidden lg:block text-xs">
                                                    <span className="text-[10px] text-muted-foreground block">ថ្ងៃចុះឈ្មោះ</span>
                                                    <span className="font-bold text-foreground">
                                                        {new Date(u.createdAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}
                                                    </span>
                                                </div>

                                                {/* Revoke Sessions */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAction(u.id, { revokeSessions: true })}
                                                    disabled={processing === u.id}
                                                    className="h-9 px-3 rounded-xl text-xs font-bold border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                                                >
                                                    <LogOut size={13} className="mr-1" />
                                                    <span>ផ្តាច់ Session</span>
                                                </Button>

                                                {/* Promote / Demote Role with Root Protection */}
                                                {u.email === 'kook74532@gmail.com' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                                                        <ShieldCheck size={14} />
                                                        <span>Root Owner (ការពារសិទ្ធិ)</span>
                                                    </span>
                                                ) : isSuperAdmin ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm(`តើអ្នកពិតជាចង់ដកសិទ្ធិ Super Admin ពី ${displayName} មែនទេ?`)) {
                                                                handleAction(u.id, { role: 'ADMIN' });
                                                            }
                                                        }}
                                                        disabled={processing === u.id || (currentUser?.email === u.email)}
                                                        className="h-9 px-3 rounded-xl text-xs font-bold border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                                    >
                                                        <span>{currentUser?.email === u.email ? "គណនីផ្ទាល់ខ្លួន" : "ទម្លាក់មក User ធម្មតា"}</span>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm(`តើអ្នកពិតជាចង់ដំឡើង ${displayName} ឱ្យមានសិទ្ធិជា Super Admin ដែរឬទេ?`)) {
                                                                handleAction(u.id, { role: 'SUPERADMIN' });
                                                            }
                                                        }}
                                                        disabled={processing === u.id}
                                                        className="h-9 px-3 rounded-xl text-xs font-bold border-border hover:bg-muted text-foreground"
                                                    >
                                                        <Crown size={13} className="mr-1 text-amber-500" />
                                                        <span>ដំឡើងជា Super Admin</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="h-9 px-3 rounded-xl text-xs font-bold"
                        >
                            <ChevronLeft size={14} className="mr-1" />
                            ទំព័រមុន
                        </Button>
                        <span className="text-xs font-bold px-3 text-muted-foreground">
                            {page} / {pagination.pages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                            disabled={page >= pagination.pages}
                            className="h-9 px-3 rounded-xl text-xs font-bold"
                        >
                            ទំព័របន្ទាប់
                            <ChevronRight size={14} className="ml-1" />
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}

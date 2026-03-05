"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, User, Save, ShieldAlert } from "lucide-react";

import { ROLES, ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function UserManagementPage() {
    const params = useParams();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>("");

    useEffect(() => {
        fetch(`/api/admin/users/${params.id}`)
            .then(res => {
                if (res.ok) {
                    res.json().then(result => {
                        setUser(result.data);
                        setSelectedRole(result.data.role);
                    });
                } else {
                    alert("ចូលមិនបានសម្រេច: មិនអាចទាញយកព័ត៌មានអ្នកប្រើប្រាស់បានទេ។");
                    router.push("/admin/users");
                }
            })
            .catch(err => {
                console.error(err);
                router.push("/admin/users");
            })
            .finally(() => setLoading(false));
    }, [params.id, router]);

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
                alert("ជោគជ័យ: តួនាទីរបស់អ្នកប្រើប្រាស់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ។");
                setUser({ ...user, role: selectedRole });
            } else {
                const data = await res.json();
                alert(`បរាជ័យ: ${data.error || "មិនអាចផ្លាស់ប្តូរតួនាទីបានទេ។"}`);
            }
        } catch (error) {
            alert("Error: An unexpected error occurred.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">កំពុងទាញយកទិន្នន័យ...</span>
            </div>
        );
    }

    if (!user) return null;

    const isPlatformOwner = user.role === ROLES.PLATFORM_OWNER;

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <Button
                    variant="ghost"
                    className="w-fit text-slate-500 hover:text-red-600 p-0 hover:bg-transparent -ml-2 gap-2"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={16} /> ត្រឡប់ក្រោយ
                </Button>

                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                            <User size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 font-kantumruy">គ្រប់គ្រងគណនី</h2>
                            <p className="text-slate-500 font-mono text-sm">{user.email}</p>
                        </div>
                    </div>
                    <Badge className={cn(
                        "px-3 py-1 rounded-lg text-sm font-black tracking-widest uppercase border",
                        user.role === ROLES.PLATFORM_OWNER
                            ? "bg-slate-900 text-white border-slate-900"
                            : user.role === ROLES.EVENT_MANAGER
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-blue-50 text-blue-700 border-blue-100"
                    )}>
                        {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-8">
                    {/* Settings Box */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 font-kantumruy mb-6">ការកំណត់តួនាទី (Role Settings)</h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 font-kantumruy">តួនាទីអ្នកប្រើប្រាស់</label>

                                {isPlatformOwner ? (
                                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <ShieldAlert size={18} className="text-amber-500" />
                                        <span className="text-sm font-medium text-slate-600 font-kantumruy">
                                            អ្នកមិនអាចផ្លាស់ប្តូរតួនាទីរបស់ {ROLE_LABELS[ROLES.PLATFORM_OWNER]} ផ្សេងទៀតបានទេ។
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                                        <div className="flex-1">
                                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                                    <SelectValue placeholder="ជ្រើសរើសតួនាទី" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={ROLES.EVENT_MANAGER}>{ROLE_LABELS[ROLES.EVENT_MANAGER]}</SelectItem>
                                                    <SelectItem value={ROLES.EVENT_STAFF}>{ROLE_LABELS[ROLES.EVENT_STAFF]}</SelectItem>
                                                    {/* We avoid letting people promote others to SUPERADMIN explicitly in this UI to prevent mistakes */}
                                                    <SelectItem value={ROLES.PLATFORM_OWNER} disabled>
                                                        {ROLE_LABELS[ROLES.PLATFORM_OWNER]} (Restricted)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            onClick={handleSaveRole}
                                            disabled={saving || selectedRole === user.role}
                                            className="h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-kantumruy font-bold gap-2"
                                        >
                                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            រក្សាទុក
                                        </Button>
                                    </div>
                                )}
                                <p className="text-xs text-slate-500 font-kantumruy mt-2">
                                    តួនាទីកំណត់ពីកម្រិតនៃសិទ្ធិសម្រាប់អ្នកប្រើប្រាស់ម្នាក់។
                                    <span className="font-bold">Event Manager</span> អាចបង្កើត/កែប្រែមង្គលការបាន។
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Associated Weddings */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 font-kantumruy mb-6 flex items-center justify-between">
                            <span>មង្គលការរបស់គណនីនេះ</span>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700">{user.weddings?.length || 0}</Badge>
                        </h3>

                        {user.weddings && user.weddings.length > 0 ? (
                            <div className="space-y-4">
                                {user.weddings.map((w: any) => (
                                    <div key={w.id} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-red-100 hover:bg-red-50/50 transition-colors group cursor-pointer" onClick={() => router.push(`/admin/weddings/${w.id}`)}>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-black text-slate-900 font-kantumruy group-hover:text-red-700 transition-colors">
                                                {w.groomName} & {w.brideName}
                                            </span>
                                            <span className="text-xs font-mono text-slate-500 uppercase">ID: {w.id.substring(0, 8)}...</span>
                                        </div>
                                        <Badge variant="outline" className={cn(
                                            "uppercase tracking-widest text-[10px]",
                                            w.status === "ACTIVE" ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-slate-200 text-slate-500 bg-slate-50"
                                        )}>
                                            {w.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                <p className="text-sm font-kantumruy text-slate-500 font-medium">គណនីនេះមិនទាន់មានមង្គលការនៅឡើយទេ</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 font-kantumruy mb-4 uppercase tracking-wider">ព័ត៌មានលម្អិត</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">User ID</label>
                                <p className="text-xs font-mono font-medium text-slate-700 break-all">{user.id}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ថ្ងៃចុះឈ្មោះ (Joined)</label>
                                <p className="text-sm font-medium text-slate-700">{new Date(user.createdAt).toLocaleDateString()} {new Date(user.createdAt).toLocaleTimeString()}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ស្ថានភាព (Status)</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">សកម្ម (Active)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Future Section: Danger Zone */}
                    <div className="bg-red-50/50 rounded-3xl border border-red-100 p-6 shadow-sm">
                        <h3 className="text-sm font-black text-red-900 font-kantumruy mb-4">តំបន់គ្រោះថ្នាក់ (Danger Zone)</h3>
                        <p className="text-xs text-red-700/80 mb-4 font-medium leading-relaxed font-kantumruy">
                            មុខងារការពារសុវត្ថិភាព។ ការលុបគណនីមិនអាចយកមកវិញបានទេ។
                        </p>
                        <Button variant="destructive" className="w-full rounded-xl font-bold font-kantumruy text-xs opacity-50 cursor-not-allowed h-10" disabled>
                            លុបគណនីអ្នកប្រើប្រាស់
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

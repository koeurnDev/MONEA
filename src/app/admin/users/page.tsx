"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, Users, Heart } from "lucide-react";

import { ROLES, ROLE_LABELS } from "@/lib/constants";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/users").then(res => {
            if (res.ok) res.json().then(result => setUsers(result.data || []));
            setLoading(false);
        });
    }, []);

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
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-600 mb-1">
                    <Users size={14} />
                    PLATFORM MEMBERSHIP
                </div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 font-kantumruy">ការគ្រប់គ្រងអ្នកប្រើប្រាស់</h2>
                <p className="text-slate-500 font-medium font-kantumruy text-sm">មើល និងគ្រប់គ្រងគណនីប្តីប្រពន្ធទាំងអស់ដែលប្រើប្រាស់ប្រព័ន្ធ MONEA ។</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-100/50">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100 hover:bg-transparent">
                            <TableHead className="text-slate-600 font-bold uppercase text-xs tracking-tight px-8 py-6">អ៊ីមែល</TableHead>
                            <TableHead className="text-slate-600 font-bold uppercase text-xs tracking-tight">តួនាទី</TableHead>
                            <TableHead className="text-slate-600 font-bold uppercase text-xs tracking-tight text-center">ចំនួនមង្គលការ</TableHead>
                            <TableHead className="text-slate-600 font-bold uppercase text-xs tracking-tight">ឈ្មោះប្តីប្រពន្ធ</TableHead>
                            <TableHead className="text-slate-600 font-bold uppercase text-xs tracking-tight">ថ្ងៃចុះឈ្មោះ</TableHead>
                            <TableHead className="text-right text-slate-600 font-bold uppercase text-xs tracking-tight px-8">សកម្មភាព</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
                                <TableCell className="font-medium text-slate-900 px-8 font-mono text-xs">{user.email}</TableCell>
                                <TableCell>
                                    <Badge className={cn(
                                        "px-2 py-0.5 rounded-md text-[11px] font-black tracking-widest uppercase border whitespace-nowrap",
                                        user.role === ROLES.PLATFORM_OWNER
                                            ? "bg-slate-900 text-white border-slate-900"
                                            : user.role === ROLES.EVENT_MANAGER
                                                ? "bg-red-50 text-red-700 border-red-100"
                                                : "bg-blue-50 text-blue-700 border-blue-100"
                                    )}>
                                        {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center text-slate-900 font-bold">{user.weddings.length}</TableCell>
                                <TableCell>
                                    {user.weddings[0] ? (
                                        <span className="text-sm text-slate-700 font-bold font-kantumruy">
                                            {user.weddings[0].groomName} & {user.weddings[0].brideName}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 italic text-xs font-kantumruy">មិនទាន់មានមង្គលការ</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-xs text-slate-500 font-mono">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right px-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-100 transition-all font-kantumruy text-xs font-bold h-9"
                                        onClick={() => alert("មុខងារគ្រប់គ្រងនឹងមកដល់ឆាប់ៗនេះ")}
                                    >
                                        គ្រប់គ្រង
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

"use client";
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type AuditLogsTabProps = {
    logs: any[];
};

export function AuditLogsTab({ logs }: AuditLogsTabProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Activity size={16} className="text-emerald-500" />
                    Audit Logs ({logs.length})
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase">System-wide events</span>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                {["Time", "Actor", "Action", "Details"].map(h => (
                                    <th key={h} className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {!logs.length ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <Activity className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                        <p className="text-sm text-slate-400 font-bold">No audit events yet</p>
                                    </td>
                                </tr>
                            ) : logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <p className="text-[11px] font-black text-slate-600">{format(new Date(log.createdAt), "HH:mm:ss")}</p>
                                        <p className="text-[9px] text-slate-400 font-bold">{format(new Date(log.createdAt), "MMM d")}</p>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                                                {log.actorName?.[0] || "?"}
                                            </div>
                                            <span className="text-xs font-black text-slate-700">{log.actorName}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <Badge className={`border-none text-[9px] uppercase font-black tracking-widest ${log.action === "PUBLISH" ? "bg-blue-50 text-blue-700" :
                                            log.action === "ROLLBACK" ? "bg-red-50 text-red-700" :
                                                log.action === "CONFIG_UPDATE" ? "bg-amber-50 text-amber-700" :
                                                    "bg-slate-50 text-slate-600"
                                            }`}>
                                            {log.action}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <p className="text-[11px] text-slate-500 font-medium max-w-[200px] truncate">{log.details}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

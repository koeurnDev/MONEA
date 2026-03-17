"use client";
import { Layers, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";

type TemplateSnapshotsTabProps = {
    templateUsage: any[];
    templateVersions: any[];
};

export function TemplateSnapshotsTab({ templateUsage, templateVersions }: TemplateSnapshotsTabProps) {
    return (
        <div className="space-y-6">
            {/* Template Popularity Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {templateUsage?.map((t: any) => (
                    <div key={t.templateId} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-center items-center gap-1 group hover:border-indigo-100 transition-colors">
                        <span className="text-2xl font-black text-indigo-600 group-hover:scale-110 transition-transform">{t.count}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{t.templateId}</span>
                    </div>
                ))}
                {(!templateUsage || templateUsage.length === 0) && (
                    <div className="col-span-full p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white rounded-2xl border border-slate-100 border-dashed">
                        Loading Usage Data...
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Layers size={16} className="text-indigo-500" />
                        ប្រវត្តិ Template Snapshot ({templateVersions?.length || 0})
                    </h3>
                </div>
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    {["Wedding", "Version Name", "Template", "Saved By", "Date"].map(h => (
                                        <th key={h} className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {!templateVersions?.length ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <Layers className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                            <p className="text-sm text-slate-400 font-bold">មិនទាន់មានការថតចម្លង Template ណាទេ</p>
                                        </td>
                                    </tr>
                                ) : templateVersions.map((ver: any) => (
                                    <tr key={ver.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">
                                                    {ver.wedding?.groomName?.[0] || "W"}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 leading-tight">{ver.wedding?.groomName} & {ver.wedding?.brideName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-bold text-slate-700">{ver.versionName}</span>
                                            {ver.description && <p className="text-[10px] text-slate-400 italic mt-0.5">{ver.description}</p>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] uppercase font-black tracking-widest">
                                                {ver.templateId}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <User size={11} className="text-slate-400" />
                                                <span className="text-[11px] font-bold text-slate-500">{ver.createdBy}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-[11px] font-bold text-slate-500 whitespace-nowrap">{format(new Date(ver.createdAt), "MMM d, yyyy")}</p>
                                            <p className="text-[9px] text-slate-400">{formatDistanceToNow(new Date(ver.createdAt), { addSuffix: true })}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

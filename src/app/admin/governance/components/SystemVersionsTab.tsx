"use client";
import { History, Database, Clock, RotateCcw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";

type SystemVersionsTabProps = {
    history: any[];
    rollingBack: string | null;
    setConfirmModal: (modal: { open: boolean, versionId: string, versionName: string }) => void;
};

export function SystemVersionsTab({ history, rollingBack, setConfirmModal }: SystemVersionsTabProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <History size={16} className="text-red-500" />
                    ប្រវត្តិ System Version ({history.length})
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Latest first</span>
            </div>
            {history.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 p-16 text-center">
                    <Database className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-bold">មិនទាន់មានទិន្នន័យ Version ទេ</p>
                    <p className="text-[11px] text-slate-300 mt-1">អ្នកអាចបង្កើត Version ថ្មីបាននៅផ្នែកខាងឆ្វេង។</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-6 bottom-6 w-px bg-slate-100" />
                    <div className="space-y-3">
                        {history.map((v: any, idx: number) => (
                            <div key={v.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group pl-14 pr-6 py-5 relative">
                                {/* Timeline dot */}
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${idx === 0 ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                                    <div className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-emerald-500" : "bg-slate-300"}`} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-slate-900 text-sm">{v.versionName}</h4>
                                            {idx === 0 && <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] uppercase font-black">Latest</Badge>}
                                            {v.isStable && <Badge className="bg-blue-100 text-blue-700 border-none text-[9px] uppercase font-black">Stable</Badge>}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2">
                                            <Clock size={10} />
                                            {format(new Date(v.createdAt), "MMM d, yyyy • h:mm a")} · {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                                        </p>
                                        {v.description && <p className="text-[11px] text-slate-500 mt-2 italic">&quot;{v.description}&quot;</p>}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={rollingBack === v.id}
                                        onClick={() => setConfirmModal({ open: true, versionId: v.id, versionName: v.versionName })}
                                        className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-1.5 border-2 transition-all border-red-100 text-red-600 bg-red-50/50 hover:bg-red-600 hover:text-white hover:border-red-600"
                                    >
                                        {rollingBack === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw size={12} />}
                                        Rollback
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

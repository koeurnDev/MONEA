"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Heart, Users, MapPin, Calendar, Clock, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function AdminWeddingDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const [wedding, setWedding] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/admin/weddings/${params.id}`)
            .then(res => {
                if (res.ok) {
                    res.json().then(result => setWedding(result.data));
                } else {
                    alert("Error fetching wedding: Could not load details.");
                    router.push("/admin/users");
                }
            })
            .catch(err => {
                console.error(err);
                router.push("/admin/users");
            })
            .finally(() => setLoading(false));
    }, [params.id, router]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">កំពុងទាញយកទិន្នន័យ...</span>
            </div>
        );
    }

    if (!wedding) return null;

    const formattedDate = wedding.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' }) : "មិនទាន់កំណត់";

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-10">
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
                        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative">
                            {wedding.couplePhoto ? (
                                <Image 
                                    src={wedding.couplePhoto} 
                                    alt="Couple" 
                                    fill
                                    className="object-cover" 
                                />
                            ) : (
                                <Heart size={32} strokeWidth={2.5} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 font-kantumruy">
                                {wedding.groomName} & {wedding.brideName}
                            </h2>
                            <p className="text-slate-500 font-mono text-sm mt-1 uppercase tracking-widest">
                                ID: {wedding.id}
                            </p>
                        </div>
                    </div>
                    <Badge className={cn(
                        "px-4 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase border whitespace-nowrap hidden md:inline-flex",
                        wedding.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                    )}>
                        {wedding.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-8">

                    {/* Quick Overview */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ភ្ញៀវសរុប</p>
                                <p className="text-2xl font-black text-slate-900">{wedding._count?.guests || 0}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <ImageIcon size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Template</p>
                                <p className="text-lg font-black text-slate-900 capitalize truncate" title={wedding.templateId}>{wedding.templateId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Schedule / Activities */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 font-kantumruy mb-6 flex items-center justify-between">
                            <span>កម្មវិធី (Events)</span>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700">{wedding.activities?.length || 0}</Badge>
                        </h3>

                        {wedding.activities && wedding.activities.length > 0 ? (
                            <div className="space-y-4">
                                {wedding.activities.map((evt: any) => (
                                    <div key={evt.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-900 font-kantumruy text-base">{evt.title}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-kantumruy">
                                                <Clock size={14} className="text-slate-400 shrink-0" />
                                                <span className="truncate">{evt.time}</span>
                                            </div>
                                            {evt.locationName && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600 font-kantumruy">
                                                    <MapPin size={14} className="text-slate-400 shrink-0" />
                                                    <span className="truncate" title={evt.locationName}>{evt.locationName}</span>
                                                </div>
                                            )}
                                        </div>
                                        {evt.description && (
                                            <p className="text-sm text-slate-500 font-kantumruy italic border-l-2 border-slate-200 pl-3">
                                                {evt.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                <p className="text-sm font-kantumruy text-slate-500 font-medium">មិនទាន់មានកម្មវិធីនៅឡើយទេ</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 font-kantumruy mb-4 uppercase tracking-wider border-b border-slate-100 pb-4">ព័ត៌មានលម្អិត</h3>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                                    <Calendar size={12} /> ថ្ងៃមង្គលការ
                                </label>
                                <p className="text-sm font-bold text-slate-700 font-kantumruy">{formattedDate}</p>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">គណនីគ្រប់គ្រង (Owner)</label>
                                {wedding.user ? (
                                    <div
                                        className="flex flex-col p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100"
                                        onClick={() => router.push("/admin/users")}  // Or direct modal trigger if we had it via query param
                                    >
                                        <span className="text-xs font-mono font-bold text-slate-700 truncate">{wedding.user.email}</span>
                                        <span className="text-[10px] text-slate-500 uppercase mt-1">{wedding.user.role}</span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 italic">មិនមានម្ចាស់</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Future Section: Danger Zone */}
                    <div className="bg-red-50/50 rounded-3xl border border-red-100 p-6 shadow-sm">
                        <h3 className="text-sm font-black text-red-900 font-kantumruy mb-4">តំបន់គ្រោះថ្នាក់</h3>
                        <p className="text-xs text-red-700/80 mb-4 font-medium leading-relaxed font-kantumruy">
                            មុខងារការពារសុវត្ថិភាព។ ការលុបមង្គលការមិនអាចយកមកវិញបានទេ។
                        </p>
                        <Button variant="destructive" className="w-full rounded-xl font-bold font-kantumruy text-xs opacity-50 cursor-not-allowed h-10" disabled>
                            លុបមង្គលការនេះ
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

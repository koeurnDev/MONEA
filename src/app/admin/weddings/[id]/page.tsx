"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Globe, Users, MapPin, Calendar, Clock, Image as ImageIcon, Sparkles, Share2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { QRCodeCard } from "@/components/QRCodeCard";
import { useToast } from "@/components/ui/Toast";
import { m } from "framer-motion";

export default function AdminWeddingDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const [wedding, setWedding] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetch(`/api/admin/weddings/${params.id}`)
            .then(res => {
                if (res.ok) {
                    res.json().then(result => setWedding(result.data));
                } else {
                    showToast({
                        title: "Error fetching wedding",
                        description: "Could not load wedding details. Please try again.",
                        type: "info"
                    });
                    router.push("/admin/weddings");
                }
            })
            .catch(err => {
                console.error(err);
                showToast({
                    title: "Network Error",
                    description: "Failed to connect to the server.",
                    type: "info"
                });
                router.push("/admin/weddings");
            })
            .finally(() => setLoading(false));
    }, [params.id, router, showToast]);

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
                                <Globe size={32} strokeWidth={2.5} />
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
                        <m.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm flex items-center gap-6 group hover:shadow-md transition-all duration-500"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                                <Users size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">ភ្ញៀវសរុប</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{wedding._count?.guests || 0}</p>
                            </div>
                        </m.div>
                        <m.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm flex items-center gap-6 group hover:shadow-md transition-all duration-500"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                                <Sparkles size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Template</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white capitalize truncate max-w-[120px]" title={wedding.templateId}>{wedding.templateId}</p>
                            </div>
                        </m.div>
                    </div>

                    {/* Schedule / Activities */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                        
                        <h3 className="text-xl font-black text-slate-900 dark:text-white font-kantumruy mb-8 flex items-center justify-between">
                            <span className="flex items-center gap-3">
                                <Calendar size={20} className="text-red-600" />
                                កម្មវិធី (Events)
                            </span>
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1">
                                {wedding.activities?.length || 0}
                            </Badge>
                        </h3>

                        {wedding.activities && wedding.activities.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {wedding.activities.map((evt: any, i: number) => (
                                    <m.div 
                                        key={evt.id} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500 flex flex-col gap-4 relative"
                                    >
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-black text-slate-900 dark:text-white font-kantumruy text-lg group-hover:text-red-600 transition-colors">{evt.title}</h4>
                                            <div className="px-3 py-1 rounded-full bg-white dark:bg-slate-950 text-[10px] font-bold text-slate-500 border border-slate-100 dark:border-slate-800 shadow-sm">
                                                Event {i + 1}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-6 items-center">
                                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-kantumruy">
                                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm">
                                                    <Clock size={16} className="text-red-500" />
                                                </div>
                                                <span className="font-bold">{evt.time}</span>
                                            </div>
                                            {evt.locationName && (
                                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-kantumruy">
                                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm">
                                                        <MapPin size={16} className="text-blue-500" />
                                                    </div>
                                                    <span className="font-bold truncate max-w-[180px]" title={evt.locationName}>{evt.locationName}</span>
                                                </div>
                                            )}
                                        </div>
                                        {evt.description && (
                                            <div className="mt-2 p-4 rounded-2xl bg-white/50 dark:bg-slate-950/30 text-sm text-slate-500 dark:text-slate-400 font-kantumruy italic border-l-4 border-red-500/20">
                                                {evt.description}
                                            </div>
                                        )}
                                    </m.div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-16 text-center bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800 border-dashed">
                                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-800">
                                    <Calendar className="text-slate-300" size={24} />
                                </div>
                                <p className="text-sm font-kantumruy text-slate-500 font-medium">មិនទាន់មានកម្មវិធីនៅឡើយទេ</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Share Section */}
                    <QRCodeCard weddingId={wedding.id} />

                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                        <h3 className="text-xs font-black text-slate-900 dark:text-white font-kantumruy mb-6 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
                            <Share2 size={14} className="text-slate-400" />
                            ព័ត៌មានលម្អិត
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                                    <Calendar size={12} /> ថ្ងៃមង្គលការ
                                </label>
                                <p className="text-base font-black text-slate-700 dark:text-slate-300 font-kantumruy ml-5">{formattedDate}</p>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">គណនីគ្រប់គ្រង (Owner)</label>
                                {wedding.user ? (
                                    <div
                                        className="flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer border border-slate-100 dark:border-slate-800 group"
                                        onClick={() => router.push("/admin/users")}
                                    >
                                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate group-hover:text-red-600 transition-colors uppercase tracking-tight">{wedding.user.email}</span>
                                        <span className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">{wedding.user.role}</span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 italic ml-1">មិនមានម្ចាស់</p>
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

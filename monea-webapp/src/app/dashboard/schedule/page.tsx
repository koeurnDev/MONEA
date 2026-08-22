"use client";
import { useState, useEffect } from "react";
import { Plus, Clock, Calendar, Activity, Pencil, Trash2, Scissors, Heart, Camera, Utensils, Music, Flower2, Users, GlassWater, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ActivityForm } from "./activity-form";
import { useTranslation } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/app/dashboard/_components/PageHeader";
import { moneaClient } from "@/lib/api-client";

const KHMER_ICONS_MAP: Record<string, any> = {
    scissors: Scissors,
    heart: Heart,
    flower: Flower2,
    users: Users,
    utensils: Utensils,
    camera: Camera,
    music: Music,
    glass: GlassWater,
    landmark: Landmark,
};

export default function SchedulePage() {
    const { t } = useTranslation();
    const [activities, setActivities] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editActivity, setEditActivity] = useState<any | null>(null);

    async function handleDelete(id: string) {
        if (!confirm(t("dashboard.schedule.deleteConfirm"))) return;
        try {
            const res = await moneaClient.delete(`/api/activities/${id}`);
            if (!res.error) {
                fetchActivities();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function fetchActivities() {
        setLoading(true);
        try {
            const res = await moneaClient.get<any[]>("/api/activities");
            if (res.data && Array.isArray(res.data)) {
                setActivities(res.data);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    useEffect(() => { fetchActivities(); }, []);

    return (
        <div className="space-y-12 pb-16 relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <div className="flex justify-end relative z-10">
                {!loading && activities.length > 0 ? (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditActivity(null)} className="h-11 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold font-kantumruy text-sm transition-all">
                                <Plus className="mr-2 h-4 w-4" /> {t("dashboard.schedule.addActivity")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border border-white/20 shadow-2xl p-0 overflow-hidden bg-background/80 backdrop-blur-2xl">
                            <DialogHeader className="p-8 pb-4 bg-gradient-to-b from-muted/50 to-transparent">
                                <DialogTitle className="text-2xl font-black font-kantumruy tracking-tight text-foreground">{t("dashboard.schedule.newActivity")}</DialogTitle>
                                <DialogDescription className="text-muted-foreground font-medium font-kantumruy">{t("dashboard.schedule.form.subtitle")}</DialogDescription>
                            </DialogHeader>
                            <div className="p-8 pt-4">
                                <ActivityForm initialData={editActivity} onSuccess={() => { setOpen(false); fetchActivities(); }} />
                            </div>
                        </DialogContent>
                    </Dialog>
                ) : null}
            </div>

            {/* Timeline View */}
            <div className="relative mt-12">
                {/* Glowing Vertical Line */}
                <div className="absolute left-[2.25rem] md:left-[2.25rem] top-8 bottom-8 w-[2px] bg-gradient-to-b from-transparent via-red-500/30 to-transparent hidden sm:block" />
                <div className="absolute left-[2.25rem] md:left-[2.25rem] top-8 bottom-8 w-[1px] bg-red-500/50 hidden sm:block shadow-[0_0_10px_rgba(239,68,68,0.5)]" />

                <div className="space-y-10 relative">
                    {loading ? (
                        <div className="p-20 text-center flex flex-col items-center">
                            <div className="relative w-16 h-16 mb-4">
                                <div className="absolute inset-0 border-4 border-red-500/20 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-red-600 rounded-full animate-spin" />
                            </div>
                            <span className="text-xs font-black text-muted-foreground/50 uppercase tracking-widest">{t("dashboard.schedule.loading")}</span>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="max-w-md mx-auto bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-12 text-center group hover:border-red-500/30 transition-all duration-500 shadow-xl">
                            <div className="w-24 h-24 bg-gradient-to-br from-background to-muted shadow-2xl rounded-3xl flex items-center justify-center text-muted-foreground/30 mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 group-hover:text-red-500 transition-all duration-500 border border-white/10">
                                <Activity size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-3 font-kantumruy">{t("dashboard.schedule.emptyTitle")}</h3>
                            <p className="text-muted-foreground mb-10 font-medium font-kantumruy leading-relaxed">{t("dashboard.schedule.emptySubtitle")}</p>

                            <Button
                                onClick={() => { setEditActivity(null); setOpen(true); }}
                                className="bg-foreground hover:bg-foreground/90 text-background rounded-2xl h-14 px-10 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 font-kantumruy hover:scale-105"
                            >
                                <Plus className="mr-2 h-5 w-5" /> {t("dashboard.schedule.createNew")}
                            </Button>
                        </div>
                    ) : (
                        activities.map((item, index) => (
                            <div 
                                key={item.id} 
                                className="group relative pl-0 sm:pl-20 animate-in slide-in-from-bottom-8 opacity-0 fade-in fill-mode-forwards"
                                style={{ animationDelay: `${index * 100}ms`, animationDuration: '700ms' }}
                            >
                                {/* Glowing Timeline Bullet */}
                                <div className="absolute left-[1.45rem] top-10 w-6 h-6 rounded-full bg-background border-[4px] border-red-500 z-10 transition-all duration-500 group-hover:scale-125 group-hover:border-red-400 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] hidden sm:block" />

                                <Card className="border border-white/20 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(239,68,68,0.1)] transition-all duration-500 rounded-[2rem] bg-white/60 dark:bg-black/40 backdrop-blur-2xl overflow-hidden group-hover:-translate-y-2">
                                    <div className="flex flex-col md:flex-row items-stretch">
                                        {/* Time Box */}
                                        <div className="w-full md:w-48 p-8 flex flex-col items-center justify-center bg-gradient-to-br from-red-500/5 to-transparent border-b md:border-b-0 md:border-r border-border/50 relative overflow-hidden">
                                            {/* Decorative blob inside time box */}
                                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-colors duration-500" />
                                            
                                            <div className="p-4 rounded-2xl bg-white/80 dark:bg-black/50 shadow-xl text-red-500 mb-4 backdrop-blur-md border border-white/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                                {(() => {
                                                    const IconComp = item.icon ? KHMER_ICONS_MAP[item.icon] : Clock;
                                                    return IconComp ? <IconComp size={24} /> : <Clock size={24} />;
                                                })()}
                                            </div>
                                            <span className="text-2xl font-black text-foreground font-mono tracking-tighter">{item.time}</span>
                                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mt-2">{t("dashboard.schedule.status.scheduled")}</span>
                                        </div>

                                        {/* Content Box */}
                                        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <h3 className="text-2xl font-black text-foreground font-kantumruy leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">{item.title}</h3>
                                                    {index === 0 && (
                                                        <span className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                                            {t("dashboard.schedule.status.starting")}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.description && (
                                                    <p className="text-muted-foreground/80 font-medium font-kantumruy leading-relaxed text-base max-w-2xl">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions Area */}
                                        <div className="p-6 md:p-8 flex items-center justify-between md:justify-center md:flex-col gap-4 bg-muted/5 md:bg-transparent md:border-l border-border/50">
                                            <div className="hidden lg:flex w-12 h-12 rounded-full items-center justify-center text-xs font-black text-muted-foreground/30 bg-background/50 border border-white/10 shadow-inner group-hover:text-red-500/50 transition-colors duration-500">
                                                {String(index + 1).padStart(2, '0')}
                                            </div>
                                            <div className="flex md:flex-col gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-12 w-12 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 rounded-2xl transition-all shadow-sm bg-white/50 dark:bg-black/50 border border-white/10 hover:scale-110"
                                                    onClick={() => { setEditActivity(item); setOpen(true); }}
                                                >
                                                    <Pencil className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-12 w-12 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-2xl transition-all shadow-sm bg-white/50 dark:bg-black/50 border border-white/10 hover:scale-110"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

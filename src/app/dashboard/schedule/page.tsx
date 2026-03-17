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
    const [activities, setActivities] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editActivity, setEditActivity] = useState<any | null>(null);

    async function handleDelete(id: string) {
        if (!confirm("តើអ្នកពិតជាចង់លុបសកម្មភាពនេះមែនទេ?")) return;
        try {
            const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchActivities();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function fetchActivities() {
        setLoading(true);
        try {
            const res = await fetch("/api/activities");
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setActivities(data);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    useEffect(() => { fetchActivities(); }, []);

    return (
        <div className="space-y-10 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-1">
                        <Calendar size={12} />
                        Wedding Rundown
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground font-kantumruy">
                        កាលវិភាគកម្មវិធី
                    </h2>
                    <p className="text-muted-foreground font-medium font-kantumruy text-sm">
                        រៀបចំ និងគ្រប់គ្រងពេលវេលានៃពិធីមង្គលការរបស់អ្នកឱ្យមានរបៀបរៀបរយ។
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditActivity(null)} className="h-11 px-8 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all font-kantumruy font-bold">
                            <Plus className="mr-2 h-4 w-4" /> បន្ថែមកម្មវិធី
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-4">
                            <DialogTitle className="text-2xl font-black font-kantumruy tracking-tight text-foreground">បន្ថែមសកម្មភាពថ្មី</DialogTitle>
                            <DialogDescription className="text-muted-foreground font-medium font-kantumruy">បំពេញទម្រង់ខាងក្រោមដើម្បីបន្ថែមសកម្មភាពថ្មីទៅក្នុងកាលវិភាគ។</DialogDescription>
                        </DialogHeader>
                        <div className="p-8 pt-4">
                            <ActivityForm initialData={editActivity} onSuccess={() => { setOpen(false); fetchActivities(); }} />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Timeline View */}
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[2.25rem] md:left-[2.25rem] top-8 bottom-8 w-px bg-border/20 hidden sm:block" />

                <div className="space-y-8 relative">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="w-8 h-8 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">កំពុងផ្ទុក...</span>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="max-w-md mx-auto bg-muted/50 border-2 border-dashed border-border rounded-[2.5rem] p-12 text-center group hover:border-red-200 transition-all">
                            <div className="w-20 h-20 bg-background shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-full flex items-center justify-center text-muted-foreground/30 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Activity size={40} />
                            </div>
                            <h3 className="text-xl font-black text-foreground mb-2 font-kantumruy">មិនទាន់មានកម្មវិធី</h3>
                            <p className="text-muted-foreground mb-10 font-medium font-kantumruy">ចាប់ផ្តើមរៀបចំកាលវិភាគអាពាហ៍ពិពាហ៍របស់អ្នកឥឡូវនេះ។</p>

                            <Button
                                onClick={() => { setEditActivity(null); setOpen(true); }}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-10 font-bold shadow-md transition-all font-kantumruy"
                            >
                                បង្កើតថ្មី
                            </Button>
                        </div>
                    ) : (
                        activities.map((item, index) => (
                            <div key={item.id} className="group relative pl-0 sm:pl-20">
                                {/* Bullet */}
                                <div className="absolute left-7 top-10 w-4 h-4 rounded-full bg-background border-[3px] border-red-600 z-10 transition-all duration-500 group-hover:scale-125 group-hover:bg-red-600 hidden sm:block shadow-sm" />

                                <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all rounded-[2rem] bg-card overflow-hidden group-hover:-translate-y-1 duration-300">
                                    <div className="flex flex-col md:flex-row items-center">
                                        {/* Time Box */}
                                        <div className="w-full md:w-40 p-8 flex flex-col items-center justify-center bg-muted/20 md:border-r border-transparent">
                                            <div className="p-3 rounded-2xl bg-background shadow-inner text-red-600 mb-3">
                                                {(() => {
                                                    const IconComp = item.icon ? KHMER_ICONS_MAP[item.icon] : Clock;
                                                    return IconComp ? <IconComp size={20} /> : <Clock size={20} />;
                                                })()}
                                            </div>
                                            <span className="text-xl font-black text-foreground font-mono tracking-tight">{item.time}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Scheduled Time</span>
                                        </div>

                                        {/* Content Box */}
                                        <div className="flex-1 p-8">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-black text-foreground font-kantumruy leading-tight">{item.title}</h3>
                                                    {index === 0 && (
                                                        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-[10px] font-black uppercase tracking-widest">
                                                            Starting Event
                                                        </span>
                                                    )}
                                                </div>
                                                {item.description && (
                                                    <p className="text-muted-foreground font-medium font-kantumruy leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status / Order & Actions */}
                                        <div className="p-8 flex items-center justify-between md:justify-end gap-6 bg-muted/10 md:bg-transparent">
                                            <div className="hidden lg:flex w-10 h-10 rounded-full items-center justify-center text-[10px] font-black text-muted-foreground/30 bg-muted/30 shadow-inner">
                                                {String(index + 1).padStart(2, '0')}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all shadow-sm bg-background/50"
                                                    onClick={() => { setEditActivity(item); setOpen(true); }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all shadow-sm bg-background/50"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
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

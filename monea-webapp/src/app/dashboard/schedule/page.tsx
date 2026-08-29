import { useState, useEffect } from "react";
import { 
    Plus, Clock, Calendar, Activity, Pencil, Trash2, Scissors, 
    Heart, Camera, Utensils, Music, Flower2, Users, GlassWater, 
    Landmark, Sparkles, Wand2, ArrowUp, ArrowDown, ArrowUpDown, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ActivityForm } from "./activity-form";
import { useTranslation } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/app/dashboard/_components/PageHeader";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { moneaClient } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

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

const KHMER_NUMERALS = ["១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩", "១០", "១១", "១២", "១៣", "១៤", "១៥"];

const STANDARD_KHMER_ACTIVITIES = [
    { time: "07:00 ព្រឹក", title: "ពិធីហែកូនកំលោះ និងរៀបចំគ្រឿងដង្វាយ", description: "ជួបជុំសាច់ញាតិ និងភ្ញៀវកិត្តិយស ហែកូនកំលោះចូលរោងជ័យ", icon: "landmark" },
    { time: "08:30 ព្រឹក", title: "ពិធីសែនព្រេន និងសំពះផ្ទឹម", description: "សំពះមេបា ញាតិមិត្តទាំងសងខាង ដើម្បីសុំពរជ័យ", icon: "heart" },
    { time: "09:30 ព្រឹក", title: "ពិធីកាត់សក់បង្កក់សិរី", description: "កាត់សក់សិរីមង្គល និងចងដៃជូនពរជ័យដល់គូស្វាមីភរិយាថ្មី", icon: "scissors" },
    { time: "11:30 ថ្ងៃត្រង់", title: "ពិធីពិសាអាហារថ្ងៃត្រង់", description: "ទទួលទានអាហារថ្ងៃត្រង់ជួបជុំសាច់ញាតិ", icon: "utensils" },
    { time: "05:00 ល្ងាច", title: "ពិធីទទួលភ្ញៀវ និងពិសាភោជនាហារពេលល្ងាច", description: "ទទួលភ្ញៀវកិត្តិយស ថតរូបអនុស្សាវរីយ៍ និងពិសារអាហារពេលល្ងាច", icon: "glass" },
];

export default function SchedulePage() {
    const { t } = useTranslation();
    const [activities, setActivities] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingTemplate, setLoadingTemplate] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [editActivity, setEditActivity] = useState<any | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; title: string }>({
        open: false,
        id: "",
        title: "",
    });

    async function fetchActivities() {
        setLoading(true);
        try {
            const res = await moneaClient.get<any[]>("/api/activities");
            if (res.data && Array.isArray(res.data)) {
                setActivities(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { 
        fetchActivities(); 
    }, []);

    async function handleLoadStandardTemplate() {
        if (activities.length > 0 && !confirm("តើអ្នកចង់បន្ថែមគំរូកាលវិភាគស្តង់ដារទាំង ៥ នេះចូលបន្ថែមមែនទេ?")) {
            return;
        }
        setLoadingTemplate(true);
        try {
            for (const item of STANDARD_KHMER_ACTIVITIES) {
                await moneaClient.post("/api/activities", item);
            }
            await fetchActivities();
        } catch (e) {
            console.error("Failed to add standard activities", e);
        } finally {
            setLoadingTemplate(false);
        }
    }

    async function handleDeleteConfirm() {
        if (!deleteConfirm.id) return;
        try {
            const res = await moneaClient.delete(`/api/activities/${deleteConfirm.id}`);
            if (!res.error) {
                fetchActivities();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setDeleteConfirm({ open: false, id: "", title: "" });
        }
    }

    // Reorder Handlers
    async function handleMove(index: number, direction: "up" | "down") {
        if (isReordering) return;
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= activities.length) return;

        const newActivities = [...activities];
        const temp = newActivities[index];
        newActivities[index] = newActivities[targetIndex];
        newActivities[targetIndex] = temp;

        // Optimistic UI Update
        setActivities(newActivities);
        setIsReordering(true);

        try {
            const orderPayload = newActivities.map((item, idx) => ({ id: item.id, order: idx }));
            await moneaClient.put("/api/activities/reorder", orderPayload);
        } catch (e) {
            console.error("Failed to save reorder:", e);
            fetchActivities();
        } finally {
            setIsReordering(false);
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-16 relative">
            {/* Top Page Header */}
            <PageHeader
                title={t("dashboard.schedule.title", { defaultValue: "កាលវិភាគកម្មវិធី" })}
                icon={Clock}
                iconColor="text-rose-500"
                action={
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {activities.length === 0 && (
                            <Button
                                variant="outline"
                                onClick={handleLoadStandardTemplate}
                                disabled={loadingTemplate}
                                className="h-10 sm:h-11 px-4 rounded-xl font-bold font-kantumruy text-xs border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30 transition-all flex items-center gap-1.5"
                            >
                                <Wand2 className="w-3.5 h-3.5" />
                                <span>{loadingTemplate ? "កំពុងបញ្ចូល..." : "ប្រើគំរូកាលវិភាគស្តង់ដារ"}</span>
                            </Button>
                        )}
                        <Button 
                            onClick={() => { setEditActivity(null); setOpen(true); }}
                            className="h-10 sm:h-11 px-4 sm:px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold font-kantumruy text-xs sm:text-sm shadow-md shadow-rose-600/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" /> 
                            <span>{t("dashboard.schedule.addActivity", { defaultValue: "បន្ថែមសកម្មភាព" })}</span>
                        </Button>
                    </div>
                }
            />

            {/* Modal Dialog for Add / Edit */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[520px] rounded-[2rem] border border-border shadow-2xl p-0 overflow-hidden bg-background">
                    <DialogHeader className="p-6 sm:p-8 pb-4 bg-muted/30 border-b border-border/40">
                        <DialogTitle className="text-xl font-black font-kantumruy tracking-tight text-foreground">
                            {editActivity 
                                ? t("dashboard.schedule.editActivity", { defaultValue: "កែប្រែកម្មវិធី" }) 
                                : t("dashboard.schedule.newActivity", { defaultValue: "បង្កើតកម្មវិធីថ្មី" })}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs font-medium font-kantumruy">
                            {t("dashboard.schedule.form.subtitle", { defaultValue: "កំណត់ម៉ោង និងព័ត៌មានលម្អិតនៃពិធីនីមួយៗ។" })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 sm:p-8 pt-4">
                        <ActivityForm 
                            initialData={editActivity} 
                            onSuccess={() => { setOpen(false); fetchActivities(); }} 
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: "", title: "" })}
                onConfirm={handleDeleteConfirm}
                title={t("dashboard.schedule.deleteTitle", { defaultValue: "លុបកម្មវិធីនេះ?" })}
                description={t("dashboard.schedule.deleteDesc", { defaultValue: `តើអ្នកប្រាកដជាចង់លុបកម្មវិធី "${deleteConfirm.title}" មែនទេ?` })}
                confirmLabel={t("common.actions.delete", { defaultValue: "លុបចេញ" })}
                cancelLabel={t("common.actions.cancel", { defaultValue: "បោះបង់" })}
                variant="danger"
            />

            {/* Main Content Area */}
            {loading ? (
                <div className="p-20 text-center flex flex-col items-center justify-center space-y-4 bg-white/40 dark:bg-white/5 rounded-3xl border border-border/50">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-3 border-rose-500/20 rounded-full" />
                        <div className="absolute inset-0 border-3 border-t-rose-500 rounded-full animate-spin" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground font-kantumruy">
                        {t("dashboard.schedule.loading", { defaultValue: "កំពុងផ្ទុកកាលវិភាគ..." })}
                    </span>
                </div>
            ) : activities.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-white dark:bg-[#141419] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-10 sm:p-14 text-center shadow-sm space-y-6"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-rose-500/10 to-amber-500/10 rounded-3xl flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20 shadow-inner">
                        <Clock size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-foreground font-kantumruy">
                            {t("dashboard.schedule.emptyTitle", { defaultValue: "មិនទាន់មានកាលវិភាគនៅឡើយទេ" })}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium font-kantumruy leading-relaxed max-w-md mx-auto">
                            {t("dashboard.schedule.emptySubtitle", { defaultValue: "សូមបន្ថែមកម្មវិធីពិធីការដូចជា ពិធីហែកូនកំលោះ ពិធីកាត់សក់ ឬពិធីជប់លៀង ដើម្បីបង្ហាញលើសំបុត្រអញ្ជើញរបស់អ្នក។" })}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Button
                            onClick={() => { setEditActivity(null); setOpen(true); }}
                            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 px-6 font-bold font-kantumruy text-xs shadow-md shadow-rose-600/20 transition-all active:scale-95"
                        >
                            <Plus className="mr-2 h-4 w-4" /> 
                            {t("dashboard.schedule.createNew", { defaultValue: "បង្កើតកម្មវិធីថ្មី" })}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleLoadStandardTemplate}
                            disabled={loadingTemplate}
                            className="w-full sm:w-auto rounded-xl h-11 px-6 font-bold font-kantumruy text-xs border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30 transition-all"
                        >
                            <Wand2 className="mr-2 h-4 w-4" />
                            {loadingTemplate ? "កំពុងបញ្ចូល..." : "ប្រើគំរូស្តង់ដារ ៥ កម្មវិធី"}
                        </Button>
                    </div>
                </motion.div>
            ) : (
                <div className="w-full space-y-3">
                    {/* Helper reorder hint */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-kantumruy px-1 pb-1">
                        <span>ចំនួនសរុប៖ <strong className="text-foreground">{activities.length} កម្មវិធី</strong></span>
                        <span className="text-[11px] flex items-center gap-1">
                            <ArrowUpDown size={13} className="text-rose-500" />
                            ចុចព្រួញឡើង/ចុះ ដើម្បីប្តូរលំដាប់លំដោយ
                        </span>
                    </div>

                    {/* Activity Cards List */}
                    <div className="space-y-3">
                        {activities.map((item, index) => {
                            const IconComp = item.icon ? KHMER_ICONS_MAP[item.icon] : Clock;
                            const isFirst = index === 0;
                            const isLast = index === activities.length - 1;
                            const numeral = KHMER_NUMERALS[index] || String(index + 1);

                            return (
                                <motion.div 
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className="border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl bg-white dark:bg-[#141419] overflow-hidden group">
                                        <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                                            
                                            {/* Left Column: Reorder Arrows & Sequence & Icon & Info */}
                                            <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0">
                                                
                                                {/* Reorder Buttons (Up / Down) */}
                                                <div className="flex flex-col items-center justify-center gap-0.5 flex-shrink-0 bg-slate-50 dark:bg-white/5 rounded-xl p-1 border border-slate-200/60 dark:border-white/5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMove(index, "up")}
                                                        disabled={isFirst || isReordering}
                                                        className={cn(
                                                            "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                                                            isFirst 
                                                                ? "text-slate-300 dark:text-white/10 cursor-not-allowed" 
                                                                : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 hover:text-rose-600 shadow-sm active:scale-90"
                                                        )}
                                                        title="រំកិលឡើងលើ (Move Up)"
                                                    >
                                                        <ArrowUp size={13} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMove(index, "down")}
                                                        disabled={isLast || isReordering}
                                                        className={cn(
                                                            "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                                                            isLast 
                                                                ? "text-slate-300 dark:text-white/10 cursor-not-allowed" 
                                                                : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 hover:text-rose-600 shadow-sm active:scale-90"
                                                        )}
                                                        title="រំកិលចុះក្រោម (Move Down)"
                                                    >
                                                        <ArrowDown size={13} strokeWidth={2.5} />
                                                    </button>
                                                </div>

                                                {/* Khmer Sequence Number Badge */}
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs font-kantumruy flex-shrink-0 border border-slate-200/80 dark:border-white/10">
                                                    {numeral}
                                                </div>

                                                {/* Icon Avatar */}
                                                <div className="flex flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-500/10 text-rose-600 items-center justify-center">
                                                    {IconComp ? <IconComp className="w-4 h-4 sm:w-5 sm:h-5" /> : <Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
                                                </div>

                                                {/* Time & Title Info */}
                                                <div className="space-y-0.5 flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-mono text-[11px] font-bold whitespace-nowrap border border-rose-200/60 dark:border-rose-500/20">
                                                            <Clock className="w-3 h-3 text-rose-500" />
                                                            {item.time}
                                                        </span>

                                                        {isFirst && (
                                                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider font-kantumruy">
                                                                កម្មវិធីដំបូង
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="text-sm sm:text-base font-bold text-foreground font-kantumruy leading-snug truncate">
                                                        {item.title}
                                                    </h3>

                                                    {item.description && (
                                                        <p className="text-[11px] text-muted-foreground font-medium font-kantumruy leading-relaxed line-clamp-1">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Action Buttons */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 sm:w-auto sm:px-2.5 p-0 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all font-kantumruy text-xs font-bold flex items-center gap-1"
                                                    onClick={() => { setEditActivity(item); setOpen(true); }}
                                                    title="កែប្រែ"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    <span className="hidden sm:inline">កែប្រែ</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 sm:w-auto sm:px-2.5 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all font-kantumruy text-xs font-bold flex items-center gap-1"
                                                    onClick={() => setDeleteConfirm({ open: true, id: item.id, title: item.title })}
                                                    title="លុប"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    <span className="hidden sm:inline">លុប</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

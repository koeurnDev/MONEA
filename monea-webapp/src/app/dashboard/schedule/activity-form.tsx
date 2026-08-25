import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Scissors, Heart, Camera, Utensils, Music, Flower2, Users, Clock, GlassWater, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { moneaClient } from "@/lib/api-client";

export function ActivityForm({ onSuccess, initialData }: { onSuccess: () => void, initialData?: any }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const formSchema = z.object({
        title: z.string().min(1, t("dashboard.schedule.form.validation.title", { defaultValue: "សូមបញ្ចូលឈ្មោះកម្មវិធី" })),
        time: z.string().min(1, t("dashboard.schedule.form.validation.time", { defaultValue: "សូមបញ្ចូលម៉ោងកម្មវិធី" })),
        description: z.string().optional(),
        icon: z.string().optional(),
    });

    const ICONS = [
        { id: "scissors", icon: Scissors, label: t("dashboard.schedule.icons.scissors", { defaultValue: "កាត់សក់" }) },
        { id: "heart", icon: Heart, label: t("dashboard.schedule.icons.heart", { defaultValue: "បេះដូង" }) },
        { id: "flower", icon: Flower2, label: t("dashboard.schedule.icons.flower", { defaultValue: "ផ្កា" }) },
        { id: "users", icon: Users, label: t("dashboard.schedule.icons.users", { defaultValue: "ភ្ញៀវ" }) },
        { id: "utensils", icon: Utensils, label: t("dashboard.schedule.icons.utensils", { defaultValue: "អាហារ" }) },
        { id: "camera", icon: Camera, label: t("dashboard.schedule.icons.camera", { defaultValue: "ថតរូប" }) },
        { id: "music", icon: Music, label: t("dashboard.schedule.icons.music", { defaultValue: "តន្ត្រី" }) },
        { id: "glass", icon: GlassWater, label: t("dashboard.schedule.icons.glass", { defaultValue: "ជប់លៀង" }) },
        { id: "landmark", icon: Landmark, label: t("dashboard.schedule.icons.landmark", { defaultValue: "ពិធី" }) },
    ];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            time: initialData?.time || "",
            description: initialData?.description || "",
            icon: initialData?.icon || "heart",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setErrorMsg("");
        try {
            if (initialData) {
                const res = await moneaClient.put(`/api/activities/${initialData.id}`, values);
                if (res.error) throw new Error(res.error);
            } else {
                const res = await moneaClient.post("/api/activities", values);
                if (res.error) throw new Error(res.error);
            }
            onSuccess();
            form.reset();
        } catch (e: any) {
            console.error("Failed to save activity", e);
            setErrorMsg(e?.message || "Failed to save activity");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-xs font-bold font-kantumruy border border-red-500/20">
                        {errorMsg}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-1">
                                <FormLabel className="font-bold font-kantumruy text-xs text-foreground">
                                    {t("dashboard.schedule.form.time", { defaultValue: "ម៉ោងវេលា" })}
                                </FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="07:00 ព្រឹក" 
                                        {...field} 
                                        className="h-11 rounded-xl bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 font-mono text-sm focus-visible:ring-rose-500 px-3.5" 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel className="font-bold font-kantumruy text-xs text-foreground">
                                    {t("dashboard.schedule.form.title", { defaultValue: "ឈ្មោះកម្មវិធី" })}
                                </FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="ពិធីហែកូនកំលោះ..." 
                                        {...field} 
                                        className="h-11 rounded-xl bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 font-kantumruy text-sm focus-visible:ring-rose-500 px-3.5" 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold font-kantumruy text-xs text-foreground">
                                {t("dashboard.schedule.form.icons", { defaultValue: "រូបតំណាង (Icon)" })}
                            </FormLabel>
                            <FormControl>
                                <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                                    {ICONS.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => field.onChange(item.id)}
                                            title={item.label}
                                            className={cn(
                                                "w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-95",
                                                field.value === item.id 
                                                    ? "bg-rose-500/10 border-rose-500 text-rose-600 shadow-sm font-black" 
                                                    : "bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-muted-foreground hover:bg-slate-100"
                                            )}
                                        >
                                            <item.icon size={18} />
                                        </button>
                                    ))}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold font-kantumruy text-xs text-foreground">
                                {t("dashboard.schedule.form.description", { defaultValue: "ព័ត៌មានលម្អិតបន្ថែម (ជម្រើស)" })}
                            </FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder={t("dashboard.schedule.form.descriptionPlaceholder", { defaultValue: "ពិពណ៌នាអំពីពិធី..." })} 
                                    {...field} 
                                    className="rounded-xl bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 min-h-[90px] font-kantumruy text-sm focus-visible:ring-rose-500 p-3.5" 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="pt-2">
                    <Button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full h-12 text-sm rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold font-kantumruy shadow-md shadow-rose-600/20 transition-all active:scale-98"
                    >
                        {loading 
                            ? t("dashboard.schedule.form.saving", { defaultValue: "កំពុងរក្សាទុក..." }) 
                            : initialData 
                                ? t("dashboard.schedule.form.edit", { defaultValue: "កែប្រែកម្មវិធី" }) 
                                : t("dashboard.schedule.form.add", { defaultValue: "រក្សាទុកកម្មវិធី" })
                        }
                    </Button>
                </div>
            </form>
        </Form>
    );
}

import { useState } from "react";
import { m } from "framer-motion";
import { User, MapPin, Sparkles } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { moneaClient } from "@/lib/api-client";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";

export function GuestForm({ onSuccess, onDone, initialData }: { onSuccess: () => void, onDone?: () => void, initialData?: any }) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const formSchema = z.object({
        name: z.string().min(1, t("guests.form.validation.name")),
        source: z.string().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            source: initialData?.source || initialData?.group || "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const url = "/api/guests";
            const body = initialData ? { ...values, id: initialData.id } : values;

            const res = initialData 
                ? await moneaClient.patch(url, body)
                : await moneaClient.post(url, body);

            if (!res.error) {
                onSuccess();
                form.reset();
                if (onDone) onDone();
            } else {
                const isLimitError = (res as any).status === 429 || res.error?.toLowerCase().includes("limit") || res.error?.toLowerCase().includes("upgrade");
                if (isLimitError) {
                    showToast({
                        title: "Action Limit Reached",
                        description: "You've hit the action limit. Upgrade to Pro for unlimited access.",
                        type: "error",
                        action: { label: "Upgrade to Pro", onClick: () => window.location.href = "/dashboard/upgrade" }
                    });
                } else {
                    showToast({
                        title: "Action Failed",
                        description: res.error,
                        type: "error"
                    });
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <div className="space-y-6">
                    {/* Section Header */}
                    <m.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 px-2 mb-2"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg border border-white/20">
                                <User className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-foreground font-kantumruy leading-tight">
                                {t("guests.form.sectionTitle")}
                            </h3>
                            <p className="text-xs text-muted-foreground font-kantumruy mt-1 opacity-70 flex items-center gap-1.5">
                                <Sparkles size={12} className="text-primary" />
                                <span>{t("guests.form.sectionSubtitle")}</span>
                            </p>
                        </div>
                    </m.div>

                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-50/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-3xl p-4 md:p-8 space-y-6 shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -mr-16 -mt-16 rounded-full group-hover:bg-primary/10 transition-colors duration-500" />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-200 font-kantumruy px-1 block mb-1">
                                        {t("guests.form.nameLabel")} <span className="text-rose-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative group/input">
                                            <div className="absolute inset-0 bg-primary/0 group-focus-within/input:bg-primary/[0.02] rounded-2xl transition-all duration-300" />
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400 group-focus-within/input:text-primary group-focus-within/input:scale-110 transition-all duration-300 z-20" />
                                            <Input
                                                placeholder={t("guests.form.namePlaceholder")}
                                                className="pl-12 h-11 md:h-14 text-base rounded-2xl font-kantumruy border-slate-200 dark:border-white/10 bg-white/80 dark:bg-background/50 hover:bg-white dark:hover:bg-background/80 focus:bg-white dark:focus:bg-background backdrop-blur-md shadow-sm dark:shadow-none focus-visible:ring-primary/10 focus-visible:border-primary/30 transition-all duration-300 font-bold placeholder:text-muted-foreground/40 placeholder:font-normal"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="font-kantumruy text-[10px] mt-1 italic text-rose-500/80" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="source"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-200 font-kantumruy px-1 block mb-1">
                                        {t("guests.form.locationLabel")}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative group/input">
                                            <div className="absolute inset-0 bg-primary/0 group-focus-within/input:bg-primary/[0.02] rounded-2xl transition-all duration-300" />
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400 group-focus-within/input:text-primary group-focus-within/input:scale-110 transition-all duration-300 z-20" />
                                            <Input
                                                placeholder={t("guests.form.locationPlaceholder")}
                                                className="pl-12 h-11 md:h-14 text-sm rounded-2xl font-kantumruy border-slate-200 dark:border-white/10 bg-white/80 dark:bg-background/50 hover:bg-white dark:hover:bg-background/80 focus:bg-white dark:focus:bg-background backdrop-blur-md shadow-sm dark:shadow-none focus-visible:ring-primary/10 focus-visible:border-primary/30 transition-all duration-300 font-medium placeholder:text-muted-foreground/40"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="font-kantumruy text-[10px] mt-1 italic text-rose-500/80" />
                                </FormItem>
                            )}
                        />
                    </m.div>
                </div>

                <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 md:h-14 rounded-2xl text-base md:text-lg font-bold font-kantumruy transition-all bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-xl shadow-red-500/25 active:scale-98 group/btn"
                    >

                        <div className="relative flex items-center justify-center gap-2.5">
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>{t("guests.form.saving")}</span>
                                </>
                            ) : (
                                <>
                                    <span>{initialData ? t("guests.form.editBtn") : t("guests.form.saveBtn")}</span>
                                    <Sparkles className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                </>
                            )}
                        </div>
                    </Button>
                </m.div>
            </form>
        </Form>
    );
}

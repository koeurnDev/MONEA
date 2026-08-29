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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                <div className="space-y-4">
                    {/* Section Header */}
                    <m.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3.5 mb-1"
                    >
                        <div className="relative">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-xs">
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground font-kantumruy leading-tight">
                                {t("guests.form.sectionTitle")}
                            </h3>
                            <p className="text-xs text-muted-foreground font-kantumruy opacity-75 flex items-center gap-1">
                                <Sparkles size={11} className="text-amber-500" />
                                <span>{t("guests.form.sectionSubtitle")}</span>
                            </p>
                        </div>
                    </m.div>

                    <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-slate-50/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl p-4 space-y-4 shadow-sm backdrop-blur-xl"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className="text-xs font-bold text-foreground font-kantumruy">
                                        {t("guests.form.nameLabel")} <span className="text-rose-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative group/input">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-rose-500 transition-colors z-20" />
                                            <Input
                                                placeholder={t("guests.form.namePlaceholder")}
                                                className="pl-10 h-11 text-sm rounded-xl font-kantumruy border-border/80 bg-background/80 focus:bg-background focus-visible:ring-rose-500/20 focus-visible:border-rose-500/50 font-bold"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="font-kantumruy text-[10px] mt-0.5 text-rose-500" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="source"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className="text-xs font-bold text-foreground font-kantumruy">
                                        {t("guests.form.locationLabel")}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative group/input">
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-rose-500 transition-colors z-20" />
                                            <Input
                                                placeholder={t("guests.form.locationPlaceholder")}
                                                className="pl-10 h-11 text-sm rounded-xl font-kantumruy border-border/80 bg-background/80 focus:bg-background focus-visible:ring-rose-500/20 focus-visible:border-rose-500/50 font-medium"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="font-kantumruy text-[10px] mt-0.5 text-rose-500" />
                                </FormItem>
                            )}
                        />
                    </m.div>
                </div>

                <m.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 rounded-xl text-sm font-bold font-kantumruy transition-all bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 active:scale-98"
                    >
                        <div className="flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>{t("guests.form.saving")}</span>
                                </>
                            ) : (
                                <>
                                    <span>{initialData ? t("guests.form.editBtn") : t("guests.form.saveBtn")}</span>
                                    <Sparkles className="w-4 h-4" />
                                </>
                            )}
                        </div>
                    </Button>
                </m.div>
            </form>
        </Form>
    );
}

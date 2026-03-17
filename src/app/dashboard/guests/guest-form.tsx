"use client";

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

const formSchema = z.object({
    name: z.string().min(1, "សូមបញ្ចូលឈ្មោះភ្ញៀវ"),
    source: z.string().optional(),
});

export function GuestForm({ onSuccess, onDone, initialData }: { onSuccess: () => void, onDone?: () => void, initialData?: any }) {
    const [loading, setLoading] = useState(false);
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
                            <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full" />
                            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-400 flex items-center justify-center text-white shadow-lg border border-white/20">
                                <User className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-black text-foreground font-kantumruy leading-none tracking-tight italic">
                                ព័ត៌មានភ្ញៀវ
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-2 opacity-40 flex items-center gap-2">
                                <Sparkles size={10} className="text-rose-500" />
                                ព័ត៌មានអត្តសញ្ញាណភ្ញៀវ
                            </p>
                        </div>
                    </m.div>

                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-50/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-3xl p-4 md:p-8 space-y-6 shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[50px] -mr-16 -mt-16 rounded-full group-hover:bg-rose-500/10 transition-colors duration-500" />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-kantumruy px-1 block mb-2 opacity-70">ឈ្មោះភ្ញៀវ *</FormLabel>
                                    <FormControl>
                                        <div className="relative group/input">
                                            <div className="absolute inset-0 bg-rose-500/0 group-focus-within/input:bg-rose-500/[0.02] rounded-2xl transition-all duration-300" />
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400 group-focus-within/input:text-rose-600 group-focus-within/input:scale-110 transition-all duration-300 z-20" />
                                            <Input
                                                placeholder="តារា សុខ..."
                                                className="pl-12 h-11 md:h-14 text-base rounded-2xl font-kantumruy border-slate-200 dark:border-white/10 bg-white/80 dark:bg-background/50 hover:bg-white dark:hover:bg-background/80 focus:bg-white dark:focus:bg-background backdrop-blur-md shadow-sm dark:shadow-none focus-visible:ring-rose-600/10 focus-visible:border-rose-600/30 transition-all duration-300 font-bold placeholder:text-muted-foreground/40 placeholder:font-normal"
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
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-kantumruy px-1 block mb-2 opacity-70">មកពីណា? (ជាប់សាច់ញាតិខាងណា)</FormLabel>
                                    <FormControl>
                                        <div className="relative group/input">
                                            <div className="absolute inset-0 bg-rose-500/0 group-focus-within/input:bg-rose-500/[0.02] rounded-2xl transition-all duration-300" />
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400 group-focus-within/input:text-rose-600 group-focus-within/input:scale-110 transition-all duration-300 z-20" />
                                            <Input
                                                placeholder=" ភ្នំពេញ, មិត្តខាងកូនក្រមុំ..."
                                                className="pl-12 h-11 md:h-14 text-sm rounded-2xl font-kantumruy border-slate-200 dark:border-white/10 bg-white/80 dark:bg-background/50 hover:bg-white dark:hover:bg-background/80 focus:bg-white dark:focus:bg-background backdrop-blur-md shadow-sm dark:shadow-none focus-visible:ring-rose-600/10 focus-visible:border-rose-600/30 transition-all duration-300 font-medium placeholder:text-muted-foreground/40"
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
                        className="w-full h-12 md:h-16 rounded-2xl text-lg font-black font-kantumruy transition-all relative overflow-hidden group/btn bg-slate-900 hover:bg-black active:scale-[0.982] shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-100 group-hover/btn:opacity-90 transition-opacity" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)] opacity-0 group-hover/btn:opacity-20 transition-opacity duration-700 blur-xl" />

                        <div className="relative flex items-center justify-center gap-3">
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>រក្សាសិទ្ធិ...</span>
                                </>
                            ) : (
                                <>
                                    <span>{initialData ? "កែប្រែព័ត៌មានភ្ញៀវ" : "រក្សាទុកព័ត៌មានភ្ញៀវ"}</span>
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

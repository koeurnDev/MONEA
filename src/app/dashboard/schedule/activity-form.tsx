"use client";

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

const formSchema = z.object({
    title: z.string().min(1, "សូមបញ្ចូលចំណងជើងសកម្មភាព"),
    time: z.string().min(1, "សូមបញ្ចូលពេលវេលា"),
    description: z.string().optional(),
    icon: z.string().optional(),
});

const KHMER_ICONS = [
    { id: "scissors", icon: Scissors, label: "កាត់សក់" },
    { id: "heart", icon: Heart, label: "សំពះផ្ទឹម" },
    { id: "flower", icon: Flower2, label: "សូត្រមន្ត" },
    { id: "users", icon: Users, label: "ហែជំនូន" },
    { id: "utensils", icon: Utensils, label: "អាហារ" },
    { id: "camera", icon: Camera, label: "ថតរូប" },
    { id: "music", icon: Music, label: "តន្ត្រី" },
    { id: "glass", icon: GlassWater, label: "ទទួលភ្ញៀវ" },
    { id: "landmark", icon: Landmark, label: "ផ្ទះកូនស្រី" },
];

export function ActivityForm({ onSuccess, initialData }: { onSuccess: () => void, initialData?: any }) {
    const [loading, setLoading] = useState(false);
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
        if (initialData) {
            await fetch(`/api/activities/${initialData.id}`, {
                method: "PUT",
                body: JSON.stringify(values),
            });
        } else {
            await fetch("/api/activities", {
                method: "POST",
                body: JSON.stringify(values),
            });
        }
        setLoading(false);
        onSuccess();
        form.reset();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex space-x-4">
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem className="w-1/3">
                                <FormLabel>ម៉ោង</FormLabel>
                                <FormControl>
                                    <Input placeholder="07:00 ព្រឹក" {...field} className="h-11 rounded-xl bg-muted border-none shadow-sm focus-visible:ring-red-500" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="w-2/3">
                                <FormLabel>ចំណងជើងសកម្មភាព</FormLabel>
                                <FormControl>
                                    <Input placeholder="ពិធីហែជំនូន" {...field} className="h-11 rounded-xl bg-muted border-none shadow-sm focus-visible:ring-red-500" />
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
                            <FormLabel>ជ្រើសរើសរូបតំណាង (Icons)</FormLabel>
                            <FormControl>
                                <div className="grid grid-cols-5 sm:grid-cols-9 gap-3">
                                    {KHMER_ICONS.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => field.onChange(item.id)}
                                            title={item.label}
                                            className={cn(
                                                "w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all",
                                                field.value === item.id 
                                                    ? "bg-red-50 border-red-500 text-red-600 shadow-sm" 
                                                    : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
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
                            <FormLabel>ការពិពណ៌នា (ស្របចិត្ត)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="ព័ត៌មានលម្អិតអំពីសកម្មភាពនេះ..." {...field} className="rounded-xl bg-muted border-none shadow-sm min-h-[100px] focus-visible:ring-red-500" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading} className="w-full h-12 text-lg rounded-xl bg-red-600 hover:bg-red-700 shadow-md font-bold font-kantumruy">
                    {loading ? "កំពុងរក្សាទុក..." : initialData ? "កែប្រែសកម្មភាព" : "បន្ថែមសកម្មភាព"}
                </Button>
            </form>
        </Form>
    );
}

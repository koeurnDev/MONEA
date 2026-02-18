"use client";

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
import { useState } from "react";
import { User, MapPin } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(1, "សូមបញ្ចូលឈ្មោះភ្ញៀវ (Name is required)"),
    source: z.string().optional(),
});

export function GuestForm({ onSuccess, initialData }: { onSuccess: () => void, initialData?: any }) {
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
            const url = initialData ? `/api/guests` : "/api/guests";
            const method = initialData ? "PATCH" : "POST";
            const body = initialData ? { ...values, id: initialData.id } : values;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                onSuccess();
                form.reset();
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
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700">ឈ្មោះភ្ញៀវ (Guest Name)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <User className="absolute left-3 top-4 h-6 w-6 text-gray-400" />
                                    <Input placeholder="Sok Dara" className="pl-12 h-14 text-lg" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700">មកពីណា? (Source)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-4 h-6 w-6 text-gray-400" />
                                    <Input placeholder="ភ្នំពេញ, ព្រៃវែង..." className="pl-12 h-14 text-lg" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 h-14 text-lg font-bold">
                    {loading ? "កំពុងរក្សាទុក..." : (initialData ? "កែប្រែ (Update)" : "រក្សាទុក (Save Guest)")}
                </Button>
            </form>
        </Form>
    );
}

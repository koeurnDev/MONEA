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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const formSchema = z.object({
    title: z.string().min(1, "សូមបញ្ចូលចំណងជើងសកម្មភាព"),
    time: z.string().min(1, "សូមបញ្ចូលពេលវេលា"),
    description: z.string().optional(),
});

export function ActivityForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            time: "",
            description: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        await fetch("/api/activities", {
            method: "POST",
            body: JSON.stringify(values),
        });
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
                                    <Input placeholder="07:00 ព្រឹក" {...field} />
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
                                    <Input placeholder="ពិធីហែជំនូន" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ការពិពណ៌នា (ស្របចិត្ត)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="ព័ត៌មានលម្អិតអំពីសកម្មភាពនេះ..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading} className="w-full h-12 text-lg">
                    {loading ? "កំពុងរក្សាទុក..." : "បន្ថែមសកម្មភាព"}
                </Button>
            </form>
        </Form>
    );
}

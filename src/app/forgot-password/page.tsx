"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, ChevronLeft } from "lucide-react";
import { m, AnimatePresence } from 'framer-motion';
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
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import dynamic from "next/dynamic";
const Turnstile = dynamic(() => import("@marsidev/react-turnstile").then(mod => mod.Turnstile), { ssr: false });

const formSchema = z.object({
    email: z.string().email({ message: "សូមបញ្ចូលអ៊ីមែលដែលត្រឹមត្រូវ (Invalid email)" }),
});

export default function ForgotPasswordPage() {
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setError("");
        setSuccessMessage("");
        setIsLoading(true);
        try {
            // Note: Replace with actual forgot-password API endpoint when available
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: values.email,
                    turnstileToken
                }),
            });

            if (res.ok) {
                setSuccessMessage("តំណភ្ជាប់សម្រាប់ប្តូរពាក្យសម្ងាត់ត្រូវបានផ្ញើទៅកាន់អ៊ីមែលរបស់អ្នក។ សូមពិនិត្យមើល!");
            } else {
                let data;
                try {
                    data = await res.json();
                } catch (e) {
                    data = { error: `Server Error (Code: ${res.status})` };
                }
                setError(data.error || "មិនអាចផ្ញើសំណើបានទេ។ សូមព្យាយាមម្តងទៀត។");
            }
        } catch (e) {
            setError("មានបញ្ហាបច្ចេកទេស។ សូមព្យាយាមម្តងទៀត។");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-black py-10">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511285560982-1356c11d4606?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40"
                    style={{ backgroundPosition: 'center 40%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 backdrop-blur-[2px]"></div>
            </div>

            {/* Content Container */}
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-4 md:p-6"
            >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                    {/* Back Button */}
                    <Link
                        href="/login"
                        className="absolute left-6 top-6 text-white/40 hover:text-white transition-colors group flex items-center gap-1 text-[10px] font-black uppercase tracking-widest z-20"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> ត្រឡប់
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex justify-center">
                            <MoneaLogo showText size="md" variant="dark" />
                        </Link>
                        <h1 className="text-2xl font-bold text-white mb-2 font-kantumruy mt-4">ភ្លេចពាក្យសម្ងាត់?</h1>
                        <p className="text-white/40 text-xs font-kantumruy">សូមបញ្ចូលអ៊ីមែលរបស់អ្នក ដើម្បីប្តូរពាក្យសម្ងាត់ថ្មី</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white/80 text-xs uppercase tracking-wider font-bold ml-1">អ៊ីមែល</FormLabel>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-3 text-white/40 group-focus-within:text-pink-400 transition-colors">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <Input placeholder="name@example.com" className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-11" {...field} />
                                        </div>
                                        <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-center my-4 scale-90 xs:scale-100 origin-center">
                                <Turnstile
                                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                                    onSuccess={setToken => setTurnstileToken(setToken)}
                                    options={{ theme: 'dark' }}
                                />
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <m.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center font-kantumruy"
                                    >
                                        {error}
                                    </m.div>
                                )}
                                {successMessage && (
                                    <m.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-xs text-center font-kantumruy leading-relaxed"
                                    >
                                        {successMessage}
                                    </m.div>
                                )}
                            </AnimatePresence>

                            <Button type="submit" disabled={isLoading || !!successMessage || !turnstileToken} className="w-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl font-bold uppercase tracking-wide h-11 border border-white/10 hover:shadow-lg hover:shadow-pink-500/20 transition-all mt-6 text-white text-sm">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ផ្ញើតំណភ្ជាប់"}
                            </Button>
                        </form>
                    </Form>

                    <div className="relative mt-6 mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#1c1c1c] px-2 text-white/40 rounded-full font-kantumruy">
                                ចងចាំពាក្យសម្ងាត់?
                            </span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link href="/login" className="font-semibold text-white hover:text-pink-400 transition-colors flex items-center justify-center gap-2 text-sm font-kantumruy">
                            <ArrowLeft className="w-4 h-4" /> ត្រឡប់ទៅការចូលគណនី
                        </Link>
                    </div>

                </div>
            </m.div>
        </div>
    );
}

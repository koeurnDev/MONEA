"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
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

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Lock, Mail, ArrowRight, UserCog, Loader2, Key, Users } from "lucide-react";
import { m, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ROLES } from "@/lib/constants";
import { Turnstile } from '@marsidev/react-turnstile';

const loginSchema = z.object({
    email: z.string().email({ message: "សូមបញ្ចូលអ៊ីមែលឱ្យបានត្រឹមត្រូវ" }),
    password: z.string().min(6, { message: "ពាក្យសម្ងាត់យ៉ាងតិច ៦ ខ្ទង់" }),
});

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [requireCaptcha, setRequireCaptcha] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");

    // Form
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    // Handler
    async function onSubmit(values: z.infer<typeof loginSchema>) {
        if (requireCaptcha && !captchaToken) {
            setError("សូមផ្ទៀងផ្ទាត់ CAPTCHA។ (Please verify CAPTCHA)");
            return;
        }

        setError("");
        setIsLoading(true);
        try {
            const body = { ...values, turnstileToken: captchaToken || undefined };
            const res = await fetch("/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (res.ok) {
                // Redirect based on Role
                const role = data.user?.role;
                if (role === ROLES.EVENT_STAFF) {
                    router.push("/dashboard/gifts");
                } else if (role === ROLES.PLATFORM_OWNER) {
                    router.push("/admin");
                } else {
                    router.push("/dashboard");
                }
                router.refresh();
            } else {
                if (res.status === 428 && data.requireCaptcha) {
                    setRequireCaptcha(true);
                } else if (res.status === 400 && data.error?.includes("CAPTCHA")) {
                    // Reset captcha if it failed serverside
                    setCaptchaToken("");
                }
                let errorMsg = data.error || "អ៊ីមែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ";
                if (data.details) {
                    errorMsg += `\n[MONEA DEBUG] ${data.details}`;
                }
                setError(errorMsg);
            }
        } catch (e: any) {
            setError(e?.message || "មានបញ្ហាបច្ចេកទេស។");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-black">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/bg_staircase.jpg"
                    alt="Background"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 backdrop-blur-[2px]"></div>
            </div>

            {/* Content Container */}
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-6"
            >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex justify-center">
                            <MoneaLogo showText size="md" variant="dark" />
                        </Link>

                        <h1 className="text-2xl font-bold text-white mb-2 font-kantumruy">ចូលប្រើប្រាស់</h1>
                        <p className="text-white/40 text-xs font-kantumruy">សូមបញ្ចូលគណនីរបស់អ្នកដើម្បីបន្ត</p>
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
                                            <Input placeholder="name@example.com" className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50" {...field} />
                                        </div>
                                        <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex justify-between items-center mb-1">
                                            <FormLabel className="text-white/80 text-xs uppercase tracking-wider font-bold ml-1">ពាក្យសម្ងាត់</FormLabel>
                                            <Link href="/forgot-password" className="text-[10px] text-pink-400 hover:text-pink-300">ភ្លេច?</Link>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-3 text-white/40 group-focus-within:text-pink-400 transition-colors">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <Input type="password" placeholder="••••••••" className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50" {...field} />
                                        </div>
                                        <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                )}
                            />

                            {requireCaptcha && (
                                <m.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="flex justify-center my-4 overflow-hidden"
                                >
                                    <Turnstile
                                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                                        onSuccess={(token) => {
                                            setCaptchaToken(token);
                                            setError(""); // Clear error when verified
                                        }}
                                        options={{ theme: 'dark' }}
                                    />
                                </m.div>
                            )}

                            <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl font-bold uppercase tracking-wide h-11 border border-white/10 hover:shadow-lg hover:shadow-pink-500/20 transition-all mt-2">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ចូលគណនី"}
                            </Button>
                        </form>
                    </Form>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <m.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center font-kantumruy"
                            >
                                {error}
                            </m.div>
                        )}
                    </AnimatePresence>

                    {/* Bottom Branding */}
                    <div className="text-center mt-6 opacity-30">
                        <MoneaLogo size="sm" variant="dark" className="justify-center grayscale" />
                    </div>
                </div>
            </m.div>
        </div>
    );
}

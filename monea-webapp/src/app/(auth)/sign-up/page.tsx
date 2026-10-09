"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    User, 
    Mail, 
    Lock, 
    ChevronLeft, 
    Loader2, 
    Eye, 
    EyeOff, 
    ShieldCheck
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { moneaClient } from "@/lib/api-client";
import SSOIcons from "@/components/auth/SSOIcons";
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
import { ROLES, AUTH_URLS } from "@/lib/constants";
import { useTranslation } from "@/i18n/LanguageProvider";
import { Turnstile } from "@marsidev/react-turnstile";
import { motion as m, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from "@/components/ThemeToggle";

const formSchema = z.object({
    name: z.string().min(2, { message: "ឈ្មោះយ៉ាងតិច ២ តួ" }),
    email: z.string().email({ message: "សូមបញ្ចូលអ៊ីមែលត្រឹមត្រូវ" }),
    password: z.string().min(8, { message: "យ៉ាងតិច ៨ ខ្ទង់" }).max(128, { message: "មិនអាចលើស ១២៨ ខ្ទង់" }),
    confirmPassword: z.string().min(8, { message: "សូមផ្ទៀងផ្ទាត់" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "ពាក្យសម្ងាត់មិនដូចគ្នាទេ",
    path: ["confirmPassword"],
});

export default function SignUpPage() {
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!turnstileToken && import.meta.env.VITE_TURNSTILE_SITE_KEY) {
            setError("សូមផ្ទៀងផ្ទាត់សុវត្ថិភាព CAPTCHA");
            return;
        }

        setError("");
        setIsLoading(true);
        try {
            const body = {
                ...values,
                role: ROLES.EVENT_MANAGER,
                turnstileToken: turnstileToken || undefined,
            };
            const res = await moneaClient.post<any>("/api/auth/signup", body);
            
            if (!res.error && res.data) {
                window.location.href = AUTH_URLS.DASHBOARD;
                return;
            } else {
                setError(res.error || "មានបញ្ហាក្នុងការចុះឈ្មោះ");
            }
        } catch (e: any) {
            setError("មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ។ សូមព្យាយាមម្ដងទៀត។");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="relative w-full min-h-[100dvh] flex flex-col font-kantumruy bg-gradient-to-br from-[#F0FDFA] via-[#F8FAFC] to-[#FFFBEB] dark:from-[#09090B] dark:via-[#0C1716] dark:to-[#09090B] items-center justify-center py-4 px-3 sm:px-4 overflow-y-auto transition-colors duration-300">
            {/* Ambient Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[15%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-teal-400/15 dark:bg-teal-600/10 blur-[130px]" />
                <div className="absolute -bottom-[15%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-amber-300/15 dark:bg-amber-900/10 blur-[130px]" />
            </div>

            {/* Top Bar Navigation */}
            <div className="mb-3 flex w-full max-w-[420px] items-center justify-between px-1">
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-xs transition-all hover:bg-muted hover:text-foreground active:scale-95"
                >
                    <ChevronLeft size={15} />
                    <span>{isKm ? "ទំព័រដើម" : "Home"}</span>
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeToggle className="h-8 w-8 border border-border/80 bg-card text-foreground shadow-xs hover:bg-muted" />
                </div>
            </div>

            {/* Auth Card */}
            <m.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 w-full max-w-[420px] pb-6 sm:pb-0"
            >
                <div className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-2xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-[#121216]/95 dark:shadow-teal-950/10 sm:p-6">
                    
                    {/* Header */}
                    <div className="mb-4 text-center">
                        <Link to="/" className="mb-2 inline-flex justify-center">
                            <MoneaLogo showText size="sm" />
                        </Link>
                        <h1 className="text-xl font-black text-foreground font-kantumruy sm:text-2xl">
                            {isKm ? "បង្កើតគណនីថ្មី" : "Create Account"}
                        </h1>
                        <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                            {isKm ? "ចុះឈ្មោះដើម្បីចាប់ផ្ដើមធ្វើការកំណត់ធៀបរបស់អ្នក" : "Sign up to start creating your invitation"}
                        </p>
                    </div>

                    {/* Primary Sign Up Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-0.5">
                                        <FormLabel className="text-foreground text-[11px] font-bold font-kantumruy">
                                            {isKm ? "ឈ្មោះរបស់អ្នក" : "Your Name"}
                                        </FormLabel>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-teal-700 dark:group-focus-within:text-teal-300 transition-colors pointer-events-none z-10">
                                                <User size={15} />
                                            </div>
                                            <Input
                                                placeholder={isKm ? "ឧ. សុខា" : "e.g. John Doe"}
                                                className="h-10 pl-10 bg-background dark:bg-zinc-900/60 border border-input text-foreground rounded-xl focus:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-600/20 text-xs font-kantumruy transition-all"
                                                {...field}
                                            />
                                        </div>
                                        <FormMessage className="text-rose-600 text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-0.5">
                                        <FormLabel className="text-foreground text-[11px] font-bold font-kantumruy">
                                            {isKm ? "អ៊ីមែល" : "Email"}
                                        </FormLabel>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-teal-700 dark:group-focus-within:text-teal-300 transition-colors pointer-events-none z-10">
                                                <Mail size={15} />
                                            </div>
                                            <Input
                                                placeholder="name@example.com"
                                                autoComplete="email"
                                                className="h-10 pl-10 bg-background dark:bg-zinc-900/60 border border-input text-foreground rounded-xl focus:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-600/20 text-xs font-mono transition-all"
                                                {...field}
                                            />
                                        </div>
                                        <FormMessage className="text-rose-600 text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-0.5">
                                            <FormLabel className="text-foreground text-[11px] font-bold font-kantumruy">
                                                {isKm ? "ពាក្យសម្ងាត់" : "Password"}
                                            </FormLabel>
                                            <div className="relative group">
                                                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-teal-700 dark:group-focus-within:text-teal-300 transition-colors pointer-events-none z-10">
                                                    <Lock size={14} />
                                                </div>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    aria-describedby="signup-password-requirements"
                                                    className="h-10 pl-9 pr-9 bg-background dark:bg-zinc-900/60 border border-input text-foreground rounded-xl focus:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-600/20 text-xs transition-all"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:scale-90 transition-all p-0.5 z-10"
                                                    aria-label="Toggle password visibility"
                                                >
                                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                            <FormMessage className="text-rose-600 text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem className="space-y-0.5">
                                            <FormLabel className="text-foreground text-[11px] font-bold font-kantumruy">
                                                {isKm ? "បញ្ជាក់ពាក្យសម្ងាត់" : "Confirm Password"}
                                            </FormLabel>
                                            <div className="relative group">
                                                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-teal-700 dark:group-focus-within:text-teal-300 transition-colors pointer-events-none z-10">
                                                    <ShieldCheck size={14} />
                                                </div>
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    className="h-10 pl-9 pr-9 bg-background dark:bg-zinc-900/60 border border-input text-foreground rounded-xl focus:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-600/20 text-xs transition-all"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:scale-90 transition-all p-0.5 z-10"
                                                    aria-label="Toggle confirm password visibility"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                            <FormMessage className="text-rose-600 text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <p
                                    id="signup-password-requirements"
                                    className="col-span-2 text-[10px] leading-relaxed text-muted-foreground"
                                >
                                    លេខសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ និងមិនលើស ១២៨ តួអក្សរ។
                                </p>
                            </div>

                            {/* Cloudflare Turnstile */}
                            {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
                                <div className="flex justify-center items-center py-0.5 min-h-[55px] w-full">
                                    <Turnstile
                                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                                        onSuccess={(token: string) => {
                                            setTurnstileToken(token);
                                            setError("");
                                        }}
                                        onError={() => setError("CAPTCHA failed to load.")}
                                        onExpire={() => setTurnstileToken("")}
                                        options={{ theme: 'auto', appearance: 'always' }}
                                    />
                                </div>
                            )}

                            {/* Error Alert */}
                            <AnimatePresence>
                                {error && (
                                    <m.div
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 4 }}
                                        className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs text-center font-bold font-kantumruy"
                                    >
                                        {error}
                                    </m.div>
                                )}
                            </AnimatePresence>

                            {/* Primary Submit Button */}
                            <Button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 active:bg-teal-800 text-white font-bold h-10 rounded-xl shadow-md shadow-teal-700/20 transition-all text-xs font-kantumruy"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <span>{isKm ? "បង្កើតគណនីឥតគិតថ្លៃ" : "Create Free Account"}</span>
                                )}
                            </Button>
                        </form>
                    </Form>

                    {/* Divider */}
                    <div className="relative my-2.5 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/60 dark:border-white/10" />
                        </div>
                        <span className="relative bg-card dark:bg-[#121216] px-2 text-[10px] text-muted-foreground font-kantumruy">
                            {isKm ? "ឬ ចុះឈ្មោះតាមរយៈ" : "or"}
                        </span>
                    </div>

                    {/* Social Sign Up */}
                    <div className="w-full">
                        <SSOIcons />
                    </div>

                    {/* Footer Switch Link */}
                    <div className="mt-3.5 border-t border-border/60 pt-3 text-center dark:border-white/10">
                        <p className="text-xs text-muted-foreground font-kantumruy">
                            {isKm ? "មានគណនីរួចហើយ?" : "Already have an account?"}{" "}
                            <Link 
                                to={AUTH_URLS.SIGN_IN} 
                                className="ml-1 font-bold text-teal-800 hover:underline dark:text-teal-300"
                            >
                                {isKm ? "ចូលគណនី" : "Sign In"}
                            </Link>
                        </p>
                    </div>
                </div>
            </m.div>
        </div>
    );
}

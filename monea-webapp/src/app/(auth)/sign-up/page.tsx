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
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";

const formSchema = z.object({
    name: z.string().min(2, { message: "ឈ្មោះយ៉ាងតិច ២ តួ" }),
    email: z.string().email({ message: "សូមបញ្ចូលអ៊ីមែលត្រឹមត្រូវ" }),
    password: z.string().min(6, { message: "យ៉ាងតិច ៦ ខ្ទង់" }),
    confirmPassword: z.string().min(6, { message: "សូមផ្ទៀងផ្ទាត់" }),
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
                if (res.data.token) {
                    localStorage.setItem('auth_token', res.data.token);
                }
                window.location.href = AUTH_URLS.DASHBOARD;
                return;
            } else {
                setError(res.error || "មានបញ្ហាក្នុងការចុះឈ្មោះ");
            }
        } catch (e: any) {
            setError(e?.message || "មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="relative w-full min-h-[100dvh] flex flex-col font-kantumruy bg-gradient-to-br from-[#FFF5F7] via-[#FDF8FF] to-[#FFF8F0] dark:from-[#09090B] dark:via-[#130E1B] dark:to-[#09090B] items-center justify-start sm:justify-center py-4 px-3 sm:px-4 overflow-y-auto transition-colors duration-300">
            {/* Ambient Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[15%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-rose-400/15 dark:bg-rose-600/10 blur-[130px]" />
                <div className="absolute -bottom-[15%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-pink-300/15 dark:bg-pink-900/10 blur-[130px]" />
            </div>

            {/* Top Bar Navigation */}
            <div className="w-full max-w-[390px] flex items-center justify-between mb-2.5 px-1">
                <Link
                    to="/"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80 text-xs font-bold transition-all shadow-xs active:scale-95"
                >
                    <ChevronLeft size={14} />
                    <span>{isKm ? "ទំព័រដើម" : "Home"}</span>
                </Link>
                <div className="flex items-center gap-1.5">
                    <LanguageToggle className="bg-card text-foreground hover:bg-muted border border-border/80 shadow-xs h-7.5 w-7.5 text-xs" />
                    <ThemeToggle className="bg-card text-foreground hover:bg-muted border border-border/80 shadow-xs h-7.5 w-7.5" />
                </div>
            </div>

            {/* Auth Card */}
            <m.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 w-full max-w-[390px] pb-6 sm:pb-0"
            >
                <div className="bg-card/95 dark:bg-[#121216]/95 backdrop-blur-2xl border border-border/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-slate-900/5 dark:shadow-rose-950/10">
                    
                    {/* Header */}
                    <div className="text-center mb-2.5">
                        <Link to="/" className="inline-flex justify-center mb-1">
                            <MoneaLogo showText size="sm" />
                        </Link>
                        <h1 className="text-lg sm:text-xl font-black text-foreground font-kantumruy">
                            {isKm ? "បង្កើតគណនីថ្មី" : "Create Account"}
                        </h1>
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
                                            {isKm ? "ឈ្មោះកូនកំលោះ & កូនក្រមុំ" : "Couple Name"}
                                        </FormLabel>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors pointer-events-none z-10">
                                                <User size={15} />
                                            </div>
                                            <Input
                                                placeholder={isKm ? "ឧ. សុខា & ធីតា" : "e.g. John & Jane"}
                                                className="h-9.5 pl-9.5 bg-background dark:bg-zinc-900/60 border border-input text-foreground rounded-xl focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500/20 text-xs font-kantumruy transition-all"
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
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors pointer-events-none z-10">
                                                <Mail size={15} />
                                            </div>
                                            <Input
                                                placeholder="name@example.com"
                                                autoComplete="email"
                                                className="h-9.5 pl-9.5 bg-background dark:bg-zinc-900/60 border border-input text-foreground rounded-xl focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500/20 text-xs font-mono transition-all"
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
                                                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors pointer-events-none z-10">
                                                    <Lock size={14} />
                                                </div>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    className="h-9.5 pl-8 pr-8 bg-background dark:bg-zinc-900/60 border border-input text-foreground rounded-xl focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500/20 text-xs transition-all"
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
                                                {isKm ? "ផ្ទៀងផ្ទាត់" : "Confirm"}
                                            </FormLabel>
                                            <div className="relative group">
                                                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors pointer-events-none z-10">
                                                    <ShieldCheck size={14} />
                                                </div>
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    className="h-9.5 pl-8 pr-8 bg-background dark:bg-zinc-900/60 border border-input text-foreground rounded-xl focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500/20 text-xs transition-all"
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
                                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:bg-rose-700 text-white font-bold h-10 rounded-xl shadow-md shadow-rose-600/20 transition-all text-xs font-kantumruy"
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
                    <div className="mt-2.5 text-center pt-2 border-t border-border/60 dark:border-white/10">
                        <p className="text-muted-foreground text-xs font-kantumruy">
                            {isKm ? "មានគណនីរួចហើយ?" : "Already have an account?"}{" "}
                            <Link 
                                to={AUTH_URLS.SIGN_IN} 
                                className="text-rose-600 dark:text-rose-400 hover:underline font-bold ml-1 font-kantumruy"
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

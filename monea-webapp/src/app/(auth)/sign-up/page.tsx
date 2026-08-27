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
    ShieldCheck, 
    Key 
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

const formSchema = z.object({
    name: z.string().min(2, { message: "ឈ្មោះត្រូវមានយ៉ាងតិច ២ តួអក្សរ" }),
    email: z.string().email({ message: "សូមបញ្ចូលអ៊ីមែលឱ្យបានត្រឹមត្រូវ" }),
    password: z.string().min(8, { message: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ ខ្ទង់" }),
    confirmPassword: z.string().min(8, { message: "សូមផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ",
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
        setError("");
        if (!turnstileToken && import.meta.env.VITE_TURNSTILE_SITE_KEY) {
            setError("សូមផ្ទៀងផ្ទាត់សុវត្ថិភាព CAPTCHA");
            return;
        }
        setIsLoading(true);
        try {
            const res = await moneaClient.post<{ token?: string; user?: any; error?: string }>("/api/auth/signup", {
                name: values.name.trim(),
                email: values.email.trim().toLowerCase(),
                password: values.password,
                turnstileToken
            });
            if (res.data && !res.error) {
                if ((res.data as any).token) {
                    localStorage.setItem('auth_token', (res.data as any).token);
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
        <div className="w-full min-h-screen flex flex-col font-kantumruy bg-gradient-to-b from-background via-background to-muted/20 md:items-center md:justify-center">
            {/* Mobile-Optimized Top Bar */}
            <div className="sticky top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-3 md:absolute md:top-6 md:left-8 md:right-8 md:border-0 md:bg-transparent md:backdrop-blur-none">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <Link
                        to={AUTH_URLS.SIGN_IN}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80 text-sm font-bold transition-all shadow-sm active:scale-95 md:rounded-xl md:px-3.5 md:py-1.5 md:text-xs"
                    >
                        <ChevronLeft size={18} className="md:w-[15px] md:h-[15px]" />
                        <span className="hidden sm:inline">{isKm ? "ត្រឡប់ទៅការចូលប្រើ" : "Back to Sign In"}</span>
                        <span className="sm:hidden">{isKm ? "ត្រឡប់" : "Back"}</span>
                    </Link>
                    <LanguageToggle className="bg-card text-foreground hover:bg-muted border border-border/80 shadow-sm" />
                </div>
            </div>

            {/* Mobile-First Sign Up Container */}
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 w-full max-w-md mx-auto px-4 pb-6 pt-4 md:flex-none md:pt-0 md:pb-0 md:max-w-[480px]"
            >
                <div className="bg-card border border-border rounded-3xl p-5 shadow-lg md:p-8 md:rounded-[2rem] md:backdrop-blur-2xl md:bg-card/95 md:border-border/90">
                    {/* Compact Brand Header - Mobile First */}
                    <div className="text-center mb-5">
                        <Link to="/" className="inline-flex justify-center mb-3 md:mb-2.5">
                            <MoneaLogo showText size="sm" />
                        </Link>
                        <h1 className="text-3xl md:text-2xl font-black text-foreground tracking-tight">
                            {isKm ? "បង្កើតគណនីថ្មី" : "Get Started"}
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-xs mt-2 md:mt-1">
                            {isKm ? "ចាប់ផ្តើមរៀបចំមង្គលការដោយឥតគិតថ្លៃ" : "Start planning for free"}
                        </p>
                    </div>

                    {/* Primary Sign Up Form - Mobile Optimized */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-3">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-2 md:space-y-1">
                                        <FormLabel className="text-foreground text-sm md:text-xs font-bold ml-1">
                                            {isKm ? "ឈ្មោះពេញ" : "Full Name"}
                                        </FormLabel>
                                        <div className="relative group">
                                            <div className="absolute left-4 md:left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                                                <User size={20} className="md:w-4 md:h-4" />
                                            </div>
                                            <Input
                                                placeholder={isKm ? "គង់ សុខា & ម៉ៅ ធីតា" : "John & Jane"}
                                                className="h-14 md:h-10 pl-12 md:pl-10 bg-background border-2 md:border border-input text-foreground rounded-2xl md:rounded-xl focus:border-rose-500 text-base md:text-xs font-kantumruy"
                                                {...field}
                                            />
                                        </div>
                                        <FormMessage className="text-rose-600 text-xs ml-1" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-2 md:space-y-1">
                                        <FormLabel className="text-foreground text-sm md:text-xs font-bold ml-1">
                                            {isKm ? "អ៊ីមែល" : "Email Address"}
                                        </FormLabel>
                                        <div className="relative group">
                                            <div className="absolute left-4 md:left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                                                <Mail size={20} className="md:w-4 md:h-4" />
                                            </div>
                                            <Input
                                                placeholder="name@example.com"
                                                autoComplete="email"
                                                className="h-14 md:h-10 pl-12 md:pl-10 bg-background border-2 md:border border-input text-foreground rounded-2xl md:rounded-xl focus:border-rose-500 text-base md:text-xs font-mono"
                                                {...field}
                                            />
                                        </div>
                                        <FormMessage className="text-rose-600 text-xs ml-1" />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4 md:space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2 md:space-y-1">
                                            <FormLabel className="text-foreground text-sm md:text-xs font-bold ml-1">
                                                {isKm ? "ពាក្យសម្ងាត់" : "Password"}
                                            </FormLabel>
                                            <div className="relative group">
                                                <div className="absolute left-4 md:left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                                                    <Lock size={20} className="md:w-[14px] md:h-[14px]" />
                                                </div>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="h-14 md:h-10 pl-12 md:pl-8 pr-12 md:pr-8 bg-background border-2 md:border border-input text-foreground rounded-2xl md:rounded-xl focus:border-rose-500 text-base md:text-xs"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 md:right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:scale-90 transition-all"
                                                >
                                                    {showPassword ? <EyeOff size={20} className="md:w-[14px] md:h-[14px]" /> : <Eye size={20} className="md:w-[14px] md:h-[14px]" />}
                                                </button>
                                            </div>
                                            <FormMessage className="text-rose-600 text-xs ml-1 md:text-[11px]" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2 md:space-y-1">
                                            <FormLabel className="text-foreground text-sm md:text-xs font-bold ml-1">
                                                {isKm ? "ផ្ទៀងផ្ទាត់" : "Confirm"}
                                            </FormLabel>
                                            <div className="relative group">
                                                <div className="absolute left-4 md:left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                                                    <ShieldCheck size={20} className="md:w-[14px] md:h-[14px]" />
                                                </div>
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="h-14 md:h-10 pl-12 md:pl-8 pr-12 md:pr-8 bg-background border-2 md:border border-input text-foreground rounded-2xl md:rounded-xl focus:border-rose-500 text-base md:text-xs"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 md:right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:scale-90 transition-all"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={20} className="md:w-[14px] md:h-[14px]" /> : <Eye size={20} className="md:w-[14px] md:h-[14px]" />}
                                                </button>
                                            </div>
                                            <FormMessage className="text-rose-600 text-xs ml-1 md:text-[11px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Cloudflare Turnstile - Mobile Optimized */}
                            {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
                                <div className="flex justify-center my-3 md:my-1.5 overflow-hidden scale-95 md:scale-90 origin-center min-h-[65px] md:min-h-[55px]">
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

                            {/* Submit Button - Mobile Optimized (44px+ height) */}
                            <Button 
                                type="submit" 
                                disabled={isLoading || (import.meta.env.VITE_TURNSTILE_SITE_KEY && !turnstileToken)} 
                                className="w-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold h-14 md:h-11 rounded-2xl md:rounded-xl shadow-lg shadow-rose-600/25 transition-all text-sm md:text-xs uppercase tracking-wider mt-3 md:mt-2 active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 md:w-4 md:h-4 animate-spin" />
                                ) : (
                                    isKm ? "បង្កើតគណនី" : "Create Account"
                                )}
                            </Button>
                        </form>
                    </Form>

                    {/* Divider - Mobile Optimized */}
                    <div className="relative my-5 md:my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/80" />
                        </div>
                        <div className="relative flex justify-center text-xs md:text-[10px] uppercase font-bold tracking-wider">
                            <span className="bg-card px-4 md:px-3 text-muted-foreground">
                                {isKm ? "ឬបន្តជាមួយ" : "Or continue with"}
                            </span>
                        </div>
                    </div>

                    {/* SSO Buttons - Mobile Optimized */}
                    <SSOIcons />

                    {/* Error Alert - Mobile Optimized */}
                    <AnimatePresence>
                        {error && (
                            <m.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="mt-4 md:mt-3 p-4 md:p-3 rounded-2xl md:rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-sm md:text-xs text-center font-medium"
                            >
                                {error}
                            </m.div>
                        )}
                    </AnimatePresence>

                    {/* Footer - Mobile Optimized */}
                    <div className="mt-6 md:mt-5 text-center pt-5 md:pt-4 border-t border-border/80">
                        <p className="text-muted-foreground text-sm md:text-xs">
                            {isKm ? "មានគណនីរួចហើយមែនទេ?" : "Already have an account?"}{" "}
                            <Link to={AUTH_URLS.SIGN_IN} className="text-rose-600 dark:text-rose-400 hover:underline font-bold active:scale-95 inline-block transition-transform">
                                {isKm ? "ចូលប្រើប្រាស់" : "Sign In"}
                            </Link>
                        </p>
                    </div>
                </div>
            </m.div>
        </div>
    );
}

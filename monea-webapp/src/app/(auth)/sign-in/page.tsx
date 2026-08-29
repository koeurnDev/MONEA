"use client";

import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
    Mail, 
    Lock, 
    ChevronLeft, 
    Loader2, 
    Eye, 
    EyeOff, 
    Key
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSWRConfig } from "swr";
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
import { ROLES, AUTH_URLS } from "@/lib/constants";
import { khmerToEnglishNumbers } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Turnstile } from "@marsidev/react-turnstile";
import { moneaClient } from "@/lib/api-client";
import SSOIcons from "@/components/auth/SSOIcons";
import { motion as m, AnimatePresence } from 'framer-motion';
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function SignInPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { mutate } = useSWRConfig();
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';
    const [searchParams] = useSearchParams();
    
    // Auto redirect if already authenticated
    useEffect(() => {
        if (!authLoading && user) {
            if (user.role === ROLES.EVENT_STAFF) {
                window.location.href = "/staff";
            } else if (user.role === ROLES.PLATFORM_OWNER || user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
                window.location.href = "/admin";
            } else {
                window.location.href = AUTH_URLS.DASHBOARD;
            }
        }
    }, [user, authLoading]);

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string>("");
    const [twoFactorToken, setTwoFactorToken] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const hint = searchParams.get('hint');
    const registered = searchParams.get('registered');

    const loginSchema = z.object({
        email: z.string().email({ message: "សូមបញ្ចូលអ៊ីមែលឱ្យបានត្រឹមត្រូវ" }),
        password: z.string().min(6, { message: "ពាក្យសម្ងាត់យ៉ាងតិច ៦ តួអក្សរ" }),
    });

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        if (!captchaToken && import.meta.env.VITE_TURNSTILE_SITE_KEY) {
            setError("សូមផ្ទៀងផ្ទាត់សុវត្ថិភាព CAPTCHA");
            return;
        }

        setError("");
        setIsLoading(true);
        try {
            const body = {
                ...values,
                turnstileToken: captchaToken || undefined,
                twoFactorToken: show2FA ? twoFactorToken : undefined
            };
            const res = await moneaClient.post<{ user?: any; require2FA?: boolean; requireCaptcha?: boolean }>("/api/auth/signin", body);
            const data = res.data;

            if (!res.error && data) {
                if ((data as any).token) {
                    localStorage.setItem('auth_token', (data as any).token);
                }
                await mutate("/api/auth/me");
                mutate(() => true, undefined, { revalidate: true });
                
                if (data.user?.role === ROLES.EVENT_STAFF) {
                    window.location.href = "/staff";
                    return;
                }
                if (data.user?.role === ROLES.PLATFORM_OWNER) {
                    window.location.href = "/admin";
                    return;
                }
                window.location.href = AUTH_URLS.DASHBOARD;
                return;
            }

            if (data?.require2FA) {
                setShow2FA(true);
                return;
            }

            if (res.error) {
                let errorMsg = res.error;
                if (res.details) {
                    errorMsg += `\n[MONEA DEBUG] ${res.details}`;
                }
                setError(errorMsg);
            }
        } catch (e: any) {
            setError(e?.message || "មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="relative w-full min-h-[100dvh] flex flex-col font-kantumruy bg-gradient-to-br from-[#FFF5F7] via-[#FDF8FF] to-[#FFF8F0] dark:from-[#09090B] dark:via-[#130E1B] dark:to-[#09090B] items-center justify-center py-4 px-3 sm:px-4 overflow-x-hidden transition-colors duration-300">
            {/* Ambient Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[15%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-rose-400/15 dark:bg-rose-600/10 blur-[130px]" />
                <div className="absolute -bottom-[15%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-pink-300/15 dark:bg-pink-900/10 blur-[130px]" />
            </div>

            {/* Top Bar Navigation */}
            <div className="w-full max-w-[400px] flex items-center justify-between mb-3 px-1">
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80 text-xs font-bold transition-all shadow-xs active:scale-95"
                >
                    <ChevronLeft size={15} />
                    <span>{isKm ? "ទំព័រដើម" : "Home"}</span>
                </Link>
                <div className="flex items-center gap-2">
                    <LanguageToggle className="bg-card text-foreground hover:bg-muted border border-border/80 shadow-xs h-8 w-8 text-xs" />
                    <ThemeToggle className="bg-card text-foreground hover:bg-muted border border-border/80 shadow-xs h-8 w-8" />
                </div>
            </div>

            {/* Auth Card (Ultra-Compact) */}
            <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 w-full max-w-[400px]"
            >
                <div className="bg-card/95 dark:bg-[#121216]/95 backdrop-blur-2xl border border-border/80 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-slate-900/5 dark:shadow-rose-950/10">
                    
                    {/* Header */}
                    <div className="text-center mb-4">
                        <Link to="/" className="inline-flex justify-center mb-2">
                            <MoneaLogo showText size="sm" />
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-black text-foreground font-kantumruy">
                            {isKm ? "ចូលគណនី" : "Sign In"}
                        </h1>
                    </div>

                    {/* Hint Banners */}
                    {hint === 'check-email' && (
                        <div className="mb-3 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 text-xs text-center font-bold">
                            📧 {isKm ? "ប្រសិនបើ Email នេះធ្លាប់ចុះឈ្មោះរួចហើយ សូមចូលប្រើដោយផ្ទាល់" : "If registered, sign in directly"}
                        </div>
                    )}
                    {registered === 'true' && (
                        <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs text-center font-bold">
                            ✅ {isKm ? "បានចុះឈ្មោះជោគជ័យ! អ្នកអាចចូលប្រើបានហើយ" : "Registration successful! Sign in now"}
                        </div>
                    )}

                    {/* Email / Password Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                            <AnimatePresence mode="wait">
                                {!show2FA ? (
                                    <m.div
                                        key="password-step"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-3"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-foreground text-xs font-bold font-kantumruy">
                                                        {isKm ? "អ៊ីមែល" : "Email"}
                                                    </FormLabel>
                                                    <div className="relative group">
                                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors pointer-events-none z-10">
                                                            <Mail size={16} />
                                                        </div>
                                                        <Input
                                                            placeholder="name@example.com"
                                                            autoComplete="email"
                                                            className="h-11 pl-11 bg-background dark:bg-zinc-900/60 border border-input text-foreground rounded-xl focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500/20 text-sm font-mono transition-all"
                                                            {...field}
                                                        />
                                                    </div>
                                                    <FormMessage className="text-rose-600 text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <FormLabel className="text-foreground text-xs font-bold font-kantumruy">
                                                            {isKm ? "ពាក្យសម្ងាត់" : "Password"}
                                                        </FormLabel>
                                                        <Link to="/forgot-password" className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold font-kantumruy">
                                                            {isKm ? "ភ្លេចពាក្យសម្ងាត់?" : "Forgot?"}
                                                        </Link>
                                                    </div>
                                                    <div className="relative group">
                                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors pointer-events-none z-10">
                                                            <Lock size={16} />
                                                        </div>
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            autoComplete="current-password"
                                                            className="h-11 pl-11 pr-11 bg-background dark:bg-zinc-900/60 border border-input text-foreground rounded-xl focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500/20 text-sm transition-all"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:scale-90 transition-all p-1 z-10"
                                                            aria-label="Toggle password visibility"
                                                        >
                                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                    <FormMessage className="text-rose-600 text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </m.div>
                                ) : (
                                    <m.div
                                        key="2fa-step"
                                        initial={{ opacity: 0, x: 15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -15 }}
                                        className="space-y-3 py-1"
                                    >
                                        <div className="text-center space-y-1 mb-1.5">
                                            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center mx-auto mb-1 text-rose-600 dark:text-rose-400">
                                                <Key size={18} />
                                            </div>
                                            <h3 className="text-foreground font-bold text-sm font-kantumruy">
                                                {isKm ? "ផ្ទៀងផ្ទាត់ ២ ដំណាក់ (2FA)" : "Two-Factor Auth"}
                                            </h3>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="relative group">
                                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 pointer-events-none z-10">
                                                    <Lock size={16} />
                                                </div>
                                                <Input
                                                    value={twoFactorToken}
                                                    onChange={(e) => {
                                                        const val = khmerToEnglishNumbers(e.target.value).replace(/[^0-9]/g, "");
                                                        setTwoFactorToken(val);
                                                    }}
                                                    placeholder="000000"
                                                    autoComplete="one-time-code"
                                                    className="pl-11 text-center text-lg font-bold tracking-[0.3em] bg-background border border-input text-foreground rounded-xl focus:border-rose-500 h-11 font-mono"
                                                    maxLength={6}
                                                    autoFocus
                                                    inputMode="numeric"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShow2FA(false)}
                                                className="w-full text-muted-foreground hover:text-foreground text-xs h-8 active:scale-95 transition-transform font-kantumruy"
                                            >
                                                {isKm ? "← ត្រឡប់ទៅវាយពាក្យសម្ងាត់" : "← Back to password"}
                                            </Button>
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>

                            {/* Cloudflare Turnstile */}
                            {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
                                <div className="flex justify-center items-center py-0.5 min-h-[58px] w-full">
                                    <Turnstile
                                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                                        onSuccess={(token: string) => {
                                            setCaptchaToken(token);
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
                                        className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs text-center font-bold font-kantumruy"
                                    >
                                        {error}
                                    </m.div>
                                )}
                            </AnimatePresence>

                            {/* Primary Submit Button */}
                            <Button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:bg-rose-700 text-white font-bold h-11 rounded-xl shadow-md shadow-rose-600/20 transition-all text-sm font-kantumruy mt-1"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <span>{isKm ? "ចូលគណនី" : "Sign In"}</span>
                                )}
                            </Button>
                        </form>
                    </Form>

                    {/* Divider */}
                    <div className="relative my-3.5 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/60 dark:border-white/10" />
                        </div>
                        <span className="relative bg-card dark:bg-[#121216] px-2.5 text-[11px] text-muted-foreground font-kantumruy">
                            {isKm ? "ឬ" : "or"}
                        </span>
                    </div>

                    {/* Social Logins */}
                    <div className="w-full">
                        <SSOIcons />
                    </div>

                    {/* Footer Switch Link */}
                    <div className="mt-3.5 text-center pt-2.5 border-t border-border/60 dark:border-white/10">
                        <p className="text-muted-foreground text-xs font-kantumruy">
                            {isKm ? "មិនទាន់មានគណនីទេ?" : "Don't have an account?"}{" "}
                            <Link 
                                to={AUTH_URLS.SIGN_UP} 
                                className="text-rose-600 dark:text-rose-400 hover:underline font-bold ml-1 font-kantumruy"
                            >
                                {isKm ? "ចុះឈ្មោះ" : "Sign Up"}
                            </Link>
                        </p>
                    </div>
                </div>
            </m.div>
        </div>
    );
}

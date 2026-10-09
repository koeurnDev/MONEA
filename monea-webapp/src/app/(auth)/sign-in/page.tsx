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
    const [captchaState, setCaptchaState] = useState<"loading" | "ready" | "error" | "expired">(
        () => import.meta.env.VITE_TURNSTILE_SITE_KEY ? "loading" : "ready",
    );
    const [captchaWidgetKey, setCaptchaWidgetKey] = useState(0);
    const [twoFactorToken, setTwoFactorToken] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    const hint = searchParams.get('hint');
    const registered = searchParams.get('registered');

    function retryCaptcha() {
        setCaptchaToken("");
        setCaptchaState("loading");
        setCaptchaWidgetKey((key) => key + 1);
    }

    const loginSchema = z.object({
        email: z.string().email({ message: "សូមបញ្ចូលអ៊ីមែលឱ្យបានត្រឹមត្រូវ" }),
        password: z.string().min(6, { message: "ពាក្យសម្ងាត់យ៉ាងតិច ៦ តួអក្សរ" }),
    });

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        if (turnstileSiteKey && !captchaToken) {
            return;
        }

        setError("");
        setIsLoading(true);
        const turnstileToken = captchaToken;
        if (turnstileSiteKey) retryCaptcha();
        try {
            const body = {
                ...values,
                turnstileToken: turnstileToken || undefined,
                twoFactorToken: show2FA ? twoFactorToken : undefined
            };
            const res = await moneaClient.post<{ user?: any; require2FA?: boolean; requireCaptcha?: boolean }>("/api/auth/signin", body);
            const data = res.data;

            if (!res.error && data) {
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
                setError(res.error);
            }
        } catch (e: any) {
            console.error("[SignIn] Request failed:", e);
            setError("មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ។ សូមព្យាយាមម្តងទៀត។");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="relative w-full min-h-[100dvh] flex flex-col font-kantumruy bg-gradient-to-br from-[#F0FDFA] via-[#F8FAFC] to-[#FFFBEB] dark:from-[#09090B] dark:via-[#0C1716] dark:to-[#09090B] items-center justify-center py-4 px-3 sm:px-4 overflow-x-hidden transition-colors duration-300">
            {/* Ambient Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[15%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-teal-400/15 dark:bg-teal-600/10 blur-[130px]" />
                <div className="absolute -bottom-[15%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-amber-300/15 dark:bg-amber-900/10 blur-[130px]" />
            </div>

            {/* Top Bar Navigation */}
            <div className="w-full max-w-[420px] flex items-center justify-between mb-3 px-1">
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

            {/* Auth Card (Ultra-Compact) */}
            <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 w-full max-w-[420px]"
            >
                <div className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-2xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-[#121216]/95 dark:shadow-teal-950/10 sm:p-6">
                    
                    {/* Header */}
                    <div className="mb-4 text-center">
                        <Link to="/" className="mb-2 inline-flex justify-center">
                            <MoneaLogo showText size="sm" />
                        </Link>
                        <h1 className="text-xl font-black text-foreground font-kantumruy sm:text-2xl">
                            {isKm ? "ចូលគណនី" : "Sign In"}
                        </h1>
                        <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                            {isKm ? "ប្រើអ៊ីមែល និងពាក្យសម្ងាត់របស់អ្នកដើម្បីបន្ត" : "Use your email and password to continue"}
                        </p>
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
                                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-teal-700 dark:group-focus-within:text-teal-300 transition-colors pointer-events-none z-10">
                                                            <Mail size={16} />
                                                        </div>
                                                        <Input
                                                            placeholder="name@example.com"
                                                            autoComplete="email"
                                                            className="h-11 pl-11 bg-background dark:bg-zinc-900/60 border border-input text-foreground rounded-xl focus:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-600/20 text-sm font-mono transition-all"
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
                                                        <Link to="/forgot-password" className="text-xs text-teal-800 dark:text-teal-300 hover:underline font-bold font-kantumruy">
                                                            {isKm ? "ភ្លេចពាក្យសម្ងាត់?" : "Forgot?"}
                                                        </Link>
                                                    </div>
                                                    <div className="relative group">
                                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-teal-700 dark:group-focus-within:text-teal-300 transition-colors pointer-events-none z-10">
                                                            <Lock size={16} />
                                                        </div>
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            autoComplete="current-password"
                                                            className="h-11 pl-11 pr-11 bg-background dark:bg-zinc-900/60 border border-input text-foreground rounded-xl focus:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-600/20 text-sm transition-all"
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
                                            <div className="w-10 h-10 bg-teal-600/10 rounded-xl flex items-center justify-center mx-auto mb-1 text-teal-800 dark:text-teal-300">
                                                <Key size={18} />
                                            </div>
                                            <h3 className="text-foreground font-bold text-sm font-kantumruy">
                                                {isKm ? "ផ្ទៀងផ្ទាត់ ២ ដំណាក់ (2FA)" : "Two-Factor Auth"}
                                            </h3>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="relative group">
                                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-teal-700 dark:group-focus-within:text-teal-300 pointer-events-none z-10">
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
                                                    className="pl-11 text-center text-lg font-bold tracking-[0.3em] bg-background border border-input text-foreground rounded-xl focus:border-teal-600 h-11 font-mono"
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
                            {turnstileSiteKey && (
                                <div className="flex justify-center items-center py-0.5 min-h-[58px] w-full">
                                    <Turnstile
                                        key={captchaWidgetKey}
                                        siteKey={turnstileSiteKey}
                                        onSuccess={(token: string) => {
                                            setCaptchaToken(token);
                                            setCaptchaState("ready");
                                        }}
                                        onError={() => {
                                            setCaptchaToken("");
                                            setCaptchaState("error");
                                        }}
                                        onExpire={() => {
                                            setCaptchaToken("");
                                            setCaptchaState("expired");
                                        }}
                                        options={{ theme: 'auto', appearance: 'always' }}
                                    />
                                </div>
                            )}

                            {turnstileSiteKey && captchaState !== "ready" && (
                                <div
                                    className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200"
                                    role="status"
                                    aria-live="polite"
                                >
                                    <span>
                                        {captchaState === "loading"
                                            ? (isKm ? "កំពុងផ្ទៀងផ្ទាត់សុវត្ថិភាព…" : "Loading security verification…")
                                            : captchaState === "expired"
                                                ? (isKm ? "ការផ្ទៀងផ្ទាត់បានផុតកំណត់។ សូមព្យាយាមម្ដងទៀត។" : "Verification expired. Please try again.")
                                                : (isKm ? "មិនអាចផ្ទុកការផ្ទៀងផ្ទាត់បានទេ។ សូមពិនិត្យការតភ្ជាប់ រួចព្យាយាមម្ដងទៀត។" : "Security verification failed to load. Check your connection and retry.")}
                                    </span>
                                    {captchaState !== "loading" && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={retryCaptcha}
                                            className="h-8 shrink-0 border-amber-600/30 px-3 text-amber-900 dark:text-amber-100"
                                        >
                                            {isKm ? "ព្យាយាមម្ដងទៀត" : "Retry"}
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Error Alert */}
                            <AnimatePresence>
                                {error && (
                                    <m.div
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 4 }}
                                        role="alert"
                                        aria-live="assertive"
                                        className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs text-center font-bold font-kantumruy"
                                    >
                                        {error}
                                    </m.div>
                                )}
                            </AnimatePresence>

                            {/* Primary Submit Button */}
                            <Button 
                                type="submit" 
                                disabled={isLoading || (!!turnstileSiteKey && !captchaToken)}
                                className="w-full bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 active:bg-teal-800 text-white font-bold h-11 rounded-xl shadow-md shadow-teal-700/20 transition-all text-sm font-kantumruy mt-1"
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
                    <div className="mt-3.5 border-t border-border/60 pt-3 text-center dark:border-white/10">
                        <p className="text-xs text-muted-foreground font-kantumruy">
                            {isKm ? "មិនទាន់មានគណនីទេ?" : "Need an account?"}{" "}
                            <Link 
                                to={AUTH_URLS.SIGN_UP} 
                                className="ml-1 font-bold text-teal-800 hover:underline dark:text-teal-300"
                            >
                                {isKm ? "ចុះឈ្មោះ" : "Create one"}
                            </Link>
                        </p>
                    </div>
                </div>
            </m.div>
        </div>
    );
}

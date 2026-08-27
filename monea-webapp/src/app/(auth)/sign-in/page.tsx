"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
import { 
    Lock, 
    Mail, 
    Loader2, 
    Key, 
    ChevronLeft, 
    Eye, 
    EyeOff 
} from "lucide-react";
import { motion as m, AnimatePresence } from 'framer-motion';
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ROLES, AUTH_URLS } from "@/lib/constants";
import { useSWRConfig } from "swr";
import { khmerToEnglishNumbers } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Turnstile } from "@marsidev/react-turnstile";
import { moneaClient } from "@/lib/api-client";
import SSOIcons from "@/components/auth/SSOIcons";

export default function SignInPage() {
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { mutate } = useSWRConfig();
    const urlError = searchParams.get('error');
    const urlDetails = searchParams.get('details');
    const safeSsoDetails = urlDetails && !/WebSocket|switching protocols|Uncaught TypeError/i.test(urlDetails)
        ? urlDetails
        : "";
    const initialError = urlError ? (
        urlError === 'sso_failed' 
            ? (safeSsoDetails ? `ការចូលប្រើប្រាស់តាម Google បរាជ័យ: ${safeSsoDetails}` : "ការចូលប្រើប្រាស់តាម Google មិនជោគជ័យ។ សូមព្យាយាមម្ដងទៀត។")
            : urlError === 'telegram_failed'
            ? "ការចូលប្រើប្រាស់តាម Telegram មិនជោគជ័យ។"
            : "មានបញ្ហាក្នុងការចូលប្រើប្រាស់"
    ) : "";
    const [error, setError] = useState(initialError);
    const [isLoading, setIsLoading] = useState(false);
    const [requireCaptcha, setRequireCaptcha] = useState(true);
    const [captchaToken, setCaptchaToken] = useState("");
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
                    window.location.href = "/dashboard/gifts";
                } else if (data.user?.role === ROLES.PLATFORM_OWNER || data.user?.role === "SUPERADMIN") {
                    window.location.href = "/admin/master";
                } else {
                    window.location.href = AUTH_URLS.DASHBOARD;
                }
            } else {
                if (res.status === 428 && data?.require2FA) {
                    setShow2FA(true);
                    setError(""); 
                    return;
                } else if (res.status === 428 && data?.requireCaptcha) {
                    setRequireCaptcha(true);
                } else if (res.status === 400 && res.error?.includes("CAPTCHA")) {
                    setCaptchaToken("");
                }
                
                let errorMsg = res.error || "ការចូលប្រើមិនត្រឹមត្រូវ";
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
        <div className="w-full min-h-screen flex flex-col font-kantumruy bg-gradient-to-b from-background via-background to-muted/20 md:items-center md:justify-center">
            {/* Mobile-Optimized Top Bar */}
            <div className="sticky top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-3 md:absolute md:top-6 md:left-8 md:right-8 md:border-0 md:bg-transparent md:backdrop-blur-none">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80 text-sm font-bold transition-all shadow-sm active:scale-95 md:rounded-xl md:px-3.5 md:py-1.5 md:text-xs"
                    >
                        <ChevronLeft size={18} className="md:w-[15px] md:h-[15px]" />
                        <span className="hidden sm:inline">{isKm ? "ត្រឡប់ទៅទំព័រដើម" : "Back to Home"}</span>
                        <span className="sm:hidden">{isKm ? "ត្រឡប់" : "Back"}</span>
                    </Link>
                    <LanguageToggle className="bg-card text-foreground hover:bg-muted border border-border/80 shadow-sm" />
                </div>
            </div>

            {/* Mobile-First Login Container */}
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 w-full max-w-md mx-auto px-4 pb-6 pt-4 md:flex-none md:pt-0 md:pb-0"
            >
                <div className="bg-card border border-border rounded-3xl p-5 shadow-lg md:p-8 md:rounded-[2rem] md:backdrop-blur-2xl md:bg-card/95 md:border-border/90">
                    {/* Compact Brand Header - Mobile First */}
                    <div className="text-center mb-5 md:mb-6">
                        <Link to="/" className="inline-flex justify-center mb-3">
                            <MoneaLogo showText size="sm" />
                        </Link>
                        <h1 className="text-3xl md:text-2xl font-black text-foreground tracking-tight">
                            {isKm ? "ចូលប្រើប្រាស់" : "Welcome Back"}
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-xs mt-2 md:mt-1">
                            {isKm ? "សូមបញ្ចូលព័ត៌មានដើម្បីបន្ត" : "Sign in to continue"}
                        </p>
                    </div>

                    {/* Hint Banners - Mobile Optimized */}
                    {hint === 'check-email' && (
                        <div className="mb-4 p-4 md:p-3 rounded-2xl md:rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 text-sm md:text-xs text-center font-medium">
                            📧 {isKm ? "ប្រសិនបើ Email នេះធ្លាប់ Register រួចហើយ សូមចូលប្រើដោយផ្ទាល់" : "If this email is registered, sign in directly"}
                        </div>
                    )}
                    {registered === 'true' && (
                        <div className="mb-4 p-4 md:p-3 rounded-2xl md:rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-sm md:text-xs text-center font-medium">
                            ✅ {isKm ? "បានចុះឈ្មោះជោគជ័យ! អ្នកអាចចូលប្រើបានហើយ" : "Registration successful! You can now sign in"}
                        </div>
                    )}

                    {/* Email / Password Form - Mobile Optimized */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-3.5">
                            <AnimatePresence mode="wait">
                                {!show2FA ? (
                                    <m.div
                                        key="password-step"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-4 md:space-y-3.5"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 md:space-y-1.5">
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
                                                            className="h-14 md:h-11 pl-12 md:pl-10 bg-background border-2 md:border border-input text-foreground rounded-2xl md:rounded-xl focus:border-rose-500 text-base md:text-xs font-mono"
                                                            {...field}
                                                        />
                                                    </div>
                                                    <FormMessage className="text-rose-600 text-xs ml-1" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 md:space-y-1.5">
                                                    <div className="flex justify-between items-center ml-1">
                                                        <FormLabel className="text-foreground text-sm md:text-xs font-bold">
                                                            {isKm ? "ពាក្យសម្ងាត់" : "Password"}
                                                        </FormLabel>
                                                        <Link to="/forgot-password" className="text-xs md:text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-bold active:scale-95 transition-transform">
                                                            {isKm ? "ភ្លេច?" : "Forgot?"}
                                                        </Link>
                                                    </div>
                                                    <div className="relative group">
                                                        <div className="absolute left-4 md:left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                                                            <Lock size={20} className="md:w-4 md:h-4" />
                                                        </div>
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            autoComplete="current-password"
                                                            className="h-14 md:h-11 pl-12 md:pl-10 pr-12 md:pr-10 bg-background border-2 md:border border-input text-foreground rounded-2xl md:rounded-xl focus:border-rose-500 text-base md:text-xs"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-4 md:right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:scale-90 transition-all p-1"
                                                        >
                                                            {showPassword ? <EyeOff size={20} className="md:w-4 md:h-4" /> : <Eye size={20} className="md:w-4 md:h-4" />}
                                                        </button>
                                                    </div>
                                                    <FormMessage className="text-rose-600 text-xs ml-1" />
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
                                        className="space-y-4 md:space-y-3 py-2 md:py-1"
                                    >
                                        <div className="text-center space-y-2 md:space-y-1 mb-3 md:mb-2">
                                            <div className="w-16 h-16 md:w-11 md:h-11 bg-rose-500/10 rounded-2xl md:rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-1.5 text-rose-600 dark:text-rose-400">
                                                <Key size={28} className="md:w-5 md:h-5" />
                                            </div>
                                            <h3 className="text-foreground font-bold text-lg md:text-sm">
                                                {isKm ? "ផ្ទៀងផ្ទាត់ ២ ដំណាក់ (2FA)" : "Two-Factor Authentication"}
                                            </h3>
                                            <p className="text-muted-foreground text-sm md:text-xs">
                                                {isKm ? "បញ្ចូលលេខកូដ ៦ ខ្ទង់ពី Authenticator" : "Enter 6-digit code from your app"}
                                            </p>
                                        </div>

                                        <div className="space-y-3 md:space-y-2">
                                            <div className="relative group">
                                                <div className="absolute left-4 md:left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600">
                                                    <Lock size={20} className="md:w-4 md:h-4" />
                                                </div>
                                                <Input
                                                    value={twoFactorToken}
                                                    onChange={(e) => {
                                                        const val = khmerToEnglishNumbers(e.target.value).replace(/[^0-9]/g, "");
                                                        setTwoFactorToken(val);
                                                    }}
                                                    placeholder="000000"
                                                    autoComplete="one-time-code"
                                                    className="pl-12 md:pl-10 text-center text-2xl md:text-lg font-black tracking-[0.5em] md:tracking-[0.4em] bg-background border-2 md:border border-input text-foreground rounded-2xl md:rounded-xl focus:border-rose-500 h-16 md:h-11 font-mono"
                                                    maxLength={6}
                                                    autoFocus
                                                    inputMode="numeric"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShow2FA(false)}
                                                className="w-full text-muted-foreground hover:text-foreground hover:bg-muted text-sm md:text-xs h-11 md:h-8 active:scale-95 transition-transform"
                                            >
                                                {isKm ? "← ត្រឡប់ទៅវាយពាក្យសម្ងាត់" : "← Back to password"}
                                            </Button>
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>

                            {/* Cloudflare Turnstile - Mobile Optimized */}
                            {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
                                <div className="flex justify-center my-3 md:my-2 overflow-hidden scale-95 md:scale-90 origin-center min-h-[65px] md:min-h-[60px]">
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

                            {/* Submit Button - Mobile Optimized (44px+ height) */}
                            <Button 
                                type="submit" 
                                disabled={isLoading || (import.meta.env.VITE_TURNSTILE_SITE_KEY && !captchaToken)} 
                                className="w-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold h-14 md:h-11 rounded-2xl md:rounded-xl shadow-lg shadow-rose-600/25 transition-all text-sm md:text-xs uppercase tracking-wider mt-3 md:mt-2 active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 md:w-4 md:h-4 animate-spin" />
                                ) : show2FA ? (
                                    isKm ? "ផ្ទៀងផ្ទាត់" : "Verify"
                                ) : (
                                    isKm ? "ចូលប្រើប្រាស់" : "Sign In"
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
                    <div className="mt-6 md:mt-6 text-center pt-5 md:pt-4 border-t border-border/80">
                        <p className="text-muted-foreground text-sm md:text-xs">
                            {isKm ? "មិនទាន់មានគណនីមែនទេ?" : "Don't have an account?"}{" "}
                            <Link to={AUTH_URLS.SIGN_UP} className="text-rose-600 dark:text-rose-400 hover:underline font-bold active:scale-95 inline-block transition-transform">
                                {isKm ? "ចុះឈ្មោះឥឡូវនេះ" : "Sign up now"}
                            </Link>
                        </p>
                    </div>
                </div>
            </m.div>
        </div>
    );
}

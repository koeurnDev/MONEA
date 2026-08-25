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
import SSOIcons from "@/components/auth/SSOIcons";

export default function SignInPage() {
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { mutate } = useSWRConfig();
    const [error, setError] = useState("");
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
            const res = await fetch("/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            let data;
            try {
                data = await res.json();
            } catch (err) {
                data = { error: "មានបញ្ហាបច្ចេកទេស", details: `HTTP Status Code: ${res.status}` };
            }

            if (res.ok) {
                await mutate("/api/auth/me");
                mutate(() => true, undefined, { revalidate: true });
                
                if (data.user?.role === ROLES.EVENT_STAFF) {
                    navigate("/dashboard/gifts");
                } else if (data.user?.role === ROLES.PLATFORM_OWNER || data.user?.role === "SUPERADMIN") {
                    navigate("/admin/master");
                } else {
                    navigate(AUTH_URLS.DASHBOARD);
                }
                navigate(0);
            } else {
                if (res.status === 428 && data.require2FA) {
                    setShow2FA(true);
                    setError(""); 
                    return;
                } else if (res.status === 428 && data.requireCaptcha) {
                    setRequireCaptcha(true);
                } else if (res.status === 400 && data.error?.includes("CAPTCHA")) {
                    setCaptchaToken("");
                }
                
                let errorMsg = data.error;
                if (data.details) {
                    errorMsg += `\n[MONEA DEBUG] ${data.details}`;
                }
                setError(errorMsg || "ការចូលប្រើមិនត្រឹមត្រូវ");
            }
        } catch (e: any) {
            setError(e?.message || "មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full flex items-center justify-center font-kantumruy">
            {/* Top Bar Header */}
            <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-8 sm:right-8 flex items-center justify-between z-30">
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-card/80 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80 text-xs font-bold transition-all shadow-xs backdrop-blur-md"
                >
                    <ChevronLeft size={15} />
                    <span>{isKm ? "ត្រឡប់ទៅទំព័រដើម" : "Back to Home"}</span>
                </Link>
                <LanguageToggle className="bg-card/80 text-foreground hover:bg-muted border border-border/80 backdrop-blur-md shadow-xs" />
            </div>

            {/* Centered Login Card */}
            <m.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[440px] my-auto pt-10 sm:pt-4"
            >
                <div className="bg-card/95 backdrop-blur-2xl border border-border/90 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/60 relative overflow-hidden">
                    {/* Brand Header */}
                    <div className="text-center mb-6">
                        <Link to="/" className="inline-flex justify-center mb-3">
                            <MoneaLogo showText size="sm" />
                        </Link>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                            {isKm ? "ចូលប្រើប្រាស់" : "Sign In"}
                        </h1>
                        <p className="text-muted-foreground text-xs mt-1">
                            {isKm ? "សូមបញ្ចូលព័ត៌មានសម្គាល់របស់អ្នកដើម្បីបន្ត" : "Enter your credentials to continue"}
                        </p>
                    </div>

                    {/* Hint Banners */}
                    {hint === 'check-email' && (
                        <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 text-xs text-center font-medium">
                            📧 ប្រសិនបើ Email នេះធ្លាប់ Register រួចហើយ សូមចូលប្រើដោយផ្ទាល់។
                        </div>
                    )}
                    {registered === 'true' && (
                        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs text-center font-medium">
                            ✅ បានចុះឈ្មោះជោគជ័យ! អ្នកអាចចូលប្រើបានហើយ។
                        </div>
                    )}

                    {/* Email / Password Form (Top) */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
                            <AnimatePresence mode="wait">
                                {!show2FA ? (
                                    <m.div
                                        key="password-step"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-3.5"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-foreground text-xs font-bold ml-0.5">
                                                        {isKm ? "អ៊ីមែល" : "Email Address"}
                                                    </FormLabel>
                                                    <div className="relative group">
                                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                                                            <Mail size={16} />
                                                        </div>
                                                        <Input
                                                            placeholder="name@example.com"
                                                            autoComplete="email"
                                                            className="h-11 pl-10 bg-background/50 border border-input text-foreground rounded-xl focus:border-rose-500 text-xs font-mono"
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
                                                <FormItem className="space-y-1.5">
                                                    <div className="flex justify-between items-center ml-0.5">
                                                        <FormLabel className="text-foreground text-xs font-bold">
                                                            {isKm ? "ពាក្យសម្ងាត់" : "Password"}
                                                        </FormLabel>
                                                        <Link to="/forgot-password" className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-bold">
                                                            {isKm ? "ភ្លេចលេខសម្ងាត់?" : "Forgot password?"}
                                                        </Link>
                                                    </div>
                                                    <div className="relative group">
                                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                                                            <Lock size={16} />
                                                        </div>
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            autoComplete="current-password"
                                                            className="h-11 pl-10 pr-10 bg-background/50 border border-input text-foreground rounded-xl focus:border-rose-500 text-xs"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                                        <div className="text-center space-y-1 mb-2">
                                            <div className="w-11 h-11 bg-rose-500/10 rounded-xl flex items-center justify-center mx-auto mb-1.5 text-rose-600 dark:text-rose-400">
                                                <Key size={20} />
                                            </div>
                                            <h3 className="text-foreground font-bold text-sm">
                                                {isKm ? "ផ្ទៀងផ្ទាត់ ២ ដំណាក់ (2FA)" : "Two-Factor Auth"}
                                            </h3>
                                            <p className="text-muted-foreground text-xs">
                                                {isKm ? "បញ្ចូលលេខកូដ ៦ ខ្ទង់ពី Google Authenticator" : "Enter the 6-digit code from Google Authenticator"}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="relative group">
                                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600">
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
                                                    className="pl-10 text-center text-lg font-black tracking-[0.4em] bg-background/50 border border-input text-foreground rounded-xl focus:border-rose-500 h-11 font-mono"
                                                    maxLength={6}
                                                    autoFocus
                                                    inputMode="numeric"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShow2FA(false)}
                                                className="w-full text-muted-foreground hover:text-foreground hover:bg-muted text-xs h-8"
                                            >
                                                {isKm ? "← ត្រឡប់ទៅវាយពាក្យសម្ងាត់" : "← Return to password"}
                                            </Button>
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>

                            {/* Cloudflare Turnstile */}
                            {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
                                <div className="flex justify-center my-2 overflow-hidden scale-90 origin-center min-h-[60px]">
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

                            {/* Submit Button */}
                            <Button 
                                type="submit" 
                                disabled={isLoading || (import.meta.env.VITE_TURNSTILE_SITE_KEY && !captchaToken)} 
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-11 rounded-xl shadow-md shadow-rose-600/20 transition-all text-xs uppercase tracking-wider mt-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : show2FA ? (
                                    isKm ? "ផ្ទៀងផ្ទាត់" : "Verify"
                                ) : (
                                    isKm ? "ចូលប្រើប្រាស់" : "Sign In"
                                )}
                            </Button>
                        </form>
                    </Form>

                    {/* Divider to Bottom SSO */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/80" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                            <span className="bg-card px-3 text-muted-foreground">
                                {isKm ? "ឬបន្តជាមួយ" : "Or continue with"}
                            </span>
                        </div>
                    </div>

                    {/* Bottom SSO Buttons (Telegram & Google) */}
                    <SSOIcons />

                    {/* Error Alert */}
                    <AnimatePresence>
                        {error && (
                            <m.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs text-center font-medium"
                            >
                                {error}
                            </m.div>
                        )}
                    </AnimatePresence>

                    {/* Footer / Sign Up Link */}
                    <div className="mt-6 text-center pt-4 border-t border-border/80">
                        <p className="text-muted-foreground text-xs">
                            {isKm ? "មិនទាន់មានគណនីមែនទេ?" : "Don't have an account?"}{" "}
                            <Link to={AUTH_URLS.SIGN_UP} className="text-rose-600 dark:text-rose-400 hover:underline font-bold">
                                {isKm ? "ចុះឈ្មោះឥឡូវនេះ" : "Sign up now"}
                            </Link>
                        </p>
                    </div>
                </div>
            </m.div>
        </div>
    );
}

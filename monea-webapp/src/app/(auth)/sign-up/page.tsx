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
    const [step, setStep] = useState<1 | 2>(1);
    const [otp, setOtp] = useState("");
    const [registeredEmail, setRegisteredEmail] = useState("");

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
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    turnstileToken
                }),
            });
            const data = await res.json();
            if (res.ok) {
                if (data.redirectToSignIn) {
                    navigate(`${AUTH_URLS.SIGN_IN}?hint=check-email`);
                    return;
                }
                setRegisteredEmail(values.email);
                setStep(2);
            } else {
                setError(data.error || "មានបញ្ហាក្នុងការចុះឈ្មោះ");
            }
        } catch (e: any) {
            setError(e?.message || "មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleVerify() {
        if (!otp || otp.length !== 6) {
            setError("សូមបញ្ចូលលេខកូដ PIN ៦ ខ្ទង់");
            return;
        }
        setError("");
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: registeredEmail, otp }),
            });
            const data = await res.json();
            if (res.ok) {
                navigate(`${AUTH_URLS.SIGN_IN}?registered=true`);
            } else {
                setError(data.error || "លេខកូដមិនត្រឹមត្រូវ");
            }
        } catch (e: any) {
            setError(e?.message || "មានបញ្ហាបច្ចេកទេស");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full flex items-center justify-center font-kantumruy">
            {/* Top Bar Header */}
            <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-8 sm:right-8 flex items-center justify-between z-30">
                <Link
                    to={AUTH_URLS.SIGN_IN}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-card/80 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80 text-xs font-bold transition-all shadow-xs backdrop-blur-md"
                >
                    <ChevronLeft size={15} />
                    <span>{isKm ? "ត្រឡប់ទៅការចូលប្រើ" : "Back to Sign In"}</span>
                </Link>
                <LanguageToggle className="bg-card/80 text-foreground hover:bg-muted border border-border/80 backdrop-blur-md shadow-xs" />
            </div>

            {/* Centered Sign Up Card */}
            <m.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[460px] my-auto pt-10 sm:pt-4"
            >
                <div className="bg-card/95 backdrop-blur-2xl border border-border/90 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/60 relative overflow-hidden">
                    {/* Brand Header */}
                    <div className="text-center mb-5">
                        <Link to="/" className="inline-flex justify-center mb-2.5">
                            <MoneaLogo showText size="sm" />
                        </Link>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                            {step === 1 
                                ? (isKm ? "បង្កើតគណនីថ្មី" : "Create Account")
                                : (isKm ? "ផ្ទៀងផ្ទាត់អ៊ីមែល" : "Verify Email")
                            }
                        </h1>
                        <p className="text-muted-foreground text-xs mt-1">
                            {step === 1 
                                ? (isKm ? "ចាប់ផ្តើមដំណើរការរៀបចំមង្គលការរបស់អ្នកដោយឥតគិតថ្លៃ" : "Start planning your wedding for free")
                                : (isKm ? `យើងបានផ្ញើកូដ ៦ ខ្ទង់ទៅកាន់ ${registeredEmail}` : `We sent a 6-digit code to ${registeredEmail}`)
                            }
                        </p>
                    </div>

                    {step === 1 ? (
                        <>
                            {/* Primary Sign Up Form */}
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-foreground text-xs font-bold ml-0.5">
                                                    {isKm ? "ឈ្មោះពេញ" : "Full Name"}
                                                </FormLabel>
                                                <div className="relative group">
                                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                                                        <User size={16} />
                                                    </div>
                                                    <Input
                                                        placeholder="គង់ សុខា & ម៉ៅ ធីតា"
                                                        className="h-10 pl-10 bg-background/50 border border-input text-foreground rounded-xl focus:border-rose-500 text-xs font-kantumruy"
                                                        {...field}
                                                    />
                                                </div>
                                                <FormMessage className="text-rose-600 text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
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
                                                        className="h-10 pl-10 bg-background/50 border border-input text-foreground rounded-xl focus:border-rose-500 text-xs font-mono"
                                                        {...field}
                                                    />
                                                </div>
                                                <FormMessage className="text-rose-600 text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-foreground text-xs font-bold ml-0.5">
                                                        {isKm ? "ពាក្យសម្ងាត់" : "Password"}
                                                    </FormLabel>
                                                    <div className="relative group">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                                                            <Lock size={14} />
                                                        </div>
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            className="h-10 pl-8 pr-8 bg-background/50 border border-input text-foreground rounded-xl focus:border-rose-500 text-xs"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                        >
                                                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                                        </button>
                                                    </div>
                                                    <FormMessage className="text-rose-600 text-[11px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-foreground text-xs font-bold ml-0.5">
                                                        {isKm ? "ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់" : "Confirm"}
                                                    </FormLabel>
                                                    <div className="relative group">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                                                            <ShieldCheck size={14} />
                                                        </div>
                                                        <Input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            className="h-10 pl-8 pr-8 bg-background/50 border border-input text-foreground rounded-xl focus:border-rose-500 text-xs"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                        >
                                                            {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                                        </button>
                                                    </div>
                                                    <FormMessage className="text-rose-600 text-[11px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Cloudflare Turnstile */}
                                    {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
                                        <div className="flex justify-center my-1.5 overflow-hidden scale-90 origin-center min-h-[55px]">
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

                                    {/* Submit Button */}
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading || (import.meta.env.VITE_TURNSTILE_SITE_KEY && !turnstileToken)} 
                                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-11 rounded-xl shadow-md shadow-rose-600/20 transition-all text-xs uppercase tracking-wider mt-2"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            isKm ? "បង្កើតគណនី" : "Create Account"
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

                            {/* Bottom SSO Buttons */}
                            <SSOIcons />
                        </>
                    ) : (
                        /* Step 2: OTP Verification */
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-rose-600">
                                        <Key size={18} />
                                    </div>
                                    <Input
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                                        placeholder="000000"
                                        className="pl-11 text-center text-xl font-mono font-black tracking-[0.4em] bg-background/50 border border-input text-foreground rounded-xl focus:border-rose-500 h-12"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <Button 
                                onClick={handleVerify}
                                disabled={isLoading || otp.length !== 6} 
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-11 rounded-xl shadow-md shadow-rose-600/20 transition-all text-xs uppercase tracking-wider"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isKm ? "ផ្ទៀងផ្ទាត់ និងបញ្ចប់" : "Verify & Complete")}
                            </Button>

                            <div className="text-center">
                                <button 
                                    type="button" 
                                    onClick={() => setStep(1)} 
                                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                                >
                                    {isKm ? "← កែប្រែព័ត៌មានឡើងវិញ" : "← Change registration info"}
                                </button>
                            </div>
                        </div>
                    )}

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

                    {/* Footer Link to Sign In */}
                    <div className="mt-5 text-center pt-4 border-t border-border/80">
                        <p className="text-muted-foreground text-xs">
                            {isKm ? "មានគណនីរួចហើយមែនទេ?" : "Already have an account?"}{" "}
                            <Link to={AUTH_URLS.SIGN_IN} className="text-rose-600 dark:text-rose-400 hover:underline font-bold">
                                {isKm ? "ចូលប្រើប្រាស់" : "Sign In"}
                            </Link>
                        </p>
                    </div>
                </div>
            </m.div>
        </div>
    );
}

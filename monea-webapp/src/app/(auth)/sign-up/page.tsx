"use client";
import React, { useState } from "react";
import Link from "next/link";
import { UserPlus, Mail, Lock, ChevronLeft, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
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
import dynamic from "next/dynamic";
import Image from "next/image";
import { ROLES, AUTH_URLS } from "@/lib/constants";
import { useTranslation } from "@/i18n/LanguageProvider";
const Turnstile = dynamic(() => import("@marsidev/react-turnstile").then(mod => mod.Turnstile), { ssr: false });

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function SignUpPage() {
    const { t } = useTranslation();
    const router = useRouter();
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

    // Step 1: Register account, create unverified user, send OTP
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setError("");
        if (!turnstileToken) {
            setError(t('common.auth.verifyCaptcha'));
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
                    // Email already registered — redirect silently to sign-in
                    // (anti-enumeration: don't reveal if email exists)
                    router.push(`${AUTH_URLS.SIGN_IN}?hint=check-email`);
                    return;
                }
                setRegisteredEmail(values.email);
                setStep(2);
            } else {
                setError(data.error || t('common.errors.unexpected'));
            }
        } catch (e: any) {
            setError(e?.message || t('common.errors.technical'));
        } finally {
            setIsLoading(false);
        }
    }

    // Step 2: Verify OTP
    async function handleVerify() {
        if (!otp || otp.length !== 6) {
            setError("Please enter the 6-digit PIN.");
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
                router.push(`${AUTH_URLS.SIGN_IN}?registered=true`);
            } else {
                setError(data.error || t('common.errors.unexpected'));
            }
        } catch (e: any) {
            setError(e?.message || t('common.errors.technical'));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-black py-4 md:py-10">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2000&auto=format&fit=crop"
                    alt="Background"
                    fill
                    className="object-cover opacity-40"
                    style={{ objectPosition: 'center 40%' }}
                    sizes="100vw"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 backdrop-blur-[2px]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 md:p-6 shadow-2xl relative overflow-hidden">
                    
                    {/* Back Button */}
                    <Link
                        href={AUTH_URLS.SIGN_IN}
                        className="absolute left-6 top-6 text-white/40 hover:text-white transition-colors group flex items-center gap-1 text-[10px] font-black uppercase tracking-widest z-20"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> {t('common.auth.back')}
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-4">
                        <Link href="/" className="inline-flex justify-center scale-90 md:scale-100">
                            <MoneaLogo showText size="sm" variant="dark" />
                        </Link>
                        <h1 className="text-lg md:text-xl font-bold text-white mb-0.5 font-kantumruy mt-1">
                            {step === 1 ? t('common.auth.registerTitle') : 'បញ្ជាក់អ៊ីមែលរបស់អ្នក'}
                        </h1>
                        <p className="text-white/40 text-[10px] font-kantumruy">
                            {step === 1 ? t('common.auth.registerSubtitle') : `យើងបានផ្ញើ PIN 6 ខ្ទង់ទៅ ${registeredEmail}`}
                        </p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-pink-500' : 'bg-white/10'}`} />
                        <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-pink-500' : 'bg-white/10'}`} />
                    </div>

                    {/* STEP 1: Registration Form */}
                    {step === 1 && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 md:space-y-3">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-white/60 text-[10px] uppercase tracking-wider font-bold ml-1 font-kantumruy">{t('common.auth.fullName')}</FormLabel>
                                            <div className="relative group">
                                                <div className="absolute left-3 top-2 md:top-2.5 text-white/30 group-focus-within:text-pink-400 transition-colors">
                                                    <UserPlus className="w-4 h-4" />
                                                </div>
                                                <Input placeholder="John Doe" className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-9 md:h-10 text-sm" {...field} />
                                            </div>
                                            <FormMessage className="text-red-400 text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-white/60 text-[10px] uppercase tracking-wider font-bold ml-1 font-kantumruy">{t('common.auth.email')}</FormLabel>
                                            <div className="relative group">
                                                <div className="absolute left-3 top-2 md:top-2.5 text-white/30 group-focus-within:text-pink-400 transition-colors">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <Input placeholder="name@example.com" className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-9 md:h-10 text-sm" {...field} />
                                            </div>
                                            <FormMessage className="text-red-400 text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-white/60 text-[10px] uppercase tracking-wider font-bold ml-1 font-kantumruy">{t('common.auth.password')}</FormLabel>
                                                <div className="relative">
                                                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-9 md:h-10 text-sm pr-10" {...field} />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 md:top-2.5 text-white/40 hover:text-white transition-colors">
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <FormMessage className="text-red-400 text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-white/60 text-[10px] uppercase tracking-wider font-bold ml-1 font-kantumruy">{t('common.auth.confirmPassword')}</FormLabel>
                                                <div className="relative">
                                                    <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className="bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-9 md:h-10 text-sm pr-10" {...field} />
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2 md:top-2.5 text-white/40 hover:text-white transition-colors">
                                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <FormMessage className="text-red-400 text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {error && (
                                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-[10px] text-center font-kantumruy">
                                        {error}
                                    </div>
                                )}

                                {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
                                    <div className="flex justify-center scale-75 origin-center relative min-h-[65px]">
                                        <div className="absolute inset-0 flex items-center justify-center -z-10">
                                            <div className="w-[300px] h-[65px] bg-white/5 animate-pulse rounded-lg border border-white/10" />
                                        </div>
                                        <div className="relative z-10">
                                            <Turnstile
                                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                                                onSuccess={(token) => { setTurnstileToken(token); setError(""); }}
                                                onError={() => setError("CAPTCHA failed. Please disable adblockers for this site.")}
                                                options={{ theme: 'dark', appearance: 'always' }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-red-400 bg-red-400/10 p-2 rounded-lg text-center font-bold">Turnstile Key Missing</div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isLoading || !turnstileToken}
                                    className="w-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl font-bold uppercase tracking-wide h-9 md:h-10 border border-white/10 hover:shadow-lg hover:shadow-pink-500/20 transition-all text-white text-xs"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {isLoading ? t('common.labels.sending') : 'បង្កើតគណនី និងផ្ញើ PIN'}
                                </Button>
                            </form>
                        </Form>
                    )}

                    {/* STEP 2: Email Verification */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <p className="text-white/40 text-[10px] font-kantumruy">Step 2 of 2 — ផ្ទៀងផ្ទាត់អ៊ីមែល</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-white/60 text-[10px] uppercase tracking-wider font-bold ml-1 block font-kantumruy">PIN 6 ខ្ទង់</label>
                                <Input
                                    autoFocus
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="------"
                                    className="text-center tracking-[1em] text-lg bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-12 font-bold"
                                />
                                <p className="text-white/30 text-[10px] text-center font-kantumruy">PIN នេះផុតកំណត់ក្នុងរយៈពេល 15 នាទី</p>
                            </div>

                            {error && (
                                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-[10px] text-center font-kantumruy">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="button"
                                onClick={handleVerify}
                                disabled={isLoading || otp.length !== 6}
                                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl font-bold uppercase tracking-wide h-9 md:h-10 border border-white/10 hover:shadow-lg hover:shadow-pink-500/20 transition-all text-white text-xs font-kantumruy"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {isLoading ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'ផ្ទៀងផ្ទាត់ & បើកដំណើរការគណនី'}
                            </Button>

                            <div className="text-center">
                                <button type="button" onClick={() => { setStep(1); setOtp(""); setError(""); }} className="text-[10px] text-white/40 hover:text-white underline underline-offset-2 transition-colors font-kantumruy">
                                    ← ផ្លាស់ប្ដូរអ៊ីមែល / Register ម្ដងទៀត
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SSO + Login Link (Step 1 only) */}
                    {step === 1 && (
                        <>
                            <div className="mt-3">
                                <div className="relative mb-3">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/5"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[9px] uppercase font-black tracking-widest">
                                        <span className="bg-[#1c1c1c] px-3 text-white/20">{t('common.auth.orContinueWith')}</span>
                                    </div>
                                </div>
                                <SSOIcons />
                            </div>

                            <div className="relative mt-4 mb-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase">
                                    <span className="bg-[#1c1c1c] px-2 text-white/40 rounded-full font-kantumruy">
                                        {t('common.auth.hasAccount')}
                                    </span>
                                </div>
                            </div>

                            <div className="text-center">
                                <Link href={AUTH_URLS.SIGN_IN} className="font-semibold text-white/60 hover:text-pink-400 transition-colors flex items-center justify-center gap-1.5 text-xs font-kantumruy">
                                    {t('common.auth.signInNow')} <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

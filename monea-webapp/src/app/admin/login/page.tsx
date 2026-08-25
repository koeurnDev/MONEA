"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
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
    ShieldCheck, 
    Loader2, 
    KeyRound, 
    Eye, 
    EyeOff, 
    ArrowLeft, 
    ShieldAlert, 
    Fingerprint,
    CheckCircle2,
    Clock,
    AlertTriangle
} from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";
import { useSWRConfig } from "swr";
import { useTranslation } from "@/i18n/LanguageProvider";
import { Turnstile } from "@marsidev/react-turnstile";
import { moneaClient } from "@/lib/api-client";

const adminLoginSchema = z.object({
    email: z.string().email({ message: "សូមបញ្ចូលអ៊ីមែលឱ្យបានត្រឹមត្រូវ" }),
    password: z.string().min(6, { message: "ពាក្យសម្ងាត់យ៉ាងតិច ៦ តួអក្សរ" }),
    twoFactorCode: z.string().optional(),
});

export default function AdminLoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { mutate } = useSWRConfig();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [require2FA, setRequire2FA] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutTimer, setLockoutTimer] = useState(0);

    // Lockout countdown timer
    useEffect(() => {
        if (lockoutTimer <= 0) return;
        const interval = setInterval(() => {
            setLockoutTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [lockoutTimer]);

    const form = useForm<z.infer<typeof adminLoginSchema>>({
        resolver: zodResolver(adminLoginSchema),
        defaultValues: { email: "", password: "", twoFactorCode: "" },
    });

    async function onSubmit(values: z.infer<typeof adminLoginSchema>) {
        if (lockoutTimer > 0) {
            setError(`ប្រព័ន្ធត្រូវបានជាប់គាំងបណ្តោះអាសន្ន។ សូមរង់ចាំ ${lockoutTimer} វិនាទីទៀត។`);
            return;
        }

        setError("");
        setIsLoading(true);
        try {
            const body = {
                email: values.email,
                password: values.password,
                turnstileToken: captchaToken || undefined,
                twoFactorToken: values.twoFactorCode || undefined,
            };

            const res = await moneaClient.post<{ require2FA?: boolean }>("/api/auth/signin", body);
            const data = res.data;

            if (res.status === 428 || data?.require2FA) {
                setRequire2FA(true);
                setIsLoading(false);
                setError("សូមបញ្ចូលកូដ 2FA ពី Google Authenticator App របស់អ្នក។");
                return;
            }

            if (!res.error && data) {
                // Invalidate auth caches
                await mutate("/api/auth/me");
                mutate(() => true, undefined, { revalidate: true });

                // Redirect directly to Super Admin Master Dashboard
                navigate("/admin/master");
            } else {
                const newAttempts = failedAttempts + 1;
                setFailedAttempts(newAttempts);

                if (newAttempts >= 5) {
                    setLockoutTimer(900); // 15 minutes lockout
                    setError("អ្នកបានព្យាយាមខុសលើសពី ៥ ដង! ប្រព័ន្ធត្រូវបានចាក់សោសុវត្ថិភាពរយៈពេល ១៥ នាទី។");
                } else {
                    setError(res.error || `ការចូលប្រើមិនត្រឹមត្រូវ! (ព្យាយាមបរាជ័យ ${newAttempts}/5)`);
                }
            }
        } catch (err) {
            console.error("Admin login error", err);
            setError("មិនអាចភ្ជាប់ទៅកាន់ Security Server បានទេ");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col justify-between items-center p-4 sm:p-8 relative overflow-hidden font-kantumruy">
            {/* Ambient Security Glows */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Navigation & Status */}
            <div className="w-full max-w-5xl flex items-center justify-between z-10">
                <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold">
                    <ArrowLeft size={16} />
                    <span>ត្រឡប់ទៅទំព័រដើម</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 size={12} />
                        <span>256-Bit TLS Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                        <ShieldCheck size={13} />
                        <span>Master Security Portal</span>
                    </div>
                </div>
            </div>

            {/* Main Security Card */}
            <m.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md my-auto z-10"
            >
                <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-black/90 space-y-6 relative overflow-hidden">
                    
                    {/* Top Security Line Indicator */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

                    {/* Shield Logo & Title */}
                    <div className="text-center space-y-3 pt-2">
                        <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-red-600/30">
                            <ShieldCheck size={32} />
                            <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-white/20">
                                <Fingerprint size={14} className="text-red-400" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black tracking-tight text-white uppercase">
                                Super Admin Portal
                            </h1>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                ប្រព័ន្ធសុវត្ថិភាពកម្រិតខ្ពស់សម្រាប់ Master Administrator
                            </p>
                        </div>
                    </div>

                    {/* Lockout Warning Banner */}
                    {lockoutTimer > 0 && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                            <Clock size={16} className="animate-spin" />
                            <span>ប្រព័ន្ធជាប់សោរ៖ នៅសល់ {Math.floor(lockoutTimer / 60)} នាទី {lockoutTimer % 60} វិនាទី</span>
                        </div>
                    )}

                    {/* Error Banner */}
                    {error && lockoutTimer <= 0 && (
                        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-300">
                                            Admin Email Address
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    disabled={lockoutTimer > 0}
                                                    placeholder="admin@monea.co"
                                                    autoComplete="email"
                                                    className="h-12 bg-slate-950/60 border-white/10 rounded-2xl px-4 pl-11 text-white font-medium focus-visible:ring-red-500"
                                                />
                                                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-300">
                                            Master Password
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type={showPassword ? "text" : "password"}
                                                    disabled={lockoutTimer > 0}
                                                    placeholder="••••••••"
                                                    autoComplete="current-password"
                                                    className="h-12 bg-slate-950/60 border-white/10 rounded-2xl px-4 pl-11 pr-11 text-white font-medium focus-visible:ring-red-500"
                                                />
                                                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-400" />
                                    </FormItem>
                                )}
                            />

                            {/* 2FA Security Code Field */}
                            <AnimatePresence>
                                {require2FA && (
                                    <m.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="pt-1"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="twoFactorCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                                                        <KeyRound size={14} />
                                                        <span>Google Authenticator (2FA Code)</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                {...field}
                                                                type="text"
                                                                placeholder="000 000"
                                                                maxLength={6}
                                                                autoFocus
                                                                className="h-12 bg-red-950/30 border-red-500/30 rounded-2xl px-4 pl-11 text-white font-mono tracking-[0.3em] text-center text-lg focus-visible:ring-red-500 font-bold"
                                                            />
                                                            <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-400" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs text-red-400" />
                                                </FormItem>
                                            )}
                                        />
                                    </m.div>
                                )}
                            </AnimatePresence>

                            {/* Cloudflare Turnstile Bot Defense */}
                            <div className="flex justify-center pt-2">
                                <Turnstile
                                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAACqptbDqodh591Td"}
                                    onSuccess={(token) => setCaptchaToken(token)}
                                    options={{ theme: 'dark' }}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || lockoutTimer > 0}
                                className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-xl shadow-red-600/30 transition-all active:scale-95 mt-2 border border-red-400/20"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span>កំពុងផ្ទៀងផ្ទាត់សុវត្ថិភាព...</span>
                                    </>
                                ) : (
                                    <span>ចូលទៅកាន់ Super Admin Portal</span>
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </m.div>

            {/* Security Footer Protocol */}
            <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-2 z-10 text-[11px] text-slate-500 font-medium border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-red-500" />
                    <span>Protected by Cloudflare WAF & End-to-End Encryption</span>
                </div>
                <div>
                    © 2026 MONEA Enterprise Security System.
                </div>
            </div>
        </div>
    );
}

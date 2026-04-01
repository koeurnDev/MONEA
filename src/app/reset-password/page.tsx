"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { KeyRound, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { m, AnimatePresence } from 'framer-motion';
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
import { useTranslation } from "@/i18n/LanguageProvider";
import { AUTH_URLS } from "@/lib/constants";
import { LanguageToggle } from "@/components/LanguageToggle";

function ResetPasswordForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token.");
        }
    }, [token]);

    const formSchema = z.object({
        password: z.string().min(8, { message: t('common.validation.tooShort') || "Password must be at least 8 characters" }),
        confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
        message: t('common.auth.passwordMismatched') || "Passwords don't match",
        path: ["confirmPassword"],
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!token) return;
        
        setError("");
        setSuccessMessage("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    newPassword: values.password,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMessage(data.message || "Password reset successfully!");
                setTimeout(() => {
                    router.push(AUTH_URLS.SIGN_IN);
                }, 3000);
            } else {
                setError(data.error || t('common.errors.unexpected'));
            }
        } catch (e) {
            setError(t('common.errors.technical'));
        } finally {
            setIsLoading(false);
        }
    }

    if (!token && !error) {
        return <div className="text-center text-white/50"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
    }

    return (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex justify-center">
                    <MoneaLogo showText size="md" variant="dark" />
                </Link>
                <h1 className="text-2xl font-bold text-white mb-2 font-kantumruy mt-4">{t('common.auth.resetPasswordTitle') || "Reset Password"}</h1>
                <p className="text-white/40 text-xs font-kantumruy">{t('common.auth.resetPasswordSubtitle') || "Please enter your new password below."}</p>
            </div>

            {successMessage ? (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-white font-bold mb-2">Success!</h3>
                    <p className="text-white/60 text-sm mb-6">{successMessage}</p>
                    <p className="text-white/40 text-xs">Redirecting to login...</p>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/80 text-xs uppercase tracking-wider font-bold ml-1">{t('common.auth.newPassword') || "New Password"}</FormLabel>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-3 text-white/40 group-focus-within:text-pink-400 transition-colors">
                                            <KeyRound className="w-5 h-5" />
                                        </div>
                                        <Input type="password" placeholder="••••••••" className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-11" {...field} />
                                    </div>
                                    <FormMessage className="text-red-400 text-xs" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/80 text-xs uppercase tracking-wider font-bold ml-1">{t('common.auth.confirmNewPassword') || "Confirm New Password"}</FormLabel>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-3 text-white/40 group-focus-within:text-pink-400 transition-colors">
                                            <KeyRound className="w-5 h-5" />
                                        </div>
                                        <Input type="password" placeholder="••••••••" className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-11" {...field} />
                                    </div>
                                    <FormMessage className="text-red-400 text-xs" />
                                </FormItem>
                            )}
                        />

                        <AnimatePresence>
                            {error && (
                                <m.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center font-kantumruy"
                                >
                                    {error}
                                </m.div>
                            )}
                        </AnimatePresence>

                        <Button type="submit" disabled={isLoading || !!error} className="w-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl font-bold uppercase tracking-wide h-11 border border-white/10 hover:shadow-lg hover:shadow-pink-500/20 transition-all mt-6 text-white text-sm">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (t('common.auth.resetButton') || "Reset Password")}
                        </Button>
                    </form>
                </Form>
            )}

            <div className="text-center mt-8">
                <Link href={AUTH_URLS.SIGN_IN} className="font-semibold text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2 text-xs font-kantumruy">
                    <ArrowLeft className="w-3 h-3" /> {t('common.auth.backToSignIn') || "Back to Sign In"}
                </Link>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-black py-10">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40"
                    style={{ backgroundPosition: 'center 40%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 backdrop-blur-[2px]"></div>
            </div>

            <div className="absolute top-4 right-4 md:top-6 md:right-8 z-50">
                <LanguageToggle className="bg-white/10 text-white hover:bg-white/20 hover:text-white border border-white/20 backdrop-blur-md" />
            </div>

            {/* Content Container */}
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-4 md:p-6"
            >
                <Suspense fallback={<div className="text-center text-white/50 p-10"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </m.div>
        </div>
    );
}

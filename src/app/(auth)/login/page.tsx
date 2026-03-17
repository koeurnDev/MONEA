"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
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

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Lock, Mail, ArrowRight, UserCog, Loader2, Key, Users, ChevronLeft } from "lucide-react";
import { m, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ROLES } from "@/lib/constants";
import dynamic from "next/dynamic";
import { useSWRConfig } from "swr";
import { khmerToEnglishNumbers } from "@/lib/utils";
const Turnstile = dynamic(() => import("@marsidev/react-turnstile").then(mod => mod.Turnstile), { ssr: false });
import SSOIcons from "@/components/auth/SSOIcons";

const loginSchema = z.object({
    email: z.string().email({ message: "សូមបញ្ចូលអ៊ីមែលឱ្យបានត្រឹមត្រូវ" }),
    password: z.string().min(6, { message: "ពាក្យសម្ងាត់យ៉ាងតិច ៦ ខ្ទង់" }),
});

export default function LoginPage() {
    const router = useRouter();
    const { mutate } = useSWRConfig();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [requireCaptcha, setRequireCaptcha] = useState(true);
    const [captchaToken, setCaptchaToken] = useState("");
    const [show2FA, setShow2FA] = useState(false);
    const [twoFactorToken, setTwoFactorToken] = useState("");

    // Form
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    // Handler
    async function onSubmit(values: z.infer<typeof loginSchema>) {
        if (!captchaToken) {
            setError("សូមផ្ទៀងផ្ទាត់ CAPTCHA។ (Please verify CAPTCHA)");
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
                data = { error: "ម៉ាស៊ីនមេមានបញ្ហា (Server Response Error)", details: `HTTP Status Code: ${res.status} ${res.statusText}` };
            }

            if (res.ok) {
                // Clear SWR cache to prevent stale 401 from previous session
                await mutate("/api/auth/me");

                // Redirect based on Role
                const role = data.user?.role;
                if (role === ROLES.EVENT_STAFF) {
                    router.push("/dashboard/gifts");
                } else if (role === ROLES.PLATFORM_OWNER) {
                    router.push("/admin");
                } else {
                    router.push("/dashboard");
                }
                router.refresh();
            } else {
                if (res.status === 428 && data.require2FA) {
                    setShow2FA(true);
                    setError(""); // Clear password errors and wait for user to enter token
                    return; // IMPORTANT: Stop here so we don't set the "2FA Token required" error message immediately
                } else if (res.status === 428 && data.requireCaptcha) {
                    setRequireCaptcha(true);
                } else if (res.status === 400 && data.error?.includes("CAPTCHA")) {
                    setCaptchaToken("");
                }
                let errorMsg = data.error || "អ៊ីមែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ";
                if (data.details) {
                    errorMsg += `\n[MONEA DEBUG] ${data.details}`;
                }
                setError(errorMsg);
            }
        } catch (e: any) {
            setError(e?.message || "មានបញ្ហាបច្ចេកទេស។");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-black py-4 md:py-10">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/bg_staircase.jpg"
                    alt="Background"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 backdrop-blur-[2px]"></div>
            </div>

            {/* Content Container */}
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-4 md:p-6"
            >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 md:p-6 shadow-2xl relative overflow-hidden">
                    {/* Back Button */}
                    <Link
                        href="/"
                        className="absolute left-6 top-6 text-white/40 hover:text-white transition-colors group flex items-center gap-1 text-[10px] font-black uppercase tracking-widest z-20"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> ត្រឡប់
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-3 md:mb-5">
                        <Link href="/" className="inline-flex justify-center">
                            <MoneaLogo showText size="sm" variant="dark" />
                        </Link>

                        <h1 className="text-xl md:text-2xl font-bold text-white mb-1 font-kantumruy">ចូលប្រើប្រាស់</h1>
                        <p className="text-white/40 text-[10px] md:text-xs font-kantumruy">សូមបញ្ចូលគណនីរបស់អ្នកដើម្បីបន្ត</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5 md:space-y-3">
                            <AnimatePresence mode="wait">
                                {!show2FA ? (
                                    <m.div
                                        key="password-step"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-2.5 md:space-y-3"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white/80 text-xs uppercase tracking-wider font-bold ml-1">អ៊ីមែល</FormLabel>
                                                    <div className="relative group">
                                                        <div className="absolute left-3 top-2.5 md:top-3 text-white/40 group-focus-within:text-pink-400 transition-colors">
                                                            <Mail className="w-4 h-4 md:w-5 md:h-5" />
                                                        </div>
                                                        <Input
                                                            placeholder="name@example.com"
                                                            autoComplete="email"
                                                            className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-10 md:h-11"
                                                            {...field}
                                                        />
                                                    </div>
                                                    <FormMessage className="text-red-400 text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <FormLabel className="text-white/80 text-xs uppercase tracking-wider font-bold ml-1">ពាក្យសម្ងាត់</FormLabel>
                                                        <Link href="/forgot-password" className="text-[10px] text-pink-400 hover:text-pink-300">ភ្លេច?</Link>
                                                    </div>
                                                    <div className="relative group">
                                                        <div className="absolute left-3 top-2.5 md:top-3 text-white/40 group-focus-within:text-pink-400 transition-colors">
                                                            <Lock className="w-4 h-4 md:w-5 md:h-5" />
                                                        </div>
                                                        <Input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            autoComplete="current-password"
                                                            className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-10 md:h-11"
                                                            {...field}
                                                        />
                                                    </div>
                                                    <FormMessage className="text-red-400 text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </m.div>
                                ) : (
                                    <m.div
                                        key="2fa-step"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4 py-2"
                                    >
                                        <div className="text-center space-y-1 mb-4">
                                            <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <Key className="text-pink-400 w-6 h-6" />
                                            </div>
                                            <h3 className="text-white font-bold font-kantumruy">ផ្ទៀងផ្ទាត់ ២ ជាន់ (2FA)</h3>
                                            <p className="text-white/40 text-[10px] font-kantumruy">សូមបញ្ចូលលេខកូដពីកម្មវិធី Authenticator របស់អ្នក</p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="relative group">
                                                <div className="absolute left-3 top-3 text-white/40 group-focus-within:text-pink-400 transition-colors">
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <Input
                                                    value={twoFactorToken}
                                                    onChange={(e) => {
                                                        const val = khmerToEnglishNumbers(e.target.value).replace(/[^0-9]/g, "");
                                                        setTwoFactorToken(val);
                                                    }}
                                                    placeholder="000000"
                                                    autoComplete="one-time-code"
                                                    className="pl-10 text-center text-xl font-black tracking-[0.5em] bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-12"
                                                    maxLength={6}
                                                    autoFocus
                                                    inputMode="numeric"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShow2FA(false)}
                                                className="w-full text-white/40 hover:text-white hover:bg-white/5 text-[10px] font-kantumruy h-8"
                                            >
                                                ត្រឡប់ទៅវាយពាក្យសម្ងាត់វិញ
                                            </Button>
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>

                            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
                                <div className="flex justify-center my-2 overflow-hidden scale-90 md:scale-100 origin-center">
                                    <Turnstile
                                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                                        onSuccess={(token) => {
                                            setCaptchaToken(token);
                                            setError("");
                                        }}
                                        options={{ theme: 'dark', appearance: 'always' }}
                                    />
                                </div>
                            ) : (
                                <div className="text-[10px] text-red-400 bg-red-400/10 p-2 rounded-lg text-center font-bold my-2">
                                    Turnstile Key Missing
                                </div>
                            )}
                            <Button type="submit" disabled={isLoading || !captchaToken} className="w-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl font-bold uppercase tracking-wide h-10 md:h-11 border border-white/10 hover:shadow-lg hover:shadow-pink-500/20 transition-all mt-1">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : show2FA ? "ផ្ទៀងផ្ទាត់ និងចូល" : "ចូលគណនី"}
                            </Button>
                        </form>
                    </Form>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <m.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center font-kantumruy"
                            >
                                {error}
                            </m.div>
                        )}
                    </AnimatePresence>

                    {/* SSO Section */}
                    <div className="mt-6">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                                <span className="bg-[#1a1a1a] px-3 text-white/20">ឬចូលតាមរយៈ</span>
                            </div>
                        </div>

                        <SSOIcons />
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-white/40 text-[10px] font-medium">
                            មិនទាន់មានគណនី? {" "}
                            <Link href="/register" className="text-pink-400 hover:text-pink-300 font-bold underline underline-offset-4 decoration-pink-500/30">
                                ចុះឈ្មោះឥឡូវនេះ
                            </Link>
                        </p>
                    </div>
                </div>
            </m.div>
        </div>
    );
}

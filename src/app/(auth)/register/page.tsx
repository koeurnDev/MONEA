"use client";
import React, { useState } from "react";
import Link from "next/link";
import { UserPlus, Mail, Lock, ChevronLeft, ArrowRight, Camera } from "lucide-react";

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
import { LanguageToggle } from "@/components/LanguageToggle";
const Turnstile = dynamic(() => import("@marsidev/react-turnstile").then(mod => mod.Turnstile), { ssr: false });

const formSchema = z.object({
    name: z.string().min(2, { message: "សូមបញ្ចូលឈ្មោះរបស់លោកអ្នក" }),
    email: z.string().email({ message: "សូមបញ្ចូលអ៊ីមែលដែលត្រឹមត្រូវ (Invalid email)" }),
    password: z.string().min(6, { message: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ ខ្ទង់" }),
    confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
    message: "ពាក្យសម្ងាត់មិនត្រឹមត្រូវ (Passwords don't match)",
    path: ["confirmPassword"],
});

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string>("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setError("");

        // Require CAPTCHA validation
        if (!turnstileToken) {
            setError("សូមផ្ទៀងផ្ទាត់ CAPTCHA (CAPTCHA required)");
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

            let data;
            try {
                data = await res.json();
            } catch (err) {
                data = { error: "ម៉ាស៊ីនមេមានបញ្ហា (Server Response Error)", details: `HTTP Status Code: ${res.status} ${res.statusText}` };
            }

            if (res.ok) {
                // Redirect to login or potentially a welcome/onboarding page
                router.push("/login?registered=true");
            } else {
                let errorMsg = data.error || "ការចុះឈ្មោះបរាជ័យ (Registration failed)";
                if (data.details) {
                    errorMsg += `\n[MONEA DEBUG] ${data.details}`;
                }
                setError(errorMsg);
            }
        } catch (e: any) {
            setError(e?.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-black py-4 md:py-10">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2000&auto=format&fit=crop"
                    alt="Background"
                    fill
                    className="object-cover opacity-40"
                    style={{ objectPosition: 'center 40%' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 backdrop-blur-[2px]"></div>
            </div>

            <div className="absolute top-4 right-4 md:top-6 md:right-8 z-50">
                <LanguageToggle className="bg-white/10 text-white hover:bg-white/20 hover:text-white border border-white/20 backdrop-blur-md" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-md p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 md:p-6 shadow-2xl relative overflow-hidden">
                    {/* Back Button */}
                    <Link
                        href="/login"
                        className="absolute left-6 top-6 text-white/40 hover:text-white transition-colors group flex items-center gap-1 text-[10px] font-black uppercase tracking-widest z-20"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> ត្រឡប់
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-2">
                        <Link href="/" className="inline-flex justify-center scale-90 md:scale-100">
                            <MoneaLogo showText size="sm" variant="dark" />
                        </Link>
                        <h1 className="text-lg md:text-xl font-bold text-white mb-0.5 font-kantumruy mt-1">បង្កើតគណនីថ្មី</h1>
                        <p className="text-white/40 text-[10px] font-kantumruy">ឥតគិតថ្លៃសម្រាប់ការចាប់ផ្តើម</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 md:space-y-2.5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-white/60 text-[10px] uppercase tracking-wider font-bold ml-1">ឈ្មោះរបស់អ្នក</FormLabel>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-2 md:top-2.5 text-white/30 group-focus-within:text-pink-400 transition-colors">
                                                <UserPlus className="w-4 h-4" />
                                            </div>
                                            <Input placeholder="Full Name" className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-8 md:h-10 text-sm" {...field} />
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
                                        <FormLabel className="text-white/60 text-[10px] uppercase tracking-wider font-bold ml-1">អ៊ីមែល</FormLabel>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-2 md:top-2.5 text-white/30 group-focus-within:text-pink-400 transition-colors">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <Input placeholder="name@example.com" className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-8 md:h-10 text-sm" {...field} />
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
                                            <FormLabel className="text-white/60 text-[10px] uppercase tracking-wider font-bold ml-1">ពាក្យសម្ងាត់</FormLabel>
                                            <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-8 md:h-10 text-sm" {...field} />
                                            <FormMessage className="text-red-400 text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-white/60 text-[10px] uppercase tracking-wider font-bold ml-1">បញ្ជាក់</FormLabel>
                                            <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-8 md:h-10 text-sm" {...field} />
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
                                <div className="flex justify-center scale-75 origin-center">
                                    <Turnstile
                                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                                        onSuccess={(token) => setTurnstileToken(token)}
                                        options={{ theme: 'dark', appearance: 'always' }}
                                    />
                                </div>
                            ) : (
                                <div className="text-[10px] text-red-400 bg-red-400/10 p-2 rounded-lg text-center font-bold">
                                    Turnstile Key Missing
                                </div>
                            )}
                            <Button type="submit" disabled={isLoading || !turnstileToken} className="w-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl font-bold uppercase tracking-wide h-9 md:h-10 border border-white/10 hover:shadow-lg hover:shadow-pink-500/20 transition-all mt-1 text-white text-xs">
                                {isLoading ? "កំពុងបង្កើត..." : "ចុះឈ្មោះ"}
                            </Button>
                        </form>
                    </Form>

                    {/* SSO Section */}
                    <div className="mt-3">
                        <div className="relative mb-3">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-[9px] uppercase font-black tracking-widest">
                                <span className="bg-[#1c1c1c] px-3 text-white/20">ឬ</span>
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
                                មានគណនីរួចហើយ?
                            </span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link href="/login" className="font-semibold text-white/60 hover:text-pink-400 transition-colors flex items-center justify-center gap-1.5 text-xs font-kantumruy">
                            ចូលប្រើប្រាស់គណនី <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}

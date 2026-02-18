"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
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
import { useState } from "react";
import Link from "next/link";
import { Heart, Lock, Mail, ArrowRight, UserPlus } from "lucide-react";
import { MoneaLogo } from "@/components/ui/MoneaLogo";

const formSchema = z.object({
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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setError("");
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: values.email, password: values.password }),
            });

            const data = await res.json();
            if (res.ok) {
                // Redirect to login or potentially a welcome/onboarding page
                router.push("/login?registered=true");
            } else {
                setError(data.error || "Registration failed");
            }
        } catch (e) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex bg-white">
            {/* Left Side - Hero Image */}
            <div className="hidden lg:flex w-1/2 bg-red-50 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511285560982-1356c11d4606?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="relative z-10 text-white max-w-lg">
                    <div className="flex justify-start mb-8">
                        <MoneaLogo showText size="lg" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4 font-kantumruy leading-tight italic">
                        ចាប់ផ្តើមរៀបចំមង្គលការ <br /> ក្នុងក្តីស្រមៃរបស់អ្នក
                    </h1>
                    <div className="flex items-center gap-2 text-white/70">
                        <div className="w-8 h-[1px] bg-red-500" />
                        <p className="text-lg font-kantumruy font-medium tracking-wide">
                            Join thousands of couples using MONEA to plan their perfect day.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-kantumruy">បង្កើតគណនីថ្មី</h2>
                        <p className="mt-2 text-sm text-gray-500">
                            ឥតគិតថ្លៃសម្រាប់ការចាប់ផ្តើម។ មិនត្រូវការកាត Credit ទេ។
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">អ៊ីមែល (Email)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    placeholder="name@example.com"
                                                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid gap-5 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700">ពាក្យសម្ងាត់</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••"
                                                        className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700">បញ្ជាក់ពាក្យសម្ងាត់</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••"
                                                        className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-md bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 text-base bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? "កំពុងបង្កើតគណនី..." : "ចុះឈ្មោះ (Register)"}
                            </Button>
                        </form>
                    </Form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-400">
                                មានគណនីរួចហើយ?
                            </span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link href="/login" className="font-semibold text-gray-900 hover:text-red-600 transition-colors flex items-center justify-center gap-2">
                            ចូលប្រើប្រាស់គណនី <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import dynamic from "next/dynamic";
import Image from "next/image";
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
                    src="https://images.unsplash.com/photo-1511285560982-1356c11d4606?q=80&w=2000&auto=format&fit=crop"
                    alt="Background"
                    fill
                    className="object-cover opacity-40"
                    style={{ objectPosition: 'center 40%' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 backdrop-blur-[2px]"></div>
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
                    <div className="text-center mb-3">
                        <Link href="/" className="inline-flex justify-center">
                            <MoneaLogo showText size="sm" variant="dark" />
                        </Link>
                        <h1 className="text-xl md:text-2xl font-bold text-white mb-1 font-kantumruy mt-1.5 md:mt-2">បង្កើតគណនីថ្មី</h1>
                        <p className="text-white/40 text-[10px] md:text-xs font-kantumruy">ឥតគិតថ្លៃសម្រាប់ការចាប់ផ្តើម។ មិនត្រូវការកាត Credit ទេ។</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5 md:space-y-3">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white/80 text-xs uppercase tracking-wider font-bold ml-1">ឈ្មោះរបស់អ្នក (Full Name)</FormLabel>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-2.5 md:top-3 text-white/40 group-focus-within:text-pink-400 transition-colors">
                                                <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
                                            </div>
                                            <Input placeholder="ឈ្មោះរបស់អ្នក" className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-9 md:h-11" {...field} />
                                        </div>
                                        <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                )}
                            />
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
                                            <Input placeholder="name@example.com" className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-9 md:h-11" {...field} />
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
                                        <FormLabel className="text-white/80 text-xs uppercase tracking-wider font-bold ml-1">ពាក្យសម្ងាត់</FormLabel>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-2.5 md:top-3 text-white/40 group-focus-within:text-pink-400 transition-colors">
                                                <Lock className="w-4 h-4 md:w-5 md:h-5" />
                                            </div>
                                            <Input type="password" placeholder="••••••••" className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-9 md:h-11" {...field} />
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
                                        <FormLabel className="text-white/80 text-xs uppercase tracking-wider font-bold ml-1">បញ្ជាក់ពាក្យសម្ងាត់</FormLabel>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-2.5 md:top-3 text-white/40 group-focus-within:text-pink-400 transition-colors">
                                                <Lock className="w-4 h-4 md:w-5 md:h-5" />
                                            </div>
                                            <Input type="password" placeholder="••••••••" className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-9 md:h-11" {...field} />
                                        </div>
                                        <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                )}
                            />

                            {error && (
                                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center font-kantumruy">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-center mt-2 mb-1 scale-[0.85] md:scale-100 origin-center">
                                <Turnstile
                                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                                    onSuccess={(token) => setTurnstileToken(token)}
                                    options={{
                                        theme: 'dark',
                                        size: 'normal',
                                    }}
                                />
                            </div>

                            <Button type="submit" disabled={isLoading || !turnstileToken} className="w-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl font-bold uppercase tracking-wide h-10 md:h-11 border border-white/10 hover:shadow-lg hover:shadow-pink-500/20 transition-all mt-4 text-white">
                                {isLoading ? "កំពុងបង្កើតគណនី..." : "ចុះឈ្មោះ"}
                            </Button>
                        </form>
                    </Form>

                    <div className="relative mt-5 mb-5">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#1c1c1c] px-2 text-white/40 rounded-full">
                                មានគណនីរួចហើយ?
                            </span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link href="/login" className="font-semibold text-white hover:text-pink-400 transition-colors flex items-center justify-center gap-2 text-sm font-kantumruy">
                            ចូលប្រើប្រាស់គណនី <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}

import { lazy, Suspense, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, ChevronLeft } from "lucide-react";
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
import { moneaClient } from "@/lib/api-client";

const Turnstile = lazy(() => import("@marsidev/react-turnstile").then(mod => ({ default: mod.Turnstile })));

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");

    const formSchema = z.object({
        email: z.string().email({ message: t('common.validation.invalidEmail') }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setError("");
        setSuccessMessage("");
        setIsLoading(true);
        try {
            const res = await moneaClient.post("/api/auth/forgot-password", {
                email: values.email,
                turnstileToken
            });

            if (!res.error) {
                setSuccessMessage(t('common.auth.resetLinkSent'));
            } else {
                setError(res.error || t('common.errors.technical'));
            }
        } catch (e) {
            setError(t('common.errors.technical'));
        } finally {
            setIsLoading(false);
        }
    }

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
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                    {/* Back Button */}
                    <Link to={AUTH_URLS.SIGN_IN}
                        className="absolute left-6 top-6 text-white/40 hover:text-white transition-colors group flex items-center gap-1 text-[10px] font-black uppercase tracking-widest z-20"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> {t('common.auth.back')}
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex justify-center">
                            <MoneaLogo showText size="md" variant="dark" />
                        </Link>
                        <h1 className="text-2xl font-bold text-white mb-2 font-kantumruy mt-4">{t('common.auth.forgotPasswordTitle')}</h1>
                        <p className="text-white/40 text-xs font-kantumruy">{t('common.auth.forgotPasswordSubtitle')}</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white/80 font-kantumruy text-xs">{t('common.auth.emailLabel')}</FormLabel>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                                            <Input placeholder="name@example.com" className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-pink-500/50 h-11" {...field} />
                                        </div>
                                        <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                )}
                            />

                            {import.meta.env.VITE_TURNSTILE_SITE_KEY ? (
                                <div className="flex justify-center my-4 scale-90 xs:scale-100 origin-center">
                                    <Turnstile
                                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAACqptbDqodh591Td"}
                                        onSuccess={(token: string) => setTurnstileToken(token)}
                                        options={{ theme: 'dark', appearance: 'always' }}
                                    />
                                </div>
                            ) : (
                                <div className="text-[10px] text-red-400 bg-red-400/10 p-2 rounded-lg text-center font-bold mb-4">
                                    Turnstile Key Missing
                                </div>
                            )}

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
                                {successMessage && (
                                    <m.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center font-kantumruy"
                                    >
                                        {successMessage}
                                    </m.div>
                                )}
                            </AnimatePresence>

                            <Button type="submit" disabled={isLoading || !!successMessage || !turnstileToken} className="w-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl font-bold uppercase tracking-wide h-11 border border-white/10 hover:shadow-lg hover:shadow-pink-500/20 transition-all mt-6 text-white text-sm">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('common.auth.sending')}
                                    </>
                                ) : (
                                    t('common.auth.sendResetLink')
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </m.div>
        </div>
    );
}

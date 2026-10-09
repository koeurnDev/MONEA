import { lazy, Suspense, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from 'react-router-dom';
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
import { ThemeToggle } from "@/components/ThemeToggle";
import { moneaClient } from "@/lib/api-client";

const Turnstile = lazy(() => import("@marsidev/react-turnstile").then(mod => ({ default: mod.Turnstile })));

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");
    const [otp, setOtp] = useState("");

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
                setSuccessMessage(t('common.auth.resetLinkSent', { defaultValue: 'បើគណនីមាន Telegram ភ្ជាប់ កូដសង្គ្រោះនឹងត្រូវបានផ្ញើទៅ Telegram។' }));
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
        <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-x-hidden bg-gradient-to-br from-[#FFF5F7] via-[#FDF8FF] to-[#FFF8F0] px-3 py-4 transition-colors duration-300 dark:from-[#09090B] dark:via-[#130E1B] dark:to-[#09090B] sm:px-4">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-[10%] -top-[15%] h-[50vw] w-[50vw] rounded-full bg-teal-400/15 blur-[130px] dark:bg-teal-600/10" />
                <div className="absolute -bottom-[15%] -right-[10%] h-[45vw] w-[45vw] rounded-full bg-amber-300/15 blur-[130px] dark:bg-amber-900/10" />
            </div>

            <div className="z-10 mb-3 flex w-full max-w-[420px] items-center justify-between px-1">
                <Link
                    to={AUTH_URLS.SIGN_IN}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-xs transition-all hover:bg-muted hover:text-foreground active:scale-95"
                >
                    <ChevronLeft size={15} />
                    <span>{t('common.auth.back', { defaultValue: 'ត្រឡប់' })}</span>
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeToggle className="h-8 w-8 border border-border/80 bg-card text-foreground shadow-xs hover:bg-muted" />
                </div>
            </div>

            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[420px]"
            >
                <div className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-2xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-[#121216]/95 dark:shadow-teal-950/10 sm:p-6">
                    <div className="mb-4 text-center">
                        <Link to="/" className="mb-2 inline-flex justify-center">
                            <MoneaLogo showText size="sm" />
                        </Link>
                        <h1 className="text-xl font-black text-foreground font-kantumruy sm:text-2xl">
                            {t('common.auth.forgotPasswordTitle', { defaultValue: 'ភ្លេចពាក្យសម្ងាត់' })}
                        </h1>
                        <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                            {t('common.auth.forgotPasswordSubtitle', { defaultValue: 'បញ្ចូលអ៊ីមែលគណនី។ បើបានភ្ជាប់ Telegram រួច កូដសង្គ្រោះនឹងផ្ញើទៅ Telegram របស់អ្នក។' })}
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-xs font-bold text-foreground font-kantumruy">
                                            {t('common.auth.emailLabel', { defaultValue: 'អ៊ីមែល' })}
                                        </FormLabel>
                                        <div className="relative group">
                                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-teal-700 dark:group-focus-within:text-teal-300" />
                                            <Input
                                                placeholder="name@example.com"
                                                className="h-11 pl-11 rounded-xl border border-input bg-background text-sm text-foreground transition-all focus:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-600/20 dark:bg-zinc-900/60"
                                                {...field}
                                            />
                                        </div>
                                        <FormMessage className="text-xs text-rose-600" />
                                    </FormItem>
                                )}
                            />

                            {import.meta.env.VITE_TURNSTILE_SITE_KEY ? (
                                <div className="flex min-h-[58px] w-full items-center justify-center py-0.5">
                                    <Turnstile
                                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAACqptbDqodh591Td"}
                                        onSuccess={(token: string) => setTurnstileToken(token)}
                                        options={{ theme: 'auto', appearance: 'always' }}
                                    />
                                </div>
                            ) : (
                                <div className="mb-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-center text-[10px] font-bold text-red-500">
                                    Turnstile Key Missing
                                </div>
                            )}

                            <AnimatePresence>
                                {error && (
                                    <m.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-center text-xs font-bold text-rose-600 dark:text-rose-400"
                                    >
                                        {error}
                                    </m.div>
                                )}
                                {successMessage && (
                                    <m.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400"
                                    >
                                        {successMessage}
                                    </m.div>
                                )}
                            </AnimatePresence>

                            {!successMessage && (
                                <Button
                                    type="submit"
                                    disabled={isLoading || !turnstileToken}
                                    className="mt-1 h-11 w-full rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 text-sm font-bold text-white shadow-md shadow-teal-700/20 transition-all hover:from-teal-800 hover:to-teal-700 active:bg-teal-800"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {t('common.auth.sending', { defaultValue: 'កំពុងផ្ញើ...' })}
                                        </span>
                                    ) : (
                                        t('common.auth.sendResetLink', { defaultValue: 'ផ្ញើ OTP' })
                                    )}
                                </Button>
                            )}

                            {successMessage && (
                                <div className="space-y-3 pt-1">
                                    <Input
                                        value={otp}
                                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                                        inputMode="numeric"
                                        placeholder="បញ្ចូល OTP ៦ ខ្ទង់"
                                        className="h-11 rounded-xl border border-input bg-background text-center text-lg font-bold tracking-[0.35em] text-foreground dark:bg-zinc-900/60"
                                    />
                                    <Button
                                        type="button"
                                        disabled={otp.length !== 6}
                                        onClick={() => navigate(`/reset-password?token=${encodeURIComponent(otp)}`, {
                                            state: { email: form.getValues("email").trim().toLowerCase() },
                                        })}
                                        className="h-11 w-full rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 text-sm font-bold text-white shadow-md shadow-teal-700/20 transition-all hover:from-teal-800 hover:to-teal-700"
                                    >
                                        {t('common.auth.continue', { defaultValue: 'បន្ត' })}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </div>
            </m.div>
        </div>
    );
}

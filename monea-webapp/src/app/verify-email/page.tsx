import { Suspense, lazy, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "@/i18n/LanguageProvider";
import { moneaClient } from "@/lib/api-client";
import { AUTH_URLS } from "@/lib/constants";

const Turnstile = lazy(() => import("@marsidev/react-turnstile").then(mod => ({ default: mod.Turnstile })));

type PageStatus = "ready" | "verified";
type MessageTone = "error" | "info";

function getVerificationErrorMessage(error: string | undefined, isKm: boolean): string {
    const normalized = error?.trim().toLowerCase();
    if (normalized === "the verification code is invalid or has expired.") {
        return isKm
            ? "លេខកូដមិនត្រឹមត្រូវ ឬបានផុតកំណត់។ សូមពិនិត្យលេខកូដ ឬចុច «ផ្ញើលេខកូដម្ដងទៀត»។"
            : "The verification code is invalid or has expired. Check the code or request a new one.";
    }
    if (normalized?.includes("too many") || normalized?.includes("rate limit")) {
        return isKm
            ? "អ្នកបានសាកល្បងច្រើនដងពេក។ សូមរង់ចាំបន្តិច រួចសាកល្បងម្ដងទៀត។"
            : "Too many attempts. Please wait a moment and try again.";
    }
    return error || (isKm
        ? "មិនអាចផ្ទៀងផ្ទាត់លេខកូដបានទេ។ សូមពិនិត្យលេខកូដ ហើយសាកល្បងម្ដងទៀត។"
        : "We could not verify the code. Check it and try again.");
}

export default function VerifyEmailPage() {
    const { locale } = useTranslation();
    const isKm = locale === "km";
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") || "";
    const [status, setStatus] = useState<PageStatus>("ready");
    const [message, setMessage] = useState(() => searchParams.get("delivery") === "failed"
        ? (isKm
            ? "គណនីត្រូវបានបង្កើត ប៉ុន្តែអ៊ីមែលមិនទាន់បានផ្ញើទេ។ សូមចុចផ្ញើលេខកូដម្ដងទៀត។"
            : "Your account was created, but the verification code could not be sent. Request a new code below.")
        : "");
    const [messageTone, setMessageTone] = useState<MessageTone>(
        searchParams.get("delivery") === "failed" ? "info" : "error",
    );
    const [otp, setOtp] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showTurnstile, setShowTurnstile] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");
    const [turnstileWidgetKey, setTurnstileWidgetKey] = useState(0);
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

    async function verifyEmail() {
        if (!/^\d{6}$/.test(otp)) {
            setMessageTone("error");
            setMessage(isKm ? "សូមបញ្ចូលលេខកូដ ៦ ខ្ទង់។" : "Enter the 6-digit verification code.");
            return;
        }
        setMessage("");
        setIsVerifying(true);
        try {
            const response = await moneaClient.post<{ success: boolean }>(
                "/api/auth/verify-email",
                { email, otp },
            );
            if (response.error) {
                setMessageTone("error");
                setMessage(getVerificationErrorMessage(response.error, isKm));
                return;
            }
            setStatus("verified");
        } catch (error) {
            console.error("[Email Verification] Could not verify code:", error);
            setMessageTone("error");
            setMessage(isKm ? "មិនអាចផ្ទៀងផ្ទាត់អ៊ីមែលបានទេ។ សូមព្យាយាមម្ដងទៀត។" : "We could not verify your email. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    }

    async function resendVerification() {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) return;
        if (showTurnstile && siteKey && !turnstileToken) {
            setMessageTone("error");
            setMessage(isKm ? "សូមបំពេញការផ្ទៀងផ្ទាត់សុវត្ថិភាព។" : "Please complete the security check.");
            return;
        }

        setMessage("");
        setIsSending(true);
        try {
            const response = await moneaClient.post(
                "/api/auth/resend-verification",
                { email: normalizedEmail, turnstileToken: turnstileToken || undefined },
            );
            if (response.error) {
                if (response.status === 428) setShowTurnstile(true);
                setMessageTone("error");
                setMessage(getVerificationErrorMessage(response.error, isKm));
                return;
            }
            setMessageTone("info");
            setMessage(isKm
                ? "បើអ៊ីមែលនេះមានគណនីដែលមិនទាន់ផ្ទៀងផ្ទាត់ លេខកូដថ្មីនឹងត្រូវបានផ្ញើ។ សូមពិនិត្យ Inbox និង Spam។"
                : "If this email has a pending account, a new verification code has been sent. Check your inbox and spam folder.");
        } catch (error) {
            console.error("[Email Verification] Could not resend code:", error);
            setMessageTone("error");
            setMessage(isKm ? "មិនអាចផ្ញើលេខកូដបានទេ។ សូមព្យាយាមម្ដងទៀត។" : "We could not send the code. Please try again.");
        } finally {
            setIsSending(false);
            setTurnstileToken("");
            setTurnstileWidgetKey(key => key + 1);
        }
    }

    return (
        <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-x-hidden bg-gradient-to-br from-background via-background to-secondary px-3 py-4 sm:px-4">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-[10%] -top-[15%] h-[50vw] w-[50vw] rounded-full bg-sage/10 blur-[130px]" />
                <div className="absolute -bottom-[15%] -right-[10%] h-[45vw] w-[45vw] rounded-full bg-gold/15 blur-[130px]" />
            </div>

            <div className="relative z-10 mb-3 flex w-full max-w-[420px] items-center justify-between px-1">
                <Link
                    to={AUTH_URLS.SIGN_IN}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
                >
                    <ChevronLeft size={15} />
                    <span>{isKm ? "ត្រឡប់ទៅចូលគណនី" : "Back to sign in"}</span>
                </Link>
                <ThemeToggle className="h-8 w-8 border border-border/80 bg-card text-foreground shadow-xs hover:bg-muted" />
            </div>

            <section className="relative z-10 w-full max-w-[420px] rounded-[28px] border border-border bg-card/95 p-5 text-center shadow-2xl backdrop-blur-2xl sm:p-6">
                <Link to="/" className="mb-3 inline-flex justify-center">
                    <MoneaLogo showText size="sm" />
                </Link>
                {status === "verified" ? (
                    <div className="flex flex-col items-center gap-3 py-3">
                        <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                        <h1 className="text-xl font-black text-foreground">
                            {isKm ? "ផ្ទៀងផ្ទាត់អ៊ីមែលជោគជ័យ" : "Email verified"}
                        </h1>
                        <p className="text-sm leading-6 text-muted-foreground">
                            {isKm ? "គណនីរបស់អ្នករួចរាល់ហើយ។ ឥឡូវនេះអ្នកអាចចូលប្រើបាន។" : "Your account is ready. You can now sign in."}
                        </p>
                        <Button asChild className="mt-2 h-11 w-full rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90">
                            <Link to={AUTH_URLS.SIGN_IN}>{isKm ? "ចូលគណនី" : "Sign in"}</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3 pt-2">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
                            <Mail size={24} />
                        </div>
                        <h1 className="text-xl font-black text-foreground">
                            {isKm ? "ផ្ទៀងផ្ទាត់អ៊ីមែលរបស់អ្នក" : "Verify your email"}
                        </h1>
                        <p className="text-xs leading-6 text-muted-foreground">
                            {isKm
                                ? <>យើងបានផ្ញើលេខកូដ ៦ ខ្ទង់ទៅ <strong className="break-all text-foreground">{email}</strong>។ សូមបញ្ចូលលេខកូដដើម្បីបញ្ចប់ការបង្កើតគណនី។ លេខកូដមានសុពលភាព ១០ នាទី។</>
                                : <>We sent a 6-digit code to <strong className="break-all text-foreground">{email}</strong>. Enter it to finish creating your account. The code expires in 10 minutes.</>}
                        </p>
                        {message && (
                            <p
                                role={messageTone === "error" ? "alert" : "status"}
                                aria-live={messageTone === "error" ? "assertive" : "polite"}
                                className={messageTone === "error"
                                    ? "rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs leading-5 text-rose-700 dark:text-rose-300"
                                    : "rounded-xl border border-border bg-accent p-3 text-xs leading-5 text-accent-foreground"}
                            >
                                {message}
                            </p>
                        )}
                        <label htmlFor="verification-otp" className="block text-left text-xs font-bold text-foreground">
                            {isKm ? "លេខកូដ OTP ៦ ខ្ទង់" : "6-digit verification code"}
                        </label>
                        <Input
                            id="verification-otp"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={otp}
                            onChange={event => {
                                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                                if (message) {
                                    setMessage("");
                                    setMessageTone("error");
                                }
                            }}
                            placeholder="••••••"
                            className="h-12 rounded-xl bg-background text-center text-lg font-bold tracking-[0.5em]"
                        />
                        {siteKey && showTurnstile && (
                            <div className="flex min-h-[58px] w-full items-center justify-center">
                                <Suspense fallback={<span className="text-xs text-muted-foreground">{isKm ? "កំពុងផ្ទុក..." : "Loading..."}</span>}>
                                    <Turnstile
                                        key={turnstileWidgetKey}
                                        siteKey={siteKey}
                                        onSuccess={setTurnstileToken}
                                        onExpire={() => setTurnstileToken("")}
                                        options={{ theme: "auto", appearance: "always", action: "resend_verification" }}
                                    />
                                </Suspense>
                            </div>
                        )}
                        {showTurnstile && !siteKey && (
                            <p role="alert" className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                                {isKm ? "មិនអាចផ្ទុកការផ្ទៀងផ្ទាត់សុវត្ថិភាពបានទេ។ សូមទាក់ទងជំនួយ។" : "Security verification is unavailable. Please contact support."}
                            </p>
                        )}
                        <Button
                            type="button"
                            onClick={() => void verifyEmail()}
                            disabled={isVerifying || otp.length !== 6}
                            className="h-11 w-full rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                        >
                            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                isKm ? "ផ្ទៀងផ្ទាត់អ៊ីមែល" : "Verify email"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => void resendVerification()}
                            disabled={isSending || (showTurnstile && (!siteKey || !turnstileToken))}
                            className="h-11 w-full rounded-xl font-bold"
                        >
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                isKm ? "ផ្ញើលេខកូដម្ដងទៀត" : "Resend code"
                            )}
                        </Button>
                    </div>
                )}
            </section>
        </div>
    );
}

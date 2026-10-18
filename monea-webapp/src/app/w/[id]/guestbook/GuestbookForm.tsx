import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Sparkles, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { lazy, Suspense } from "react";
import { submitGuestbookEntry } from "@/app/actions";

const Turnstile = lazy(() => import("@marsidev/react-turnstile").then(mod => ({ default: mod.Turnstile })));

type GuestbookEntry = {
    id: string;
    guestName: string;
    message: string;
    createdAt: string;
};

export function GuestbookForm({
    weddingId,
    onSuccess,
}: {
    weddingId: string;
    onSuccess: (entry: GuestbookEntry) => void;
}) {
    const [token, setToken] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [turnstileKey, setTurnstileKey] = useState(0);
    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(formData: FormData) {
        if (!token) {
            setSubmitError("សូមផ្ទៀងផ្ទាត់ CAPTCHA មុនពេលផ្ញើពាក្យជូនពរ។");
            return;
        }

        setSubmitError("");
        setIsSubmitting(true);
        formData.set("turnstileToken", token);

        try {
            const entry = await submitGuestbookEntry(formData) as GuestbookEntry;
            onSuccess(entry);
            formRef.current?.reset();
            setToken("");
            setTurnstileKey((key) => key + 1);
        } catch (error) {
            console.error("[GuestbookForm] Submission failed:", error);
            setSubmitError(error instanceof Error ? error.message : "មានបញ្ហាបច្ចេកទេស។ សូមព្យាយាមម្តងទៀត។");
            setToken("");
            setTurnstileKey((key) => key + 1);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <GlassCard className="p-6" gradient>
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold font-moul text-gray-800 dark:text-gray-100">សរសេរពាក្យជូនពរ</h2>
            </div>

            <form 
                ref={formRef}
                onSubmit={async (e) => {
                    e.preventDefault();
                    await handleSubmit(new FormData(e.currentTarget));
                }}
                className="space-y-5"
            >
                <input type="hidden" name="weddingId" value={weddingId} />

                <div className="space-y-2 group">
                    <label className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">ឈ្មោះរបស់អ្នក (Your Name)</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                        <Input
                            name="guestName"
                            placeholder="ឈ្មោះភ្ញៀវ"
                            className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-rose-300 focus:ring-rose-200 dark:bg-black/20 dark:border-white/10"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <label className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">ពាក្យជូនពរ (Wishes)</label>
                    <div className="hidden" aria-hidden="true">
                        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                    </div>
                    <Textarea
                        name="message"
                        placeholder="សូមជូនពរ..."
                        className="min-h-[120px] bg-white/50 border-gray-200 focus:border-rose-300 focus:ring-rose-200 resize-none dark:bg-black/20 dark:border-white/10"
                        required
                    />
                </div>

                {import.meta.env.VITE_TURNSTILE_SITE_KEY ? (
                    <div className="flex justify-center scale-90 xs:scale-100 origin-center overflow-hidden py-2">
                        <Suspense fallback={<div className="h-[65px] w-[300px] bg-gray-100 animate-pulse rounded" />}>
                            <Turnstile
                                key={turnstileKey}
                                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                                onSuccess={setToken}
                                onExpire={() => setToken("")}
                                options={{ theme: 'auto', appearance: 'always', action: "guestbook_submit" }}
                            />
                        </Suspense>
                    </div>
                ) : (
                    <div className="text-xs text-rose-500 bg-rose-500/10 p-2 rounded-lg text-center font-bold py-2">
                        មិនអាចផ្ទៀងផ្ទាត់ CAPTCHA បានទេ។ សូមព្យាយាមពេលក្រោយ។
                    </div>
                )}

                {submitError && (
                    <p role="alert" className="rounded-xl bg-rose-500/10 px-4 py-3 text-center text-sm font-bold text-rose-600 dark:text-rose-400">
                        {submitError}
                    </p>
                )}

                <Button
                    type="submit"
                    disabled={isSubmitting || !import.meta.env.VITE_TURNSTILE_SITE_KEY || !token}
                    className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:opacity-90 transition-opacity text-white h-12 rounded-xl text-lg font-medium shadow-lg shadow-rose-200 dark:shadow-rose-900/20"
                >
                    {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />កំពុងផ្ញើ...</> : "ផ្ញើជូនពរ (Send Wishes)"}
                </Button>
            </form>
        </GlassCard>
    );
}

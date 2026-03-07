"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Sparkles, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import dynamic from "next/dynamic";
const Turnstile = dynamic(() => import("@marsidev/react-turnstile").then(mod => mod.Turnstile), { ssr: false });
import { submitGuestbookEntry } from "@/app/actions";

export function GuestbookForm({ weddingId }: { weddingId: string }) {
    const [token, setToken] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(formData: FormData) {
        if (!token) {
            alert("សូមផ្ទៀងផ្ទាត់ CAPTCHA (Please verify CAPTCHA)");
            return;
        }

        setIsSubmitting(true);
        formData.append("turnstileToken", token);

        try {
            await submitGuestbookEntry(formData);
        } catch (error) {
            console.error("Submission failed", error);
            alert("មានបញ្ហាបច្ចេកទេស។ សូមព្យាយាមម្តងទៀត។");
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

            <form action={handleSubmit} className="space-y-5">
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
                        <input name="website_url" type="text" tabIndex={-1} autoComplete="off" />
                    </div>
                    <Textarea
                        name="message"
                        placeholder="សូមជូនពរ..."
                        className="min-h-[120px] bg-white/50 border-gray-200 focus:border-rose-300 focus:ring-rose-200 resize-none dark:bg-black/20 dark:border-white/10"
                        required
                    />
                </div>

                <div className="flex justify-center scale-90 xs:scale-100 origin-center overflow-hidden py-2">
                    <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                        onSuccess={setToken}
                        options={{ theme: "auto" }}
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting || !token}
                    className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:opacity-90 transition-opacity text-white h-12 rounded-xl text-lg font-medium shadow-lg shadow-rose-200 dark:shadow-rose-900/20"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "ផ្ញើជូនពរ (Send Wishes)"}
                </Button>
            </form>
        </GlassCard>
    );
}

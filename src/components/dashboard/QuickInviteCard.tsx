"use client";

/**
 * QuickInviteCard Component
 * Version: 6.0.0 (Clean Implementation)
 */
import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageProvider";

export function QuickInviteCard({ weddingId }: { weddingId: string }) {
    const { t } = useTranslation();
    const [copied, setCopied] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const origin = typeof window !== 'undefined' ? window.location.origin : "";
    const url = mounted ? `${origin}/w/${weddingId}` : "";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    if (!mounted) return (
        <Card className="border-none shadow-sm rounded-[2rem] bg-card p-6 animate-pulse">
            <div className="h-6 w-32 bg-muted rounded mb-4" />
            <div className="h-11 w-full bg-muted rounded-2xl" />
        </Card>
    );

    return (
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none rounded-[2rem] overflow-hidden bg-card transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
            <CardHeader className="pb-4 border-b border-border/50 mx-6 px-0">
                <CardTitle className="text-sm font-black font-kantumruy uppercase tracking-widest text-muted-foreground/60">{t("dashboard.quickActions.inviteTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-8 px-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 group">
                        <input
                            className="flex h-10 w-full rounded-xl border border-black/[0.05] dark:border-white/[0.05] bg-muted/20 px-4 py-2 text-sm md:text-base font-medium transition-all focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 outline-none text-muted-foreground group-hover:bg-muted/30"
                            readOnly
                            value={url}
                        />
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={handleCopy}
                            className={cn(
                                "h-10 w-10 rounded-xl transition-all active:scale-95 border-none shadow-sm", 
                                copied 
                                    ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" 
                                    : "bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => window.open(url, '_blank')}
                            className="h-10 w-10 rounded-xl transition-all active:scale-95 bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground border-none shadow-sm"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-5 opacity-40 justify-center sm:justify-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-sans">
                        {t("dashboard.quickActions.liveInvitation")}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default QuickInviteCard;

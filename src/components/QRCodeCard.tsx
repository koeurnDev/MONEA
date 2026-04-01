"use client";
import * as React from "react";
import QRCode from "react-qr-code";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";

// Cache bust: 2026-03-10T22:42:00
export function QRCodeCard({ weddingId }: { weddingId: string }) {
    const { t } = useTranslation();
    const [url, setUrl] = React.useState("");
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        setUrl(`${window.location.origin}/invite/${weddingId}`);
    }, [weddingId]);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!url) return null;

    return (
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none rounded-[2rem] overflow-hidden bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50 mx-6 px-0">
                <CardTitle className="text-sm font-black font-kantumruy uppercase tracking-widest text-muted-foreground/60">{t("dashboard.quickActions.shareInvite")}</CardTitle>
                <Button
                    variant="outline"
                    onClick={handleCopy}
                    className={cn(
                        "h-10 px-4 rounded-xl font-kantumruy font-bold transition-all border-none shadow-sm text-xs",
                        copied 
                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" 
                            : "bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                >
                    {copied ? t("dashboard.quickActions.copied") : t("dashboard.quickActions.copyLink")}
                </Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 pt-8 pb-8">
                <div className="bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/[0.03] dark:border-white/[0.03] transition-transform hover:scale-105 duration-500">
                    <QRCode value={url} size={160} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                </div>
                <div className="space-y-3 w-full max-w-[240px] text-center">
                    <p className="text-[11px] font-medium text-muted-foreground/50 break-all leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/30">
                        {url}
                    </p>
                    <Link href={`/invite/${weddingId}`} target="_blank" className="inline-flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors font-kantumruy group">
                        {t("dashboard.quickActions.viewPublic")}
                        <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

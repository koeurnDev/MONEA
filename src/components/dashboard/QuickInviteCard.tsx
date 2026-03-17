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

console.log("[QuickInviteCard] Script loaded v6.0.0");

export function QuickInviteCard({ weddingId }: { weddingId: string }) {
    const [copied, setCopied] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        console.log("[QuickInviteCard] Component mounted v6.0.0");
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
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold font-kantumruy">តំណលិខិតអញ្ជើញ</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 group">
                        <input
                            className="flex h-11 w-full rounded-2xl border border-input bg-muted/30 px-4 py-2 text-sm md:text-base transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            readOnly
                            value={url}
                        />
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={handleCopy}
                            className={cn("h-11 w-11 rounded-2xl transition-all active:scale-95", copied ? "text-green-600 border-green-600 bg-green-50" : "hover:border-primary hover:text-primary")}
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => window.open(url, '_blank')}
                            className="h-11 w-11 rounded-2xl transition-all active:scale-95 hover:bg-primary hover:text-white"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-3 opacity-60">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-sans">
                        Live Invitation link (v6)
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default QuickInviteCard;

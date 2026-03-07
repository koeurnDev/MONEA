"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InvitationLinkCard({ weddingId }: { weddingId: string }) {
    const [copied, setCopied] = useState(false);

    // Construct URL on client to ensure origin is correct, or fallback to environment
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://monea.com');
    const url = `${origin}/w/${weddingId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">តំណលិខិតអញ្ជើញ</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                    <input
                        className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm md:text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        readOnly
                        value={url}
                    />
                    <div className="flex gap-2 shrink-0">
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={handleCopy}
                            title="Copy Link"
                            className={cn("flex-1 sm:flex-none", copied ? "text-green-600 border-green-600" : "")}
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button
                            size="icon"
                            variant="secondary"
                            title="Open Link"
                            onClick={() => window.open(url, '_blank')}
                            className="flex-1 sm:flex-none"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">ចែករំលែកតំណនេះទៅកាន់ភ្ញៀវរបស់អ្នក។</p>
            </CardContent>
        </Card>
    );
}

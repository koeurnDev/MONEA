"use client";
import QRCode from "react-qr-code";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

export function QRCodeCard({ weddingId }: { weddingId: string }) {
    const [url, setUrl] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setUrl(`${window.location.origin}/invite/${weddingId}`);
    }, [weddingId]);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!url) return null;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Digital Invitation</CardTitle>
                <button
                    onClick={handleCopy}
                    className={`text-[10px] px-2 py-1 rounded transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                >
                    {copied ? 'Copied!' : 'Copy Link'}
                </button>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4 pt-4">
                <div className="bg-white p-2 border">
                    <QRCode value={url} size={150} />
                </div>
                <p className="text-[10px] text-muted-foreground text-center break-all max-w-[200px]">{url}</p>
                <Link href={`/invite/${weddingId}`} target="_blank" className="text-sm text-blue-600 flex items-center hover:underline">
                    View Public Invitation <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
            </CardContent>
        </Card>
    )
}

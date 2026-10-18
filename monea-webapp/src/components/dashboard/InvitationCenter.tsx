import * as React from "react";
import SafeQRCode from "@/components/ui/SafeQRCode";
import { Copy, Check, Download, Share2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

export function InvitationCenter({ weddingId }: { weddingId: string }) {
    const { t } = useTranslation();
    const [copied, setCopied] = React.useState(false);
    const [copyError, setCopyError] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const url = mounted ? `${window.location.origin}/w/${weddingId}` : "";

    const handleCopy = async () => {
        setCopyError(false);
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("[InvitationCenter] Failed to copy invitation link:", err);
            setCopyError(true);
        }
    };

    const handleDownloadQR = () => {
        const svg = document.getElementById("qr-code-svg");
        if (!svg) return;
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        
        img.onload = () => {
            canvas.width = 1000;
            canvas.height = 1300;
            if (ctx) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.strokeStyle = "#D4AF37";
                ctx.lineWidth = 8;
                ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

                ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
                ctx.lineWidth = 2;
                ctx.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);

                ctx.fillStyle = "#1e293b";
                ctx.font = "bold 46px Moul, Khmer OS Moul, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("សំបុត្រអញ្ជើញអាពាហ៍ពិពាហ៍", canvas.width / 2, 180);

                ctx.fillStyle = "#64748b";
                ctx.font = "30px Kantumruy Pro, sans-serif";
                ctx.fillText("សូមស្កេន QR Code ខាងក្រោមដើម្បីចូលរួម", canvas.width / 2, 250);

                const qrSize = 600;
                const qrX = (canvas.width - qrSize) / 2;
                const qrY = 320;
                ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

                ctx.fillStyle = "#334155";
                ctx.font = "24px monospace";
                ctx.fillText(url, canvas.width / 2, 990);

                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - 100, 1050);
                ctx.lineTo(canvas.width / 2 + 100, 1050);
                ctx.strokeStyle = "#D4AF37";
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = "#94a3b8";
                ctx.font = "bold 22px sans-serif";
                ctx.fillText("POWERED BY MONEO", canvas.width / 2, 1120);

                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `monea-wedding-qr-print-${weddingId}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const handleShareTelegram = () => {
        const text = encodeURIComponent(`សូមគោរពអញ្ជើញចូលរួមពិធីអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ 💐`);
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank', 'noopener,noreferrer');
    };

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: "សំបុត្រអញ្ជើញ MONEO",
                text: "សូមគោរពអញ្ជើញចូលរួមកម្មវិធីរបស់យើងខ្ញុំ",
                url,
            }).catch(() => undefined);
            return;
        }
        await handleCopy();
    };

    if (!mounted) return (
        <div className="h-[340px] w-full rounded-3xl bg-muted/20 animate-pulse border border-border/50" />
    );

    return (
        <div id="invitation-center" className="relative w-full max-w-full scroll-mt-20 overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-background via-card to-muted/70 shadow-sm font-kantumruy">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--sage)/0.12),_transparent_28%),radial-gradient(circle_at_bottom_left,_hsl(var(--gold)/0.08),_transparent_30%)]" />

            <div className="relative p-4 sm:p-6 md:p-7">
                <div className="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-black text-foreground sm:text-2xl">
                            {t("dashboard.quickActions.invitationCenterTitle", { defaultValue: "ធៀបអាពាហ៍ពិពាហ៍របស់អ្នក" })}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t("dashboard.quickActions.invitationCenterDescription", { defaultValue: "ក្រោយរក្សាទុក អ្នកអាចត្រឡប់មកទីនេះ ដើម្បីមើលធៀប ឬចម្លងតំណចែករំលែក។" })}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleShare}
                        className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border bg-secondary px-4 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/80 sm:w-auto"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        {t("dashboard.quickActions.shareButton", { defaultValue: "ចែករំលែក" })}
                    </button>
                </div>

                <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
                    <div className="flex flex-col items-center gap-3 xl:w-[240px]">
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 220, damping: 24 }}
                            className="flex justify-center"
                        >
                            <button
                                type="button"
                                onClick={handleDownloadQR}
                                className="group relative flex items-center justify-center rounded-[24px] border border-border bg-white p-3 shadow-sm transition-transform duration-200 hover:scale-[1.02]"
                                aria-label={t("dashboard.quickActions.downloadInvitationQr", { defaultValue: "ទាញយក QR Code ការអញ្ជើញ" })}
                            >
                                <SafeQRCode
                                    id="qr-code-svg"
                                    value={url}
                                    size={150}
                                    style={{ height: "auto", maxWidth: "100%", width: "150px" }}
                                    fgColor="#0f172a"
                                />
                            </button>
                        </motion.div>

                        <button
                            type="button"
                            onClick={handleDownloadQR}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 text-sm font-bold text-amber-800 transition hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100 dark:hover:bg-amber-500/20"
                        >
                            <Download className="h-3.5 w-3.5" />
                            {t("dashboard.quickActions.downloadQR", { defaultValue: "ទាញយក QR" })}
                        </button>
                    </div>

                    <div className="flex-1 space-y-4">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {t("dashboard.quickActions.shareDesc", { defaultValue: "ផ្ញើតំណទៅភ្ញៀវ ឬស្កេន QR" })}
                        </p>

                        <div className="rounded-2xl border border-border bg-muted/60 p-2">
                            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
                                <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground sm:text-xs">{url}</span>
                                <Button
                                    type="button"
                                    onClick={handleCopy}
                                    size="sm"
                                    className={cn(
                                        "min-h-11 shrink-0 rounded-xl px-3 text-sm font-bold",
                                        copied ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-primary text-primary-foreground hover:bg-primary/90"
                                    )}
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        {copied ? (
                                            <motion.span key="check" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="flex items-center gap-1.5">
                                                <Check className="h-3.5 w-3.5" />
                                                {t("dashboard.quickActions.copied", { defaultValue: "បានចម្លង" })}
                                            </motion.span>
                                        ) : (
                                            <motion.span key="copy" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="flex items-center gap-1.5">
                                                <Copy className="h-3.5 w-3.5" />
                                                {t("dashboard.quickActions.copyLink", { defaultValue: "ចម្លងតំណ" })}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </div>
                        </div>
                        {copyError && (
                            <p className="text-sm font-medium text-rose-600 dark:text-rose-400" role="alert">
                                {t("dashboard.quickActions.copyError", { defaultValue: "មិនអាចចម្លងតំណបានទេ។ សូមព្យាយាមម្ដងទៀត។" })}
                            </p>
                        )}

                        <div className="grid min-w-0 grid-cols-2 gap-2">
                            <Button
                                type="button"
                                onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                                aria-label={t("dashboard.quickActions.viewPublic")}
                                className="h-11 w-full min-w-0 gap-1 rounded-2xl border border-primary/20 bg-secondary px-2 text-sm font-black text-secondary-foreground shadow-sm hover:bg-secondary/80 sm:gap-2 sm:px-4"
                            >
                                <Globe className="h-4 w-4 shrink-0" />
                                <span className="sm:hidden">{t("dashboard.quickActions.viewPublicShort", { defaultValue: "មើល" })}</span>
                                <span className="hidden min-w-0 truncate sm:inline">
                                    {t("dashboard.quickActions.viewPublic")}
                                </span>
                            </Button>

                            <Button
                                type="button"
                                onClick={handleShareTelegram}
                                aria-label="Telegram"
                                className="h-11 w-full min-w-0 gap-1 rounded-2xl border border-sky-500/20 bg-sky-500/10 px-2 text-sm font-black text-sky-700 shadow-sm hover:bg-sky-500/15 dark:text-sky-200 sm:gap-2 sm:px-4"
                            >
                                <Share2 className="h-4 w-4 shrink-0" />
                                <span className="truncate">Telegram</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

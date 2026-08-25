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
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const url = mounted ? `${window.location.origin}/w/${weddingId}` : "";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
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
                ctx.fillText("POWERED BY MONEA", canvas.width / 2, 1120);

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
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
    };

    if (!mounted) return (
        <div className="h-[340px] w-full rounded-3xl bg-muted/20 animate-pulse border border-border/50" />
    );

    return (
        <div className="relative w-full max-w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none overflow-hidden font-kantumruy">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-60 h-60 bg-rose-500/10 dark:bg-rose-500/20 rounded-full blur-[70px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-50 h-50 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[50px] pointer-events-none" />

            <div className="relative p-4 sm:p-7 md:p-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 w-full max-w-full">
                
                {/* QR Code Container - Perfectly Centered */}
                <div className="w-full md:w-auto flex justify-center items-center">
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 240, damping: 24 }}
                        className="relative group cursor-pointer flex justify-center items-center mx-auto"
                        onClick={handleDownloadQR}
                    >
                        <div className="relative bg-slate-50 dark:bg-black/30 p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-white/10 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center mx-auto">
                            <SafeQRCode 
                                id="qr-code-svg"
                                value={url} 
                                size={145} 
                                style={{ height: "auto", maxWidth: "100%", width: "145px" }} 
                                fgColor="#0f172a"
                            />
                            
                            {/* Hover Overlay for Download */}
                            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 text-white p-3 text-center">
                                <Download className="w-5 h-5 text-white animate-bounce" />
                                <span className="text-xs font-bold font-kantumruy">
                                    {t("dashboard.quickActions.downloadQR", { defaultValue: "ទាញយក QR" })}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: Links and Actions */}
                <div className="flex-1 min-w-0 w-full space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="space-y-1.5 w-full flex flex-col items-center md:items-start">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto md:mx-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-bold uppercase tracking-wider font-kantumruy">
                                {t("dashboard.quickActions.liveInvitation", { defaultValue: "តំណភ្ជាប់ការអញ្ជើញផ្ទាល់" })}
                            </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold font-kantumruy tracking-tight text-foreground text-center md:text-left">
                            {t("dashboard.quickActions.shareInvite", { defaultValue: "ផ្ញើការអញ្ជើញ" })}
                        </h3>
                        <p className="text-xs text-muted-foreground font-kantumruy leading-relaxed max-w-md text-center md:text-left mx-auto md:mx-0">
                            {t("dashboard.quickActions.shareDesc", { defaultValue: "ផ្ញើតំណភ្ជាប់នេះទៅកាន់ភ្ញៀវកិត្តិយសរបស់អ្នក ឬអោយពួកគេស្កេន QR Code ដើម្បីចូលរួម។" })}
                        </p>
                    </div>

                    <div className="space-y-3 w-full max-w-md mx-auto md:mx-0">
                        {/* Link Input Box */}
                        <div className="relative flex items-center bg-slate-50 dark:bg-black/20 border border-slate-200/80 dark:border-white/10 rounded-xl p-1 shadow-sm w-full min-w-0">
                            <div className="pl-3 py-1.5 flex-1 min-w-0 overflow-hidden text-left">
                                <p className="text-xs font-medium text-foreground truncate font-mono select-all">
                                    {url}
                                </p>
                            </div>
                            <div className="flex-shrink-0 pl-2">
                                <Button
                                    onClick={handleCopy}
                                    size="sm"
                                    className={cn(
                                        "h-9 px-3.5 rounded-lg font-bold font-kantumruy text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0",
                                        copied 
                                            ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                                            : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                                    )}
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        {copied ? (
                                            <motion.div key="check" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="flex items-center gap-1">
                                                <Check className="w-3.5 h-3.5" />
                                                <span>{t("dashboard.quickActions.copied", { defaultValue: "បានចម្លង" })}</span>
                                            </motion.div>
                                        ) : (
                                            <motion.div key="copy" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="flex items-center gap-1">
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>{t("dashboard.quickActions.copyLink", { defaultValue: "ចម្លងតំណ" })}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </div>
                        </div>

                        {/* Action Buttons Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full pt-1">
                            <Button 
                                variant="outline"
                                onClick={() => window.open(url, '_blank')}
                                className="h-10 rounded-xl px-3 bg-white dark:bg-black/20 border-slate-200/80 dark:border-white/10 hover:bg-slate-50 text-foreground font-bold font-kantumruy text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all w-full"
                            >
                                <Globe className="w-3.5 h-3.5 text-rose-500" />
                                <span className="truncate">{t("dashboard.quickActions.viewPublic", { defaultValue: "បើកមើលសំបុត្រ" })}</span>
                            </Button>

                            <Button 
                                onClick={handleDownloadQR}
                                className="h-10 rounded-xl px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold font-kantumruy text-xs shadow-sm shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all w-full"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span className="truncate">{t("dashboard.quickActions.downloadPrintQR", { defaultValue: "ទាញយក QR" })}</span>
                            </Button>

                            <Button 
                                onClick={handleShareTelegram}
                                className="h-10 rounded-xl px-3 bg-[#229ED9] hover:bg-[#1E88C7] text-white font-bold font-kantumruy text-xs shadow-sm shadow-[#229ED9]/20 flex items-center justify-center gap-1.5 transition-all w-full"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                                <span className="truncate">{t("dashboard.quickActions.shareTelegram", { defaultValue: "ផ្ញើតាម Telegram" })}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

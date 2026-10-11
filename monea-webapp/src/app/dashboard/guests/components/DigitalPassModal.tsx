import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Check, Loader2, Send } from "lucide-react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

interface DigitalPassModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guest: {
        id: string;
        name: string;
        group?: string;
    } | null;
    wedding: any;
}

export function DigitalPassModal({
    open,
    onOpenChange,
    guest,
    wedding,
}: DigitalPassModalProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [downloading, setDownloading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [shared, setShared] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const groomName = wedding?.groomName || "កូនកំលោះ";
    const brideName = wedding?.brideName || "កូនក្រមុំ";
    const eventType = wedding?.eventType === "anniversary" ? "សិរីមង្គលភ្ជាប់ពាក្យ" : "សិរីមង្គលអាពាហ៍ពិពាហ៍";
    const heroImage = wedding?.themeSettings?.heroImage || wedding?.themeSettings?.coverImageUrl || "/images/cover.webp";

    // Invitation link for the specific guest
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = guest && wedding?.id 
        ? `${origin}/invite/${wedding.id}?to=${encodeURIComponent(guest.name)}&g=${guest.id}`
        : origin;

    // Generate QR code data URL
    useEffect(() => {
        if (!guest || !inviteUrl) return;
        let isMounted = true;
        QRCode.toDataURL(inviteUrl, {
            width: 360,
            margin: 1,
            color: {
                dark: "#231f20",
                light: "#ffffff",
            },
            errorCorrectionLevel: "M",
        })
            .then((url) => {
                if (isMounted) setQrDataUrl(url);
            })
            .catch((err) => {
                console.error("Failed to generate QR code:", err);
            });

        return () => {
            isMounted = false;
        };
    }, [guest, inviteUrl]);

    // Format Dates
    const rawDate = wedding?.date ? new Date(wedding.date) : new Date();
    const khmerDays = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
    const khmerMonths = [
        "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
        "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
    ];
    const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
    const toKhmerNum = (num: number) =>
        String(num).split("").map((d) => khmerDigits[parseInt(d, 10)] || d).join("");

    const dayKh = khmerDays[rawDate.getDay()];
    const dateNumKh = toKhmerNum(rawDate.getDate());
    const monthKh = khmerMonths[rawDate.getMonth()];
    const yearKh = toKhmerNum(rawDate.getFullYear());
    const hours = rawDate.getHours();
    const mins = rawDate.getMinutes();
    const periodKh = hours >= 12 ? "ល្ងាច" : "ព្រឹក";
    const displayHours = hours % 12 || 12;
    const timeKh = `វេលាម៉ោង ${toKhmerNum(displayHours)}:${toKhmerNum(mins).padStart(2, "០")} ${periodKh}`;

    const dateKhmerFormatted = `ថ្ងៃ${dayKh} ទី${dateNumKh} ខែ${monthKh} ឆ្នាំ${yearKh}`;

    const dateEnglishFormatted = rawDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    const timeEnglishFormatted = `at ${String(displayHours).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;

    // Export Ticket to High-Res PNG via Canvas
    const generateCanvasTicket = useCallback(async (): Promise<HTMLCanvasElement | null> => {
        if (!guest) return null;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        // High-DPI canvas size (640 x 960)
        const width = 640;
        const height = 980;
        canvas.width = width;
        canvas.height = height;

        // 1. Background base
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // 2. Load top photo
        const loadImage = (src: string): Promise<HTMLImageElement> =>
            new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = () => {
                    // Fallback to placeholder image
                    const fallbackImg = new Image();
                    fallbackImg.onload = () => resolve(fallbackImg);
                    fallbackImg.src = "/images/cover.webp";
                };
                img.src = src;
            });

        const topHeight = 380;
        try {
            const bgImg = await loadImage(heroImage);
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, width, topHeight);
            ctx.clip();
            // Cover fit
            const scale = Math.max(width / bgImg.width, topHeight / bgImg.height);
            const x = (width - bgImg.width * scale) / 2;
            const y = (topHeight - bgImg.height * scale) / 2;
            ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);

            // Dark gradient overlay
            const grad = ctx.createLinearGradient(0, 0, 0, topHeight);
            grad.addColorStop(0, "rgba(0, 0, 0, 0.4)");
            grad.addColorStop(0.5, "rgba(0, 0, 0, 0.65)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0.9)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, topHeight);
            ctx.restore();
        } catch {
            ctx.fillStyle = "#262320";
            ctx.fillRect(0, 0, width, topHeight);
        }

        // 3. Top Section Typography
        ctx.textAlign = "center";
        
        // Event title
        ctx.fillStyle = "#f3ba59";
        ctx.font = "bold 22px 'Kantumruy Pro', 'Khmer OS Moul', serif";
        ctx.fillText(eventType, width / 2, 175);

        // Couple Names
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 34px 'Kantumruy Pro', sans-serif";
        ctx.fillText(`${groomName} និង ${brideName}`, width / 2, 230);

        // Gold divider line
        ctx.strokeStyle = "rgba(243, 186, 89, 0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 120, 255);
        ctx.lineTo(width / 2 + 120, 255);
        ctx.stroke();

        // Date text
        ctx.fillStyle = "#fef3c7";
        ctx.font = "16px 'Kantumruy Pro', sans-serif";
        ctx.fillText(dateKhmerFormatted, width / 2, 290);
        ctx.fillText(timeKh, width / 2, 315);

        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.font = "14px 'Inter', sans-serif";
        ctx.fillText(`${dateEnglishFormatted} ${timeEnglishFormatted}`, width / 2, 345);

        // 4. Ticket Cutout Divider at Y = topHeight
        const dividerY = topHeight;
        const notchRadius = 24;

        // Cutout notches (left and right circles in transparent/canvas background)
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, dividerY, notchRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(width, dividerY, notchRadius, 0, Math.PI * 2);
        ctx.fill();

        // Dashed divider line
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(notchRadius + 10, dividerY);
        ctx.lineTo(width - notchRadius - 10, dividerY);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // 5. Bottom Section
        ctx.fillStyle = "#fcfbfa";
        ctx.fillRect(0, dividerY + 1, width, height - dividerY);

        // Invitation greeting
        ctx.fillStyle = "#a16207";
        ctx.font = "bold 18px 'Kantumruy Pro', serif";
        ctx.fillText("សូមគោរពអញ្ជើញ", width / 2, dividerY + 65);

        // Guest name
        ctx.fillStyle = "#854d0e";
        ctx.font = "900 32px 'Kantumruy Pro', sans-serif";
        ctx.fillText(guest.name, width / 2, dividerY + 115);

        // 6. QR Code
        const qrSize = 240;
        const qrX = (width - qrSize) / 2;
        const qrY = dividerY + 145;

        // Corner bracket accents
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 3.5;
        const bracketLen = 24;

        // Top-left
        ctx.beginPath();
        ctx.moveTo(qrX - 12, qrY - 12 + bracketLen);
        ctx.lineTo(qrX - 12, qrY - 12);
        ctx.lineTo(qrX - 12 + bracketLen, qrY - 12);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(qrX + qrSize + 12 - bracketLen, qrY - 12);
        ctx.lineTo(qrX + qrSize + 12, qrY - 12);
        ctx.lineTo(qrX + qrSize + 12, qrY - 12 + bracketLen);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(qrX - 12, qrY + qrSize + 12 - bracketLen);
        ctx.lineTo(qrX - 12, qrY + qrSize + 12);
        ctx.lineTo(qrX - 12 + bracketLen, qrY + qrSize + 12);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(qrX + qrSize + 12 - bracketLen, qrY + qrSize + 12);
        ctx.lineTo(qrX + qrSize + 12, qrY + qrSize + 12);
        ctx.lineTo(qrX + qrSize + 12, qrY + qrSize + 12 - bracketLen);
        ctx.stroke();

        if (qrDataUrl) {
            const qrImg = await loadImage(qrDataUrl);
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        }

        // Subtitle under QR
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 15px 'Kantumruy Pro', sans-serif";
        ctx.fillText("ស្កេន ដើម្បីបើកមើល ធៀបការឌីជីថល", width / 2, qrY + qrSize + 40);

        // Footer note
        ctx.fillStyle = "#94a3b8";
        ctx.font = "13px 'Kantumruy Pro', sans-serif";
        ctx.fillText("រចនាឡើងយ៉ាងពិសេសដោយ MONEA", width / 2, qrY + qrSize + 65);

        return canvas;
    }, [
        guest,
        heroImage,
        eventType,
        groomName,
        brideName,
        dateKhmerFormatted,
        timeKh,
        dateEnglishFormatted,
        timeEnglishFormatted,
        qrDataUrl,
    ]);

    // Download Pass as Image
    const handleDownload = async () => {
        if (!guest) return;
        setDownloading(true);
        try {
            const canvas = await generateCanvasTicket();
            if (!canvas) throw new Error("Failed to render ticket canvas");

            const link = document.createElement("a");
            const safeName = guest.name.replace(/[^a-zA-Z0-9\u1780-\u17FF_-]/g, "_");
            link.download = `monea-pass-${safeName}.png`;
            link.href = canvas.toDataURL("image/png");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading pass:", error);
        } finally {
            setDownloading(false);
        }
    };

    // Share Pass Image or Link
    const handleShare = async () => {
        if (!guest) return;
        setShared(true);

        const shareText = `សូមគោរពអញ្ជើញ ${guest.name} ចូលរួមក្នុងពិធី ${eventType} របស់ ${groomName} និង ${brideName}។ សូមចុចតំណភ្ជាប់ ឬស្កេន QR Code ដើម្បីមើលធៀបការ៖\n${inviteUrl}`;

        // Attempt Web Share API with file if supported
        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                const canvas = await generateCanvasTicket();
                if (canvas && navigator.canShare) {
                    const blob = await new Promise<Blob | null>((resolve) =>
                        canvas.toBlob(resolve, "image/png")
                    );
                    if (blob) {
                        const file = new File([blob], `monea-pass.png`, { type: "image/png" });
                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: `សំបុត្រអញ្ជើញ - ${guest.name}`,
                                text: shareText,
                            });
                            return;
                        }
                    }
                }

                // Fallback to text share
                await navigator.share({
                    title: `សំបុត្រអញ្ជើញ - ${guest.name}`,
                    text: shareText,
                    url: inviteUrl,
                });
                return;
            } catch (err) {
                // User cancelled or unsupported
                console.log("Web share dismissed:", err);
            }
        }

        // Fallback to Telegram share
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(telegramUrl, "_blank", "noopener,noreferrer");

        // Copy link as quick convenience
        navigator.clipboard?.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        setTimeout(() => setShared(false), 2000);
    };

    if (!guest) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-[92vw] sm:w-full p-0 overflow-hidden bg-background rounded-3xl border border-border shadow-2xl">
                <DialogHeader className="p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                    <DialogTitle className="font-kantumruy font-black text-lg text-foreground">
                        សំបុត្រឌីជីថល
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh] flex flex-col items-center">
                    {/* The Ticket Card */}
                    <div
                        ref={cardRef}
                        className="w-full max-w-[340px] rounded-3xl overflow-hidden shadow-xl border border-amber-900/10 dark:border-amber-200/10 bg-white dark:bg-[#1a1917] select-none"
                    >
                        {/* Top Card Section: Couple Photo & Details */}
                        <div className="relative h-56 w-full flex flex-col items-center justify-end p-4 pb-5 text-center overflow-hidden">
                            <img
                                src={heroImage}
                                alt="Couple"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

                            <div className="relative z-10 space-y-1">
                                <span className="text-amber-300 font-extrabold text-xs sm:text-sm tracking-wide font-kantumruy drop-shadow">
                                    {eventType}
                                </span>
                                <h3 className="text-white font-black text-lg sm:text-xl font-kantumruy tracking-tight drop-shadow-md">
                                    {groomName} និង {brideName}
                                </h3>

                                <div className="pt-2 text-[11px] text-amber-100 font-kantumruy leading-tight">
                                    <p>{dateKhmerFormatted}</p>
                                    <p className="opacity-90">{timeKh}</p>
                                </div>
                                <p className="text-[10px] text-white/70 font-sans tracking-tight">
                                    {dateEnglishFormatted} {timeEnglishFormatted}
                                </p>
                            </div>
                        </div>

                        {/* Perforated Divider Notch */}
                        <div className="relative flex items-center bg-[#faf9f6] dark:bg-[#1f1e1c]">
                            <div className="w-5 h-5 rounded-r-full bg-background -ml-2.5 z-10 border-r border-border/60" />
                            <div className="flex-1 border-t-2 border-dashed border-amber-300/40 my-0" />
                            <div className="w-5 h-5 rounded-l-full bg-background -mr-2.5 z-10 border-l border-border/60" />
                        </div>

                        {/* Bottom Card Section: Guest Name & QR */}
                        <div className="bg-[#faf9f6] dark:bg-[#1f1e1c] p-5 pt-4 text-center flex flex-col items-center space-y-3 font-kantumruy">
                            <div>
                                <span className="text-amber-700/80 dark:text-amber-300/80 text-xs font-semibold">
                                    សូមគោរពអញ្ជើញ
                                </span>
                                <h4 className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-200 tracking-wide mt-0.5">
                                    {guest.name}
                                </h4>
                            </div>

                            {/* QR Code Container with 4 Corner Accents */}
                            <div className="relative p-3 bg-white dark:bg-white/95 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-900/30">
                                {/* Corner Brackets */}
                                <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500 rounded-tl-sm pointer-events-none" />
                                <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500 rounded-tr-sm pointer-events-none" />
                                <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500 rounded-bl-sm pointer-events-none" />
                                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500 rounded-br-sm pointer-events-none" />

                                {qrDataUrl ? (
                                    <img
                                        src={qrDataUrl}
                                        alt={`QR Code for ${guest.name}`}
                                        className="w-36 h-36 object-contain"
                                    />
                                ) : (
                                    <div className="w-36 h-36 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-0.5">
                                <p className="text-[11px] font-bold text-muted-foreground">
                                    ស្កេន ដើម្បីបើកមើល ធៀបការឌីជីថល
                                </p>
                                <p className="text-[10px] text-muted-foreground/60">
                                    រចនាឡើងយ៉ាងពិសេសដោយ MONEA
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full max-w-[340px] grid grid-cols-2 gap-3 pt-5 font-kantumruy">
                        <Button
                            type="button"
                            onClick={handleDownload}
                            disabled={downloading}
                            className="h-11 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                            {downloading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            <span>ទាញយកសំបុត្រ</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleShare}
                            className="h-11 rounded-2xl border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20 font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-green-600" />
                            ) : shared ? (
                                <Send className="w-4 h-4 text-amber-600" />
                            ) : (
                                <Share2 className="w-4 h-4" />
                            )}
                            <span>{copied ? "បានចម្លងតំណ!" : "ចែករំលែក"}</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default DigitalPassModal;

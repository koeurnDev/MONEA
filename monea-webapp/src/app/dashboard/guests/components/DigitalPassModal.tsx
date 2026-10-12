import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Check, Loader2, Send, Ticket, ExternalLink, Sparkles } from "lucide-react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface DigitalPassModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guest: {
        id: string;
        name: string;
        group?: string;
        phone?: string;
        pax?: number;
    } | null;
    wedding: any;
}

export function DigitalPassModal({
    open,
    onOpenChange,
    guest,
    wedding,
}: DigitalPassModalProps) {
    const { showToast } = useToast();
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [downloading, setDownloading] = useState(false);
    const [copied, setCopied] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const groomName = wedding?.groomName || "កូនកំលោះ";
    const brideName = wedding?.brideName || "កូនក្រមុំ";

    const isAnniversary = wedding?.eventType === "anniversary";
    const eventType = isAnniversary
        ? "សិរីមង្គលភ្ជាប់ពាក្យ"
        : (wedding?.eventType === "custom" && wedding?.customEventTitle ? wedding.customEventTitle : "សិរីមង្គលអាពាហ៍ពិពាហ៍");

    // Short contextual label used in share messages & ticket subtitle
    const eventShortName = isAnniversary ? "ភ្ជាប់ពាក្យ" : "ការ";
    // Label for "see digital invitation"  e.g. ធៀបភ្ជាប់ពាក្យ / ធៀបការ
    const inviteLabel = isAnniversary ? "ធៀបភ្ជាប់ពាក្យ" : "ធៀបការ";
    // QR subtitle on ticket
    const qrSubtitleLabel = isAnniversary ? "ស្កេនដើម្បីបើកមើលធៀបភ្ជាប់ពាក្យឌីជីថល" : "ស្កេនដើម្បីបើកមើលធៀបឌីជីថល";

    const heroImage = wedding?.themeSettings?.heroImage || wedding?.themeSettings?.coverImageUrl || wedding?.coverImageUrl || "/images/cover.webp";


    // Invitation link for the specific guest
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = guest && wedding?.id 
        ? `${origin}/invite/${wedding.id}?to=${encodeURIComponent(guest.name)}&g=${guest.id}`
        : origin;

    // Generate QR code data URL (High Contrast for reliable phone scanning)
    useEffect(() => {
        if (!guest || !inviteUrl) return;
        let isMounted = true;
        QRCode.toDataURL(inviteUrl, {
            width: 400,
            margin: 1,
            color: {
                dark: "#141312",
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

    // Export Masterpiece Ticket to High-Res PNG via Canvas
    const generateCanvasTicket = useCallback(async (): Promise<HTMLCanvasElement | null> => {
        if (!guest) return null;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        if (typeof document !== "undefined" && document.fonts) {
            try {
                await document.fonts.ready;
            } catch (e) {
                // Ignore font readiness error
            }
        }

        // High-DPI canvas size (900 x 1350, golden 2:3 ticket proportion)
        const width = 900;
        const height = 1350;
        canvas.width = width;
        canvas.height = height;

        // Helper for rounded rectangles with fallbacks
        const drawRoundRect = (
            c: CanvasRenderingContext2D,
            x: number,
            y: number,
            w: number,
            h: number,
            radius: number
        ) => {
            if (typeof c.roundRect === "function") {
                c.beginPath();
                c.roundRect(x, y, w, h, radius);
            } else {
                c.beginPath();
                c.moveTo(x + radius, y);
                c.lineTo(x + w - radius, y);
                c.quadraticCurveTo(x + w, y, x + w, y + radius);
                c.lineTo(x + w, y + h - radius);
                c.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
                c.lineTo(x + radius, y + h);
                c.quadraticCurveTo(x, y + h, x, y + h - radius);
                c.lineTo(x, y + radius);
                c.quadraticCurveTo(x, y, x + radius, y);
                c.closePath();
            }
        };

        // 1. Luxury Obsidian Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#1c1a17");
        bgGrad.addColorStop(0.35, "#151412");
        bgGrad.addColorStop(1, "#0d0c0b");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Load top photo
        const loadImage = (src: string): Promise<HTMLImageElement> =>
            new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                let isResolved = false;

                const timer = setTimeout(() => {
                    if (!isResolved) {
                        isResolved = true;
                        const fallback = new Image();
                        fallback.crossOrigin = "anonymous";
                        fallback.onload = () => resolve(fallback);
                        fallback.onerror = () => resolve(fallback);
                        fallback.src = "/images/cover.webp";
                    }
                }, 3000);

                img.onload = () => {
                    if (!isResolved) {
                        isResolved = true;
                        clearTimeout(timer);
                        resolve(img);
                    }
                };
                img.onerror = () => {
                    if (!isResolved) {
                        isResolved = true;
                        clearTimeout(timer);
                        const fallback = new Image();
                        fallback.crossOrigin = "anonymous";
                        fallback.onload = () => resolve(fallback);
                        fallback.onerror = () => resolve(fallback);
                        fallback.src = "/images/cover.webp";
                    }
                };
                img.src = src;
            });

        const topHeight = 520;
        try {
            const bgImg = await loadImage(heroImage);
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, width, topHeight);
            ctx.clip();
            
            // Cover fit
            const scale = Math.max(width / (bgImg.width || 1), topHeight / (bgImg.height || 1));
            const x = (width - (bgImg.width || 1) * scale) / 2;
            const y = (topHeight - (bgImg.height || 1) * scale) / 2;
            ctx.drawImage(bgImg, x, y, (bgImg.width || 1) * scale, (bgImg.height || 1) * scale);

            // Luxury Dark Gradient Vignette
            const grad = ctx.createLinearGradient(0, 0, 0, topHeight);
            grad.addColorStop(0, "rgba(18, 17, 16, 0.4)");
            grad.addColorStop(0.55, "rgba(18, 17, 16, 0.72)");
            grad.addColorStop(1, "rgba(18, 17, 16, 0.98)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, topHeight);
            ctx.restore();
        } catch {
            ctx.fillStyle = "#1e1c19";
            ctx.fillRect(0, 0, width, topHeight);
        }

        // 3. Top Section Typography
        ctx.textAlign = "center";
        
        // VIP Pill Badge
        const badgeY = 175;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.strokeStyle = "rgba(243, 186, 89, 0.4)";
        ctx.lineWidth = 1.5;
        drawRoundRect(ctx, width / 2 - 160, badgeY - 26, 320, 36, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#f3ba59";
        ctx.font = "bold 18px 'Kantumruy Pro', sans-serif";
        ctx.fillText(`✦ ${eventType} ✦`, width / 2, badgeY - 2);
        ctx.restore();

        // Couple Names
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 38px 'Kantumruy Pro', sans-serif";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 10;
        ctx.fillText(`${groomName} និង ${brideName}`, width / 2, 250);
        ctx.shadowBlur = 0; // Reset shadow

        // Gold divider line
        ctx.strokeStyle = "rgba(243, 186, 89, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 140, 275);
        ctx.lineTo(width / 2 + 140, 275);
        ctx.stroke();

        // Date text
        ctx.fillStyle = "#fef3c7";
        ctx.font = "20px 'Kantumruy Pro', sans-serif";
        ctx.fillText(dateKhmerFormatted, width / 2, 315);

        ctx.fillStyle = "#fde68a";
        ctx.font = "18px 'Kantumruy Pro', sans-serif";
        ctx.fillText(timeKh, width / 2, 345);

        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = "16px 'Inter', sans-serif";
        ctx.fillText(`${dateEnglishFormatted} ${timeEnglishFormatted}`, width / 2, 385);

        // 4. Ticket Cutout Divider at Y = topHeight
        const dividerY = topHeight;
        const notchRadius = 32;

        // Cutout notches
        ctx.save();
        ctx.fillStyle = "#0d0c0b";
        ctx.beginPath();
        ctx.arc(0, dividerY, notchRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width, dividerY, notchRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Dashed golden divider line
        ctx.strokeStyle = "rgba(243, 186, 89, 0.4)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([12, 10]);
        ctx.beginPath();
        ctx.moveTo(notchRadius + 18, dividerY);
        ctx.lineTo(width - notchRadius - 18, dividerY);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // 5. Bottom Section: Guest Greeting
        ctx.fillStyle = "#f3ba59";
        ctx.font = "bold 22px 'Kantumruy Pro', serif";
        ctx.fillText("❦ សូមគោរពអញ្ជើញ ❦", width / 2, dividerY + 70);

        // Guest name in glowing radiant gold
        ctx.fillStyle = "#fbbf24";
        ctx.font = "900 42px 'Kantumruy Pro', sans-serif";
        ctx.fillText(guest.name, width / 2, dividerY + 130);

        // Guest Group Badge (if exists)
        let qrOffsetY = dividerY + 160;
        if (guest.group && guest.group !== "None") {
            ctx.save();
            ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
            ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
            ctx.lineWidth = 1.5;
            const groupWidth = 200;
            drawRoundRect(ctx, width / 2 - groupWidth / 2, dividerY + 155, groupWidth, 32, 16);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#fde68a";
            ctx.font = "bold 16px 'Kantumruy Pro', sans-serif";
            ctx.fillText(`✦ ${guest.group} ✦`, width / 2, dividerY + 177);
            ctx.restore();
            qrOffsetY = dividerY + 205;
        }

        // 6. QR Code Framed Container
        const qrBoxSize = 340;
        const qrBoxX = (width - qrBoxSize) / 2;
        const qrBoxY = qrOffsetY + 15;

        // White background box for QR code
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 20;
        drawRoundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 26);
        ctx.fill();
        ctx.restore();

        // 4 Golden Corner Bracket Accents
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 4;
        const bracketLen = 32;

        // Top-left
        ctx.beginPath();
        ctx.moveTo(qrBoxX - 12, qrBoxY - 12 + bracketLen);
        ctx.lineTo(qrBoxX - 12, qrBoxY - 12);
        ctx.lineTo(qrBoxX - 12 + bracketLen, qrBoxY - 12);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(qrBoxX + qrBoxSize + 12 - bracketLen, qrBoxY - 12);
        ctx.lineTo(qrBoxX + qrBoxSize + 12, qrBoxY - 12);
        ctx.lineTo(qrBoxX + qrBoxSize + 12, qrBoxY - 12 + bracketLen);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(qrBoxX - 12, qrBoxY + qrBoxSize + 12 - bracketLen);
        ctx.lineTo(qrBoxX - 12, qrBoxY + qrBoxSize + 12);
        ctx.lineTo(qrBoxX - 12 + bracketLen, qrBoxY + qrBoxSize + 12);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(qrBoxX + qrBoxSize + 12 - bracketLen, qrBoxY + qrBoxSize + 12);
        ctx.lineTo(qrBoxX + qrBoxSize + 12, qrBoxY + qrBoxSize + 12);
        ctx.lineTo(qrBoxX + qrBoxSize + 12, qrBoxY + qrBoxSize + 12 - bracketLen);
        ctx.stroke();

        // Draw QR Image
        if (qrDataUrl) {
            const qrImg = await loadImage(qrDataUrl);
            const qrInnerPadding = 20;
            const qrInnerSize = qrBoxSize - qrInnerPadding * 2;
            ctx.drawImage(qrImg, qrBoxX + qrInnerPadding, qrBoxY + qrInnerPadding, qrInnerSize, qrInnerSize);
        }

        // Subtitle under QR
        ctx.fillStyle = "#fef3c7";
        ctx.font = "bold 21px 'Kantumruy Pro', sans-serif";
        ctx.fillText(qrSubtitleLabel, width / 2, qrBoxY + qrBoxSize + 55);

        // Official Watermark / Footer
        ctx.fillStyle = "rgba(243, 186, 89, 0.65)";
        ctx.font = "bold 15px 'Inter', 'Kantumruy Pro', sans-serif";
        ctx.fillText("MONEA VIP PASS • OFFICIAL WEDDING INVITATION", width / 2, qrBoxY + qrBoxSize + 90);

        // 7. Outer Luxury Gold Border Frame
        ctx.strokeStyle = "rgba(243, 186, 89, 0.35)";
        ctx.lineWidth = 3;
        drawRoundRect(ctx, 10, 10, width - 20, height - 20, 36);
        ctx.stroke();

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
        qrSubtitleLabel,
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

            showToast({
                title: "ទាញយករួចរាល់!",
                description: `សំបុត្រឌីជីថលសម្រាប់ ${guest.name} ត្រូវបានរក្សាទុកជារូបភាព HD។`,
                type: "success",
            });
        } catch (error) {
            console.error("Error downloading pass:", error);
            showToast({
                title: "បរាជ័យក្នុងការទាញយក",
                description: "សូមសាកល្បងម្ដងទៀត។",
                type: "error",
            });
        } finally {
            setDownloading(false);
        }
    };

    // Share directly to Telegram — short personal note; Telegram auto-generates rich preview card
    const handleTelegram = () => {
        if (!guest) return;
        const eventCeremony = isAnniversary ? "ពិធីភ្ជាប់ពាក្យ" : "ពិធីមង្គលការ";
        const shareText = `សួស្តី ${guest.name} 🤍
យើងខ្ញុំសូមគោរពអញ្ជើញចូលរួម${eventCeremony}របស់យើងខ្ញុំ។ សូមចុចតំណភ្ជាប់ខាងក្រោមដើម្បីបើកមើលសំបុត្រអញ្ជើញ ⬇️`;
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(telegramUrl, "_blank", "noopener,noreferrer");
    };

    // Native Share or Copy Link Fallback
    const handleShareOrCopy = async () => {
        if (!guest) return;

        // Clean message — link preview card handles couple names & date visually
        const eventCeremony = isAnniversary ? "ពិធីភ្ជាប់ពាក្យ" : "ពិធីមង្គលការ";
        const shareText = `សួស្តី ${guest.name} 🤍
យើងខ្ញុំសូមគោរពអញ្ជើញចូលរួម${eventCeremony}របស់យើងខ្ញុំ។ សូមចុចតំណភ្ជាប់ខាងក្រោមដើម្បីបើកមើលសំបុត្រអញ្ជើញ៖
${inviteUrl}`;

        // Attempt Web Share API with image file if supported
        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                const canvas = await generateCanvasTicket();
                if (canvas && navigator.canShare) {
                    const blob = await new Promise<Blob | null>((resolve) =>
                        canvas.toBlob(resolve, "image/png")
                    );
                    if (blob) {
                        const file = new File([blob], `monea-pass-${guest.name}.png`, { type: "image/png" });
                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: `${groomName} និង ${brideName} 💍 សូមគោរពអញ្ជើញ ${guest.name}`,
                                text: shareText,
                            });
                            return;
                        }
                    }
                }

                // Fallback to text Web Share
                await navigator.share({
                    title: `${groomName} និង ${brideName} 💍 សូមគោរពអញ្ជើញ ${guest.name}`,
                    text: shareText,
                    url: inviteUrl,
                });
                return;
            } catch (err) {
                console.log("Web share dismissed or cancelled:", err);
            }
        }

        // Copy short message + link as last resort
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText);
            setCopied(true);
            showToast({
                title: "បានចម្លងតំណភ្ជាប់!",
                description: "អ្នកអាចយកទំណភ្ជាប់ទៅផ្ញើជូនភ្ញៀវក្នុង Telegram ឬ Messenger បាន។",
                type: "success",
            });
            setTimeout(() => setCopied(false), 2500);
        }
    };

    if (!guest) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] xs:w-[92vw] max-w-[400px] p-0 overflow-hidden bg-background/95 dark:bg-[#121110]/98 backdrop-blur-2xl rounded-3xl sm:rounded-[2rem] border border-amber-500/25 shadow-2xl flex flex-col gap-0 max-h-[92dvh] sm:max-h-[88vh]">
                {/* Header with Title and VIP Badge */}
                <div className="shrink-0 p-3.5 sm:p-4 px-4 sm:px-5 pr-14 border-b border-border/40 flex items-center justify-between">
                    <DialogTitle className="font-kantumruy font-black text-base sm:text-lg text-foreground flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-amber-500" />
                        <span>សំបុត្រឌីជីថល</span>
                    </DialogTitle>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                        VIP PASS
                    </span>
                </div>

                {/* Scrollable Container with Luxury Ticket Card */}
                <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col items-center justify-start overscroll-contain">
                    {/* The Ticket Card */}
                    <div
                        ref={cardRef}
                        className="w-full max-w-[325px] xs:max-w-[340px] sm:max-w-[350px] rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 dark:border-amber-400/25 bg-gradient-to-b from-[#1c1a17] via-[#161513] to-[#11100f] text-white select-none relative"
                    >
                        {/* Top Card Section: Couple Photo & Details */}
                        <div className="relative h-40 xs:h-44 sm:h-52 w-full flex flex-col items-center justify-end p-3.5 sm:p-4 pb-4 text-center overflow-hidden">
                            <img
                                src={heroImage}
                                alt="Couple Cover"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#161513] via-black/65 to-black/35" />

                            <div className="relative z-10 space-y-1 w-full px-2">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-400/30 shadow-sm">
                                    <span className="text-amber-300 font-extrabold text-[10px] sm:text-xs tracking-wide font-kantumruy">
                                        ✦ {eventType} ✦
                                    </span>
                                </div>
                                <h3 className="text-white font-black text-lg sm:text-xl font-kantumruy tracking-tight drop-shadow-md leading-tight">
                                    {groomName} និង {brideName}
                                </h3>

                                <div className="pt-1 text-[11px] sm:text-xs text-amber-100 font-kantumruy leading-tight">
                                    <p>{dateKhmerFormatted}</p>
                                    <p className="opacity-90">{timeKh}</p>
                                </div>
                                <p className="text-[9px] sm:text-[10px] text-white/70 font-sans tracking-tight">
                                    {dateEnglishFormatted} {timeEnglishFormatted}
                                </p>
                            </div>
                        </div>

                        {/* Perforated Divider with Authentic Ticket Notches */}
                        <div className="relative flex items-center bg-[#161513] -my-1 z-10">
                            <div className="w-5 h-5 rounded-r-full bg-background dark:bg-[#121110] -ml-2.5 border-r border-amber-500/30 shadow-inner" />
                            <div className="flex-1 border-t-2 border-dashed border-amber-400/35 mx-2" />
                            <div className="w-5 h-5 rounded-l-full bg-background dark:bg-[#121110] -mr-2.5 border-l border-amber-500/30 shadow-inner" />
                        </div>

                        {/* Bottom Card Section: Guest Name & QR */}
                        <div className="bg-gradient-to-b from-[#161513] to-[#11100f] p-4 sm:p-5 pt-3.5 text-center flex flex-col items-center space-y-2.5 sm:space-y-3 font-kantumruy">
                            <div className="space-y-0.5">
                                <span className="text-amber-400/90 text-[11px] sm:text-xs font-bold tracking-wider flex items-center gap-1.5 justify-center">
                                    <span>❦</span>
                                    <span>សូមគោរពអញ្ជើញ</span>
                                    <span>❦</span>
                                </span>
                                <h4 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-100 bg-clip-text text-transparent tracking-wide drop-shadow-sm px-2 break-words max-w-full">
                                    {guest.name}
                                </h4>
                                {guest.group && guest.group !== "None" && (
                                    <div className="pt-0.5">
                                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-400/25">
                                            ✦ {guest.group} ✦
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Jeweled QR Code Container with 4 Golden Corner Accents */}
                            <div className="relative p-2.5 sm:p-3 bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.5),0_0_20px_rgba(245,158,11,0.18)]">
                                {/* Corner Brackets */}
                                <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500 rounded-tl pointer-events-none" />
                                <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500 rounded-tr pointer-events-none" />
                                <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500 rounded-bl pointer-events-none" />
                                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500 rounded-br pointer-events-none" />

                                {qrDataUrl ? (
                                    <img
                                        src={qrDataUrl}
                                        alt={`QR Code for ${guest.name}`}
                                        className="w-28 h-28 xs:w-32 xs:h-32 sm:w-36 sm:h-36 object-contain"
                                    />
                                ) : (
                                    <div className="w-28 h-28 xs:w-32 xs:h-32 sm:w-36 sm:h-36 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-0.5 pt-0.5">
                                <p className="text-[11px] font-bold text-amber-100/80">
                                    {qrSubtitleLabel}
                                </p>
                                <p className="text-[9px] uppercase tracking-widest text-amber-400/50 font-sans font-medium">
                                    MONEA VIP PASS • OFFICIAL INVITATION
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Action Footer (Always Visible on Mobile Phones) */}
                <div className="shrink-0 p-3 sm:p-4 pt-2.5 bg-background/95 dark:bg-[#121110]/95 backdrop-blur-md border-t border-border/40 w-full z-20 space-y-2 font-kantumruy">
                    {/* Primary Action: Download High-Res PNG Pass */}
                    <Button
                        type="button"
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full h-11 sm:h-12 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-900/20 active:scale-[0.98] transition-all"
                    >
                        {downloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        <span>ទាញយកសំបុត្រ (Download PNG)</span>
                    </Button>

                    {/* Quick Share Options: Telegram and Native Share / Copy */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            onClick={handleTelegram}
                            className="h-10 sm:h-11 rounded-2xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all text-xs sm:text-sm"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>ផ្ញើ Telegram</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleShareOrCopy}
                            className="h-10 sm:h-11 rounded-2xl border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all text-xs sm:text-sm"
                        >
                            {copied ? (
                                <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            ) : (
                                <Share2 className="w-3.5 h-3.5" />
                            )}
                            <span>{copied ? "បានចម្លង!" : "ចែករំលែក"}</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default DigitalPassModal;


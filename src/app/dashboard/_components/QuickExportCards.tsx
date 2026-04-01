"use client";

import { Users, DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/i18n/LanguageProvider";

interface QuickExportCardsProps {
    weddingId: string;
}

export function QuickExportCards({ weddingId }: QuickExportCardsProps) {
    const { t, locale } = useTranslation();
    const [loading, setLoading] = useState<"guests" | "gifts" | null>(null);

    const formatKhmerDate = (date: Date | string | undefined) => {
        if (!date) return "";
        const d = new Date(date);
        const khmerDays = t("common.calendar.days", { returnObjects: true }) as string[];
        const khmerMonths = t("common.calendar.months", { returnObjects: true }) as string[];
        const khmerDigits = t("common.calendar.digits", { returnObjects: true }) as string[];
        const toKhmerNum = (num: number) => String(num).split('').map(digit => khmerDigits[parseInt(digit)] || digit).join('');
        return `${t("common.calendar.day")}${khmerDays[d.getDay()]} ${t("common.calendar.number")}${toKhmerNum(d.getDate())} ${t("common.calendar.month")}${khmerMonths[d.getMonth()]} ${t("common.calendar.year")}${toKhmerNum(d.getFullYear())}`;
    };

    const exportGuests = async () => {
        setLoading("guests");
        try {
            const [guestsRes, weddingRes] = await Promise.all([
                fetch("/api/guests"),
                fetch("/api/wedding")
            ]);
            
            if (!guestsRes.ok || !weddingRes.ok) throw new Error("Failed to fetch data");
            
            const guests = await guestsRes.json();
            const wedding = await weddingRes.json();
            const XLSX = await import("xlsx");

            const title = t("dashboard.export.guestListTitle", {
                groom: wedding?.groomName || '...',
                bride: wedding?.brideName || '...'
            });
            const dateStr = locale === 'km' ? formatKhmerDate(wedding?.date) : new Date(wedding?.date).toLocaleDateString('en-US', { dateStyle: 'full' });
            const summary = t("dashboard.export.summary", { date: dateStr, count: guests.length });

            const headers = [
                t("dashboard.export.cols.no"),
                t("dashboard.export.cols.name"),
                t("dashboard.export.cols.location")
            ];
            const rows = guests.sort((a: any, b: any) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0)).map((g: any, idx: number) => [
                g.sequenceNumber || (idx + 1),
                g.name,
                g.group || g.source || t("dashboard.export.unspecified")
            ]);

            const worksheet = XLSX.utils.aoa_to_sheet([[title], [], [summary], [], headers, ...rows]);
            worksheet["!cols"] = [{ wpx: 50 }, { wpx: 250 }, { wpx: 300 }];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, t("dashboard.export.guestSheetName"));
            XLSX.writeFile(workbook, `MONEA_GuestList_${wedding?.groomName || 'Wedding'}.xlsx`);
        } catch (e) {
            console.error(e);
            alert(t("dashboard.export.error"));
        } finally {
            setLoading(null);
        }
    };

    const exportGifts = async () => {
        setLoading("gifts");
        try {
            const [giftsRes, weddingRes] = await Promise.all([
                fetch("/api/gifts"),
                fetch("/api/wedding")
            ]);
            
            if (!giftsRes.ok || !weddingRes.ok) throw new Error("Failed to fetch data");
            
            const gifts = await giftsRes.json();
            const wedding = await weddingRes.json();
            const XLSX = await import("xlsx");

            // Calculate totals
            const totals = gifts.reduce((acc: any, g: any) => {
                if (g.currency === "USD") acc.usd += g.amount;
                else acc.khr += g.amount;
                return acc;
            }, { usd: 0, khr: 0 });

            const title = t("dashboard.export.giftListTitle", {
                groom: wedding?.groomName || '...',
                bride: wedding?.brideName || '...'
            });
            const dateStr = locale === 'km' ? formatKhmerDate(wedding?.date) : new Date(wedding?.date).toLocaleDateString('en-US', { dateStyle: 'full' });
            const summary = t("dashboard.export.summary", { date: dateStr, count: gifts.length });
            const moneySummary = t("dashboard.export.moneySummary", {
                usd: `$${totals.usd.toLocaleString()}`,
                khr: `${totals.khr.toLocaleString()} ៛`
            });

            const headers = [
                t("dashboard.export.cols.no"),
                t("dashboard.export.cols.name"),
                t("dashboard.export.cols.location"),
                t("dashboard.export.cols.amount"),
                t("dashboard.export.cols.currency"),
                t("dashboard.export.cols.method"),
                t("dashboard.export.cols.date")
            ];
            const rows = gifts.sort((a: any, b: any) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0)).map((g: any, idx: number) => [
                g.sequenceNumber || (idx + 1),
                g.guest?.name || t("dashboard.export.unknown"),
                g.guest?.group && g.guest.group !== "None" ? g.guest.group : (g.guest?.source && g.guest.source !== "GIFT_ENTRY" && g.guest.source !== "None" ? g.guest.source : t("dashboard.export.general")),
                g.amount.toLocaleString(),
                g.currency,
                g.method || t("dashboard.export.cash"),
                new Date(g.createdAt).toLocaleDateString(locale === 'km' ? 'km-KH' : 'en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
            ]);

            const worksheet = XLSX.utils.aoa_to_sheet([[title], [], [summary], [moneySummary], [], headers, ...rows]);
            worksheet["!cols"] = [{ wpx: 50 }, { wpx: 200 }, { wpx: 150 }, { wpx: 100 }, { wpx: 80 }, { wpx: 100 }, { wpx: 120 }];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, t("dashboard.export.giftSheetName"));
            XLSX.writeFile(workbook, `MONEA_GiftList_${wedding?.groomName || 'Wedding'}.xlsx`);
        } catch (e) {
            console.error(e);
            alert(t("dashboard.export.error"));
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <button
                onClick={exportGuests}
                disabled={loading !== null}
                className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-blue-50/50 dark:bg-blue-950/10 hover:bg-blue-100 transition-all border border-transparent hover:border-blue-100 group"
            >
                {loading === "guests" ? <Loader2 className="w-6 h-6 text-blue-600 animate-spin" /> : <Users className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />}
                <span className="font-bold font-kantumruy text-sm">{t("dashboard.quickActions.guests")}</span>
            </button>
            <button
                onClick={exportGifts}
                disabled={loading !== null}
                className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/10 hover:bg-emerald-100 transition-all border border-transparent hover:border-emerald-100 group"
            >
                {loading === "gifts" ? <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" /> : <DollarSign className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />}
                <span className="font-bold font-kantumruy text-sm">{t("dashboard.quickActions.gifts")}</span>
            </button>
        </div>
    );
}

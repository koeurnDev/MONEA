"use client";

import { Users, DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";

interface QuickExportCardsProps {
    weddingId: string;
}

export function QuickExportCards({ weddingId }: QuickExportCardsProps) {
    const [loading, setLoading] = useState<"guests" | "gifts" | null>(null);

    const formatKhmerDate = (date: Date | string | undefined) => {
        if (!date) return "";
        const d = new Date(date);
        const khmerDays = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
        const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
        const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
        const toKhmerNum = (num: number) => String(num).split('').map(digit => khmerDigits[parseInt(digit)] || digit).join('');
        return `ថ្ងៃ${khmerDays[d.getDay()]} ទី${toKhmerNum(d.getDate())} ខែ${khmerMonths[d.getMonth()]} ឆ្នាំ${toKhmerNum(d.getFullYear())}`;
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

            const title = `បញ្ជីឈ្មោះភ្ញៀវ - ${wedding?.groomName || '...'} និង ${wedding?.brideName || '...'}`;
            const dateStr = formatKhmerDate(wedding?.date);
            const summary = `កាលបរិច្ឆេទ: ${dateStr}  |  សរុបភ្ញៀវ: ${guests.length} នាក់`;

            const headers = ["ល.រ", "ឈ្មោះភ្ញៀវ", "មកពីណា / ទីតាំង"];
            const rows = guests.sort((a: any, b: any) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0)).map((g: any, idx: number) => [
                g.sequenceNumber || (idx + 1),
                g.name,
                g.group || g.source || "មិនបានបញ្ជាក់"
            ]);

            const worksheet = XLSX.utils.aoa_to_sheet([[title], [], [summary], [], headers, ...rows]);
            worksheet["!cols"] = [{ wpx: 50 }, { wpx: 250 }, { wpx: 300 }];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "បញ្ជីឈ្មោះភ្ញៀវ");
            XLSX.writeFile(workbook, `MONEA_GuestList_${wedding?.groomName || 'Wedding'}.xlsx`);
        } catch (e) {
            console.error(e);
            alert("ការទាញយកមានបញ្ហា! សូមព្យាយាមម្តងទៀត។");
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

            const title = `បញ្ជីចំណងដៃ - ${wedding?.groomName || '...'} និង ${wedding?.brideName || '...'}`;
            const dateStr = formatKhmerDate(wedding?.date);
            const summary = `កាលបរិច្ឆេទ: ${dateStr}  |  សរុបភ្ញៀវ: ${gifts.length} នាក់`;
            const moneySummary = `សរុប (USD): $${totals.usd.toLocaleString()}  |  សរុប (KHR): ${totals.khr.toLocaleString()} ៛`;

            const headers = ["ល.រ", "ឈ្មោះភ្ញៀវ", "មកពីណា", "ចំនួនទឹកប្រាក់", "រូបិយប័ណ្ណ", "វិធីសាស្ត្រ", "កាលបរិច្ឆេទ"];
            const rows = gifts.sort((a: any, b: any) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0)).map((g: any, idx: number) => [
                g.sequenceNumber || (idx + 1),
                g.guest?.name || "មិនស្គាល់",
                g.guest?.group && g.guest.group !== "None" ? g.guest.group : (g.guest?.source && g.guest.source !== "GIFT_ENTRY" && g.guest.source !== "None" ? g.guest.source : "ទូទៅ"),
                g.amount.toLocaleString(),
                g.currency,
                g.method || "សាច់ប្រាក់",
                new Date(g.createdAt).toLocaleDateString("en-US", { month: '2-digit', day: '2-digit', year: 'numeric' })
            ]);

            const worksheet = XLSX.utils.aoa_to_sheet([[title], [], [summary], [moneySummary], [], headers, ...rows]);
            worksheet["!cols"] = [{ wpx: 50 }, { wpx: 200 }, { wpx: 150 }, { wpx: 100 }, { wpx: 80 }, { wpx: 100 }, { wpx: 120 }];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "បញ្ជីចំណងដៃ");
            XLSX.writeFile(workbook, `MONEA_GiftList_${wedding?.groomName || 'Wedding'}.xlsx`);
        } catch (e) {
            console.error(e);
            alert("ការទាញយកមានបញ្ហា! សូមព្យាយាមម្តងទៀត។");
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
                <span className="font-bold font-kantumruy text-sm">បញ្ជីភ្ញៀវ</span>
            </button>
            <button
                onClick={exportGifts}
                disabled={loading !== null}
                className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/10 hover:bg-emerald-100 transition-all border border-transparent hover:border-emerald-100 group"
            >
                {loading === "gifts" ? <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" /> : <DollarSign className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />}
                <span className="font-bold font-kantumruy text-sm">បញ្ជីចំណងដៃ</span>
            </button>
        </div>
    );
}

import { useState } from "react";
import { Users, Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface QuickExportCardsProps {
    weddingId: string;
}

export function QuickExportCards({ weddingId }: QuickExportCardsProps) {
    const { t, locale } = useTranslation();
    const { showToast } = useToast();
    const [loading, setLoading] = useState<"guests" | null>(null);

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
        if (!weddingId) return;
        setLoading("guests");
        try {
            const [guestsRes, weddingRes] = await Promise.all([
                fetch(`/api/guests?weddingId=${weddingId}`),
                fetch(`/api/wedding?weddingId=${weddingId}`)
            ]);

            if (!guestsRes.ok || !weddingRes.ok) throw new Error("Failed to fetch data");

            const guestsData = await guestsRes.json();
            const guests = Array.isArray(guestsData) ? guestsData : (guestsData.items || []);
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
            XLSX.writeFile(workbook, `MONEO_GuestList_${wedding?.groomName || 'Wedding'}.xlsx`);

            showToast({
                title: "ទាញយកបញ្ជីភ្ញៀវជោគជ័យ!",
                description: `ឯកសារ Excel ចំនួន ${guests.length} នាក់ត្រូវបានទាញយក។`,
                type: "success"
            });
        } catch (e) {
            console.error(e);
            showToast({
                title: "បរាជ័យក្នុងការទាញយក",
                description: t("dashboard.export.error", { defaultValue: "មានបញ្ហាក្នុងការទាញយក សូមព្យាយាមម្ដងទៀត។" }),
                type: "error"
            });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-3 md:gap-4">
            <button
                type="button"
                onClick={exportGuests}
                disabled={loading !== null}
                className={cn(
                    "flex flex-col items-center justify-center gap-2.5 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-accent/50 hover:bg-accent active:scale-95 transition-all border border-border/40 hover:border-primary/30 group outline-none",
                    loading !== null && "cursor-not-allowed opacity-60 pointer-events-none"
                )}
            >
                {loading === "guests" ? (
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-primary animate-spin" />
                ) : (
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:scale-110 transition-transform" />
                )}
                <span className="font-bold font-kantumruy text-xs md:text-sm text-foreground">{t("dashboard.quickActions.guests")}</span>
            </button>
        </div>
    );
}
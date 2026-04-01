"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useGiftsData } from "./useGiftsData";
import { moneaClient } from "@/lib/api-client";

export function useGiftsPage(onSuccess: () => void) {
    const { t } = useTranslation();
    const {
        wedding,
        gifts,
        userRole,
        isLoading: loading,
        totals,
        refresh,
        mutateWedding
    } = useGiftsData();

    const [visibleCount, setVisibleCount] = useState(20);
    const [offlineCount, setOfflineCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    const checkOfflineQueue = useCallback(() => {
        const queue = JSON.parse(localStorage.getItem('gift_offline_queue') || "[]");
        setOfflineCount(queue.length);
    }, []);

    useEffect(() => {
        checkOfflineQueue();
    }, [checkOfflineQueue]);

    const syncOfflineGifts = async () => {
        setIsSyncing(true);
        const queue = JSON.parse(localStorage.getItem('gift_offline_queue') || "[]");
        const failed = [];

        for (const gift of queue) {
            try {
                const res = await moneaClient.post<any>("/api/gifts", gift);
                if (!res.error) {
                    // Success (handled by refresh)
                } else {
                    failed.push(gift);
                }
            } catch (e) {
                failed.push(gift);
            }
        }

        localStorage.setItem('gift_offline_queue', JSON.stringify(failed));
        setOfflineCount(failed.length);
        setIsSyncing(false);
        refresh();
        onSuccess();
    };

    const clearOfflineQueue = () => {
        localStorage.removeItem('gift_offline_queue');
        setOfflineCount(0);
    };

    const filteredGifts = useMemo(() => {
        if (!searchQuery) return gifts;
        const q = searchQuery.toLowerCase();
        return gifts.filter((g: any) => 
            (g.guest?.name || "").toLowerCase().includes(q) ||
            (g.sequenceNumber?.toString() || "").includes(q) ||
            (`#${g.sequenceNumber?.toString().padStart(3, '0')}`).includes(q)
        );
    }, [gifts, searchQuery]);

    const sortedGifts = useMemo(() => {
        return [...filteredGifts].sort((a: any, b: any) => {
            if (sortConfig.key === 'createdAt') {
                return sortConfig.direction === 'asc'
                    ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            if (sortConfig.key === 'address') {
                const addrA = a.guest?.group || "";
                const addrB = b.guest?.group || "";
                return sortConfig.direction === 'asc'
                    ? addrA.localeCompare(addrB)
                    : addrB.localeCompare(addrA);
            }
            return 0;
        });
    }, [filteredGifts, sortConfig]);

    const toggleSort = (key: string = 'createdAt') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const exportExcel = async () => {
        const XLSX = await import("xlsx");
        
        // Manual Khmer Date Formatter (Keep for Khmer locale, use standard for others)
        const formatKhmerDate = (date: Date | string | undefined) => {
            if (!date) return "";
            const d = new Date(date);
            if (t("common.language") !== "km") {
                return d.toLocaleDateString("en-US", { month: '2-digit', day: '2-digit', year: 'numeric' });
            }
            const khmerDays = t("common.calendar.days", { returnObjects: true }) as string[];
            const khmerMonths = t("common.calendar.months", { returnObjects: true }) as string[];
            const khmerDigits = t("common.calendar.digits", { returnObjects: true }) as string[];
            const toKhmerNum = (num: number) => String(num).split('').map(digit => khmerDigits[parseInt(digit)] || digit).join('');
            return `${t("common.calendar.day")}${khmerDays[d.getDay()]} ${t("common.calendar.number")}${toKhmerNum(d.getDate())} ${t("common.calendar.month")}${khmerMonths[d.getMonth()]} ${t("common.calendar.year")}${toKhmerNum(d.getFullYear())}`;
        };

        const weddingAny = wedding as any;
        const title = `${t("gifts.export.title")} - ${weddingAny?.groomName || '...'} ${t("gifts.export.and")} ${weddingAny?.brideName || '...'}`;
        const dateStr = formatKhmerDate(weddingAny?.date);
        const summary = `${t("gifts.export.date")}: ${dateStr}  |  ${t("gifts.export.totalGuests")}: ${gifts.length} ${t("gifts.export.guestsCount")}`;
        const moneySummary = `${t("gifts.export.totalUsd")}: $${totals.usd.toLocaleString()}  |  ${t("gifts.export.totalKhr")}: ${totals.khr.toLocaleString()} ៛`;

        const headers = [
            t("gifts.export.headers.no"),
            t("gifts.export.headers.guestName"),
            t("gifts.export.headers.from"),
            t("gifts.export.headers.amount"),
            t("gifts.export.headers.currency"),
            t("gifts.export.headers.method"),
            t("gifts.export.headers.date")
        ];

        const rows = gifts.sort((a: any, b: any) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0)).map((g: any, idx: number) => {
            const methodDisplay = (g.method === "Cash" || g.method === "CASH") ? t("gifts.export.cash") : (g.method || t("gifts.export.cash"));
            return [
                g.sequenceNumber || (idx + 1),
                g.guest?.name || t("gifts.export.unknown"),
                g.guest?.group && g.guest.group !== "None" ? g.guest.group : (g.guest?.source && g.guest.source !== "GIFT_ENTRY" && g.guest.source !== "None" ? g.guest.source : t("gifts.export.general")),
                g.amount.toLocaleString(),
                g.currency,
                methodDisplay,
                new Date(g.createdAt).toLocaleDateString("en-US", { month: '2-digit', day: '2-digit', year: 'numeric' })
            ];
        });

        const aoa = [
            [title],
            [],
            [summary],
            [moneySummary],
            [],
            headers,
            ...rows
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(aoa);
        worksheet["!cols"] = [
            { wpx: 50 },  // No.
            { wpx: 200 }, // Name
            { wpx: 150 }, // From
            { wpx: 100 }, // Amount
            { wpx: 80 },  // Currency
            { wpx: 100 }, // Method
            { wpx: 120 }  // Date
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t("gifts.export.sheetName"));
        const fileName = `MONEA_GiftList_${weddingAny?.groomName || 'Wedding'}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = "";
        window.print();
        document.title = originalTitle;
    };

    const toggleShowGifts = async () => {
        const weddingAny = wedding as any;
        if (!weddingAny) return;
        const currentShow = weddingAny.themeSettings?.showGiftAmounts !== false;
        const newShow = !currentShow;

        mutateWedding({
            ...weddingAny,
            themeSettings: { ...weddingAny.themeSettings, showGiftAmounts: newShow }
        }, { revalidate: false });

        try {
            await moneaClient.put("/api/wedding", { themeSettings: { showGiftAmounts: newShow } });
            refresh();
        } catch (e) {
            refresh();
        }
    };

    return {
        wedding,
        gifts,
        sortedGifts,
        userRole,
        loading,
        visibleCount,
        setVisibleCount,
        offlineCount,
        isSyncing,
        sortConfig,
        toggleSort,
        searchQuery,
        setSearchQuery,
        syncOfflineGifts,
        clearOfflineQueue,
        handlePrint,
        exportExcel,
        toggleShowGifts,
        totals,
        refresh
    };
}

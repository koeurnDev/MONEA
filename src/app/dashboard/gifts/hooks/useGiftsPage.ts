"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useGiftsData } from "./useGiftsData";

export function useGiftsPage(onSuccess: () => void) {
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
                const res = await fetch("/api/gifts", {
                    method: "POST",
                    body: JSON.stringify(gift),
                });
                if (!res.ok) failed.push(gift);
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
        
        // Manual Khmer Date Formatter
        const formatKhmerDate = (date: Date | string | undefined) => {
            if (!date) return "";
            const d = new Date(date);
            const khmerDays = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
            const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
            const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
            const toKhmerNum = (num: number) => String(num).split('').map(digit => khmerDigits[parseInt(digit)] || digit).join('');
            return `ថ្ងៃ${khmerDays[d.getDay()]} ទី${toKhmerNum(d.getDate())} ខែ${khmerMonths[d.getMonth()]} ឆ្នាំ${toKhmerNum(d.getFullYear())}`;
        };

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
        XLSX.utils.book_append_sheet(workbook, worksheet, "បញ្ជីចំណងដៃ");
        const fileName = `MONEA_GiftList_${wedding?.groomName || 'Wedding'}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = "";
        window.print();
        document.title = originalTitle;
    };

    const toggleShowGifts = async () => {
        if (!wedding) return;
        const currentShow = wedding.themeSettings?.showGiftAmounts !== false;
        const newShow = !currentShow;

        mutateWedding({
            ...wedding,
            themeSettings: { ...wedding.themeSettings, showGiftAmounts: newShow }
        }, { revalidate: false });

        try {
            await fetch("/api/wedding", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ themeSettings: { showGiftAmounts: newShow } })
            });
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

"use client";

import { useState, useEffect } from "react";
import { moneaClient } from "@/lib/api-client";

export function useGuests() {
    // 1. Core Data State
    const [guests, setGuests] = useState<any[]>([]);
    const [filteredGuests, setFilteredGuests] = useState<any[]>([]);
    const [wedding, setWedding] = useState<any>(null);
    const [cachedPackageType, setCachedPackageType] = useState<string | null>(null);

    // 2. UI Control State
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(20);

    // 3. Selection / Action State
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [editingGuest, setEditingGuest] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    async function loadData() {
        setLoading(true);
        try {
            const [guestsRes, weddingRes] = await Promise.all([
                moneaClient.get<any[]>("/api/guests"),
                moneaClient.get<any>("/api/wedding")
            ]);

            if (guestsRes.data) {
                setGuests(guestsRes.data);
                setFilteredGuests(guestsRes.data);
            }
            if (weddingRes.data) {
                const wData = weddingRes.data;
                setWedding(wData);
                if (wData?.packageType) {
                    localStorage.setItem(`monea_pkg_${wData.id}`, wData.packageType);
                    setCachedPackageType(wData.packageType);
                }
            }
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setLoading(false);
        }
    }

    // Load initial data and cache
    useEffect(() => {
        // Try to get wedding ID from initial load or current state if available
        // Since we don't have the ID yet, we'll try to find any monea_pkg_* in localStorage
        const keys = Object.keys(localStorage);
        const pkgKey = keys.find(k => k.startsWith('monea_pkg_'));
        if (pkgKey) {
            setCachedPackageType(localStorage.getItem(pkgKey));
        }
        
        loadData();
    }, []);

    // Handle searching
    useEffect(() => {
        if (!search) {
            setFilteredGuests(guests);
        } else {
            const lower = search.toLowerCase();
            setFilteredGuests(guests.filter((g: any) =>
                g.name.toLowerCase().includes(lower) ||
                (g.source && g.source.toLowerCase().includes(lower)) ||
                (g.group && g.group.toLowerCase().includes(lower))
            ));
        }
    }, [search, guests]);

    const exportCSV = async () => {
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

        // 1. Prepare Title and Summary Rows
        const title = `បញ្ជីឈ្មោះភ្ញៀវ - ${wedding?.groomName || '...'} និង ${wedding?.brideName || '...'}`;
        const dateStr = formatKhmerDate(wedding?.date);
        const summary = `កាលបរិច្ឆេទ: ${dateStr}  |  សរុបភ្ញៀវ: ${guests.length} នាក់`;
        
        // 2. Prepare Table Headers and Data
        const headers = ["ល.រ", "ឈ្មោះភ្ញៀវ", "មកពីណា / ទីតាំង"];
        const rows = guests.sort((a: any, b: any) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0)).map((g: any, idx: number) => [
            g.sequenceNumber || (idx + 1),
            g.name,
            g.group || g.source || "មិនបានបញ្ជាក់"
        ]);

        // 3. Construct Final Data Sheet (Title + Spacer + Summary + Spacer + Table)
        const aoa = [
            [title],
            [],
            [summary],
            [],
            headers,
            ...rows
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(aoa);

        // 4. Basic Styling (Column Widths)
        worksheet["!cols"] = [
            { wpx: 50 },  // No.
            { wpx: 250 }, // Name
            { wpx: 300 }  // Location/Group
        ];

        // 5. Create Workbook and Save
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "បញ្ជីឈ្មោះភ្ញៀវ");
        
        const fileName = `MONEA_GuestList_${wedding?.groomName || 'Wedding'}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const copyLink = (name: string, guestId: string) => {
        if (!wedding?.id) return;
        const link = `${window.location.origin}/invite/${wedding.id}?to=${encodeURIComponent(name)}&g=${guestId}`;
        navigator.clipboard.writeText(link);
        setCopiedId(guestId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = ""; // Clear title to hide from browser print header
        window.print();
        document.title = originalTitle;
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        const previousGuests = [...guests];
        const newGuests = guests.filter(g => g.id !== deleteId);
        setGuests(newGuests);
        setFilteredGuests(newGuests);
        const currentDeleteId = deleteId;
        setDeleteId(null);

        try {
            const res = await moneaClient.delete(`/api/guests?id=${currentDeleteId}`);
            if (res.error) throw new Error(res.error);
        } catch (e: any) {
            console.error(e);
            setGuests(previousGuests);
            setFilteredGuests(previousGuests);
            alert("ការលុបមិនបានជោគជ័យ! សូមព្យាយាមម្ដងទៀត។");
        }
    };

    const isArchived = wedding?.status === 'ARCHIVED';
    
    // Smart isPremium check: Use actual data if available, fallback to cache while loading
    const currentPackage = wedding?.packageType || cachedPackageType;
    const isPremium = currentPackage === "PRO" || currentPackage === "PREMIUM";

    return {
        guests,
        filteredGuests,
        wedding,
        search,
        setSearch,
        open,
        setOpen,
        loading,
        visibleCount,
        setVisibleCount,
        copiedId,
        editingGuest,
        setEditingGuest,
        deleteId,
        setDeleteId,
        loadData,
        exportCSV,
        copyLink,
        handlePrint,
        confirmDelete,
        isArchived,
        isPremium
    };
}

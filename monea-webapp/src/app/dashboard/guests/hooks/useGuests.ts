import { useState, useEffect } from "react";
import { moneaClient } from "@/lib/api-client";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";

export function useGuests() {
    const { t, locale } = useTranslation();
    const { showToast } = useToast();
    // 1. Core Data State
    const [guests, setGuests] = useState<any[]>([]);
    const [filteredGuests, setFilteredGuests] = useState<any[]>([]);
    const [wedding, setWedding] = useState<any>(null);
    const [cachedPackageType, setCachedPackageType] = useState<string | null>(null);

    const [pagination, setPagination] = useState<any>(null);
    const [offset, setOffset] = useState(0);
    const LIMIT = 50;
    const [loadingMore, setLoadingMore] = useState(false);

    // 2. UI Control State
    const [search, setSearch] = useState("");
    const [open, setOpenInternal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(20);

    // 3. Selection / Action State
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [editingGuest, setEditingGuest] = useState<any>(null);
    const [deleteGuest, setDeleteGuest] = useState<{ id: string, name: string } | null>(null);

    async function loadData() {
        setLoading(true);
        try {
            const [guestsRes, weddingRes] = await Promise.all([
                moneaClient.get<any>(`/api/guests?limit=${LIMIT}&offset=0`),
                moneaClient.get<any>("/api/wedding")
            ]);

            if (guestsRes.data) {
                const data = guestsRes.data;
                const items = data.items || [];
                setGuests(items);
                setFilteredGuests(items);
                setPagination(data.pagination || null);
                setOffset(LIMIT);
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

    async function fetchMoreGuests() {
        if (!pagination?.hasMore || loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await moneaClient.get<any>(`/api/guests?limit=${LIMIT}&offset=${offset}`);
            if (res.data && res.data.items) {
                const newItems = res.data.items;
                setGuests(prev => [...prev, ...newItems]);
                // Ensure search filter is applied to new items
                if (search) {
                    const lower = search.toLowerCase();
                    const matchedNew = newItems.filter((g: any) => 
                        g.name.toLowerCase().includes(lower) ||
                        (g.source && g.source.toLowerCase().includes(lower)) ||
                        (g.group && g.group.toLowerCase().includes(lower))
                    );
                    setFilteredGuests(prev => [...prev, ...matchedNew]);
                } else {
                    setFilteredGuests(prev => [...prev, ...newItems]);
                }
                setPagination(res.data.pagination || null);
                setOffset(prev => prev + LIMIT);
            }
        } catch (e) {
            console.error("Failed to load more guests", e);
        } finally {
            setLoadingMore(false);
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

    // Handle searching with non-blocking pattern (INP Optimization)
    useEffect(() => {
        let isCancelled = false;
        
        async function runFilteredSearch() {
            if (!search) {
                setFilteredGuests(guests);
                return;
            }

            const lower = search.toLowerCase();
            const results: any[] = [];
            const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

            // Chunked filtering to prevent main-thread blocking
            for (let i = 0; i < guests.length; i++) {
                if (isCancelled) return;

                const g = guests[i];
                if (
                    g.name.toLowerCase().includes(lower) ||
                    (g.source && g.source.toLowerCase().includes(lower)) ||
                    (g.group && g.group.toLowerCase().includes(lower))
                ) {
                    results.push(g);
                }

                // Yield to main thread every 200 items to keep UI responsive
                if (i > 0 && i % 200 === 0) {
                    await yieldToMain();
                }
            }

            if (!isCancelled) {
                setFilteredGuests(results);
            }
        }

        runFilteredSearch();
        return () => { isCancelled = true; };
    }, [search, guests]);

    const exportCSV = async () => {
        const XLSX = await import("xlsx");
        
        // Manual Khmer Date Formatter
        const formatKhmerDate = (date: Date | string | undefined) => {
            if (!date) return "";
            const d = new Date(date);
            
            if (locale === 'en') {
                return d.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            const khmerDays = t("common.calendar.days", { returnObjects: true }) as string[];
            const khmerMonths = t("common.calendar.months", { returnObjects: true }) as string[];
            const khmerDigits = t("common.calendar.digits", { returnObjects: true }) as string[];
            const toKhmerNum = (num: number) => String(num).split('').map(digit => khmerDigits[parseInt(digit)] || digit).join('');

            return `${t("common.calendar.day")}${khmerDays[d.getDay()]} ${t("common.calendar.number")}${toKhmerNum(d.getDate())} ${t("common.calendar.month")}${khmerMonths[d.getMonth()]} ${t("common.calendar.year")}${toKhmerNum(d.getFullYear())}`;
        };

        // 1. Prepare Title and Summary Rows
        const title = `${t("guests.exportTitle")} - ${wedding?.groomName || '...'} ${t("common.constants.and")} ${wedding?.brideName || '...'}`;
        const dateStr = formatKhmerDate(wedding?.date);
        const summary = `${t("guests.summaryDate", { date: dateStr })}  |  ${t("guests.summaryTotal", { count: guests.length, unit: t("guests.personUnit") })}`;
        
        // 2. Prepare Table Headers and Data
        const headers = [t("guests.cols.no"), t("guests.cols.name"), t("guests.cols.location")];
        const rows = guests.sort((a: any, b: any) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0)).map((g: any, idx: number) => [
            g.sequenceNumber || (idx + 1),
            g.name,
            g.group || g.source || t("guests.notSpecified")
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
        XLSX.utils.book_append_sheet(workbook, worksheet, t("guests.title"));
        
        const fileName = `MONEA_GuestList_${wedding?.groomName || 'Wedding'}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const copyLink = (name: string, guestId: string) => {
        if (!isPremium) {
            showToast({
                title: t("common.upgradeRequired", { defaultValue: "ទាមទារគណនី PRO" }),
                description: t("guests.upgradeToShare", { defaultValue: "សូមធ្វើការ Upgrade ទៅគណនី PRO ដើម្បីអាចចម្លង និងផ្ញើលីងធៀបទៅកាន់ភ្ញៀវរបស់អ្នកបាន។" }),
                type: "error",
                action: { label: t("guests.upgradeBtn", { defaultValue: "Upgrade Now" }), onClick: () => window.location.href = "/dashboard/upgrade" }
            });
            return;
        }
        
        if (!wedding?.id) return;
        const link = `${window.location.origin}/invite/${wedding.id}?to=${encodeURIComponent(name)}&g=${guestId}`;
        
        const isAnniversary = wedding.eventType === 'anniversary';
        const eventName = isAnniversary ? "កម្មវិធីភ្ជាប់ពាក្យ" : "កម្មវិធីមង្គលការ";
        
        const message = `សួស្តី ${name} 🤍\nយើងខ្ញុំសូមគោរពអញ្ជើញចូលរួម${eventName}របស់យើងខ្ញុំ។\n\nសូមចុចលីងខាងក្រោមដើម្បីមើលធៀបអញ្ជើញ និងទីតាំងកម្មវិធី៖\n${link}`;
        
        navigator.clipboard.writeText(message);
        setCopiedId(guestId);
        
        // Use the toast provider we added earlier to give feedback that the MESSAGE was copied, not just the link
        showToast({
            title: t("common.success") || "ជោគជ័យ",
            description: "សារអញ្ជើញត្រូវបានថតចម្លង (Copied) រួចរាល់។ លោកអ្នកអាចយកទៅផ្ញើ (Paste) ក្នុង Telegram ជូនភ្ញៀវបាន!",
            type: "success",
        });

        setTimeout(() => setCopiedId(null), 2000);
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = ""; // Clear title to hide from browser print header
        window.print();
        document.title = originalTitle;
    };

    const confirmDelete = async () => {
        if (!deleteGuest) return;
        const previousGuests = [...guests];
        const newGuests = guests.filter(g => g.id !== deleteGuest.id);
        setGuests(newGuests);
        setFilteredGuests(newGuests);
        const currentDeleteId = deleteGuest.id;
        setDeleteGuest(null);

        try {
            const res = await moneaClient.delete(`/api/guests?id=${currentDeleteId}`);
            if (res.error) throw new Error(res.error);
            
            showToast({
                title: t("common.success") || "ជោគជ័យ",
                description: t("guests.delete.success", { defaultValue: `ភ្ញៀវ ${deleteGuest.name} ត្រូវបានលុបចោលដោយជោគជ័យ។` }),
                type: "success",
            });
        } catch (e: any) {
            console.error(e);
            setGuests(previousGuests);
            setFilteredGuests(previousGuests);
            alert(t("guests.deleteError"));
        }
    };

    const isArchived = wedding?.status === 'ARCHIVED';
    
    // Smart isPremium check: Use actual data if available, fallback to cache while loading
    const currentPackage = wedding?.packageType || cachedPackageType;
    const isPremium = currentPackage === "PRO" || currentPackage === "PREMIUM";

    const setOpen = (v: boolean) => {
        // Prevent opening the "Add Guest" modal if limit reached
        if (v && !isPremium && guests.length >= 20 && !editingGuest) {
            showToast({
                title: t("common.upgradeRequired", { defaultValue: "ទាមទារគណនី PRO" }),
                description: t("guests.upgradeToLimit", { defaultValue: "គណនី Free អាចបញ្ចូលភ្ញៀវបានត្រឹម 20 នាក់ប៉ុណ្ណោះ។ សូមធ្វើការ Upgrade ទៅគណនី PRO ដើម្បីបញ្ចូលភ្ញៀវដោយគ្មានដែនកំណត់!" }),
                type: "error",
                action: { label: t("guests.upgradeBtn", { defaultValue: "Upgrade Now" }), onClick: () => window.location.href = "/dashboard/upgrade" }
            });
            return;
        }
        setOpenInternal(v);
    };

    return {
        guests,
        filteredGuests,
        wedding,
        search,
        setSearch,
        open,
        setOpen,
        loading,
        loadingMore,
        fetchMoreGuests,
        hasMore: pagination?.hasMore || false,
        visibleCount,
        setVisibleCount,
        copiedId,
        editingGuest,
        setEditingGuest,
        deleteGuest,
        setDeleteGuest,
        loadData,
        exportCSV,
        copyLink,
        handlePrint,
        confirmDelete,
        isArchived,
        isPremium
    };
}

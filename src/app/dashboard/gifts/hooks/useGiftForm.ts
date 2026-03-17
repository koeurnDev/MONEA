"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";

export const giftFormSchema = z.object({
    amount: z.string().min(1, "សូមបញ្ចូលចំនួនទឹកប្រាក់"),
    currency: z.enum(["USD", "KHR"]),
    method: z.string().optional(),
    guestId: z.string().optional(),
    guestName: z.string().optional(),
    source: z.string().optional(),
});

export type GiftFormValues = z.infer<typeof giftFormSchema>;

export function useGiftForm({ onSuccess, onDone, defaultCreate = false }: { onSuccess: () => void; onDone: () => void; defaultCreate?: boolean }) {
    const [loading, setLoading] = useState(false);
    const [guests, setGuests] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [offlineMode, setOfflineMode] = useState(false);
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [lastSavedValues, setLastSavedValues] = useState<{ currency: "USD" | "KHR"; method: string } | null>(null);
    const [paymentQrUrl, setPaymentQrUrl] = useState<string | null>(null);

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<{ name: string; amount: string; currency: string; source?: string; sequenceNumber?: number } | null>(null);

    const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

    const DRAFT_KEY = 'gift_form_draft';
    const QUEUE_KEY = 'gift_offline_queue';
    const PREF_KEY = 'gift_form_prefs';

    const form = useForm<GiftFormValues>({
        resolver: zodResolver(giftFormSchema),
        defaultValues: {
            amount: "",
            currency: "USD",
            method: "Cash",
            guestId: "",
            guestName: "",
            source: "",
        },
    });

    // Auto-save draft
    useEffect(() => {
        const subscription = form.watch((value) => {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
        });
        return () => subscription.unsubscribe();
    }, [form]);

    useEffect(() => {
        // Load Guests
        fetch("/api/guests")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setGuests(data);
                } else {
                    console.error("Guests API Error:", data);
                    setGuests([]);
                }
            })
            .catch(err => {
                console.error("Network Error - Using Offline Mode:", err);
                setGuests([]);
            });

        // Load QR Code Settings
        fetch("/api/wedding")
            .then(res => res.json())
            .then(data => {
                if (data?.themeSettings?.paymentQrUrl) {
                    setPaymentQrUrl(data.themeSettings.paymentQrUrl);
                }
            })
            .catch(err => console.error("Failed to load settings", err));

        // Load Preferences
        const savedPrefs = localStorage.getItem(PREF_KEY);
        if (savedPrefs) {
            setLastSavedValues(JSON.parse(savedPrefs));
        }

        // Load Draft
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (defaultCreate) {
            setIsCreatingNew(true);
            form.setValue("guestId", "new");
        } else if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                form.reset(draft);
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        } else if (savedPrefs) {
            const prefs = JSON.parse(savedPrefs);
            form.setValue('currency', prefs.currency);
            form.setValue('method', prefs.method);
        }

        // Check Offline Queue
        const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
        setOfflineQueue(queue);
    }, [defaultCreate, form]);

    function handleSelectGuest(guestId: string) {
        if (guestId === "new") {
            setIsCreatingNew(true);
            form.setValue("guestId", "new");
            form.setValue("guestName", searchQuery);
        } else {
            const guest = guests.find(g => g.id === guestId);
            if (guest) {
                setIsCreatingNew(false);
                form.setValue("guestId", guestId);
                form.setValue("guestName", guest.name);
                if (guest.source || guest.group) form.setValue("source", guest.source || guest.group);
            } else {
                setIsCreatingNew(false);
                form.setValue("guestId", "");
                form.setValue("guestName", "");
            }
        }
        setOpen(false);
        setSuggestions([]);
        setShowSuggestions(false);
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        form.setValue("guestName", value);

        if (form.getValues("guestId") !== "new") {
            form.setValue("guestId", "new");
        }

        if (value.length > 1) {
            const matches = guests.filter(g =>
                (g.name || "").toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
            setSuggestions(matches);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const syncOfflineGifts = async () => {
        if (offlineQueue.length === 0) return;

        setLoading(true);
        let currentQueue = [...offlineQueue];
        const failedQueue: any[] = [];
        let successCount = 0;

        for (const item of currentQueue) {
            try {
                const res = await fetch("/api/gifts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(item),
                });

                if (res.ok) {
                    successCount++;
                } else {
                    failedQueue.push(item);
                }
            } catch (e) {
                console.error("Sync failed for item", e);
                failedQueue.push(item);
            }
        }

        localStorage.setItem(QUEUE_KEY, JSON.stringify(failedQueue));
        setOfflineQueue(failedQueue);
        setLoading(false);

        if (failedQueue.length === 0) {
            setOfflineMode(false);
            setError(null);
            onSuccess();
            alert(`បានបញ្ចូលទិន្នន័យបាន ${successCount} ជោគជ័យ! 🎉`);
        } else {
            setError(`បានបញ្ចូល ${successCount} កាដូ។ នៅសល់ ${failedQueue.length} ទៀតបរាជ័យ។`);
        }
    };

    async function onSubmit(values: GiftFormValues, keepOpen: boolean) {
        setLoading(true);
        setError(null);
        setOfflineMode(false);

        const payload = {
            ...values,
            guestId: (values.guestId === "no-guest" || values.guestId === "") && !isCreatingNew ? null : values.guestId,
            createdAt: new Date().toISOString()
        };

        try {
            // Add timeout for better UX
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

            const res = await fetch("/api/gifts", {
                method: "POST",
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Server Error Response:", errorData);
                throw new Error(errorData.error || `Server error (${res.status})`);
            }

            const gift = await res.json();
            localStorage.removeItem(DRAFT_KEY);

            const newPrefs = { currency: values.currency, method: values.method || "Cash" };
            localStorage.setItem(PREF_KEY, JSON.stringify(newPrefs));
            setLastSavedValues(newPrefs);

            onSuccess();

            setReceiptData({
                name: values.guestName || "ភ្ញៀវមិនស្គាល់ឈ្មោះ",
                amount: values.amount,
                currency: values.currency,
                source: values.source,
                sequenceNumber: gift.sequenceNumber
            });
            setShowReceipt(true);

            form.reset({
                amount: "",
                currency: values.currency,
                method: values.method || "Cash",
                guestId: "",
                guestName: "",
                source: values.source || "",
            });
            setIsCreatingNew(false);
            setSearchQuery("");

            if (!keepOpen) {
                onDone();
            }
        } catch (err) {
            console.error("Submission failed:", err);
            const currentQueue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
            currentQueue.push(payload);
            localStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue));

            setOfflineQueue(currentQueue);
            setOfflineMode(true);
            setError("ដាច់អ៊ីនធឺណិត! កាដូត្រូវបានរក្សាទុកក្នុងទូរស័ព្ទ");
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = (e: React.FormEvent, keepOpen: boolean = false) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit(async (values) => {
            await onSubmit(values, keepOpen);
        })();
    };

    // Derived states
    const filteredGuests = guests.filter(g =>
        (g.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const closeReceipt = () => {
        setShowReceipt(false);
        setReceiptData(null);
    };

    return {
        form,
        loading,
        error,
        offlineMode,
        offlineQueue,
        paymentQrUrl,
        showReceipt,
        receiptData,
        searchQuery,
        setSearchQuery,
        suggestions,
        showSuggestions,
        setShowSuggestions,
        handleSelectGuest,
        handleNameChange,
        handleSubmit,
        syncOfflineGifts,
        onSubmit,
        closeReceipt,
        filteredGuests,
    };
}

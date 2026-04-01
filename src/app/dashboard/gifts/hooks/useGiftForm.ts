"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { moneaClient } from "@/lib/api-client";

export const createGiftFormSchema = (t: any) => z.object({
    amount: z.string().min(1, t("gifts.form.amountRequired") || "Please enter amount"),
    currency: z.enum(["USD", "KHR"]),
    method: z.string().optional(),
    guestId: z.string().optional(),
    guestName: z.string().optional(),
    source: z.string().optional(),
});

export type GiftFormValues = z.infer<ReturnType<typeof createGiftFormSchema>>;

export function useGiftForm({ onSuccess, onDone, defaultCreate = false }: { onSuccess: () => void; onDone: () => void; defaultCreate?: boolean }) {
    const { t } = useTranslation();
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
        resolver: zodResolver(createGiftFormSchema(t)),
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
        moneaClient.get<any>("/api/guests?limit=1000")
            .then(res => {
                if (res.data?.items) {
                    setGuests(res.data.items);
                } else if (Array.isArray(res.data)) {
                    setGuests(res.data);
                } else {
                    console.error("Guests API Error:", res.error || res.data);
                    setGuests([]);
                }
            })
            .catch(err => {
                console.error("Network Error - Using Offline Mode:", err);
                setGuests([]);
            });

        // Load QR Code Settings
        moneaClient.get<any>("/api/wedding")
            .then(res => {
                if (res.data?.themeSettings?.paymentQrUrl) {
                    setPaymentQrUrl(res.data.themeSettings.paymentQrUrl);
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
            form.setValue("guestName", "");
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
                const res = await moneaClient.post<any>("/api/gifts", item);

                if (!res.error) {
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
            alert(t("gifts.form.syncSuccess", { count: successCount }));
        } else {
            setError(t("gifts.form.syncPartial", { success: successCount, failed: failedQueue.length }));
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
            const res = await moneaClient.post<any>("/api/gifts", payload);

            if (res.error) {
                console.error("Server Error Response:", res.error);
                throw new Error(res.error);
            }

            const gift = res.data;
            localStorage.removeItem(DRAFT_KEY);

            const newPrefs = { currency: values.currency, method: values.method || "Cash" };
            localStorage.setItem(PREF_KEY, JSON.stringify(newPrefs));
            setLastSavedValues(newPrefs);

            onSuccess();

            setReceiptData({
                name: values.guestName || t("gifts.table.unknown"),
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
            setError(t("gifts.form.offlineAlert"));
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

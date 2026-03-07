"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Search, Plus, Activity, Users, User, CreditCard } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import Image from "next/image";

const formSchema = z.object({
    amount: z.string().min(1, "សូមបញ្ចូលចំនួនទឹកប្រាក់"),
    currency: z.enum(["USD", "KHR"]),
    method: z.string().optional(),
    guestId: z.string().optional(),
    guestName: z.string().optional(),
    source: z.string().optional(),
});

export function GiftForm({ onSuccess, onDone, defaultCreate = false }: { onSuccess: () => void; onDone: () => void; defaultCreate?: boolean }) {
    const [loading, setLoading] = useState(false);
    const [guests, setGuests] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [offlineMode, setOfflineMode] = useState(false);
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [lastSavedValues, setLastSavedValues] = useState<{ currency: "USD" | "KHR"; method: string } | null>(null);
    const [paymentQrUrl, setPaymentQrUrl] = useState<string | null>(null);
    const [showQr, setShowQr] = useState(false);

    // Ref for auto-focus
    const guestTriggerRef = useRef<HTMLButtonElement>(null);

    const nameInputRef = useRef<HTMLInputElement | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const DRAFT_KEY = 'gift_form_draft';
    const QUEUE_KEY = 'gift_offline_queue';
    const PREF_KEY = 'gift_form_prefs';

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

        // Load Preferences (Last used Currency/Method)
        const savedPrefs = localStorage.getItem(PREF_KEY);
        if (savedPrefs) {
            setLastSavedValues(JSON.parse(savedPrefs));
        }

        // Load Draft (only if exists, override prefs)
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
    }, [defaultCreate]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
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
    }, [form.watch]);

    function handleSelectGuest(guestId: string) {
        if (guestId === "new") {
            setIsCreatingNew(true);
            form.setValue("guestId", "new");
            form.setValue("guestName", searchQuery);
        } else {
            const guest = guests.find(g => g.id === guestId);
            if (guest) {
                // Determine if we should switch to "Creating New" mode with pre-filled data 
                // OR just link the ID. Use linking for now.
                setIsCreatingNew(false);
                form.setValue("guestId", guestId);
                form.setValue("guestName", guest.name); // Visually show name
                if (guest.source || guest.group) form.setValue("source", guest.source || guest.group);
            } else {
                // Clear
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

        // If we are typing, we are effectively "creating new" until we pick an existing one
        // OR we are searching. 
        // Logic: Always set guestId to "new" (or empty) when typing manually, 
        // unless they click a suggestion.
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

    // Two modes of submission
    const handleSubmit = (e: React.FormEvent, keepOpen: boolean = false) => {
        e.preventDefault();
        e.stopPropagation(); // Stop propagation to prevent default form submission if called from button click

        form.handleSubmit(async (values) => {
            await onSubmit(values, keepOpen);
        })();
    };

    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<{ name: string; amount: string; currency: string; source?: string } | null>(null);

    // ... (existing code)

    const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

    // Check queue on mount
    useEffect(() => {
        const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
        setOfflineQueue(queue);
    }, []);

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

    async function onSubmit(values: z.infer<typeof formSchema>, keepOpen: boolean) {
        setLoading(true);
        setError(null);
        setOfflineMode(false);

        const payload = {
            ...values,
            guestId: (values.guestId === "no-guest" || values.guestId === "") && !isCreatingNew ? null : values.guestId,
            createdAt: new Date().toISOString()
        };

        try {
            const res = await fetch("/api/gifts", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Server responded with an error");
            }

            // Success
            localStorage.removeItem(DRAFT_KEY);

            // Save preferences
            const newPrefs = { currency: values.currency, method: values.method || "Cash" };
            localStorage.setItem(PREF_KEY, JSON.stringify(newPrefs));
            setLastSavedValues(newPrefs);

            onSuccess(); // Refresh list

            // SHOW RECEIPT & RESET PRIVACY
            setReceiptData({
                name: values.guestName || "ភ្ញៀវមិនស្គាល់ឈ្មោះ",
                amount: values.amount,
                currency: values.currency,
                source: values.source
            });
            setShowReceipt(true);

            // Always reset the form logic immediately behind the modal
            form.reset({
                amount: "", // CLEAR AMOUNT FOR PRIVACY
                currency: values.currency,
                method: values.method || "Cash",
                guestId: "",
                guestName: "",
                source: values.source || "", // Keep Source/Group for next entry transparency (requested)
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

            // Update state to show sync button immediately
            setOfflineQueue(currentQueue);

            setOfflineMode(true);
            setError("ដាច់អ៊ីនធឺណិត! កាដូត្រូវបានរក្សាទុកក្នុងទូរស័ព្ទ"); // Connection failed
        } finally {
            setLoading(false);
        }
    }

    // Close Receipt -> Focus for next input
    const closeReceipt = () => {
        setShowReceipt(false);
        setReceiptData(null);
        // Focus back on Guest Name for next entry
        setTimeout(() => {
            if (defaultCreate) {
                nameInputRef.current?.focus();
            } else {
                guestTriggerRef.current?.focus();
            }
        }, 100);
    };

    // Filter guests based on search
    const filteredGuests = guests.filter(g =>
        (g.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedGuest = guests.find(g => g.id === form.getValues("guestId"));

    return (
        <Form {...form}>
            {/* Receipt Modal */}
            <Dialog open={showReceipt} onOpenChange={(open) => !open && closeReceipt()}>
                <DialogContent className="sm:max-w-md bg-card text-center p-5 md:p-8 flex flex-col items-center justify-center space-y-4">
                    <DialogTitle className="sr-only">Submission Successful</DialogTitle>
                    <DialogDescription className="sr-only">
                        Details of the successfully recorded gift.
                    </DialogDescription>
                    <div className="rounded-full bg-emerald-500/10 p-2 md:p-3">
                        <Check className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-foreground">បានទទួលជោគជ័យ</h2>
                        <p className="text-muted-foreground">កាដូត្រូវបានកត់ត្រាចូលក្នុងប្រព័ន្ធ</p>
                    </div>

                    {receiptData && (
                        <div className="w-full bg-muted/30 rounded-xl p-6 border border-border my-4">
                            <p className="text-sm text-muted-foreground mb-1">ទទួលបានពី</p>
                            <h3 className="text-2xl font-bold text-foreground mb-4 font-kantumruy">{receiptData.name}</h3>

                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-3xl md:text-4xl font-extrabold text-blue-600">
                                    {receiptData.currency === "USD" ? "$" : ""}
                                    {parseFloat(receiptData.amount).toLocaleString()}
                                    {receiptData.currency === "KHR" ? "ល" : ""}
                                </span>
                                <span className="text-gray-400 font-medium">{receiptData.currency}</span>
                            </div>
                            {receiptData.source && (
                                <p className="text-sm text-gray-400 mt-2">📍 {receiptData.source}</p>
                            )}
                        </div>
                    )}

                    <Button
                        onClick={closeReceipt}
                        className="w-full h-11 md:h-12 text-lg bg-blue-600 hover:bg-blue-700 font-bold"
                        autoFocus
                    >
                        បិទ & បន្តទៅអ្នកបន្ទាប់
                    </Button>
                </DialogContent>
            </Dialog>

            <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">

                {offlineQueue.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-md flex items-center justify-between animate-in slide-in-from-top-2 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📡</span>
                            <div className="leading-tight">
                                <p className="font-bold">អ្នកមានកាដូ {offlineQueue.length} ដែលមិនទាន់បញ្ចូល</p>
                                <p className="text-xs text-orange-600">បានរក្សាទុកក្នុងទូរស័ព្ទពេលដាច់អ៊ីនធឺណិត</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={syncOfflineGifts}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                            disabled={loading}
                        >
                            {loading ? "កំពុងបញ្ចូល..." : "បញ្ចូលទិន្នន័យ (Sync) ↻"}
                        </Button>
                    </div>
                )}
                {/* Existing Form Content... */}
                {/* ... (rest of the form remains the same, wrapped in fragments if needed but <Form> handles it) ... */}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-semibold font-kantumruy">
                            ⚠️ {error}
                        </div>
                        <p className="text-xs text-red-500 font-kantumruy">
                            ទិន្នន័យមានសុវត្ថិភាពក្នុងទូរស័ព្ទរបស់អ្នក។ សូមពិនិត្យអ៊ីនធឺណិត រួចព្យាយាមម្ដងទៀត។
                        </p>
                        {offlineMode && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="self-end border-red-200 hover:bg-red-100 text-red-700 rounded-lg font-bold font-kantumruy"
                                onClick={form.handleSubmit((v) => onSubmit(v, false))}
                            >
                                ↺ ព្យាយាមម្ដងទៀត
                            </Button>
                        )}
                    </div>
                )}

                {/* Section 1: ព័ត៌មានភ្ញៀវ (Guest Information) */}
                <div className="space-y-4">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 px-1 mb-1">
                        <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                            <Users size={16} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground font-kantumruy leading-none">ព័ត៌មានភ្ញៀវ</h3>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Guest Identity</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 border border-border/50 rounded-[1.5rem] p-3 md:p-5">
                        <FormField
                            control={form.control}
                            name="guestName"
                            render={({ field }) => (
                                <FormItem className="relative flex-1">
                                    <FormLabel className="text-xs font-bold text-muted-foreground font-kantumruy ml-1">ឈ្មោះភ្ញៀវ *</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
                                            <Input
                                                placeholder=" Eg: លោក សុវណ្ណ..."
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleNameChange(e);
                                                }}
                                                ref={(e) => {
                                                    field.ref(e);
                                                    nameInputRef.current = e;
                                                }}
                                                className="h-9 md:h-12 pl-10 text-base rounded-xl font-kantumruy border-border/60 bg-background/50 backdrop-blur-sm shadow-sm focus-visible:ring-blue-500/20 transition-all font-medium"
                                                autoFocus={true}
                                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                autoComplete="off"
                                            />

                                            {/* Auto-suggest dropdown (Overlay) */}
                                            {showSuggestions && suggestions.length > 0 && (
                                                <div className="absolute z-50 w-full bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-2xl mt-2 max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="p-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/50 backdrop-blur-sm sticky top-0 z-10 border-b border-border/50">
                                                        សមាជិកមានស្រាប់
                                                    </div>
                                                    {suggestions.map((g) => (
                                                        <div
                                                            key={g.id}
                                                            className="px-4 py-2.5 border-b border-border/30 hover:bg-blue-600/5 cursor-pointer flex justify-between items-center group transition-colors"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                handleSelectGuest(g.id);
                                                            }}
                                                        >
                                                            <div>
                                                                <p className="font-bold text-foreground text-sm group-hover:text-blue-600 font-kantumruy">{g.name}</p>
                                                                {g.source && <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 font-kantumruy">
                                                                    📍 {g.source}
                                                                </p>}
                                                            </div>
                                                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center group-hover:bg-blue-600/10 group-hover:scale-110 transition-all text-muted-foreground group-hover:text-blue-600">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage className="font-kantumruy text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="source"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-muted-foreground font-kantumruy ml-1">មកពីណា? (ឧទាហរណ៍៖ កំពត...)</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="h-9 md:h-12 text-sm rounded-xl border-border/60 bg-background/50 backdrop-blur-sm font-kantumruy shadow-sm focus-visible:ring-blue-500/20" />
                                    </FormControl>
                                    <FormMessage className="font-kantumruy text-[10px]" />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 px-1 mb-1 mt-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <Activity size={16} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground font-kantumruy leading-none">ព័ត៌មានចំណងដៃ</h3>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Gift Details</p>
                        </div>
                    </div>

                    <div className="bg-muted/20 border border-border/50 rounded-[1.5rem] p-3 md:p-5 space-y-4">
                        <div className="grid grid-cols-5 gap-4">
                            <div className="col-span-3">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-muted-foreground font-kantumruy ml-1">ចំនួនទឹកប្រាក់ *</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        {...field}
                                                        className="h-11 md:h-14 text-lg md:text-2xl font-black rounded-xl border-border/60 bg-background/50 backdrop-blur-sm shadow-sm pl-4 pr-12 text-foreground focus-visible:ring-emerald-500/20 group-focus-within:border-emerald-500/50"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                handleSubmit(e, true);
                                                            }
                                                        }}
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-black pointer-events-none text-lg">
                                                        {form.watch("currency") === "USD" ? "$" : "៛"}
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-kantumruy text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-muted-foreground font-kantumruy ml-1">រូបិយប័ណ្ណ</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-1.5 bg-background/50 p-1 rounded-xl border border-border/60 backdrop-blur-sm h-11 md:h-14">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className={cn(
                                                            "flex-1 h-full rounded-lg font-black text-sm transition-all",
                                                            field.value === "USD"
                                                                ? "bg-emerald-600 text-white shadow-sm"
                                                                : "text-muted-foreground hover:bg-muted"
                                                        )}
                                                        onClick={() => field.onChange("USD")}
                                                    >
                                                        USD
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className={cn(
                                                            "flex-1 h-full rounded-lg font-black text-xs md:text-sm transition-all font-kantumruy",
                                                            field.value === "KHR"
                                                                ? "bg-blue-600 text-white shadow-sm"
                                                                : "text-muted-foreground hover:bg-muted"
                                                        )}
                                                        onClick={() => field.onChange("KHR")}
                                                    >
                                                        ៛ KHR
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-kantumruy text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-muted-foreground font-kantumruy ml-1">បានទទួលតាមរយៈ</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-9 md:h-12 rounded-xl text-sm font-bold bg-background/50 backdrop-blur-sm border-border/60 shadow-sm text-foreground font-kantumruy focus:ring-blue-500/20 transition-all">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl border-border bg-card/95 backdrop-blur-md shadow-2xl font-kantumruy font-bold border-none ring-1 ring-border">
                                            <SelectItem value="Cash">សាច់ប្រាក់ផ្ទាល់ (Cash)</SelectItem>
                                            <SelectItem value="ABA">ABA Bank</SelectItem>
                                            <SelectItem value="Wing">Wing Bank</SelectItem>
                                            <SelectItem value="ACLEDA">ACLEDA Bank</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="font-kantumruy text-[10px]" />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                    <Button
                        type="button"
                        disabled={loading}
                        onClick={(e) => handleSubmit(e, true)}
                        className={`flex-1 h-11 md:h-14 rounded-2xl font-black font-kantumruy text-base md:text-lg transition-all border-none active:scale-[0.98] ${offlineMode
                            ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-[0_10px_30px_-10px_rgba(249,115,22,0.5)]'
                            : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)]'
                            } text-white`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>រក្សាទុក...</span>
                            </div>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                រក្សាទុក & ថែមទៀត <Plus className="w-5 h-5 opacity-50" />
                            </span>
                        )}
                    </Button>
                    <Button
                        type="button"
                        disabled={loading}
                        variant="outline"
                        onClick={(e) => handleSubmit(e, false)}
                        className="flex-1 sm:flex-none h-11 md:h-14 px-8 rounded-2xl font-black font-kantumruy border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all text-sm md:text-base border-2"
                    >
                        {loading ? "..." : "រក្សាទុក & បិទផ្ទាំង"}
                    </Button>
                </div>
            </form>

            {/* Persistent QR Code Section (Always visible if URL exists) */}
            {
                paymentQrUrl && (
                    <div className="mt-6 border-t border-border pt-6">
                        <div className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col items-center shadow-sm">
                            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 font-kantumruy">
                                <span>ឰ QR សម្រាប់ស្កេន</span>
                            </p>

                            {/* Click to Expand/Zoom */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="relative w-48 h-48 bg-white rounded-lg overflow-hidden border border-border cursor-zoom-in hover:opacity-90 transition-opacity">
                                        <Image
                                            src={paymentQrUrl}
                                            alt="Payment QR"
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8 bg-card">
                                    <VisuallyHidden.Root>
                                        <DialogTitle>ស្កេន QR កូដ (Scan Payment QR)</DialogTitle>
                                        <DialogDescription>
                                            ពង្រីក QR កូដសម្រាប់ការទូទាត់ (Enlarged QR code for payment)
                                        </DialogDescription>
                                    </VisuallyHidden.Root>
                                    <div className="relative w-full max-w-[300px] aspect-square bg-white rounded-xl p-4">
                                        <Image
                                            src={paymentQrUrl}
                                            alt="Payment QR Full"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <p className="mt-4 text-center font-bold text-lg font-kantumruy text-foreground">ស្កេនដើម្បីទូទាត់</p>
                                </DialogContent>
                            </Dialog>

                            <p className="text-xs text-muted-foreground mt-2 text-center max-w-[200px] font-kantumruy">
                                បង្ហាញ QR នេះជូនភ្ញៀវប្រសិនបើពួកគាត់ចង់វេរលុយ
                            </p>
                        </div>
                    </div>
                )
            }
        </Form >
    );
}


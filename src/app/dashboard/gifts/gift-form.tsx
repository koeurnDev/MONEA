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
import { Check, ChevronsUpDown, Search, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
                <DialogContent className="sm:max-w-md bg-white text-center p-8 flex flex-col items-center justify-center space-y-4">
                    <DialogTitle className="sr-only">Submission Successful</DialogTitle>
                    <DialogDescription className="sr-only">
                        Details of the successfully recorded gift.
                    </DialogDescription>
                    <div className="rounded-full bg-green-100 p-3">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-900">បានទទួលជោគជ័យ</h2>
                        <p className="text-gray-500">កាដូត្រូវបានកត់ត្រាចូលក្នុងប្រព័ន្ធ</p>
                    </div>

                    {receiptData && (
                        <div className="w-full bg-gray-50 rounded-xl p-6 border border-gray-100 my-4">
                            <p className="text-sm text-gray-500 mb-1">ទទួលបានពី</p>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 font-kantumruy">{receiptData.name}</h3>

                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-extrabold text-blue-600">
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
                        className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 font-bold"
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
                {/* Wait, I cannot easily replace the ENTIRE return block safely in one go without context of lines. 
               The instruction was "Add Receipt Dialog logic and UI". 
               I will wrap the existing form in the Fragment and put Dialog above it.
            */}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-semibold">
                            ⚠️ {error}
                        </div>
                        <p className="text-xs text-red-500">
                            ទិន្នន័យមានសុវត្ថិភាពក្នុងទូរស័ព្ទរបស់អ្នក។ សូមពិនិត្យអ៊ីនធឺណិត រួចព្យាយាមម្ដងទៀត។
                        </p>
                        {offlineMode && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="self-end border-red-200 hover:bg-red-100 text-red-700"
                                onClick={form.handleSubmit((v) => onSubmit(v, false))}
                            >
                                ↺ ព្យាយាមម្ដងទៀត
                            </Button>
                        )}
                    </div>
                )}

                <div className="space-y-4">
                    {!defaultCreate && (
                        <FormField
                            control={form.control}
                            name="guestId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>ឈ្មោះអ្នកផ្តល់ (Guest)</FormLabel>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    ref={guestTriggerRef}
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={open}
                                                    className={cn(
                                                        "w-full justify-between bg-white h-14 text-lg font-medium",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {isCreatingNew ? (
                                                        <span>កំពុងបង្កើត: <span className="font-bold text-blue-600">{form.watch("guestName")}</span></span>
                                                    ) : selectedGuest ? (
                                                        selectedGuest.name
                                                    ) : (
                                                        "ស្វែងរក ឬ បង្កើតភ្ញៀវថ្មី"
                                                    )}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0" align="start">
                                            <div className="p-2 border-b">
                                                <Input
                                                    placeholder="បញ្ចូលឈ្មោះដើម្បីស្វែងរក..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="h-12 text-lg shadow-none border-0 focus-visible:ring-0"
                                                />
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto p-1">
                                                <div
                                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-gray-500"
                                                    onClick={() => handleSelectGuest("")}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                                                    សម្អាត
                                                </div>

                                                {filteredGuests.map((guest) => (
                                                    <div
                                                        key={guest.id}
                                                        className={cn(
                                                            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                            guest.id === field.value && "bg-accent/50"
                                                        )}
                                                        onClick={() => handleSelectGuest(guest.id)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                guest.id === field.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {guest.name}
                                                    </div>
                                                ))}

                                                {searchQuery && (
                                                    <div
                                                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium border-t border-blue-100 mt-1"
                                                        onClick={() => handleSelectGuest("new")}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        បង្កើតថ្មី: &quot;{searchQuery}&quot;
                                                    </div>
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {(isCreatingNew || defaultCreate) && (
                        <div className={cn("grid grid-cols-1 gap-2", !defaultCreate && "p-3 bg-slate-50 rounded-lg border border-slate-200 animate-in slide-in-from-top-2")}>
                            <FormField
                                control={form.control}
                                name="guestName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={cn("text-xs", defaultCreate && "text-base font-semibold text-gray-700")}>ឈ្មោះភ្ញៀវ</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    placeholder="ឈ្មោះ"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        handleNameChange(e);
                                                    }}
                                                    ref={(e) => {
                                                        field.ref(e);
                                                        nameInputRef.current = e;
                                                    }}
                                                    className={cn("h-13 text-lg")}
                                                    autoFocus={defaultCreate}
                                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                    autoComplete="off"
                                                />
                                                {showSuggestions && suggestions.length > 0 && (
                                                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-auto animate-in fade-in zoom-in-95 duration-100">
                                                        {suggestions.map((g) => (
                                                            <div
                                                                key={g.id}
                                                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center group border-b border-gray-50 last:border-0"
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault(); // Prevent blur
                                                                    handleSelectGuest(g.id);
                                                                }}
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-gray-900 group-hover:text-blue-700">{g.name}</p>
                                                                    {g.source && <p className="text-xs text-gray-500">{g.source}</p>}
                                                                </div>
                                                                <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600">
                                                                    មានស្រាប់
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="source"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-gray-600">មកពីណា?</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: កំពត, កែប..." {...field} className="h-12 text-lg" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ចំនួនទឹកប្រាក់</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        className="h-14 text-xl font-bold"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleSubmit(e, true); // Submit and Keep Open (Add Another)
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>រូបិយប័ណ្ណ</FormLabel>
                                <FormControl>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={field.value === "USD" ? "default" : "outline"}
                                            className={cn("flex-1", field.value === "USD" && "bg-green-600 hover:bg-green-700")}
                                            onClick={() => field.onChange("USD")}
                                        >
                                            $ USD
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={field.value === "KHR" ? "default" : "outline"}
                                            className={cn("flex-1", field.value === "KHR" && "bg-blue-600 hover:bg-blue-700")}
                                            onClick={() => field.onChange("KHR")}
                                        >
                                            ៛ KHR
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>វិធីសាស្ត្រ</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Cash">សាច់ប្រាក់</SelectItem>
                                    <SelectItem value="ABA">ABA</SelectItem>
                                    <SelectItem value="Wing">Wing</SelectItem>
                                    <SelectItem value="ACLEDA">ACLEDA</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        disabled={loading}
                        onClick={(e) => handleSubmit(e, true)}
                        className={`flex-1 bg-red-900 hover:bg-red-800 ${offlineMode ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                    >
                        {loading ? "..." : "រក្សាទុក & ថែមទៀត"}
                    </Button>
                    <Button
                        type="button"
                        disabled={loading}
                        variant="outline"
                        onClick={(e) => handleSubmit(e, false)}
                        className="flex-1"
                    >
                        {loading ? "..." : "រក្សាទុក & បិទ"}
                    </Button>
                </div>
            </form>

            {/* Persistent QR Code Section (Always visible if URL exists) */}
            {paymentQrUrl && (
                <div className="mt-6 border-t pt-6">
                    <div className="bg-white border rounded-xl p-4 flex flex-col items-center shadow-sm">
                        <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <span>ឰ QR សម្រាប់ស្កេន</span>
                        </p>

                        {/* Click to Expand/Zoom */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="relative w-48 h-48 bg-white rounded-lg overflow-hidden border cursor-zoom-in hover:opacity-90 transition-opacity">
                                    <img
                                        src={paymentQrUrl}
                                        alt="Payment QR"
                                        className="w-full h-full object-contain p-2"
                                    />
                                </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8 bg-white">
                                <DialogTitle className="sr-only">Payment QR Full</DialogTitle>
                                <DialogDescription className="sr-only">
                                    Enlarged view of the payment QR code.
                                </DialogDescription>
                                <img
                                    src={paymentQrUrl}
                                    alt="Payment QR Full"
                                    className="w-full max-w-[300px] h-auto object-contain"
                                />
                                <p className="mt-4 text-center font-bold text-lg">ស្កេនដើម្បីទូទាត់</p>
                            </DialogContent>
                        </Dialog>

                        <p className="text-xs text-gray-500 mt-2 text-center max-w-[200px]">
                            បង្ហាញ QR នេះជូនភ្ញៀវប្រសិនបើពួកគាត់ចង់វេរលុយ
                        </p>
                    </div>
                </div>
            )}
        </Form>
    );
}

// Ensure Dialog imports are added at the top
// Currently GiftForm imports: Button, Form..., Input, etc.
// Need to add Dialog imports if not present.
// Note: checking existing imports... Dialog is NOT imported in original file.
// We must add imports or this will fail.
// Since I can't edit imports easily with this chunk, I should do a separate edit for imports first or use a bigger chunk.
// I'll stick to replacing the render for now, but I MUST add imports.
// Wait, I can use a multi-step approach.
// Step 1: Add Dialog imports.
// Step 2: Add Logic hook.
// Step 3: Add JSX.
// This chunk is for JSX. I will assume I will add imports in next step or use `multi_replace`.
// Actually, I should use `multi_replace` to do it all at once to be safe.


"use client";

import { useRef } from "react";
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
import { Check, Search, Plus, Activity, Users } from "lucide-react";
import { cn, khmerToEnglishNumbers } from "@/lib/utils";
import { useGiftForm } from "./hooks/useGiftForm";
import { ReceiptModal } from "./components/ReceiptModal";
import { PaymentQrView } from "./components/PaymentQrView";
import { useTranslation } from "@/i18n/LanguageProvider";

export function GiftForm({ onSuccess, onDone, defaultCreate = false }: { onSuccess: () => void; onDone: () => void; defaultCreate?: boolean }) {
    const { t } = useTranslation();
    const {
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
    } = useGiftForm({ onSuccess, onDone, defaultCreate });

    const nameInputRef = useRef<HTMLInputElement | null>(null);

    return (
        <Form {...form}>
            {/* Extracted Receipt Modal */}
            <ReceiptModal
                open={showReceipt}
                onClose={() => {
                    closeReceipt();
                    setTimeout(() => nameInputRef.current?.focus(), 100);
                }}
                receiptData={receiptData}
            />

            <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">

                {offlineQueue.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-md flex items-center justify-between animate-in slide-in-from-top-2 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📡</span>
                            <div className="leading-tight">
                                <p className="font-bold">{t("gifts.form.offlineAlert")}</p>
                                <p className="text-xs text-orange-600">({offlineQueue.length})</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={syncOfflineGifts}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                            disabled={loading}
                        >
                            {loading ? t("gifts.form.saving") : t("gifts.actions.live") + " ↻"}
                        </Button>
                    </div>
                )}

                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-semibold font-kantumruy">
                            ⚠️ {error}
                        </div>
                        {offlineMode && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="self-end border-rose-200 hover:bg-rose-100 text-rose-700 rounded-lg font-bold font-kantumruy"
                                onClick={form.handleSubmit((v) => onSubmit(v, false))}
                            >
                                ↺ {t("common.auth.back")}
                            </Button>
                        )}
                    </div>
                )}

                {/* Section 1: Guest Information */}
                <div className="space-y-4">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 px-1 mb-1">
                        <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                            <Users size={16} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground font-kantumruy leading-none">{t("gifts.form.guestInfo")}</h3>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{t("gifts.form.guestIdentity")}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 border border-border/50 rounded-[1.5rem] p-3 md:p-5">
                        <FormField
                            control={form.control}
                            name="guestName"
                            render={({ field }) => (
                                <FormItem className="relative flex-1">
                                    <FormLabel className="text-xs font-bold text-muted-foreground font-kantumruy ml-1">{t("gifts.form.name")} *</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
                                            <Input
                                                placeholder={t("gifts.form.namePlaceholder")}
                                                {...field}
                                                onChange={(e) => {
                                                    const converted = khmerToEnglishNumbers(e.target.value);
                                                    e.target.value = converted;
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
                                                        {t("gifts.form.memberExists")}
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
                                    <FormLabel className="text-xs font-bold text-muted-foreground font-kantumruy ml-1">{t("gifts.table.source")} ({t("gifts.form.sourcePlaceholder")})</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            className="h-9 md:h-12 text-sm rounded-xl border-border/60 bg-background/50 backdrop-blur-sm font-kantumruy shadow-sm focus-visible:ring-blue-500/20" 
                                            onChange={(e) => {
                                                const converted = khmerToEnglishNumbers(e.target.value);
                                                field.onChange(converted);
                                            }}
                                        />
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
                            <h3 className="text-base font-bold text-foreground font-kantumruy leading-none">{t("gifts.form.giftDetails")}</h3>
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
                                            <FormLabel className="text-xs font-bold text-muted-foreground font-kantumruy ml-1">{t("gifts.form.amount")} *</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder="0.00"
                                                        {...field}
                                                        className="h-11 md:h-14 text-lg md:text-2xl font-black rounded-xl border-border/60 bg-background/50 backdrop-blur-sm shadow-sm pl-4 pr-12 text-foreground focus-visible:ring-emerald-500/20 group-focus-within:border-emerald-500/50"
                                                        onChange={(e) => {
                                                            const val = khmerToEnglishNumbers(e.target.value).replace(/[^0-9.]/g, "");
                                                            field.onChange(val);
                                                        }}
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
                                            <FormLabel className="text-xs font-bold text-muted-foreground font-kantumruy ml-1">{t("gifts.form.currency")}</FormLabel>
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
                                    <FormLabel className="text-xs font-bold text-muted-foreground font-kantumruy ml-1">{t("gifts.form.receivedVia")}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || "Cash"}>
                                        <FormControl>
                                            <SelectTrigger className="h-9 md:h-12 rounded-xl text-sm font-bold bg-background/50 backdrop-blur-sm border-border/60 shadow-sm text-foreground font-kantumruy focus:ring-blue-500/20 transition-all">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl border-border bg-card/95 backdrop-blur-md shadow-2xl font-kantumruy font-bold border-none ring-1 ring-border">
                                            <SelectItem value="Cash">{t("gifts.form.cashPlus")}</SelectItem>
                                            <SelectItem value="KHQR">{t("gifts.form.khqr")}</SelectItem>
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
                            : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 shadow-[0_10px_30px_-10px_rgba(225,29,72,0.5)]'
                            } text-white`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>{t("gifts.form.saving")}</span>
                            </div>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                {t("gifts.form.saveAndAddMore")} <Plus className="w-5 h-5 opacity-50" />
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
                        {loading ? "..." : t("gifts.form.saveAndClose")}
                    </Button>
                </div>
            </form>

            <PaymentQrView paymentQrUrl={paymentQrUrl} />
        </Form>
    );
}


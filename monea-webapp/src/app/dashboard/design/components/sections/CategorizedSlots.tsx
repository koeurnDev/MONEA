import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, User, Loader2, Eye, EyeOff, Check, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { PhotoImage } from "@/components/templates/shared/PhotoImage";

interface CategorizedSlotsProps {
    wedding: any;
    layout: any;
    isAnniv: boolean;
    getSlotAspectRatio: (idx: number) => number;
    setActiveSlotIdx: (idx: number) => void;
    slotInputRef: React.RefObject<HTMLInputElement>;
    removeGalleryItem: (idx: number) => void;
    updateTheme: (key: string, value: any) => void;
    slotUploading: boolean;
    slotProgress: number;
    activeSlotIdx: number | null;
    onStartUpload: () => void;
    t: any;
}

interface SlotMeta {
    index: number;
    title: string;
    locationHint: string;
    aspectRatioText: string;
    aspectRatioClass: string;
}

export const CategorizedSlots: React.FC<CategorizedSlotsProps> = ({
    wedding,
    layout,
    isAnniv,
    getSlotAspectRatio,
    setActiveSlotIdx,
    slotInputRef,
    removeGalleryItem,
    updateTheme,
    slotUploading,
    slotProgress,
    activeSlotIdx,
    onStartUpload,
    t
}) => {
    const [showAdvancedSlots, setShowAdvancedSlots] = useState(false);
    if (!layout) return null;

    const toggleSlotVisibility = (index: number) => {
        const hiddenSlots = new Set<number>(wedding.themeSettings?.hiddenPhotoSlots || []);
        if (hiddenSlots.has(index)) hiddenSlots.delete(index);
        else hiddenSlots.add(index);
        updateTheme("hiddenPhotoSlots", [...hiddenSlots].sort((a, b) => a - b));
    };

    const SLOT_CATEGORIES: {
        categoryTitle: string;
        icon: any;
        slots: SlotMeta[];
    }[] = [
        {
            categoryTitle: "រូបសំខាន់ៗលើធៀប",
            icon: Sparkles,
            slots: [
                {
                    index: 0,
                    title: "រូបក្របធំ",
                    locationHint: "ក្បាលធៀប",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                },
                {
                    index: 1,
                    title: "រូបគូ",
                    locationHint: "រាប់ថយក្រោយ និងប្រើជំនួសរូបផ្សេង",
                    aspectRatioText: "16:9",
                    aspectRatioClass: "aspect-[16/9]"
                },
                {
                    index: 2,
                    title: "រូបទីតាំងកម្មវិធី",
                    locationHint: "ទីតាំងកម្មវិធី",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                },
                {
                    index: 3,
                    title: "រូបចំណងដៃមង្គល",
                    locationHint: "ចំណងដៃមង្គល",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                },
                {
                    index: 6,
                    title: "រូបថតផ្តើមស្នេហ៍",
                    locationHint: "ផ្តើមស្នេហ៍",
                    aspectRatioText: "16:9",
                    aspectRatioClass: "aspect-[16/9]"
                },
                {
                    index: 4,
                    title: "រូបថ្លែងអំណរគុណ",
                    locationHint: "ថ្លែងអំណរគុណ",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                },
                {
                    index: 5,
                    title: "រូបបដាធៀបការ",
                    locationHint: "បដាអញ្ជើញ",
                    aspectRatioText: "16:9",
                    aspectRatioClass: "aspect-[16/9]"
                }
            ]
        },
        {
            categoryTitle: "រូបកូនកំលោះ និងកូនក្រមុំ",
            icon: User,
            slots: [
                {
                    index: 9,
                    title: isAnniv ? "រូបថតស្វាមី" : "រូបថតកូនកំលោះ",
                    locationHint: "រូបកូនកំលោះ",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                },
                {
                    index: 10,
                    title: isAnniv ? "រូបថតភរិយា" : "រូបថតកូនក្រមុំ",
                    locationHint: "រូបកូនក្រមុំ",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                }
            ]
        }
    ];
    const configuredSlots = SLOT_CATEGORIES.flatMap((category) => category.slots);
    const basicSlots = configuredSlots.filter((slot) => slot.index === 0 || slot.index === 1);
    const visibleCategories = showAdvancedSlots
        ? SLOT_CATEGORIES.map((category, index) => ({
            ...category,
            categoryTitle: index === 0 ? "រូបផ្នែកបន្ថែម" : category.categoryTitle,
        }))
        : [{
            ...SLOT_CATEGORIES[0],
            categoryTitle: "រូបសំខាន់ៗ",
            slots: basicSlots,
        }];
    const basicUploadedCount = basicSlots.filter((slot) => wedding.galleryItems?.[slot.index]?.url).length;
    const advancedCount = configuredSlots.length - basicSlots.length;

    return (
        <div className="space-y-3 sm:space-y-6 font-kantumruy">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-teal-200/70 bg-teal-50/70 px-3 py-3 dark:border-teal-500/20 dark:bg-teal-500/5">
                <p className="text-sm font-bold text-foreground">រូបសម្រាប់ផ្នែកនីមួយៗលើធៀប</p>
                <span className="shrink-0 rounded-full bg-white px-2.5 py-1.5 text-xs font-bold text-teal-700 dark:bg-white/10 dark:text-teal-300">
                    រូបសំខាន់ {basicUploadedCount}/{basicSlots.length}
                </span>
            </div>

            {visibleCategories.map((cat) => {
                const completedCount = cat.slots.filter((slot) => wedding.galleryItems?.[slot.index]?.url).length;
                return (
                <div
                    key={cat.categoryTitle}
                    role="region"
                    aria-label={cat.categoryTitle}
                    className="space-y-2 sm:space-y-3.5"
                >
                    <div className="space-y-1 border-b border-slate-200/80 pb-2 dark:border-white/10">
                        <div className="flex items-center justify-between gap-2">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                                <cat.icon className="h-4 w-4 flex-shrink-0 text-teal-500" />
                                <span>{cat.categoryTitle}</span>
                            </h4>
                            <span className="shrink-0 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                                {completedCount}/{cat.slots.length}
                            </span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-3">
                        {cat.slots.map((slot) => {
                            const item = wedding.galleryItems?.find((i: any, iidx: number) => iidx === slot.index);
                            const hasUrl = item && item.url;
                            const isVisible = !wedding.themeSettings?.hiddenPhotoSlots?.includes(slot.index);
                            const desktopAspectClass = slot.aspectRatioClass === "aspect-[16/9]"
                                ? "sm:aspect-video"
                                : slot.aspectRatioClass === "aspect-[4/3]"
                                    ? "sm:aspect-[4/3]"
                                    : "sm:aspect-[3/4]";

                            return (
                                <div
                                    key={slot.index}
                                    className="bg-[#171c22] p-3 sm:p-3 rounded-xl sm:rounded-[1.25rem] border border-white/10 shadow-sm flex flex-col justify-between gap-3 sm:gap-3"
                                >
                                    {/* Header & Badges */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h5 className="text-sm font-bold text-white line-clamp-2">
                                                {slot.title}
                                            </h5>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {hasUrl && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1.5 text-[11px] font-bold text-emerald-300">
                                                        <Check size={11} />
                                                        បានដាក់
                                                    </span>
                                                )}
                                                {hasUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSlotVisibility(slot.index)}
                                                        aria-pressed={isVisible}
                                                        aria-label={isVisible ? `លាក់ ${slot.title} ពីធៀប` : `បង្ហាញ ${slot.title} ក្នុងធៀប`}
                                                        title={isVisible ? "លាក់ពីធៀប" : "បង្ហាញក្នុងធៀប"}
                                                        className={clsx(
                                                            "inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-[11px] font-bold transition-colors",
                                                            isVisible ? "bg-teal-600 text-white" : "bg-slate-600 text-white"
                                                        )}
                                                    >
                                                        {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                                                        <span>{isVisible ? "លាក់" : "បង្ហាញ"}</span>
                                                    </button>
                                                )}
                                                <span className="text-[11px] px-2 py-1 rounded-full font-bold bg-slate-700 text-slate-100 font-mono">
                                                    {slot.aspectRatioText}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-xs text-teal-300 font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                                            <span className="leading-relaxed">{slot.locationHint}</span>
                                        </div>
                                    </div>

                                    {/* Upload Box / Image Display */}
                                    <div className={clsx(
                                        "relative w-full h-36 sm:h-auto aspect-auto rounded-lg sm:rounded-xl overflow-hidden bg-slate-50 dark:bg-black/20 border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-center group transition-all duration-200",
                                        desktopAspectClass,
                                        !hasUrl && "hover:border-teal-300 cursor-pointer"
                                    )}>
                                        {hasUrl ? (
                                            <>
                                                <PhotoImage src={item.url!} alt={slot.title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                
                                                {/* Mobile Direct Action Pills (Visible on Mobile, Hover on Desktop) */}
                                                <div className="absolute inset-x-2 bottom-2 z-10 flex sm:hidden items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            onStartUpload();
                                                            setActiveSlotIdx(slot.index);
                                                            slotInputRef.current?.click();
                                                        }}
                                                        className="flex-1 min-h-11 bg-black/80 backdrop-blur-md text-white py-2 px-3 rounded-lg font-bold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                                                    >
                                                        <Plus size={12} />
                                                        <span>ប្តូររូប</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryItem(slot.index)}
                                                        className="min-h-11 bg-rose-600/95 backdrop-blur-md text-white py-2 px-3 rounded-lg font-bold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                                                    >
                                                        <Trash2 size={12} />
                                                        <span>លុប</span>
                                                    </button>
                                                </div>

                                                {/* Desktop Hover Overlay */}
                                                <div className="hidden sm:flex absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 items-center justify-center gap-2 backdrop-blur-[2px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            onStartUpload();
                                                            setActiveSlotIdx(slot.index);
                                                            slotInputRef.current?.click();
                                                        }}
                                                        className="bg-white text-slate-900 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md hover:bg-teal-600 hover:text-white transition-all flex items-center gap-1"
                                                    >
                                                        <Plus size={13} />
                                                        <span>ប្តូររូប</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryItem(slot.index)}
                                                        className="bg-rose-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-md hover:bg-rose-700 transition-all flex items-center gap-1"
                                                    >
                                                        <Trash2 size={13} />
                                                        <span>លុប</span>
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <button 
                                                type="button"
                                                disabled={slotUploading}
                                                onClick={() => {
                                                    onStartUpload();
                                                    setActiveSlotIdx(slot.index);
                                                    slotInputRef.current?.click();
                                                }} 
                                                className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 text-center disabled:opacity-50 group outline-none"
                                            >
                                                {slotUploading && activeSlotIdx === slot.index ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                                                        <span className="text-xs font-bold text-teal-500">{slotProgress}%</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div                                                         className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Plus size={18} strokeWidth={2.5} />
                                                        </div>
                                                        <span className="text-sm text-foreground font-bold block group-hover:text-teal-600">
                                                            ចុចបញ្ចូលរូបភាព
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <button
                            type="button"
                            aria-expanded={showAdvancedSlots}
                            onClick={() => setShowAdvancedSlots((visible) => !visible)}
                            className="flex min-h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-[#171c22] px-4 py-3 text-left text-sm font-bold text-slate-100 transition-colors hover:border-teal-500/40"
                        >
                            <span>{showAdvancedSlots ? "លាក់រូបផ្នែកបន្ថែម" : `រូបតាមផ្នែកផ្សេងៗ (${advancedCount})`}</span>
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showAdvancedSlots ? "rotate-180" : ""}`} />
                        </button>
                    </div>
                </div>
                );
            })}
        </div>
    );
};

import React from 'react';
import { Label } from "@/components/ui/label";
import { m } from "framer-motion";
import { Plus, Trash2, Sparkles, Heart, User, Image as ImageIcon, Loader2, Info } from "lucide-react";
import clsx from "clsx";

interface CategorizedSlotsProps {
    wedding: any;
    layout: any;
    isAnniv: boolean;
    getSlotAspectRatio: (idx: number) => number;
    setActiveSlotIdx: (idx: number) => void;
    slotInputRef: React.RefObject<HTMLInputElement>;
    removeGalleryItem: (idx: number) => void;
    slotUploading: boolean;
    slotProgress: number;
    activeSlotIdx: number | null;
    t: any;
}

interface SlotMeta {
    index: number;
    title: string;
    description: string;
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
    slotUploading,
    slotProgress,
    activeSlotIdx,
    t
}) => {
    if (!layout) return null;

    const SLOT_CATEGORIES: {
        categoryTitle: string;
        categoryDesc: string;
        icon: any;
        slots: SlotMeta[];
    }[] = [
        {
            categoryTitle: "រូបភាពសំខាន់ៗលើធៀប (Main Sections Photos)",
            categoryDesc: "រូបភាពដែលបង្ហាញនៅផ្នែកក្បាលទំព័រ រាប់ថយក្រោយ ទីតាំង និងចំណងដៃ",
            icon: Sparkles,
            slots: [
                {
                    index: 0,
                    title: "រូបក្របធំ (Hero Cover)",
                    description: "រូបថតគូស្នេហ៍ Pre-wedding ក្បាលទំព័រធំ Full Screen",
                    locationHint: "ក្បាលទំព័រ (Hero)",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                },
                {
                    index: 1,
                    title: "រូបរាប់ថយក្រោយ (Countdown)",
                    description: "រូបថតគូស្នេហ៍ប្លង់ផ្ដេក លើប្រអប់ម៉ោងរាប់ថយក្រោយ",
                    locationHint: "រាប់ថយក្រោយ",
                    aspectRatioText: "16:9",
                    aspectRatioClass: "aspect-[16/9]"
                },
                {
                    index: 2,
                    title: "រូបទីតាំងកម្មវិធី (Location)",
                    description: "រូបថតគូស្នេហ៍ប្លង់បញ្ឈរ អមជាមួយ Google Maps QR",
                    locationHint: "ទីតាំងកម្មវិធី",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                },
                {
                    index: 3,
                    title: "រូបចំណងដៃមង្គល (Gift / KHQR)",
                    description: "រូបថតគូស្នេហ៍ប្លង់បញ្ឈរ អមជាមួយកាត KHQR Code",
                    locationHint: "ចំណងដៃមង្គល",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                },
                {
                    index: 6,
                    title: "រូបថតផ្តើមស្នេហ៍ (Love Story)",
                    description: "រូបថតគូស្នេហ៍អនុស្សាវរីយ៍ ក្នុងផ្នែកផ្តើមស្នេហ៍",
                    locationHint: "ផ្នែកផ្តើមស្នេហ៍",
                    aspectRatioText: "16:9",
                    aspectRatioClass: "aspect-[16/9]"
                },
                {
                    index: 4,
                    title: "រូបថ្លែងអំណរគុណ (Thank You)",
                    description: "រូបថតគូស្នេហ៍ប្លង់បញ្ឈរ ផ្នែកសូមថ្លែងអំណរគុណ",
                    locationHint: "សូមថ្លែងអំណរគុណ",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                }
            ]
        },
        {
            categoryTitle: "រូបថតសាមីខ្លួន (Groom & Bride Portraits)",
            categoryDesc: "រូបថតទោលផ្ទាល់ខ្លួន សម្រាប់បង្ហាញក្នុងប្រអប់ Profile & ពាក្យសន្យា",
            icon: User,
            slots: [
                {
                    index: 9,
                    title: isAnniv ? "រូបថតស្វាមី (Husband)" : "រូបថតកូនកំលោះ (Groom)",
                    description: "រូបថតទោលកូនកំលោះ ស្អាតច្បាស់",
                    locationHint: "ពាក្យសន្យាកូនកំលោះ",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                },
                {
                    index: 10,
                    title: isAnniv ? "រូបថតភរិយា (Wife)" : "រូបថតកូនក្រមុំ (Bride)",
                    description: "រូបថតទោលកូនក្រមុំ ស្អាតច្បាស់",
                    locationHint: "ពាក្យសន្យាកូនក្រមុំ",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                }
            ]
        }
    ];

    return (
        <div className="space-y-8 font-kantumruy">
            {/* Visual Photo Guide Explainer Card */}
            <div className="bg-slate-50/80 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Info className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span>មគ្គុទ្ទេសក៍ទីតាំងរូបភាព (Photo Placement Guide)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div className="p-2.5 bg-white dark:bg-black/20 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-0.5">
                        <strong className="text-foreground block font-bold text-xs">1. រូបក្របធំ (Hero)</strong>
                        <span className="text-[11px] leading-tight block">បង្ហាញនៅក្បាលទំព័រពេលភ្ញៀវបើកដំបូង។</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-black/20 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-0.5">
                        <strong className="text-foreground block font-bold text-xs">2. រូបកូនកំលោះ-កូនក្រមុំ</strong>
                        <span className="text-[11px] leading-tight block">រូបថតទោលក្នុងប្រអប់ Profile សាមីខ្លួន។</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-black/20 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-0.5">
                        <strong className="text-foreground block font-bold text-xs">3. រូបអនុស្សាវរីយ៍ & វិចិត្រសាល</strong>
                        <span className="text-[11px] leading-tight block">រូបបន្ថែមក្នុងផ្នែក Story និង Gallery។</span>
                    </div>
                </div>
            </div>

            {/* Render Slot Groups */}
            {SLOT_CATEGORIES.map((cat, catIdx) => (
                <div key={catIdx} className="space-y-3.5">
                    <div className="space-y-0.5 border-b border-slate-200/80 dark:border-white/10 pb-2">
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                            <cat.icon className="w-4 h-4 text-rose-500 flex-shrink-0" />
                            <span>{cat.categoryTitle}</span>
                        </h4>
                        <p className="text-[11px] text-muted-foreground">{cat.categoryDesc}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">
                        {cat.slots.map((slot) => {
                            const item = wedding.galleryItems?.find((i: any, iidx: number) => iidx === slot.index);
                            const hasUrl = item && item.url;

                            return (
                                <m.div 
                                    key={slot.index} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-white/[0.02] p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between gap-3"
                                >
                                    {/* Header & Badges */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h5 className="text-xs font-bold text-foreground truncate">
                                                {slot.title}
                                            </h5>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex-shrink-0 font-mono">
                                                {slot.aspectRatioText}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                                            <span>{slot.locationHint}</span>
                                        </div>
                                    </div>

                                    {/* Upload Box / Image Display */}
                                    <div className={clsx(
                                        "relative w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-black/20 border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-center group transition-all duration-200",
                                        slot.aspectRatioClass,
                                        !hasUrl && "hover:border-rose-300 cursor-pointer"
                                    )}>
                                        {hasUrl ? (
                                            <>
                                                <img src={item.url!} alt={slot.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                
                                                {/* Mobile Direct Action Pills (Visible on Mobile, Hover on Desktop) */}
                                                <div className="absolute inset-x-2 bottom-2 z-10 flex sm:hidden items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveSlotIdx(slot.index);
                                                            slotInputRef.current?.click();
                                                        }}
                                                        className="flex-1 bg-black/75 backdrop-blur-md text-white py-1.5 px-2 rounded-lg font-bold text-[11px] shadow-md flex items-center justify-center gap-1 active:scale-95"
                                                    >
                                                        <Plus size={12} />
                                                        <span>ប្តូររូប</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryItem(slot.index)}
                                                        className="bg-rose-600/90 backdrop-blur-md text-white py-1.5 px-2 rounded-lg font-bold text-[11px] shadow-md flex items-center justify-center gap-1 active:scale-95"
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
                                                            setActiveSlotIdx(slot.index);
                                                            slotInputRef.current?.click();
                                                        }}
                                                        className="bg-white text-slate-900 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1"
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
                                                    setActiveSlotIdx(slot.index);
                                                    slotInputRef.current?.click();
                                                }} 
                                                className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 text-center disabled:opacity-50 group outline-none"
                                            >
                                                {slotUploading && activeSlotIdx === slot.index ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                                                        <span className="text-xs font-bold text-rose-500">{slotProgress}%</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Plus size={18} strokeWidth={2.5} />
                                                        </div>
                                                        <span className="text-xs text-foreground font-bold block group-hover:text-rose-600">
                                                            ចុចបញ្ចូលរូបភាព
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </m.div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

import React from 'react';
import { Label } from "@/components/ui/label";
import { m } from "framer-motion";
import { Plus, Trash2, Sparkles, Heart, User, Image as ImageIcon, Loader2, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

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
    updateTheme,
    slotUploading,
    slotProgress,
    activeSlotIdx,
    t
}) => {
    const [activeCategory, setActiveCategory] = React.useState(0);
    const [showAllSlots, setShowAllSlots] = React.useState(false);
    if (!layout) return null;

    const toggleSlotVisibility = (index: number) => {
        const hiddenSlots = new Set<number>(wedding.themeSettings?.hiddenPhotoSlots || []);
        if (hiddenSlots.has(index)) hiddenSlots.delete(index);
        else hiddenSlots.add(index);
        updateTheme("hiddenPhotoSlots", [...hiddenSlots].sort((a, b) => a - b));
    };

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
                    title: "រូបក្របធំ",
                    description: "រូបថតគូស្នេហ៍ Pre-wedding ក្បាលទំព័រធំ Full Screen",
                    locationHint: "ក្បាលទំព័រ (Hero)",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                },
                {
                    index: 1,
                    title: "រូបរាប់ថយក្រោយ",
                    description: "រូបថតគូស្នេហ៍ប្លង់ផ្ដេក លើប្រអប់ម៉ោងរាប់ថយក្រោយ",
                    locationHint: "រាប់ថយក្រោយ",
                    aspectRatioText: "16:9",
                    aspectRatioClass: "aspect-[16/9]"
                },
                {
                    index: 2,
                    title: "រូបទីតាំងកម្មវិធី",
                    description: "រូបថតគូស្នេហ៍ប្លង់បញ្ឈរ អមជាមួយ Google Maps QR",
                    locationHint: "ទីតាំងកម្មវិធី",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                },
                {
                    index: 3,
                    title: "រូបចំណងដៃមង្គល",
                    description: "រូបថតគូស្នេហ៍ប្លង់បញ្ឈរ អមជាមួយកាត KHQR Code",
                    locationHint: "ចំណងដៃមង្គល",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                },
                {
                    index: 6,
                    title: "រូបថតផ្តើមស្នេហ៍",
                    description: "រូបថតគូស្នេហ៍អនុស្សាវរីយ៍ ក្នុងផ្នែកផ្តើមស្នេហ៍",
                    locationHint: "ផ្នែកផ្តើមស្នេហ៍",
                    aspectRatioText: "16:9",
                    aspectRatioClass: "aspect-[16/9]"
                },
                {
                    index: 4,
                    title: "រូបថ្លែងអំណរគុណ",
                    description: "រូបថតគូស្នេហ៍ប្លង់បញ្ឈរ ផ្នែកសូមថ្លែងអំណរគុណ",
                    locationHint: "សូមថ្លែងអំណរគុណ",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                },
                {
                    index: 5,
                    title: "រូបបដាធៀបការ",
                    description: "រូបថតបដាផ្ដេក សម្រាប់ផ្នែកអញ្ជើញ",
                    locationHint: "បដាធៀបការ",
                    aspectRatioText: "16:9",
                    aspectRatioClass: "aspect-[16/9]"
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
                    title: isAnniv ? "រូបថតស្វាមី" : "រូបថតកូនកំលោះ",
                    description: "រូបថតទោលកូនកំលោះ ស្អាតច្បាស់",
                    locationHint: "ពាក្យសន្យាកូនកំលោះ",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                },
                {
                    index: 10,
                    title: isAnniv ? "រូបថតភរិយា" : "រូបថតកូនក្រមុំ",
                    description: "រូបថតទោលកូនក្រមុំ ស្អាតច្បាស់",
                    locationHint: "ពាក្យសន្យាកូនក្រមុំ",
                    aspectRatioText: "3:4",
                    aspectRatioClass: "aspect-[3/4]"
                }
            ]
        }
    ];

    return (
        <div className="space-y-4 sm:space-y-6 font-kantumruy">
            <p className="rounded-xl border border-teal-500/15 bg-teal-500/5 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                រូបថតទាំងនេះអាចរំលងបាន។ ចុច «បង្ហាញ» ឬ «លាក់» លើរូបនីមួយៗតាមចិត្ត—ការលាក់មិនលុបរូបចេញទេ។
            </p>
            {/* Category tabs keep the photo editor focused. */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-1.5 dark:border-white/10 dark:bg-white/[0.02]">
                {SLOT_CATEGORIES.map((cat, categoryIndex) => {
                    const CategoryIcon = cat.icon;
                    return (
                        <button
                            key={cat.categoryTitle}
                            type="button"
                            onClick={() => setActiveCategory(categoryIndex)}
                            className={clsx(
                                "flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 text-[11px] font-bold transition-colors",
                                activeCategory === categoryIndex
                                    ? "bg-white text-teal-600 shadow-sm dark:bg-white/10 dark:text-teal-400"
                                    : "text-muted-foreground hover:bg-white/60 hover:text-teal-600 dark:hover:bg-white/5"
                            )}
                        >
                            <CategoryIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">
                                {categoryIndex === 0 ? `រូបលើធៀប (${cat.slots.length})` : `រូបគូស្នេហ៍ (${cat.slots.length})`}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Render the selected slot group only. */}
            {[SLOT_CATEGORIES[activeCategory]].map((cat) => (
                <div key={cat.categoryTitle} className="space-y-3.5">
                    <div className="space-y-0.5 border-b border-slate-200/80 dark:border-white/10 pb-2">
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                            <cat.icon className="w-4 h-4 text-teal-500 flex-shrink-0" />
                            <span>{cat.categoryTitle}</span>
                        </h4>
                        <p className="text-[11px] text-muted-foreground">{cat.categoryDesc}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
                        {(showAllSlots || activeCategory !== 0 ? cat.slots : cat.slots.slice(0, 3)).map((slot) => {
                            const item = wedding.galleryItems?.find((i: any, iidx: number) => iidx === slot.index);
                            const hasUrl = item && item.url;
                            const isVisible = !wedding.themeSettings?.hiddenPhotoSlots?.includes(slot.index);

                            return (
                                <m.div 
                                    key={slot.index} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#171c22] p-3 rounded-[1.25rem] border border-white/10 shadow-sm flex flex-col justify-between gap-3"
                                >
                                    {/* Header & Badges */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h5 className="text-[12px] sm:text-xs font-bold text-white truncate">
                                                {slot.title}
                                            </h5>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {hasUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSlotVisibility(slot.index)}
                                                        aria-pressed={isVisible}
                                                        aria-label={isVisible ? `លាក់ ${slot.title} ពីធៀប` : `បង្ហាញ ${slot.title} ក្នុងធៀប`}
                                                        title={isVisible ? "លាក់ពីធៀប" : "បង្ហាញក្នុងធៀប"}
                                                        className={clsx(
                                                            "inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold transition-colors",
                                                            isVisible ? "bg-teal-600 text-white" : "bg-slate-600 text-white"
                                                        )}
                                                    >
                                                        {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                                                        <span>{isVisible ? "លាក់" : "បង្ហាញ"}</span>
                                                    </button>
                                                )}
                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-700 text-slate-100 font-mono">
                                                    {slot.aspectRatioText}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-[11px] text-teal-400 font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                                            <span>{slot.locationHint}</span>
                                        </div>
                                    </div>

                                    {/* Upload Box / Image Display */}
                                    <div className={clsx(
                                        "relative w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-black/20 border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-center group transition-all duration-200",
                                        slot.aspectRatioClass,
                                        !hasUrl && "hover:border-teal-300 cursor-pointer"
                                    )}>
                                        {hasUrl ? (
                                            <>
                                                <img src={item.url!} alt={slot.title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                
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
                                                        <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Plus size={18} strokeWidth={2.5} />
                                                        </div>
                                                        <span className="text-xs text-foreground font-bold block group-hover:text-teal-600">
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
                    {activeCategory === 0 && cat.slots.length > 3 && (
                        <button
                            type="button"
                            onClick={() => setShowAllSlots((value) => !value)}
                            className="w-full rounded-xl border border-dashed border-slate-300 py-2.5 text-xs font-bold text-muted-foreground transition-colors hover:border-teal-300 hover:text-teal-600 dark:border-white/15"
                        >
                            {showAllSlots ? "លាក់រូបបន្ថែម" : "បង្ហាញរូបបន្ថែម"}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

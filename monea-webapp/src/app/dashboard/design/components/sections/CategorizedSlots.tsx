"use client";
import React from 'react';
import { Label } from "@/components/ui/label";
import { m } from "framer-motion";
import { Plus, Trash2, Sparkles, Heart, Video, Loader2 } from "lucide-react";
import Image from "next/image";
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

    const categories = [
        {
            title: t("wizard.steps.4.bannerCategory"),
            description: t("wizard.steps.4.bannerCategoryDesc"),
            indices: [0, 5],
            icon: Sparkles
        },
        {
            title: t("wizard.steps.4.storyCategory"),
            description: t("wizard.steps.4.storyCategoryDesc"),
            indices: [1, 2, 3, 4],
            icon: Heart
        },
        {
            title: t("wizard.steps.4.portraitCategory"),
            description: isAnniv ? t("wizard.steps.4.portraitCategoryDescAnniv", { defaultValue: "ស្វាមី ភរិយា និងរូបភាពអនុស្សាវរីយ៍" }) : t("wizard.steps.4.portraitCategoryDesc"),
            indices: [6, 7, 8, 9, 10],
            icon: Video
        }
    ];

    return (
        <div className="space-y-16">
            {categories.map((cat, catIdx) => (
                <div key={catIdx} className="space-y-8">
                    <div className="space-y-1">
                        <h4 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                            {cat.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium pl-3">{cat.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-3">
                        {cat.indices.map((idx) => {
                            const label = t((layout?.labels || [])[idx] || "wizard.steps.4.addImage");
                            const item = wedding.galleryItems?.find((i: any, iidx: number) => iidx === idx);
                            const hasUrl = item && item.url;
                            const isHorizontal = getSlotAspectRatio(idx) > 1;

                            return (
                                <m.div 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className={clsx("space-y-3", isHorizontal && "sm:col-span-2")}
                                >
                                    <div className="flex items-center justify-between px-1">
                                        <Label className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            {label}
                                        </Label>
                                        <span className="text-[9px] bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded-full font-bold text-slate-300">
                                            {isHorizontal ? "16:9" : "3:4"}
                                        </span>
                                    </div>
                                    <div className={clsx(
                                        "relative rounded-xl overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center group transition-all duration-300",
                                        isHorizontal ? "aspect-[16/9]" : "aspect-[3/4]",
                                        !hasUrl && "hover:border-rose-200/50"
                                    )}>
                                        {hasUrl ? (
                                            <>
                                                <Image src={item.url!} alt={label} className="object-cover transition-transform duration-700 group-hover:scale-105" fill sizes="(max-width: 768px) 100vw, 50vw" />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setActiveSlotIdx(idx);
                                                                slotInputRef.current?.click();
                                                            }}
                                                            className="bg-white text-rose-500 p-2.5 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                                        >
                                                            <Plus size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => removeGalleryItem(idx)}
                                                            className="bg-white text-red-500 p-2.5 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <button 
                                                disabled={slotUploading}
                                                onClick={() => {
                                                    setActiveSlotIdx(idx);
                                                    slotInputRef.current?.click();
                                                }} 
                                                className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 text-center disabled:opacity-50 group"
                                            >
                                                {slotUploading && activeSlotIdx === idx ? (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                                                        <span className="text-[10px] font-bold text-rose-500">{slotProgress}%</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-slate-200 group-hover:text-rose-500 transition-all">
                                                            <Plus size={20} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-[11px] text-slate-600 dark:text-white/40 font-bold block group-hover:text-rose-500">{t("wizard.steps.4.addImage")}</span>
                                                        </div>
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

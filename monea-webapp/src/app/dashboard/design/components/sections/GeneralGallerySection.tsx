"use client";
import React from 'react';
import { Label } from "@/components/ui/label";
import { m } from "framer-motion";
import { Plus, Trash2, Loader2, ImageIcon, Send, Video } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

interface GeneralGallerySectionProps {
    wedding: any;
    layout: any;
    removeGalleryItem: (idx: number) => void;
    generalInputRef: React.RefObject<HTMLInputElement>;
    galleryUploading: boolean;
    galleryProgress: number;
    isDraggingGallery: boolean;
    setIsDraggingGallery: (val: boolean) => void;
    handleGalleryDirectUpload: (files: FileList) => Promise<void>;
    updateTheme: (key: string, value: any, autoSave?: boolean) => void;
    t: any;
}

export const GeneralGallerySection: React.FC<GeneralGallerySectionProps> = ({
    wedding,
    layout,
    removeGalleryItem,
    generalInputRef,
    galleryUploading,
    galleryProgress,
    isDraggingGallery,
    setIsDraggingGallery,
    handleGalleryDirectUpload,
    updateTheme,
    t
}) => {
    return (
        <section className="space-y-8">
            <div className="space-y-1">
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    {t("wizard.steps.4.albumTitle")}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium pl-3">{t("wizard.steps.4.albumSubtitle")}</p>
            </div>

            <div className="pl-3 space-y-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {wedding.galleryItems?.map((item: any, idx: number) => {
                        const isSpecial = layout && idx < layout.slots;
                        if (isSpecial || !item.url) return null;

                        return (
                            <m.div 
                                key={idx} 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative aspect-square rounded-3xl overflow-hidden group shadow-md border-2 border-slate-50 dark:border-white/5"
                            >
                                <Image src={item.url} alt="Extra Gallery" className="object-cover transition-transform group-hover:scale-110" fill sizes="(max-width: 768px) 50vw, 25vw" />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <button
                                        onClick={() => removeGalleryItem(idx)}
                                        className="bg-white text-red-500 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </m.div>
                        );
                    })}

                    <button
                        onClick={() => generalInputRef.current?.click()} 
                        disabled={galleryUploading}
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingGallery(true); }}
                        onDragLeave={() => setIsDraggingGallery(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDraggingGallery(false); handleGalleryDirectUpload(e.dataTransfer.files); }}
                        className={clsx(
                            "aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all duration-500 relative border-4 border-dashed",
                            isDraggingGallery 
                                ? "border-rose-500 bg-rose-50/50 dark:bg-rose-500/10 scale-105" 
                                : "bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/10 hover:border-rose-200 hover:bg-white dark:hover:bg-white/5"
                        )}
                    >
                        {galleryUploading ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                                <span className="text-[12px] font-black text-rose-600">{galleryProgress}%</span>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center text-slate-300 shadow-sm">
                                    <Plus size={24} />
                                </div>
                                <div className="px-2">
                                    <span className="text-[11px] text-slate-900 dark:text-white font-black font-kantumruy block">{t("wizard.steps.4.addImage")}</span>
                                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-tighter">{t("wizard.steps.4.bulkUpload")}</span>
                                </div>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Gallery Style Picker */}
            <div className="pt-8 border-t dark:border-white/5 mx-3">
                <Label className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase mb-4 block tracking-widest">{t("wizard.steps.4.galleryStyle")}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    {[
                        { id: 'masonry', label: t("wizard.steps.4.masonry"), icon: ImageIcon },
                        { id: 'slider', label: t("wizard.steps.4.slider"), icon: Send },
                        { id: 'polaroid', label: t("wizard.steps.4.polaroid"), icon: Video }
                    ].map((style) => (
                        <button
                            key={style.id}
                            onClick={() => updateTheme('galleryStyle', style.id as any, true)}
                            className={clsx(
                                "p-2 sm:p-3 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-row sm:flex-col items-center justify-center gap-2 border",
                                (wedding.themeSettings as any)?.galleryStyle === style.id || (style.id === 'masonry' && !(wedding.themeSettings as any)?.galleryStyle)
                                    ? "bg-rose-500 text-white border-rose-500 shadow-lg"
                                    : "bg-white dark:bg-white/5 text-slate-400 border-slate-100 dark:border-white/5 hover:border-rose-200"
                            )}
                        >
                            <style.icon size={16} />
                            {style.label}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

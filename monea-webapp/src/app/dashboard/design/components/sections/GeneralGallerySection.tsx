import React from 'react';
import { Label } from "@/components/ui/label";
import { m, Reorder } from "framer-motion";
import { Plus, Trash2, Loader2, ImageIcon, LayoutGrid, SlidersHorizontal, Film } from "lucide-react";
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
    updateGalleryOrder: (items: any[]) => void;
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
    updateGalleryOrder,
    t
}) => {
    return (
        <section className="space-y-6 font-kantumruy">
            <div className="space-y-1 border-b border-slate-200/80 dark:border-white/10 pb-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-rose-500" />
                    <span>កម្រងរូបភាពវិចិត្រសាលបន្ថែម (Photo Album Gallery)</span>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                    បញ្ចូលរូបភាព Pre-wedding បន្ថែមបានច្រើនសន្លឹក (ភ្ញៀវអាចចុចពង្រីកមើលបានទាំងអស់)
                </p>
            </div>

            <div className="space-y-6">
                {(() => {
                    const slotCount = layout ? layout.slots : 0;
                    const slotItems = wedding.galleryItems?.slice(0, slotCount) || [];
                    const generalItems = wedding.galleryItems?.slice(slotCount).filter((i: any) => i.url) || [];
                    const hasGeneralItems = generalItems.length > 0;

                    return (
                        <Reorder.Group 
                            axis="y" 
                            values={generalItems} 
                            onReorder={(newGeneral) => updateGalleryOrder([...slotItems, ...newGeneral])}
                            className={clsx(
                                "relative grid gap-3",
                                hasGeneralItems ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1"
                            )}
                        >
                            {generalItems.map((item: any, localIdx: number) => {
                                const globalIdx = slotCount + localIdx;
                                const uniqueKey = item.publicId ? `${item.publicId}-${localIdx}` : `${item.url || 'gallery'}-${localIdx}`;
                                return (
                                    <Reorder.Item 
                                        key={uniqueKey} 
                                        value={item}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-slate-200/80 dark:border-white/10 cursor-grab active:cursor-grabbing bg-slate-100 dark:bg-black/20"
                                    >
                                        <img src={item.url} alt="Extra Gallery" className="w-full h-full object-cover transition-transform group-hover:scale-105 pointer-events-none" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryItem(globalIdx)}
                                                className="bg-rose-600 text-white p-2.5 rounded-xl hover:bg-rose-700 transition-all shadow-lg flex items-center gap-1 text-xs font-bold"
                                            >
                                                <Trash2 size={15} />
                                                <span>លុប</span>
                                            </button>
                                        </div>
                                    </Reorder.Item>
                                );
                            })}

                            <button
                                type="button"
                                onClick={() => generalInputRef.current?.click()} 
                                disabled={galleryUploading}
                                onDragOver={(e) => { e.preventDefault(); setIsDraggingGallery(true); }}
                                onDragLeave={() => setIsDraggingGallery(false)}
                                onDrop={(e) => { e.preventDefault(); setIsDraggingGallery(false); handleGalleryDirectUpload(e.dataTransfer.files); }}
                                className={clsx(
                                    "flex flex-col items-center justify-center gap-2.5 transition-all duration-300 relative border-2 border-dashed rounded-2xl p-6 outline-none",
                                    hasGeneralItems 
                                        ? "col-span-full min-h-[120px] " + (isDraggingGallery ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20" : "bg-slate-50/50 dark:bg-white/[0.02] border-slate-300 dark:border-white/10 hover:border-rose-400 hover:bg-rose-50/30")
                                        : "w-full min-h-[180px] " + (isDraggingGallery ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20" : "bg-slate-50/50 dark:bg-white/[0.02] border-slate-300 dark:border-white/10 hover:border-rose-400 hover:bg-rose-50/30")
                                )}
                            >
                                {galleryUploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-7 h-7 animate-spin text-rose-500" />
                                        <span className="text-xs font-bold text-rose-600">{galleryProgress}%</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                            <Plus size={20} strokeWidth={2.5} />
                                        </div>
                                        <div className="text-center space-y-0.5">
                                            <span className="text-xs text-foreground font-bold block">
                                                {hasGeneralItems ? "បន្ថែមរូបភាពចូលវិចិត្រសាលទៀត (Add More)" : "ចុចដើម្បីជ្រើសរើសរូបថត ឬទាញទម្លាក់ទីនេះ (Drag & Drop)"}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground block">
                                                អាចជ្រើសរើសរូបថតបានច្រើនសន្លឹកក្នុងពេលតែមួយ (JPG, PNG, WebP)
                                            </span>
                                        </div>
                                    </>
                                )}
                            </button>
                        </Reorder.Group>
                    );
                })()}
            </div>

            {/* Gallery Style Selector */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-3">
                <Label className="text-xs font-bold text-foreground block">
                    របៀបបង្ហាញកម្រងរូបភាពលើធៀប
                </Label>
                <div className="grid grid-cols-3 gap-2.5">
                    {[
                        { id: 'masonry', label: "ក្រឡារៀបឆ្លាស់", icon: LayoutGrid },
                        { id: 'slider', label: "រំកិលស្លាយ", icon: SlidersHorizontal },
                        { id: 'polaroid', label: "ស៊ុមរូបថតបុរាណ", icon: Film }
                    ].map((style) => (
                        <button
                            key={style.id}
                            type="button"
                            onClick={() => updateTheme('galleryStyle', style.id as any, true)}
                            className={clsx(
                                "p-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 border outline-none",
                                (wedding.themeSettings as any)?.galleryStyle === style.id || (style.id === 'masonry' && !(wedding.themeSettings as any)?.galleryStyle)
                                    ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20"
                                    : "bg-white dark:bg-white/[0.02] text-muted-foreground border-slate-200/80 dark:border-white/10 hover:border-slate-300"
                            )}
                        >
                            <style.icon size={16} />
                            <span className="text-[11px] font-kantumruy">{style.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

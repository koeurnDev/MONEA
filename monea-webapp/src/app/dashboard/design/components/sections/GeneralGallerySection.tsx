import React from 'react';
import { Label } from "@/components/ui/label";
import { m, Reorder } from "framer-motion";
import { Plus, Trash2, Loader2, ImageIcon, LayoutGrid, SlidersHorizontal, Film, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import { getGalleryPhotoKey } from "@/components/templates/photo-visibility";
import { PhotoImage } from "@/components/templates/shared/PhotoImage";

interface GeneralGallerySectionProps {
    wedding: any;
    layout: any;
    removeGalleryItem: (idx: number) => void;
    generalInputRef: React.RefObject<HTMLInputElement>;
    galleryUploading: boolean;
    galleryProgress: number;
    isDraggingGallery: boolean;
    setIsDraggingGallery: (val: boolean) => void;
    handleGalleryDirectUpload: (files: FileList | File[]) => Promise<void>;
    galleryUploadStatus: "idle" | "uploading" | "success" | "error";
    galleryUploadError: string | null;
    canRetryGalleryUpload: boolean;
    retryGalleryUpload: () => Promise<unknown> | undefined;
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
    galleryUploadStatus,
    galleryUploadError,
    canRetryGalleryUpload,
    retryGalleryUpload,
    updateTheme,
    updateGalleryOrder,
    t
}) => {
    const toggleGalleryPhotoVisibility = (photoKey: string, visible: boolean) => {
        const hiddenPhotos = new Set(wedding.themeSettings?.hiddenGalleryPhotoKeys || []);
        if (visible) hiddenPhotos.delete(photoKey);
        else hiddenPhotos.add(photoKey);
        updateTheme("hiddenGalleryPhotoKeys", [...hiddenPhotos]);
    };

    return (
        <section className="space-y-4 rounded-2xl border border-sky-200/70 bg-white p-3 font-kantumruy dark:border-sky-500/20 dark:bg-white/[0.02] sm:space-y-6 sm:p-5">
            <div className="space-y-1 border-b border-slate-200/80 dark:border-white/10 pb-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-teal-500" />
                    <span>កម្រងរូបភាពវិចិត្រសាលបន្ថែម (Photo Album Gallery)</span>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                    ផ្នែកនេះសម្រាប់រូបអនុស្សាវរីយ៍ច្រើនសន្លឹក។ រូបទាំងនេះខុសពីរូបក្រប ឬរូបកូនកំលោះ/កូនក្រមុំ។ ភ្ញៀវអាចចុចរូបដើម្បីពង្រីកមើល។
                </p>
                <p className="text-[11px] font-bold text-teal-500">
                    {((wedding.galleryItems?.slice(layout ? layout.slots : 0) || []).filter((item: any) => item && typeof item === "object" && typeof item.url === "string" && item.url.trim())).length} រូបក្នុងវិចិត្រសាល
                </p>
            </div>
            <p className="rounded-xl bg-sky-50 px-3 py-2 text-[11px] leading-relaxed text-sky-900 dark:bg-sky-500/10 dark:text-sky-100">
                របៀបដាក់៖ ចុចប៊ូតុងខាងក្រោម រួចជ្រើសរើសរូបមួយ ឬច្រើនសន្លឹក។ អាចអូសរូបដើម្បីប្ដូរលំដាប់ និងលាក់រូបដែលមិនចង់បង្ហាញបាន។
            </p>

            <div className="space-y-6">
                {(() => {
                    const slotCount = layout ? layout.slots : 0;
                    const slotItems = wedding.galleryItems?.slice(0, slotCount) || [];
                    const generalItems = (wedding.galleryItems?.slice(slotCount) || []).filter((i: any) => i && typeof i === "object" && typeof i.url === "string" && i.url.trim());
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
                                const photoKey = getGalleryPhotoKey(item);
                                const isVisible = !wedding.themeSettings?.hiddenGalleryPhotoKeys?.includes(photoKey);
                                return (
                                    <Reorder.Item 
                                        key={uniqueKey} 
                                        value={item}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-slate-200/80 dark:border-white/10 cursor-grab active:cursor-grabbing bg-slate-100 dark:bg-black/20"
                                    >
                                        <PhotoImage src={item.url} alt="Extra Gallery" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform group-hover:scale-105 pointer-events-none" />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleGalleryPhotoVisibility(photoKey, !isVisible);
                                            }}
                                            aria-pressed={isVisible}
                                            aria-label={isVisible ? "លាក់រូបនេះពីធៀប" : "បង្ហាញរូបនេះក្នុងធៀប"}
                                            title={isVisible ? "លាក់រូបនេះពីធៀប" : "បង្ហាញរូបនេះក្នុងធៀប"}
                                            className={clsx(
                                                "absolute top-2 left-2 z-10 inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-white shadow-md backdrop-blur-sm",
                                                isVisible ? "bg-teal-700/90" : "bg-slate-700/90"
                                            )}
                                        >
                                            {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                                            <span>{isVisible ? "លាក់" : "បង្ហាញ"}</span>
                                        </button>
                                        
                                        {/* Mobile Direct Delete Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeGalleryItem(globalIdx);
                                            }}
                                            className="sm:hidden absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/70 active:bg-rose-600 text-white flex items-center justify-center shadow-md backdrop-blur-sm"
                                            title="លុបរូបភាព"
                                        >
                                            <Trash2 size={13} />
                                        </button>

                                        {/* Desktop Hover Overlay */}
                                        <div className="hidden sm:flex absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center backdrop-blur-[2px]">
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
                                aria-label="បន្ថែមរូបភាពទៅវិចិត្រសាល"
                                onDragOver={(e) => { e.preventDefault(); setIsDraggingGallery(true); }}
                                onDragLeave={() => setIsDraggingGallery(false)}
                                onDrop={(e) => { e.preventDefault(); setIsDraggingGallery(false); handleGalleryDirectUpload(e.dataTransfer.files); }}
                                className={clsx(
                                    "flex flex-col items-center justify-center gap-2.5 transition-all duration-300 relative border-2 border-dashed rounded-2xl p-6 outline-none",
                                    hasGeneralItems 
                                        ? "col-span-full min-h-[120px] " + (isDraggingGallery ? "border-teal-500 bg-teal-50 dark:bg-teal-950/20" : "bg-slate-50/50 dark:bg-white/[0.02] border-slate-300 dark:border-white/10 hover:border-teal-400 hover:bg-teal-50/30")
                                        : "w-full min-h-[180px] " + (isDraggingGallery ? "border-teal-500 bg-teal-50 dark:bg-teal-950/20" : "bg-slate-50/50 dark:bg-white/[0.02] border-slate-300 dark:border-white/10 hover:border-teal-400 hover:bg-teal-50/30")
                                )}
                            >
                                {galleryUploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-7 h-7 animate-spin text-teal-500" />
                                        <span className="text-xs font-bold text-foreground">កំពុងបញ្ចូលរូបភាព...</span>
                                        <span className="text-[11px] font-bold text-teal-600">{galleryProgress}%</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                                            <Plus size={20} strokeWidth={2.5} />
                                        </div>
                                        <div className="text-center space-y-0.5">
                                            <span className="text-xs text-foreground font-bold block">
                                                {hasGeneralItems ? "បន្ថែមរូបទៅកម្រងនេះ" : "ជ្រើសរូបច្រើនសន្លឹកសម្រាប់វិចិត្រសាល"}
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

            {galleryUploadStatus === "success" && (
                <p role="status" className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    រូបភាពត្រូវបានបង្ហោះជោគជ័យ។
                </p>
            )}
            {galleryUploadStatus === "error" && (
                <div role="alert" className="flex flex-wrap items-center gap-2 rounded-xl border border-rose-300/70 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                    <span>{galleryUploadError || "បង្ហោះរូបមិនបាន។"}</span>
                    {canRetryGalleryUpload && (
                        <button
                            type="button"
                            onClick={() => void retryGalleryUpload()}
                            disabled={galleryUploading}
                            className="min-h-9 rounded-lg border border-rose-300 px-3 py-1.5 disabled:opacity-50"
                        >
                            សាកល្បងរូបដែលបរាជ័យម្ដងទៀត
                        </button>
                    )}
                </div>
            )}

            {/* Gallery Style Selector */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-3">
                <Label className="text-xs font-bold text-foreground block">
                    របៀបបង្ហាញកម្រងរូបភាពលើធៀប
                </Label>
                <div className="grid grid-cols-3 gap-2.5">
                    {[
                        { id: 'masonry', label: "ក្រឡារៀបឆ្លាស់", hint: "រូបធំតូចលាយគ្នា", icon: LayoutGrid },
                        { id: 'slider', label: "រំកិលមើល", hint: "អូសមើលរូបម្ដងមួយ", icon: SlidersHorizontal },
                        { id: 'polaroid', label: "ស៊ុម Polaroid", hint: "រូបក្នុងស៊ុមស", icon: Film }
                    ].map((style) => (
                        <button
                            key={style.id}
                            type="button"
                            onClick={() => updateTheme('galleryStyle', style.id as any, true)}
                            className={clsx(
                                "min-h-24 rounded-xl border p-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 outline-none",
                                (wedding.themeSettings as any)?.galleryStyle === style.id || (style.id === 'masonry' && !(wedding.themeSettings as any)?.galleryStyle)
                                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20"
                                    : "bg-white dark:bg-white/[0.02] text-muted-foreground border-slate-200/80 dark:border-white/10 hover:border-slate-300"
                            )}
                        >
                            <span className="flex h-8 w-12 items-center justify-center gap-0.5" aria-hidden="true">
                                {style.id === "masonry" && (
                                    <span className="grid h-8 w-12 grid-cols-3 gap-0.5">
                                        <i className="row-span-2 rounded-sm bg-current opacity-80" />
                                        <i className="rounded-sm bg-current opacity-45" />
                                        <i className="rounded-sm bg-current opacity-60" />
                                        <i className="rounded-sm bg-current opacity-60" />
                                        <i className="rounded-sm bg-current opacity-35" />
                                    </span>
                                )}
                                {style.id === "slider" && (
                                    <span className="flex h-6 w-12 gap-0.5 overflow-hidden">
                                        <i className="h-6 w-7 shrink-0 rounded-sm bg-current opacity-80" />
                                        <i className="h-6 w-7 shrink-0 rounded-sm bg-current opacity-50" />
                                        <i className="h-6 w-7 shrink-0 rounded-sm bg-current opacity-35" />
                                    </span>
                                )}
                                {style.id === "polaroid" && (
                                    <span className="flex items-center gap-1">
                                        <i className="h-7 w-5 border-b-4 border-current bg-current opacity-70" />
                                        <i className="h-7 w-5 rotate-3 border-b-4 border-current bg-current opacity-45" />
                                    </span>
                                )}
                            </span>
                            <style.icon size={16} />
                            <span className="text-[11px] font-kantumruy">{style.label}</span>
                            <span className={clsx(
                                "text-center text-[9px] font-normal",
                                (wedding.themeSettings as any)?.galleryStyle === style.id || (style.id === 'masonry' && !(wedding.themeSettings as any)?.galleryStyle)
                                    ? "text-white/80"
                                    : "text-muted-foreground"
                            )}>{style.hint}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

"use client";
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { m } from "framer-motion";
import { Plus, Trash2, X, Music, Video, Sparkles, Loader2, Facebook, Send, Wallet, ImageIcon, Heart } from "lucide-react";
import Image from "next/image";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import clsx from "clsx";
import AudioUploadWidget from "@/components/ui/audio-upload-widget";
import ImageUpload from "@/components/ui/image-upload-widget";
import ImageCropperModal from "@/components/ui/image-cropper-modal";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { WeddingData } from '@/components/templates/types';

interface Step4MediaProps {
    wedding: WeddingData;
    updateTheme: (key: string, value: any, autoSave?: boolean) => void;
    removeThemeAsset: (urlKey: string, publicIdKey: string) => Promise<void>;
    addGalleryItem: (url: string, publicId?: string, index?: number, type?: string) => void;
    removeGalleryItem: (index: number) => void;
    handleGalleryDirectUpload: (files: FileList) => Promise<void>;
    galleryUploading: boolean;
    galleryProgress: number;
    isDraggingGallery: boolean;
    setIsDraggingGallery: (val: boolean) => void;
    TEMPLATE_LAYOUTS: Record<string, { slots: number, labels: string[] }>;
}

const Step4Media: React.FC<Step4MediaProps> = ({
    wedding,
    updateTheme,
    removeThemeAsset,
    addGalleryItem,
    removeGalleryItem,
    handleGalleryDirectUpload,
    galleryUploading,
    galleryProgress,
    isDraggingGallery,
    setIsDraggingGallery,
    TEMPLATE_LAYOUTS
}) => {
    const { t } = useTranslation();
    const layout = TEMPLATE_LAYOUTS[wedding.templateId || "khmer-legacy"];
    const [activeSlotIdx, setActiveSlotIdx] = React.useState<number | null>(null);
    const [isCropModalOpen, setIsCropModalOpen] = React.useState(false);
    const [selectedFileUrl, setSelectedFileUrl] = React.useState<string | null>(null);
    const slotInputRef = React.useRef<HTMLInputElement>(null);
    const generalInputRef = React.useRef<HTMLInputElement>(null);


    const { uploading: slotUploading, progress: slotProgress, uploadFile: uploadSlotFile } = useCloudinaryUpload({
        onSuccess: (url, publicId) => {
            if (activeSlotIdx !== null) {
                if (activeSlotIdx === -1) {
                    // Find existing certificate to overwrite or push new one
                    const certIdx = wedding.galleryItems?.findIndex(i => i.type === 'CERTIFICATE');
                    addGalleryItem(url, publicId, certIdx !== -1 ? certIdx : undefined, 'CERTIFICATE');
                } else {
                    addGalleryItem(url, publicId, activeSlotIdx);
                }
                setActiveSlotIdx(null);
            }
        },
        onError: (err) => console.error("Slot upload error:", err),
        folder: wedding.id
    });

    const getSlotAspectRatio = (idx: number) => {
        // [0: Hero (3:4)], [1: Ed1 (16:9)], [2: Ed2 (3:4)], [3: Ed3 (4:3)], [4: Ed4 (16:9)], [5: Map (16:9)], [6-8: Signature (3:4)], [9-10: Portraits (3:4)]
        const horizontalSlots = [1, 4, 5];
        const fourThreeSlots = [3];
        if (horizontalSlots.includes(idx)) return 16 / 9;
        if (fourThreeSlots.includes(idx)) return 4 / 3;
        return 3 / 4;
    };

    return (
        <div className="space-y-8 pb-10 font-khmer">
            {/* Header Section */}
            <section className="space-y-1">
                <h3 className="text-lg font-bold font-kantumruy text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {t("wizard.steps.4.title")}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-widest font-medium pl-3.5">{t("wizard.steps.4.description")}</p>
                <div className="mt-4 pl-3.5">
                    <p className="text-[11px] text-slate-500 dark:text-rose-200/50 leading-relaxed font-normal italic">
                        {t("wizard.steps.4.mediaNote")}
                    </p>
                </div>
            </section>

            {/* Hidden Inputs remained... */}
            <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={slotInputRef}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            setSelectedFileUrl(reader.result as string);
                            setIsCropModalOpen(true);
                        };
                        reader.readAsDataURL(file);
                        e.target.value = '';
                    }
                }}
            />

            <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={generalInputRef} 
                onChange={(e) => {
                    if (e.target.files) handleGalleryDirectUpload(e.target.files);
                }}
            />

            {/* 1. CATEGORIZED SPECIAL SLOTS */}
            {layout && (() => {
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
                        description: t("wizard.steps.4.portraitCategoryDesc"),
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
                                        const item = wedding.galleryItems?.find((i, iidx) => iidx === idx);
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
            })()}

            {/* Sacred Bond Section */}
            <section className="space-y-8">
                <div className="space-y-1">
                    <h4 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        {t("wizard.steps.4.bondTitle")}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium pl-3">{t("wizard.steps.4.bondSubtitle")}</p>
                </div>
                
                <div className="mx-3">
                    {(() => {
                        const cert = wedding.galleryItems?.find(i => i.type === 'CERTIFICATE');
                        const certIdx = wedding.galleryItems?.findIndex(i => i.type === 'CERTIFICATE');
                        const hasCert = !!cert?.url;

                        return (
                            <div className={clsx(
                                "relative rounded-xl overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center group transition-all duration-500 min-h-[260px]",
                                !hasCert && "hover:border-rose-100 dark:hover:border-rose-500/10"
                            )}>
                                {hasCert ? (
                                    <>
                                        <Image src={cert.url} alt="Sacred Bond" className="object-cover transition-transform duration-1000 group-hover:scale-105" fill sizes="(max-width: 768px) 100vw, 80vw" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        setActiveSlotIdx(-1);
                                                        slotInputRef.current?.click();
                                                    }}
                                                    className="bg-white text-rose-500 p-3 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                                <button
                                                    onClick={() => certIdx !== undefined && removeGalleryItem(certIdx)}
                                                    className="bg-white text-red-500 p-3 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <button 
                                        disabled={slotUploading}
                                        onClick={() => {
                                            setActiveSlotIdx(-1);
                                            slotInputRef.current?.click();
                                        }} 
                                        className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center"
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-slate-200 group-hover:text-rose-500 shadow-sm transition-all">
                                            <Sparkles size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-600 dark:text-white/40 font-bold block group-hover:text-rose-500 transition-colors">{t("wizard.steps.4.uploadBond")}</span>
                                            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-widest">{t("wizard.steps.4.recommendSize")}</span>
                                        </div>
                                    </button>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </section>

            {/* General Gallery Section */}
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
                    </div> {/* Added missing closing div for the grid */}
                </div>

                {/* Gallery Style Picker */}
                <div className="pt-8 border-t dark:border-white/5 mx-3">
                    <Label className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase mb-4 block tracking-widest">{t("wizard.steps.4.galleryStyle")}</Label>
                    <div className="grid grid-cols-3 gap-3">
                    {[
                            { id: 'masonry', label: t("wizard.steps.4.masonry"), icon: ImageIcon },
                            { id: 'slider', label: t("wizard.steps.4.slider"), icon: Send },
                            { id: 'polaroid', label: t("wizard.steps.4.polaroid"), icon: Video }
                        ].map((style) => (
                            <button
                                key={style.id}
                                onClick={() => updateTheme('galleryStyle', style.id as any, true)}
                                className={clsx(
                                    "p-3 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-2 border",
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

            {/* Audio & Video Section */}
            <section className="space-y-12">
                <div className="space-y-1">
                    <h4 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        {t("wizard.steps.4.audioVideoTitle")}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium pl-3">{t("wizard.steps.4.audioVideoSubtitle")}</p>
                </div>

                <div className="pl-3 space-y-10">
                    {/* Audio Section */}
                    <div className="space-y-4">
                        <Label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">{t("wizard.steps.4.bgMusic")}</Label>
                        <AudioUploadWidget
                            value={wedding.themeSettings?.musicUrl || ""}
                            onChange={(url, publicId) => {
                                updateTheme('musicUrl', url);
                                if (publicId) {
                                    updateTheme('musicUrlPublicId', publicId, true);
                                } else {
                                    updateTheme('musicUrl', url, true);
                                }
                            }}
                            onRemove={() => removeThemeAsset('musicUrl', 'musicUrlPublicId')}
                            folder={wedding.id}
                        />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                            {[
                                { title: "Traditional", url: "https://res.cloudinary.com/dmsh9p6af/video/upload/v1710123456/samples/wedding_sample_1.mp3" },
                                { title: "True Love", url: "https://res.cloudinary.com/dmsh9p6af/video/upload/v1710123457/samples/wedding_sample_2.mp3" },
                                { title: "Happy Day", url: "https://res.cloudinary.com/dmsh9p6af/video/upload/v1710123458/samples/wedding_sample_3.mp3" }
                            ].map((song, i) => (
                                <button
                                    key={i}
                                    onClick={() => updateTheme('musicUrl', song.url, true)}
                                    className={clsx(
                                        "flex items-center justify-center p-3 rounded-xl text-[10px] transition-all border font-bold uppercase tracking-widest",
                                        wedding.themeSettings?.musicUrl === song.url
                                            ? "bg-rose-500 text-white border-rose-500 shadow-md"
                                            : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500 hover:border-rose-200"
                                    )}
                                >
                                    <Music size={12} className="mr-2" />
                                    {song.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* YouTube Section */}
                    <div className="space-y-4">
                        <Label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">{t("wizard.steps.4.youtubeTitle")}</Label>
                        <DebouncedInput
                            placeholder={t("wizard.steps.4.youtubePlaceholder")}
                            value={wedding.themeSettings?.videoUrl || ""}
                            onDebouncedChange={(val) => updateTheme('videoUrl', val as string, true)}
                            className="h-12 rounded-xl border-none bg-slate-50 dark:bg-white/5 focus:ring-1 ring-rose-500/20 font-medium text-sm transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* Cropper Modal */}
            <ImageCropperModal
                isOpen={isCropModalOpen}
                onClose={() => {
                    setIsCropModalOpen(false);
                    setSelectedFileUrl(null);
                }}
                imageSrc={selectedFileUrl}
                onCropComplete={async (croppedBlob) => {
                    const file = new File([croppedBlob], "cropped.jpg", { type: "image/jpeg" });
                    await uploadSlotFile(file);
                }}
                aspectRatio={activeSlotIdx !== null ? (activeSlotIdx === -1 ? 16/10 : getSlotAspectRatio(activeSlotIdx)) : 3/4}
                title={activeSlotIdx !== null ? `${t("wizard.steps.4.cropperTitle")} - ${activeSlotIdx === -1 ? t("wizard.steps.4.bondTitle") : t((layout?.labels || [])[activeSlotIdx] || "wizard.steps.4.addImage")}` : t("wizard.steps.4.cropperTitle")}
            />
        </div>
    );
};

export default React.memo(Step4Media);

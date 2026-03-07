
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Plus, Trash2, X, Music, Video, Sparkles, Loader2, Facebook, Send, Wallet } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from 'next-cloudinary';
import clsx from "clsx";
import AudioUploadWidget from "@/components/ui/audio-upload-widget";
import ImageUpload from "@/components/ui/image-upload-widget";
import type { WeddingData } from '@/components/templates/types';

interface Step4MediaProps {
    wedding: WeddingData;
    updateTheme: (key: string, value: any) => void;
    addGalleryItem: (url: string, index?: number) => void;
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
    addGalleryItem,
    removeGalleryItem,
    handleGalleryDirectUpload,
    galleryUploading,
    galleryProgress,
    isDraggingGallery,
    setIsDraggingGallery,
    TEMPLATE_LAYOUTS
}) => {
    const layout = TEMPLATE_LAYOUTS[wedding.templateId || "vip-premium-khmer"];

    return (
        <div className="space-y-6">
            <div className="bg-muted/40 p-4 rounded-xl mb-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none">
                <h3 className="text-sm font-bold text-foreground font-kantumruy mb-1">ជំហានទី៤៖ រូបភាព និងវីដេអូ</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">សូមបញ្ចូលរូបថតរបស់អ្នក។ <br /><span className="font-bold text-red-600">"រូបភាពតាមពុម្ព"</span> ជារូបភាពប្រចាំម៉ូដដែលត្រូវតែមាន ចំណែក <span className="font-bold text-red-600">"រូបភាពរួម"</span> ជារូបភាពវិចិត្រសាលបន្ថែម។</p>
            </div>

            {/* 1. SPECIAL SLOTS */}
            {layout && (
                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/60 p-1 px-2 rounded inline-block shadow-sm">រូបភាពតាមពុម្ព (Template Required)</p>
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
                        {layout.labels.map((label, idx) => {
                            const item = wedding.galleryItems?.[idx];
                            const hasUrl = item && item.url;

                            return (
                                <div key={idx} className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground truncate">{label}</p>
                                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted/30 flex flex-col items-center justify-center group shadow-inner">
                                        {hasUrl ? (
                                            <>
                                                <Image src={item.url} alt={label} className="object-cover" fill sizes="(max-width: 768px) 50vw, 33vw" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        onClick={() => removeGalleryItem(idx)}
                                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <CldUploadWidget
                                                onSuccess={(result: any) => addGalleryItem(result.info.secure_url, idx)}
                                                signatureEndpoint="/api/cloudinary/sign"
                                                uploadPreset="wedding_upload"
                                                options={{
                                                    maxFiles: 1,
                                                    sources: ['local'],
                                                    cropping: true,
                                                    croppingAspectRatio: idx < 2 ? 4 / 5 : undefined,
                                                    croppingShowBackButton: true
                                                }}
                                            >
                                                {({ open }) => (
                                                    <button onClick={() => open()} className="w-full h-full flex flex-col items-center justify-center gap-2 group-hover:bg-red-50 dark:group-hover:bg-red-950/20 transition-colors p-2 text-center">
                                                        <Plus size={16} className="text-muted-foreground/60 group-hover:text-red-600" />
                                                        <span className="text-[10px] text-muted-foreground/80 font-bold group-hover:text-red-700 font-kantumruy">ដាក់រូបភាពទីនេះ</span>
                                                    </button>
                                                )}
                                            </CldUploadWidget>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2. GENERAL GALLERY */}
            <div className="space-y-3 pt-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/60 p-1 px-2 rounded inline-block shadow-sm">រូបភាពរួម (Gallery)</p>
                <div className="grid grid-cols-3 gap-2">
                    {wedding.galleryItems?.map((item: any, idx: number) => {
                        const isSpecial = layout && idx < layout.slots;
                        if (isSpecial || !item.url) return null;

                        return (
                            <div key={idx} className="relative aspect-square rounded-md overflow-hidden group shadow-sm bg-muted/20">
                                <Image src={item.url} alt="Extra Gallery" className="object-cover" fill sizes="(max-width: 768px) 33vw, 20vw" />
                                <button
                                    onClick={() => removeGalleryItem(idx)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        );
                    })}

                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingGallery(true); }}
                        onDragLeave={() => setIsDraggingGallery(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDraggingGallery(false); handleGalleryDirectUpload(e.dataTransfer.files); }}
                        className={clsx(
                            "aspect-square rounded-md flex flex-col items-center justify-center gap-2 transition-all group relative shadow-inner bg-muted/30",
                            isDraggingGallery ? "bg-red-50 dark:bg-red-950/20 scale-105" : "hover:bg-background hover:shadow-md"
                        )}
                    >
                        {galleryUploading ? (
                            <div className="flex flex-col items-center gap-2 p-2">
                                <Loader2 className="w-4 h-4 animate-spin text-pink-600" />
                                <span className="text-[8px] font-bold text-pink-600">{galleryProgress}%</span>
                            </div>
                        ) : (
                            <CldUploadWidget
                                onSuccess={(result: any) => addGalleryItem(result.info.secure_url)}
                                signatureEndpoint="/api/cloudinary/sign"
                                uploadPreset="wedding_upload"
                                options={{
                                    multiple: true,
                                    maxFiles: 50,
                                    sources: ['local'],
                                    cropping: true
                                }}
                            >
                                {({ open }) => (
                                    <button onClick={() => open()} className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                                        <Plus size={20} className="text-muted-foreground group-hover:text-pink-500 mb-1" />
                                        <span className="text-[10px] text-muted-foreground font-bold font-kantumruy group-hover:text-pink-600">ចុចអាប់ឡូត</span>
                                        <span className="text-[8px] text-muted-foreground/60 leading-tight">អាចរើសច្រើន<br />សន្លឹកចូលគ្នា</span>
                                    </button>
                                )}
                            </CldUploadWidget>
                        )}
                    </div>
                </div>

                <div className="mt-4 p-3 bg-muted/40 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none">
                    <Label className="text-[10px] text-muted-foreground font-bold uppercase mb-3 block">រចនាបថរូបភាព (Gallery Style)</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {['masonry', 'slider', 'polaroid'].map((style) => (
                            <button
                                key={style}
                                onClick={() => updateTheme('galleryStyle', style as any)}
                                className={clsx(
                                    "py-2 rounded-lg text-[10px] font-bold uppercase transition-all shadow-sm",
                                    (wedding.themeSettings as any)?.galleryStyle === style || (style === 'masonry' && !(wedding.themeSettings as any)?.galleryStyle)
                                        ? "bg-red-600 text-white shadow-red-100 dark:shadow-none"
                                        : "bg-background text-muted-foreground hover:bg-muted/50"
                                )}
                            >
                                {style === 'masonry' ? 'ក្រឡា (Grid)' : style === 'slider' ? 'រំកិល (Slide)' : 'ប៉ុឡារ៉ូអ៊ីត (Polaroid)'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        <Label className="block text-xs">តន្ត្រី (Background Music)</Label>
                    </div>
                </div>
                <AudioUploadWidget
                    value={wedding.themeSettings?.musicUrl || ""}
                    onChange={(url) => updateTheme('musicUrl', url)}
                    onRemove={() => updateTheme('musicUrl', "")}
                />
            </div>


            <div className="mt-6">
                <Label className="flex items-center gap-2 mb-3"><Video className="w-4 h-4" /> វីដេអូ (YouTube Video)</Label>
                <DebouncedInput
                    placeholder="បញ្ចូលតំណភ្ជាប់ YouTube..."
                    value={wedding.themeSettings?.videoUrl || ""}
                    onDebouncedChange={(val) => updateTheme('videoUrl', val as string)}
                    className="mb-2 border-none shadow-sm bg-muted"
                />
            </div>
        </div>
    );
};

export default React.memo(Step4Media);

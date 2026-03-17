
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Plus, Trash2, X, Music, Video, Sparkles, Loader2, Facebook, Send, Wallet } from "lucide-react";
import Image from "next/image";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import clsx from "clsx";
import AudioUploadWidget from "@/components/ui/audio-upload-widget";
import ImageUpload from "@/components/ui/image-upload-widget";
import ImageCropperModal from "@/components/ui/image-cropper-modal";
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
    const layout = TEMPLATE_LAYOUTS[wedding.templateId || "khmer-legacy"];
    const [activeSlotIdx, setActiveSlotIdx] = React.useState<number | null>(null);
    const [isCropModalOpen, setIsCropModalOpen] = React.useState(false);
    const [selectedFileUrl, setSelectedFileUrl] = React.useState<string | null>(null);
    const slotInputRef = React.useRef<HTMLInputElement>(null);
    const generalInputRef = React.useRef<HTMLInputElement>(null);

    const renderImageSlot = (idx: number, label: string, hasUrl: any, isHorizontal: boolean, url?: string) => (
        <div className={clsx(
            "relative rounded-2xl overflow-hidden bg-muted/30 border-2 border-dashed border-muted-foreground/10 flex flex-col items-center justify-center group transition-all duration-300",
            isHorizontal ? "aspect-[16/9]" : "aspect-[3/4]",
            !hasUrl && "hover:border-red-600/30 hover:bg-red-50/10"
        )}>
            {hasUrl ? (
                <>
                    <Image src={url!} alt={label} className="object-cover" fill sizes="(max-width: 768px) 100vw, 50vw" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setActiveSlotIdx(idx);
                                    slotInputRef.current?.click();
                                }}
                                className="bg-white text-black p-2.5 rounded-full hover:bg-gold hover:text-white transition-all shadow-lg scale-90 group-hover:scale-100"
                                title="Replace Image"
                            >
                                <Plus size={18} />
                            </button>
                            <button
                                onClick={() => removeGalleryItem(idx)}
                                className="bg-red-600 text-white p-2.5 rounded-full hover:bg-red-700 transition-all shadow-lg scale-90 group-hover:scale-100"
                                title="Remove Image"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <span className="text-[10px] text-white font-bold font-kantumruy">កែសម្រួល</span>
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
                            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-red-600">{slotProgress}%</span>
                                <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${slotProgress}%` }} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground/40 group-hover:bg-red-600/10 group-hover:text-red-600 transition-all">
                                <Plus size={20} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] text-muted-foreground font-black font-kantumruy block group-hover:text-red-700">ដាក់រូបភាពទីនេះ</span>
                                <span className="text-[9px] text-muted-foreground/40 font-bold block">BROWSE OR DRAG</span>
                            </div>
                        </>
                    )}
                </button>
            )}
        </div>
    );

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
        <div className="space-y-6">
            <div className="bg-muted/40 p-4 rounded-xl mb-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none">
                <h3 className="text-sm font-bold text-foreground font-kantumruy mb-1">ជំហានទី៤៖ រូបភាព និងវីដេអូ</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">សូមបញ្ចូលរូបថតរបស់អ្នក។ <br /><span className="font-bold text-red-600">&quot;រូបភាពតាមពុម្ព&quot;</span> ជារូបភាពប្រចាំម៉ូដដែលត្រូវតែមាន ចំណែក <span className="font-bold text-red-600">&quot;រូបភាពរួម&quot;</span> ជារូបភាពវិចិត្រសាលបន្ថែម។</p>
            </div>

            {/* Hidden Inputs */}
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
                        // Reset input value to allow the same file to be selected again if needed
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
                        title: "បដា និងរូបភាពចម្បង (Main Banners)",
                        description: "រូបភាពធំៗសម្រាប់បង្ហាញនៅផ្នែកខាងលើ និងផែនទី",
                        indices: [0, 5]
                    },
                    {
                        title: "សាច់រឿងនៃក្តីស្រលាញ់ (Love Stories)",
                        description: "រូបភាពសម្រាប់បង្ហាញរៀបរាប់អំពីប្រវត្តិស្នេហា",
                        indices: [1, 2, 3, 4]
                    },
                    {
                        title: "ហត្ថលេខា និងរូបថតតួអង្គ (Portraits & Signatures)",
                        description: "រូបថតកូនកំលោះ កូនក្រមុំ និងរូបភាពអនុស្សាវរីយ៍ហត្ថលេខា",
                        indices: [6, 7, 8, 9, 10]
                    }
                ];

                return (
                    <div className="space-y-8">
                        {categories.map((cat, catIdx) => (
                            <div key={catIdx} className="space-y-4">
                                <div className="space-y-1 px-1">
                                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 dark:bg-red-950/20 p-1 px-2 rounded inline-block shadow-sm border border-red-100 dark:border-red-900/30">
                                        {cat.title}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground font-medium">{cat.description}</p>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                                    {cat.indices.map((idx) => {
                                        const label = layout.labels[idx];
                                        const item = wedding.galleryItems?.[idx];
                                        const hasUrl = item && item.url;
                                        const isHorizontal = getSlotAspectRatio(idx) > 1;

                                        return (
                                            <div key={idx} className={clsx("space-y-1.5", isHorizontal && "col-span-2")}>
                                                <p className="text-[10px] font-bold text-muted-foreground px-1 flex items-center justify-between gap-1.5">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-1 h-1 rounded-full bg-red-600" />
                                                        {label}
                                                    </span>
                                                    <span className="text-[8px] bg-muted/80 px-1 rounded font-normal opacity-60">
                                                        {isHorizontal ? "16:9 (1920x1080)" : "3:4 (1080x1440)"}
                                                    </span>
                                                </p>
                                                {renderImageSlot(idx, label, hasUrl, isHorizontal, item?.url)}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })()}

            {/* 1.5 SACRED BOND (CERTIFICATE) */}
            <div className="space-y-4 pt-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/60 p-1 px-2 rounded inline-block shadow-sm">សក្ខីភាពនៃក្តីស្រលាញ់ (Sacred Bond)</p>
                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground px-1 flex items-center gap-1.5 opacity-70">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        អាប់ឡូតសំបុត្រអាពាហ៍ពិពាហ៍ ឬរូបភាពតំណាងសេចក្តីស្រឡាញ់ (បង្ហាញនៅខាងក្រោមផែនទី)
                    </p>
                    
                    {(() => {
                        const cert = wedding.galleryItems?.find(i => i.type === 'CERTIFICATE');
                        const certIdx = wedding.galleryItems?.findIndex(i => i.type === 'CERTIFICATE');
                        const hasCert = !!cert?.url;

                        return (
                            <div className={clsx(
                                "relative rounded-3xl overflow-hidden bg-gold/5 border-2 border-dashed border-gold/20 flex flex-col items-center justify-center group transition-all duration-500 min-h-[160px]",
                                !hasCert && "hover:border-gold/40 hover:bg-gold/10"
                            )}>
                                {hasCert ? (
                                    <>
                                        <Image src={cert.url} alt="Sacred Bond" className="object-cover" fill sizes="(max-width: 768px) 100vw, 50vw" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setActiveSlotIdx(-1); // Special ID for certificate
                                                        slotInputRef.current?.click();
                                                    }}
                                                    className="bg-white text-gold p-3 rounded-full hover:bg-gold hover:text-white transition-all shadow-xl scale-90 group-hover:scale-100"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                                <button
                                                    onClick={() => certIdx !== undefined && removeGalleryItem(certIdx)}
                                                    className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-all shadow-xl scale-90 group-hover:scale-100"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            <span className="text-[10px] text-white font-bold font-kantumruy tracking-widest uppercase">ប្តូររូបភាព</span>
                                        </div>
                                    </>
                                ) : (
                                    <button 
                                        disabled={slotUploading}
                                        onClick={() => {
                                            setActiveSlotIdx(-1); // Special ID for certificate
                                            slotInputRef.current?.click();
                                        }} 
                                        className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center text-gold/40 group-hover:bg-gold/20 group-hover:text-gold transition-all duration-500 rotate-0 group-hover:rotate-12">
                                            <Plus size={28} />
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[12px] text-gold/60 font-black font-kantumruy block group-hover:text-gold transition-colors">បញ្ចូលរូបភាពសក្ខីភាព</span>
                                            <span className="text-[10px] text-gold/40 font-bold block uppercase tracking-tighter">Recommended: 4:3 or 16:9</span>
                                        </div>
                                    </button>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* 2. GENERAL GALLERY */}
            <div className="space-y-4 pt-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/60 p-1 px-2 rounded inline-block shadow-sm">រូបភាពអាល់ប៊ុមរួម</p>
                <div className="grid grid-cols-3 gap-3">
                    {wedding.galleryItems?.map((item: any, idx: number) => {
                        const isSpecial = layout && idx < layout.slots;
                        if (isSpecial || !item.url) return null;

                        return (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group shadow-md bg-muted/20 border-2 border-transparent hover:border-red-600/20 transition-all">
                                <Image src={item.url} alt="Extra Gallery" className="object-cover" fill sizes="(max-width: 768px) 33vw, 20vw" />
                                <button
                                    onClick={() => removeGalleryItem(idx)}
                                    className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg backdrop-blur-md"
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
                            "aspect-square rounded-xl flex flex-col items-center justify-center gap-2 transition-all group relative bg-muted/20 border-2 border-dashed border-muted-foreground/10",
                            isDraggingGallery ? "border-red-600/50 bg-red-50/10 scale-105" : "hover:border-red-600/30 hover:bg-white dark:hover:bg-muted/30"
                        )}
                    >
                        {galleryUploading ? (
                            <div className="flex flex-col items-center gap-2 p-2">
                                <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                                <span className="text-[10px] font-black text-red-600">{galleryProgress}%</span>
                            </div>
                        ) : (
                            <button 
                                onClick={() => generalInputRef.current?.click()} 
                                className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
                            >
                                <Plus size={24} className="text-muted-foreground/40 group-hover:text-red-500 mb-1 transition-colors" />
                                <span className="text-[11px] text-muted-foreground font-black font-kantumruy group-hover:text-red-600 transition-colors">ចុចអាប់ឡូត</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-4 p-4 bg-muted/20 rounded-2xl border border-muted-foreground/5 shadow-inner">
                    <Label className="text-[10px] text-muted-foreground font-black uppercase mb-3 block tracking-widest px-1">រចនាបថនៃការបង្ហាញរូបភាព</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {['masonry', 'slider', 'polaroid'].map((style) => (
                            <button
                                key={style}
                                onClick={() => updateTheme('galleryStyle', style as any, true)}
                                className={clsx(
                                    "py-3 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm",
                                    (wedding.themeSettings as any)?.galleryStyle === style || (style === 'masonry' && !(wedding.themeSettings as any)?.galleryStyle)
                                        ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                                        : "bg-background text-muted-foreground hover:bg-muted/50 border border-muted-foreground/10"
                                )}
                            >
                                {style === 'masonry' ? 'ក្រឡា (Grid)' : style === 'slider' ? 'រំកិល (Slide)' : 'ប៉ុឡារ៉ូអ៊ីត (Polaroid)'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                            <Music className="w-4 h-4 text-pink-500" />
                        </div>
                        <Label className="block text-xs font-black uppercase tracking-wider">តន្ត្រីកំដរ (Audio)</Label>
                    </div>
                </div>
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
            </div>

            <div className="mt-6 bg-amber-500/5 p-5 rounded-[2rem] border border-dashed border-amber-500/20">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                    <Label className="text-[12px] font-black font-kantumruy uppercase tracking-wider text-amber-700">បណ្ណាល័យចម្រៀងគំរូ</Label>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {[
                        { title: "ភ្លេងការខ្មែរ (Traditional)", url: "https://res.cloudinary.com/dmsh9p6af/video/upload/v1710123456/samples/wedding_sample_1.mp3" },
                        { title: "ស្នេហាពិត (True Love)", url: "https://res.cloudinary.com/dmsh9p6af/video/upload/v1710123457/samples/wedding_sample_2.mp3" },
                        { title: "ថ្ងៃមង្គល (Happy Day)", url: "https://res.cloudinary.com/dmsh9p6af/video/upload/v1710123458/samples/wedding_sample_3.mp3" }
                    ].map((song, i) => (
                        <button
                            key={i}
                            onClick={() => updateTheme('musicUrl', song.url, true)}
                            className={clsx(
                                "flex items-center justify-between p-3.5 rounded-2xl text-[11px] transition-all border font-bold",
                                wedding.themeSettings?.musicUrl === song.url
                                    ? "bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20"
                                    : "bg-white border-amber-100 text-amber-800 hover:border-amber-300 shadow-sm"
                            )}
                        >
                            <span className="flex items-center gap-3">
                                <Music size={14} className={wedding.themeSettings?.musicUrl === song.url ? "text-white" : "text-amber-500"} />
                                {song.title}
                            </span>
                            {wedding.themeSettings?.musicUrl === song.url && <div className="w-2 h-2 rounded-full bg-white animate-ping" />}
                        </button>
                    ))}
                </div>
                <p className="text-[10px] text-amber-700/60 mt-4 italic font-bold text-center underline decoration-amber-500/20">* អ្នកអាចរើសបទខាងលើ ឬអាប់ឡូតផ្ទាល់ខ្លួន។</p>
            </div>


            <div className="mt-8">
                <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <Video className="w-4 h-4 text-red-500" />
                    </div>
                    <Label className="block text-xs font-black uppercase tracking-wider">វីដេអូ YouTube</Label>
                </div>
                <DebouncedInput
                    placeholder="បញ្ចូលតំណភ្ជាប់ YouTube..."
                    value={wedding.themeSettings?.videoUrl || ""}
                    onDebouncedChange={(val) => updateTheme('videoUrl', val as string, true)}
                    className="h-12 rounded-xl border-muted-foreground/10 bg-muted/20 focus:ring-red-500 shadow-inner"
                />
            </div>

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
                title={activeSlotIdx !== null ? `សារែររូបភាព - ${activeSlotIdx === -1 ? 'សក្ខីភាពនៃក្តីស្រលាញ់' : (layout.labels[activeSlotIdx] || 'រូបភាព')}` : "សារែររូបភាព"}
            />
        </div>
    );
};

export default React.memo(Step4Media);

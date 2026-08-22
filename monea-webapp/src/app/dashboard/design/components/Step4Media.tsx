"use client";
import React from 'react';
import ImageCropperModal from "@/components/ui/image-cropper-modal";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import type { WeddingData } from '@/components/templates/types';
import { CategorizedSlots } from './sections/CategorizedSlots';
import { SacredBondSection } from './sections/SacredBondSection';
import { GeneralGallerySection } from './sections/GeneralGallerySection';
import { AudioVideoSection } from './sections/AudioVideoSection';

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
    const isAnniv = wedding.eventType === 'anniversary';
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

            <CategorizedSlots 
                wedding={wedding} 
                layout={layout} 
                isAnniv={isAnniv} 
                getSlotAspectRatio={getSlotAspectRatio} 
                setActiveSlotIdx={setActiveSlotIdx} 
                slotInputRef={slotInputRef} 
                removeGalleryItem={removeGalleryItem} 
                slotUploading={slotUploading} 
                slotProgress={slotProgress} 
                activeSlotIdx={activeSlotIdx} 
                t={t} 
            />

            <SacredBondSection 
                wedding={wedding} 
                setActiveSlotIdx={setActiveSlotIdx} 
                slotInputRef={slotInputRef} 
                removeGalleryItem={removeGalleryItem} 
                slotUploading={slotUploading} 
                t={t} 
            />

            <GeneralGallerySection 
                wedding={wedding} 
                layout={layout} 
                removeGalleryItem={removeGalleryItem} 
                generalInputRef={generalInputRef} 
                galleryUploading={galleryUploading} 
                galleryProgress={galleryProgress} 
                isDraggingGallery={isDraggingGallery} 
                setIsDraggingGallery={setIsDraggingGallery} 
                handleGalleryDirectUpload={handleGalleryDirectUpload} 
                updateTheme={updateTheme} 
                t={t} 
            />

            <AudioVideoSection 
                wedding={wedding} 
                isAnniv={isAnniv} 
                updateTheme={updateTheme} 
                removeThemeAsset={removeThemeAsset} 
                t={t} 
            />

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

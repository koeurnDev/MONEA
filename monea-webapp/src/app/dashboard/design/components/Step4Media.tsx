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
    updateGalleryOrder: (items: any[]) => void;
    onUploadingChange: (uploading: boolean) => void;
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
    TEMPLATE_LAYOUTS,
    updateGalleryOrder,
    onUploadingChange
}) => {
    const { t } = useTranslation();
    const isAnniv = wedding.eventType === 'anniversary';
    const layout = TEMPLATE_LAYOUTS[wedding.templateId || "khmer-legacy"];
    const [activeSlotIdx, setActiveSlotIdx] = React.useState<number | null>(null);
    const [isCropModalOpen, setIsCropModalOpen] = React.useState(false);
    const [selectedFileUrl, setSelectedFileUrl] = React.useState<string | null>(null);
    const [showExtraMedia, setShowExtraMedia] = React.useState(false);
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
    React.useEffect(() => {
        onUploadingChange(slotUploading || galleryUploading);
    }, [galleryUploading, onUploadingChange, slotUploading]);

    React.useEffect(() => () => onUploadingChange(false), [onUploadingChange]);

    const getSlotAspectRatio = (idx: number) => {
        const horizontalSlots = [1, 4, 5];
        const fourThreeSlots = [3];
        if (horizontalSlots.includes(idx)) return 16 / 9;
        if (fourThreeSlots.includes(idx)) return 4 / 3;
        return 3 / 4;
    };

    return (
        <div className="space-y-5 sm:space-y-8 font-kantumruy">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-black text-foreground">រូបភាពលើធៀប</h3>
                    <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">អាចរំលងបាន</span>
                </div>
                {(slotUploading || galleryUploading) && (
                    <p role="status" className="rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                        កំពុងបង្ហោះរូបភាព។ សូមរង់ចាំរហូតដល់ការបង្ហោះចប់ មុនពេលរក្សាទុក។
                    </p>
                )}
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    ដាក់រូបនៅទីនេះ ហើយជ្រើសលាក់ ឬបង្ហាញរូបនីមួយៗតាមចិត្ត។
                </p>
            </div>

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

            {/* Categorized Visual Photo Slots */}
            <CategorizedSlots 
                wedding={wedding} 
                layout={layout} 
                isAnniv={isAnniv} 
                getSlotAspectRatio={getSlotAspectRatio} 
                setActiveSlotIdx={setActiveSlotIdx} 
                slotInputRef={slotInputRef} 
                removeGalleryItem={removeGalleryItem} 
                updateTheme={updateTheme}
                slotUploading={slotUploading} 
                slotProgress={slotProgress} 
                activeSlotIdx={activeSlotIdx} 
                t={t} 
            />

            <button
                type="button"
                onClick={() => setShowExtraMedia((value) => !value)}
                aria-expanded={showExtraMedia}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-left dark:border-white/10 dark:bg-white/[0.02]"
            >
                <span className="font-kantumruy text-xs font-bold text-foreground">រូបថតបន្ថែម តន្ត្រី និងវីដេអូ (ស្រេចចិត្ត)</span>
                <span className={`text-muted-foreground transition-transform ${showExtraMedia ? "rotate-180" : ""}`}>⌄</span>
            </button>

            {showExtraMedia && <>

            {/* General Multi-Photo Album Section */}
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
                updateGalleryOrder={updateGalleryOrder}
                t={t} 
            />

            {/* Background Music & Video */}
            <AudioVideoSection 
                wedding={wedding} 
                isAnniv={isAnniv} 
                updateTheme={updateTheme} 
                removeThemeAsset={removeThemeAsset} 
                t={t} 
            />
            </>}

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
                title="កាត់តម្រឹមរូបភាព (Crop Photo)"
            />
        </div>
    );
};

export default React.memo(Step4Media);

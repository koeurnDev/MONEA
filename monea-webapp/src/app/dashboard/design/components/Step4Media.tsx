import React from "react";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { WeddingData } from "@/components/templates/types";
import { GeneralGallerySection } from "./sections/GeneralGallerySection";
import { AudioVideoSection } from "./sections/AudioVideoSection";

interface Step4MediaProps {
    wedding: WeddingData;
    onPreviewInvitation: () => void;
    photoMigrationNotice: string | null;
    onDismissPhotoMigrationNotice: () => void;
    updateTheme: (key: string | Record<string, unknown>, value?: any, autoSave?: boolean) => void;
    removeThemeAsset: (urlKey: string, publicIdKey: string) => Promise<void>;
    removeGalleryItem: (index: number) => void;
    replaceGalleryPhoto: (index: number, url: string, publicId?: string) => Promise<boolean>;
    moveGalleryPhoto: (fromIndex: number, toIndex: number) => Promise<boolean>;
    handleGalleryDirectUpload: (files: FileList | File[]) => Promise<boolean>;
    galleryUploading: boolean;
    galleryProgress: number;
    galleryUploadError: string | null;
    failedGalleryFileCount: number;
    retryGalleryUpload: () => Promise<boolean>;
    onUploadingChange: (uploading: boolean) => void;
}

const Step4Media: React.FC<Step4MediaProps> = ({
    wedding,
    onPreviewInvitation,
    photoMigrationNotice,
    onDismissPhotoMigrationNotice,
    updateTheme,
    removeThemeAsset,
    removeGalleryItem,
    replaceGalleryPhoto,
    moveGalleryPhoto,
    handleGalleryDirectUpload,
    galleryUploading,
    galleryProgress,
    galleryUploadError,
    failedGalleryFileCount,
    retryGalleryUpload,
    onUploadingChange,
}) => {
    const { t } = useTranslation();
    const [showExtraMedia, setShowExtraMedia] = React.useState(false);
    const [uploadStatus, setUploadStatus] = React.useState<"idle" | "uploading" | "success" | "error">("idle");
    const [saveError, setSaveError] = React.useState<string | null>(null);
    const [savingPhotoBatch, setSavingPhotoBatch] = React.useState(false);
    const [cropUploading, setCropUploading] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        onUploadingChange(galleryUploading || savingPhotoBatch || cropUploading);
    }, [cropUploading, galleryUploading, onUploadingChange, savingPhotoBatch]);
    React.useEffect(() => () => onUploadingChange(false), [onUploadingChange]);
    React.useEffect(() => {
        if (uploadStatus === "success" && failedGalleryFileCount > 0) {
            setSaveError(galleryUploadError || "រូបខ្លះបានដាក់ និងរក្សាទុករួចហើយ ប៉ុន្តែមានរូបខ្លះបរាជ័យ។ សូមសាកដាក់រូបដែលបរាជ័យម្ដងទៀត។");
            setUploadStatus("error");
        }
    }, [failedGalleryFileCount, galleryUploadError, uploadStatus]);

    const uploadFiles = async (files: FileList | File[]) => {
        const selectedFiles = Array.from(files);
        if (selectedFiles.length === 0) return;
        const invalidFile = selectedFiles.find((file) => !file.type.startsWith("image/"));
        if (invalidFile) {
            setSaveError("សូមជ្រើសរើសឯកសាររូបភាពប៉ុណ្ណោះ។ រូបភាពនឹងត្រូវដាក់តាមលំដាប់ស្វ័យប្រវត្តិ។");
            setUploadStatus("error");
            return;
        }

        setUploadStatus("uploading");
        setSaveError(null);
        setSavingPhotoBatch(true);
        try {
            const saved = await handleGalleryDirectUpload(selectedFiles);
            if (saved) {
                setUploadStatus("success");
            } else {
                setSaveError(galleryUploadError || "រូបបានផ្ទុកឡើង ប៉ុន្តែរក្សាទុកមិនបាន។ សូមពិនិត្យអ៊ីនធឺណិត ហើយសាកម្ដងទៀត។");
                setUploadStatus("error");
            }
        } catch (error) {
            console.error("Photo batch upload failed:", error);
            setSaveError(error instanceof Error ? error.message : "មិនអាចដាក់ និងរក្សាទុករូបបានទេ។");
            setUploadStatus("error");
        } finally {
            setSavingPhotoBatch(false);
        }
    };

    const retryFailedFiles = async () => {
        setUploadStatus("uploading");
        setSaveError(null);
        setSavingPhotoBatch(true);
        try {
            const saved = await retryGalleryUpload();
            if (saved) {
                setUploadStatus("success");
            } else {
                setSaveError(galleryUploadError || "មិនអាចរក្សាទុករូបបានទេ។ សូមសាកម្ដងទៀត។");
                setUploadStatus("error");
            }
        } catch (error) {
            console.error("Retrying photo upload failed:", error);
            setSaveError(error instanceof Error ? error.message : "មិនអាចសាកដាក់រូបម្ដងទៀតបានទេ។");
            setUploadStatus("error");
        } finally {
            setSavingPhotoBatch(false);
        }
    };

    return (
        <div className="space-y-3 font-kantumruy sm:space-y-8">
            <div className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-black text-foreground">រូបភាពសម្រាប់ធៀប</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">អាចរំលងបាន</span>
                </div>
                <ol className="mt-3 grid gap-2 rounded-xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground sm:grid-cols-3">
                    <li><span className="font-bold text-foreground">១. ជ្រើសរើសរូបទាំងអស់</span><br />អាចជ្រើសរើសច្រើនសន្លឹកម្ដង។</li>
                    <li><span className="font-bold text-foreground">២. រូបទី១ជារូបគម្រប</span><br />រូបបន្ទាប់ៗទៅផ្នែកផ្សេងៗដោយស្វ័យប្រវត្តិ។</li>
                    <li><span className="font-bold text-foreground">៣. ពិនិត្យលទ្ធផល</span><br />ចុច «មើលរូបនៅលើធៀប» ដើម្បីមើល។</li>
                </ol>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    រូបដែលមានរួចនឹងមិនត្រូវបានជំនួសទេ។ រូបថ្មីបំពេញកន្លែងទំនេរបន្ទាប់ ហើយរូបបន្ថែមលើសនឹងចូលកម្រងរូប។
                </p>
                <button
                    type="button"
                    onClick={onPreviewInvitation}
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-primary/30 bg-card px-4 text-sm font-bold text-primary transition-colors hover:bg-accent md:hidden"
                >
                    មើលរូបនៅលើធៀប
                </button>
            </div>

            {photoMigrationNotice && (
                <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
                    <span>{photoMigrationNotice}</span>
                    <button type="button" onClick={onDismissPhotoMigrationNotice} aria-label="បិទសារព័ត៌មាន" className="min-h-8 min-w-8 shrink-0 rounded-lg hover:bg-sky-900/10">×</button>
                </div>
            )}

            <GeneralGallerySection
                wedding={wedding}
                inputRef={inputRef}
                uploading={galleryUploading || savingPhotoBatch}
                progress={galleryProgress}
                uploadStatus={uploadStatus}
                uploadError={saveError || galleryUploadError}
                failedFileCount={failedGalleryFileCount}
                onUpload={uploadFiles}
                onRetry={retryFailedFiles}
                onReplacePhoto={replaceGalleryPhoto}
                onMovePhoto={moveGalleryPhoto}
                onMediaOperationChange={setCropUploading}
                removeGalleryItem={removeGalleryItem}
                updateTheme={updateTheme}
            />

            <button
                type="button"
                onClick={() => setShowExtraMedia((value) => !value)}
                aria-expanded={showExtraMedia}
                className="flex w-full items-center justify-between rounded-2xl border border-border bg-muted/30 px-4 py-3 text-left"
            >
                <span className="text-xs font-bold text-foreground">តន្ត្រី និងវីដេអូ (ស្រេចចិត្ត)</span>
                <span className={`text-muted-foreground transition-transform ${showExtraMedia ? "rotate-180" : ""}`}>⌄</span>
            </button>
            {showExtraMedia && (
                <>
                    <AudioVideoSection
                        wedding={wedding}
                        isAnniv={wedding.eventType === "anniversary"}
                        updateTheme={updateTheme}
                        removeThemeAsset={removeThemeAsset}
                        t={t}
                    />
                </>
            )}
        </div>
    );
};

export default React.memo(Step4Media);

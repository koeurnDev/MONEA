import * as React from "react";
import { Button } from "@/components/ui/button";
import { motion as m, AnimatePresence } from "framer-motion";
import { ImagePlus, Trash, Loader2, RefreshCw } from "lucide-react";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import ImageCropperModal from "./image-cropper-modal";

interface ImageUploadProps {
    value: string;
    onChange: (url: string, publicId?: string) => void;
    onRemove: () => void;
    disabled?: boolean;
    folder?: string;
    label?: string;
    compact?: boolean;
    maxFileSizeBytes?: number;
    allowedMimeTypes?: readonly string[];
}

export default function ImageUploadWidget({
    value,
    onChange,
    onRemove,
    disabled,
    folder,
    label,
    compact = false,
    maxFileSizeBytes,
    allowedMimeTypes,
}: ImageUploadProps) {
    const [isMounted, setIsMounted] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = React.useState(false);
    const [selectedFileUrl, setSelectedFileUrl] = React.useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = React.useState<number>(1);
    const [validationError, setValidationError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { uploading, progress, error, uploadFile, retryUpload } = useCloudinaryUpload({
        onSuccess: (url, publicId) => onChange?.(url, publicId),
        onError: (error) => console.error("Upload error:", error),
        resourceType: "image",
        folder
    });

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setValidationError("សូមជ្រើសរើសឯកសាររូបភាព។");
            return;
        }
        if (allowedMimeTypes && !allowedMimeTypes.includes(file.type)) {
            setValidationError("ប្រភេទរូបភាពនេះមិនត្រូវបានអនុញ្ញាតទេ។");
            return;
        }
        if (maxFileSizeBytes && file.size > maxFileSizeBytes) {
            setValidationError(`រូបភាពត្រូវមានទំហំតិចជាង ${Math.round(maxFileSizeBytes / 1024 / 1024)}MB។`);
            return;
        }
        setValidationError(null);
        
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setSelectedFileUrl(reader.result);
                setIsCropModalOpen(true);
            } else {
                setValidationError("មិនអាចអានរូបភាពនេះបានទេ។ សូមសាកល្បងរូបភាពផ្សេង។");
            }
        };
        reader.onerror = () => setValidationError("មិនអាចអានរូបភាពនេះបានទេ។ សូមសាកល្បងម្តងទៀត។");
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        const file = new File([croppedBlob], "cropped_image.jpg", { type: "image/jpeg" });
        await uploadFile(file);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (disabled || uploading) return;
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled || uploading) return;

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="w-full">
            <m.div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`
                    relative border-2 border-dashed rounded-2xl p-3 sm:p-4 transition-all duration-300
                    ${isDragging ? 'border-rose-500 bg-rose-500/5' : 'border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]'}
                    ${uploading ? 'opacity-80' : ''}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <div className={`flex w-full flex-col items-center justify-center ${compact ? "min-h-[112px]" : "min-h-[150px] sm:min-h-[180px]"}`}>
                    {value ? (
                        <m.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`group relative w-full rounded-xl border border-slate-200 bg-white p-2 shadow-md dark:border-white/10 ${compact ? "max-w-[260px]" : ""}`}
                        >
                            <img 
                                className={`w-full rounded-lg object-contain transition-transform duration-500 group-hover:scale-[1.02] ${compact ? "aspect-[1.6/1]" : "aspect-video"}`}
                                alt="Uploaded Image"
                                src={value}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2.5 backdrop-blur-[2px]">
                                <Button
                                    type="button"
                                    disabled={disabled || uploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    aria-label="ប្តូររូបភាព"
                                    size="sm"
                                    className="h-8 rounded-lg px-3 text-[11px] font-bold bg-white text-slate-900 hover:bg-white/90 shadow-lg"
                                >
                                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                    ប្តូររូប
                                </Button>
                                <Button
                                    type="button"
                                    disabled={disabled || uploading}
                                    onClick={() => onRemove?.()}
                                    aria-label="លុបរូបភាព"
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 rounded-lg px-3 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 shadow-lg"
                                >
                                    <Trash className="h-3.5 w-3.5 mr-1.5" />
                                    លុបចេញ
                                </Button>
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/60 text-white">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span className="text-xs font-bold">កំពុងប្តូររូបភាព... {progress}%</span>
                                </div>
                            )}
                            <div className="relative mt-2 flex items-center gap-2 sm:hidden">
                                <Button
                                    type="button"
                                    disabled={disabled || uploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    size="sm"
                                    className="h-8 flex-1 rounded-lg bg-white/95 px-2 text-[10px] font-bold text-slate-900 shadow-lg"
                                >
                                    <RefreshCw className="mr-1 h-3.5 w-3.5" /> ប្តូរ
                                </Button>
                                <Button
                                    type="button"
                                    disabled={disabled || uploading}
                                    onClick={() => onRemove?.()}
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 flex-1 rounded-lg bg-rose-600/95 px-2 text-[10px] font-bold text-white shadow-lg"
                                >
                                    <Trash className="mr-1 h-3.5 w-3.5" /> លុប
                                </Button>
                            </div>
                        </m.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full text-center py-4">
                            {validationError || error ? (
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <p className="text-xs font-bold text-rose-600 font-kantumruy">{validationError || error}</p>
                                    {error && (
                                        <Button type="button" onClick={retryUpload} className="h-9 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white">
                                            សាកល្បងម្តងទៀត
                                        </Button>
                                    )}
                                </div>
                            ) : uploading ? (
                                <div className="space-y-4 w-full max-w-[200px]">
                                    <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto" />
                                    <p className="text-xs font-bold text-foreground font-kantumruy">កំពុងបញ្ចូលរូបភាព...</p>
                                    <div className="space-y-1.5">
                                        <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                            <m.div
                                                className="h-full bg-rose-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground font-mono">{progress}%</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center w-full space-y-3">
                                    <div className="w-12 h-12 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm">
                                        <ImagePlus className="h-6 w-6" />
                                    </div>
                                    
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-foreground font-kantumruy">
                                            {label || "អូសរូបភាពទម្លាក់ ឬចុចរើសរូបភាព"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                                            JPG, PNG, WEBP (Max 10MB)
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        disabled={disabled || uploading}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="rounded-xl px-5 h-9 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs shadow-sm"
                                    >
                                        រើសរូបភាព (Browse)
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </m.div>

            <input 
                type="file" 
                accept={allowedMimeTypes?.join(",") || "image/*"}
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => {
                    const input = e.currentTarget;
                    const file = input.files?.[0];
                    input.value = "";
                    if (file) handleFileSelect(file);
                }}
            />
            {(validationError || error) && value && (
                <div role="alert" className="mt-2 flex flex-wrap items-center justify-center gap-2 text-center">
                    <p className="text-xs font-bold text-rose-600">{validationError || error}</p>
                    {error && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={disabled || uploading}
                            onClick={retryUpload}
                            className="h-8 rounded-lg px-3 text-[11px] font-bold"
                        >
                            សាកល្បងម្តងទៀត
                        </Button>
                    )}
                </div>
            )}

            <ImageCropperModal
                isOpen={isCropModalOpen}
                onClose={() => {
                    setIsCropModalOpen(false);
                    setSelectedFileUrl(null);
                }}
                imageSrc={selectedFileUrl}
                onCropComplete={handleCropComplete}
                aspectRatio={aspectRatio}
            />
        </div>
    );
}

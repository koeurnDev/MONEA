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
}

export default function ImageUploadWidget({
    value,
    onChange,
    onRemove,
    disabled,
    folder,
    label
}: ImageUploadProps) {
    const [isMounted, setIsMounted] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = React.useState(false);
    const [selectedFileUrl, setSelectedFileUrl] = React.useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = React.useState<number>(1);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { uploading, progress, uploadFile } = useCloudinaryUpload({
        onSuccess: (url, publicId) => onChange?.(url, publicId),
        onError: (error) => console.error("Upload error:", error),
        resourceType: "image",
        folder
    });

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = () => {
            setSelectedFileUrl(reader.result as string);
            setIsCropModalOpen(true);
        };
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
        if (file && file.type.startsWith('image/')) {
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
                    relative border-2 border-dashed rounded-2xl p-4 sm:p-5 transition-all duration-300
                    ${isDragging ? 'border-rose-500 bg-rose-500/5' : 'border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]'}
                    ${uploading ? 'opacity-80' : ''}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <div className="flex flex-col items-center justify-center min-h-[180px] w-full">
                    {value ? (
                        <m.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md group"
                        >
                            <img 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                alt="Uploaded Image"
                                src={value}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2.5 backdrop-blur-[2px]">
                                <Button
                                    type="button"
                                    disabled={disabled || uploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    size="sm"
                                    className="rounded-xl px-4 h-9 bg-white text-slate-900 hover:bg-white/90 font-bold text-xs shadow-lg"
                                >
                                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                    ប្តូររូប
                                </Button>
                                <Button
                                    type="button"
                                    disabled={disabled || uploading}
                                    onClick={() => onRemove?.()}
                                    variant="destructive"
                                    size="sm"
                                    className="rounded-xl px-4 h-9 bg-rose-600 hover:bg-rose-700 font-bold text-xs shadow-lg"
                                >
                                    <Trash className="h-3.5 w-3.5 mr-1.5" />
                                    លុបចេញ
                                </Button>
                            </div>
                        </m.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full text-center py-4">
                            {uploading ? (
                                <div className="space-y-4 w-full max-w-[200px]">
                                    <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto" />
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
                accept="image/*"
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                }}
            />

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

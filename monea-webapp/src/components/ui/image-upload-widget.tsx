"use client";
import * as React from "react";
import { CldImage } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { motion as m, AnimatePresence } from "framer-motion";
import { ImagePlus, Trash, Loader2, Scissors } from "lucide-react";
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
    folder
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

    const onError = (error: any) => {
        console.error("Cloudinary Upload Error:", error);
    };

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
                animate={{
                    borderColor: isDragging ? "rgb(212, 175, 55)" : "rgba(229, 231, 235, 0.2)",
                    backgroundColor: isDragging ? "rgba(212, 175, 55, 0.05)" : "rgba(24, 24, 27, 0.4)",
                    scale: isDragging ? 1.02 : 1,
                }}
                className={`
                    relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 backdrop-blur-md
                    ${uploading ? 'opacity-80' : ''}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    shadow-[0_8px_32px_rgba(0,0,0,0.2)]
                `}
            >
                <div className="flex flex-col items-center justify-center min-h-[220px] py-4">
                    {value ? (
                        <m.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl group max-w-[300px]"
                        >
                            <CldImage
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                alt="Uploaded Image"
                                src={value}
                                sizes="(max-width: 768px) 100vw, 300px"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                <Button
                                    type="button"
                                    disabled={disabled || uploading}
                                    onClick={() => onRemove?.()}
                                    variant="destructive"
                                    size="sm"
                                    className="rounded-full px-6 shadow-lg bg-red-500/80 hover:bg-red-500 backdrop-blur-md border border-white/10"
                                >
                                    <Trash className="h-4 w-4 mr-2" />
                                    លុបចេញ
                                </Button>
                            </div>
                        </m.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full text-center">
                            {uploading ? (
                                <div className="space-y-6 w-full max-w-[240px]">
                                    <div className="relative">
                                        <Loader2 className="h-10 w-10 animate-spin text-gold mx-auto" />
                                        <m.div 
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="absolute inset-0 bg-gold/20 blur-xl rounded-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <m.div
                                                className="h-full bg-gradient-to-r from-gold/50 via-gold to-gold/50 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center px-1">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-gold/60">Uploading</p>
                                            <p className="text-[10px] font-black text-gold">{progress}%</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <m.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center w-full"
                                >
                                    <m.div 
                                        animate={isDragging ? { scale: 1.1, rotate: 5, color: "#D4AF37" } : {}}
                                        className="w-14 h-14 bg-white/5 rounded-2xl shadow-inner border border-white/10 flex items-center justify-center mb-4 text-white/20"
                                    >
                                        <ImagePlus className="h-6 w-6" />
                                    </m.div>
                                    
                                    <div className="space-y-1 mb-6">
                                        <p className="text-sm font-bold text-white/90 tracking-tight">អូសរូបភាពមកទីនេះ</p>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black">Drag & Drop images here</p>
                                    </div>

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

                                    <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            type="button"
                                            disabled={disabled || uploading}
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="rounded-full px-8 h-10 bg-white text-black border-none hover:bg-gold hover:text-white transition-all duration-300 font-bold text-xs shadow-lg"
                                        >
                                            រើសរូបភាព (Browse)
                                        </Button>
                                    </m.div>
                                </m.div>
                            )}
                        </div>
                    )}
                </div>
            </m.div>
            
            <AnimatePresence>
                {isDragging && !uploading && (
                    <m.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3 text-center"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold animate-pulse">
                            Release to upload
                        </p>
                    </m.div>
                )}
            </AnimatePresence>

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

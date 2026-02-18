"use client";

import { CldUploadWidget, CldImage } from "next-cloudinary";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash, Loader2 } from "lucide-react";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";

interface ImageUploadProps {
    value: string;
    onChange: (value: string) => void;
    onRemove: () => void;
    disabled?: boolean;
}

export default function ImageUploadWidget({
    value,
    onChange,
    onRemove,
    disabled
}: ImageUploadProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const { uploading, progress, uploadFile } = useCloudinaryUpload({
        onSuccess: (url) => onChange(url),
        onError: (error) => console.error("Upload error:", error),
        resourceType: "image"
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onUploadSuccess = (result: any) => {
        onChange(result.info.secure_url);
    };

    const onError = (error: any) => {
        console.error("Cloudinary Upload Error:", error);
    };

    const handleDirectUpload = async (file: File) => {
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
            handleDirectUpload(file);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="w-full">
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`
                    relative border-2 border-dashed rounded-xl p-4 transition-all duration-200
                    ${isDragging ? 'border-red-500 bg-red-50 scale-[1.01]' : 'border-gray-200 bg-gray-50/50'}
                    ${uploading ? 'opacity-80' : ''}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <div className="flex flex-col items-center justify-center min-h-[160px]">
                    {value ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-100 shadow-sm group">
                            <CldImage
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                alt="Uploaded Image"
                                src={value}
                                sizes="(max-width: 768px) 100vw, 400px"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                    type="button"
                                    disabled={disabled || uploading}
                                    onClick={() => onRemove()}
                                    variant="destructive"
                                    size="sm"
                                    className="rounded-full"
                                >
                                    <Trash className="h-4 w-4 mr-2" />
                                    លុបចេញ
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full py-6 text-center">
                            {uploading ? (
                                <div className="space-y-4 w-full max-w-[240px]">
                                    <Loader2 className="h-10 w-10 animate-spin text-red-900 mx-auto" />
                                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-900 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-sm font-bold text-red-900 leading-none">
                                        កំពុងបញ្ជូន {progress}%
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 text-gray-400">
                                        <ImagePlus className="h-7 w-7" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-600 mb-1">អូសរូបភាពមកទីនេះ</p>
                                    <p className="text-xs text-gray-400 mb-6">Drag & Drop images here</p>

                                    <CldUploadWidget
                                        onSuccess={onUploadSuccess}
                                        onError={onError}
                                        signatureEndpoint="/api/cloudinary/sign"
                                        uploadPreset="wedding_upload"
                                        options={{
                                            maxFiles: 1,
                                            sources: ['local', 'google_drive', 'facebook'],
                                            clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
                                            maxImageFileSize: 10000000,
                                            cropping: true,
                                            styles: {
                                                palette: {
                                                    window: "#FFFFFF",
                                                    windowBorder: "#90A0B3",
                                                    tabIcon: "#D4AF37",
                                                    menuIcons: "#5A616A",
                                                    textDark: "#000000",
                                                    textLight: "#FFFFFF",
                                                    link: "#D4AF37",
                                                    action: "#D4AF37",
                                                    inactiveTabIcon: "#0E2F5A",
                                                    error: "#F44235",
                                                    inProgress: "#D4AF37",
                                                    complete: "#20B832",
                                                    sourceBg: "#E4EBF1"
                                                },
                                                zIndex: 99999
                                            }
                                        }}
                                    >
                                        {({ open, isLoading }) => (
                                            <Button
                                                type="button"
                                                disabled={disabled || isLoading}
                                                variant="outline"
                                                onClick={() => open()}
                                                className="rounded-full px-8 bg-white border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm"
                                            >
                                                រើសរូបភាព (Browse)
                                            </Button>
                                        )}
                                    </CldUploadWidget>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {isDragging && !uploading && (
                <div className="mt-2 text-center">
                    <p className="text-xs font-bold text-red-600 animate-bounce">
                        លែងដៃដើម្បីដាក់រូបភាព! (Release to upload)
                    </p>
                </div>
            )}
        </div>
    );
}

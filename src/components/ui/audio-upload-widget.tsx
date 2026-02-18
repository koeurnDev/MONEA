"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Music, Trash, Loader2, FileAudio } from "lucide-react";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";

interface AudioUploadProps {
    value: string;
    onChange: (value: string) => void;
    onRemove: () => void;
    disabled?: boolean;
}

export default function AudioUploadWidget({
    value,
    onChange,
    onRemove,
    disabled
}: AudioUploadProps) {
    const [isMounted, setIsMounted] = useState(false);

    // Use the shared hook which handles the entire upload process
    // Note: The CldUploadWidget below is a backup/alternative, 
    // but the hook provides the direct upload capability for future drag-and-drop
    // or custom button implementations if we want to bypass the widget UI.
    // However, CldUploadWidget manages its own state. 
    // Ideally, we should unify this, but CldUploadWidget is robust.
    // The previous implementation used CldUploadWidget primarily.
    // The "uploading" state in the previous code was only for the CldUploadWidget loading state?
    // Wait, the previous code had CldUploadWidget AND a "Direct Upload" logic?
    // Actually, looking at the previous file, it ONLY used CldUploadWidget.
    // It didn't have the drag-and-drop logic like ImageUploadWidget.
    // So for Audio, we might just want to keep CldUploadWidget for now, 
    // OR implementing drag-and-drop using our new hook.

    // Let's IMPROVE AudioUploadWidget by adding the same drag-and-drop capability!

    const { uploading, progress, uploadFile } = useCloudinaryUpload({
        onSuccess: (url) => onChange(url),
        onError: (error) => {
            console.error("Upload error:", error);
            alert(`Upload failed: ${error.statusText || error.message || "Unknown error"}`);
        },
        resourceType: "video" // Cloudinary treats audio as video usually
    });

    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onUploadSuccess = (result: any) => {
        onChange(result.info.secure_url);
    };

    const onError = (error: any) => {
        console.error("Cloudinary Upload Error:", error);
        alert(`Upload failed: ${error.statusText || error.message || "Size limit exceeded"}`);
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
            uploadFile(file);
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
                    ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-gray-200 bg-gray-50/50'}
                    ${uploading ? 'opacity-80' : ''}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <div className="flex flex-col items-center justify-center min-h-[120px]">
                    {value ? (
                        <div className="w-full space-y-4">
                            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                    <Music className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">Background Music</p>
                                    <p className="text-xs text-gray-500 truncate">{value}</p>
                                </div>
                            </div>

                            <audio controls className="w-full">
                                <source src={value} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => onRemove()}
                                    variant="destructive"
                                    size="sm"
                                    className="rounded-lg"
                                >
                                    <Trash className="h-4 w-4 mr-2" />
                                    លុបចេញ (Remove)
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full py-4 text-center">
                            {uploading ? (
                                <div className="space-y-4 w-full max-w-[240px]">
                                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-sm font-bold text-blue-600 leading-none">
                                        កំពុងបញ្ជូន {progress}%
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 text-gray-400">
                                        <FileAudio className="h-7 w-7" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-600 mb-1">ដាក់បញ្ចូលភ្លេង (Upload MP3)</p>
                                    <p className="text-xs text-gray-400 mb-4">Drag & Drop audio or browse</p>

                                    <CldUploadWidget
                                        onSuccess={onUploadSuccess}
                                        onError={onError}
                                        signatureEndpoint="/api/cloudinary/sign"
                                        uploadPreset="wedding_upload"
                                        options={{
                                            maxFiles: 1,
                                            sources: ['local', 'google_drive', 'facebook'],
                                            clientAllowedFormats: ['mp3', 'wav', 'ogg'],
                                            maxFileSize: 50000000, // 50MB
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
                                                }
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
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        កំពុងដំណើរការ...
                                                    </>
                                                ) : (
                                                    "រើសឯកសារ (Browse)"
                                                )}
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
                    <p className="text-xs font-bold text-blue-600 animate-bounce">
                        លែងដៃដើម្បីដាក់ភ្លេង! (Release to upload)
                    </p>
                </div>
            )}
        </div>
    );
}

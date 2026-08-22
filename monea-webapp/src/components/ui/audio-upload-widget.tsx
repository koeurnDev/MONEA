"use client";
import * as React from "react";
import { CldImage } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Music, Trash, Loader2, FileAudio } from "lucide-react";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";

interface AudioUploadProps {
    value: string;
    onChange: (url: string, publicId?: string) => void;
    onRemove: () => void;
    disabled?: boolean;
    folder?: string;
}

export default function AudioUploadWidget({
    value,
    onChange,
    onRemove,
    disabled,
    folder
}: AudioUploadProps) {
    const [isMounted, setIsMounted] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { uploading, progress, uploadFile } = useCloudinaryUpload({
        onSuccess: (url, publicId) => onChange?.(url, publicId),
        onError: (error) => {
            console.error("Upload error:", error);
            alert(`Upload failed: ${error.statusText || error.message || "Unknown error"}`);
        },
        resourceType: "auto", // Cloudinary will auto-detect if it's audio/video
        folder
    });

    const [isDragging, setIsDragging] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

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

                            <audio 
                                key={value} 
                                controls 
                                src={value} 
                                className="w-full" 
                                preload="metadata" 
                                crossOrigin="anonymous"
                            >
                                Your browser does not support the audio element.
                            </audio>

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => onRemove?.()}
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
                                    <p className="text-sm font-bold text-gray-600 mb-1 md:block hidden">ដាក់បញ្ចូលភ្លេង (Upload MP3)</p>
                                    <p className="text-sm font-bold text-gray-600 mb-1 md:hidden">រើសឯកសារភ្លេង</p>
                                    <p className="text-xs text-gray-400 mb-4 md:block hidden">Drag & Drop audio or browse</p>

                                    <input 
                                        type="file" 
                                        accept="audio/*"
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) uploadFile(file);
                                        }}
                                    />

                                    <Button
                                        type="button"
                                        disabled={disabled || uploading}
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="rounded-full px-8 bg-white border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm"
                                    >
                                        រើសឯកសារ (Browse)
                                    </Button>
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

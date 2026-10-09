import { useState } from 'react';
import { moneaClient } from '@/lib/api-client';

interface UseCloudinaryUploadProps {
    onSuccess: (url: string, publicId?: string) => void;
    onError?: (error: any) => void;
    uploadPreset?: string;
    resourceType?: "auto" | "image" | "video" | "raw";
    folder?: string;
}

export function useCloudinaryUpload({
    onSuccess,
    onError,
    uploadPreset = "wedding_upload",
    resourceType = "auto",
    folder
}: UseCloudinaryUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [lastFile, setLastFile] = useState<File | null>(null);

    const uploadFile = async (file: File) => {
        try {
            setLastFile(file);
            setError(null);
            setUploading(true);
            setProgress(0);

            // 1. Get signature
            const timestamp = Math.round((new Date()).getTime() / 1000);
            const response = await moneaClient.post<{ signature: string; folder: string }>('/api/cloudinary/sign', {
                paramsToSign: {
                    timestamp,
                    upload_preset: uploadPreset,
                    folder
                }
            });

            if (!response.data?.signature || !response.data.folder) {
                throw new Error(response.error || "មិនអាចភ្ជាប់ទៅ server បានទេ");
            }

            const { signature } = response.data;

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY!);
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("upload_preset", uploadPreset);
            formData.append("folder", response.data.folder);

            const xhr = new XMLHttpRequest();
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setProgress(Math.round(percentComplete));
                }
            };

            await new Promise<void>((resolve) => {
                xhr.onload = () => {
                    try {
                        if (xhr.status === 200) {
                            const result = JSON.parse(xhr.responseText);
                            onSuccess(result.secure_url, result.public_id);
                        } else {
                            const uploadError = xhr.responseText;
                            console.error("Upload failed", uploadError);
                            setError("ការបញ្ចូលរូបភាពបរាជ័យ។ សូមសាកល្បងម្តងទៀត។");
                            if (onError) onError(uploadError);
                        }
                    } catch (uploadError) {
                        console.error("Failed to process upload response:", uploadError);
                        setError("មិនអាចដំណើរការរូបភាពដែលបានបញ្ចូលទេ។");
                        if (onError) onError(uploadError);
                    } finally {
                        setUploading(false);
                        resolve();
                    }
                };

                xhr.onerror = () => {
                    const uploadError = "XHR Error during upload";
                    try {
                        console.error(uploadError);
                        setError("អ៊ីនធឺណិតមានបញ្ហា។ សូមសាកល្បងម្តងទៀត។");
                        if (onError) onError(uploadError);
                    } finally {
                        setUploading(false);
                        resolve();
                    }
                };

                xhr.send(formData);
            });

        } catch (error) {
            console.error("Direct upload error:", error);
            setError(error instanceof Error ? error.message : "ការបញ្ចូលរូបភាពបរាជ័យ។");
            if (onError) onError(error);
            setUploading(false);
        }
    };

    return {
        uploading,
        progress,
        error,
        uploadFile,
        retryUpload: () => lastFile ? uploadFile(lastFile) : undefined
    };
}

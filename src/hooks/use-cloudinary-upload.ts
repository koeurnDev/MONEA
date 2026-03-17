import { useState } from 'react';

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

    const uploadFile = async (file: File) => {
        try {
            setUploading(true);
            setProgress(0);

            // 1. Get signature
            const timestamp = Math.round((new Date()).getTime() / 1000);
            const response = await fetch('/api/cloudinary/sign', {
                method: 'POST',
                body: JSON.stringify({
                    paramsToSign: {
                        timestamp,
                        upload_preset: uploadPreset,
                        folder
                    }
                })
            });

            if (!response.ok) throw new Error("Failed to get signature");

            const { signature } = await response.json();

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("upload_preset", uploadPreset);
            if (folder) formData.append("folder", folder);

            const xhr = new XMLHttpRequest();
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setProgress(Math.round(percentComplete));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const result = JSON.parse(xhr.responseText);
                    onSuccess(result.secure_url, result.public_id);
                } else {
                    const error = xhr.responseText;
                    console.error("Upload failed", error);
                    if (onError) onError(error);
                }
                setUploading(false);
            };

            xhr.onerror = () => {
                const error = "XHR Error during upload";
                console.error(error);
                if (onError) onError(error);
                setUploading(false);
            };

            xhr.send(formData);

        } catch (error) {
            console.error("Direct upload error:", error);
            if (onError) onError(error);
            setUploading(false);
        }
    };

    return {
        uploading,
        progress,
        uploadFile
    };
}

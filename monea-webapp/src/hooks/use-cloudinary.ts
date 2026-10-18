import { useState } from 'react';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from "@/lib/network-errors";

interface UseCloudinaryOptions {
    onSuccess?: (items: { url: string; publicId: string; type?: "IMAGE" | "VIDEO" }[]) => void;
    onError?: (error: any) => void;
    folder?: string;
}

export function useCloudinary(options: UseCloudinaryOptions = {}) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [failedFiles, setFailedFiles] = useState<File[]>([]);

    const compressImage = (file: File): Promise<Blob | File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    // Set high max dimensions (3000px) for pristine quality while preventing mobile canvas crash
                    const MAX_WIDTH = 3000;
                    const MAX_HEIGHT = 3000;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(blob || file);
                    }, 'image/webp', 0.98); // 0.98 for Maximum Visual Clarity while still saving space
                };
            };
        });
    };

    const uploadFiles = async (files: File[]) => {
        setUploading(true);
        setProgress(0);
        setError(null);
        setFailedFiles([]);

        const filesArray = Array.from(files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
        if (filesArray.length === 0) {
            if (files.length > 0) setError("សូមជ្រើសរើសឯកសាររូបភាព ឬវីដេអូ។");
            setUploading(false);
            return [];
        }

        const totalFiles = filesArray.length;
        let completedFiles = 0;
        const failedUploads: File[] = [];
        let networkFailure = false;

        try {
            const uploadPromises = filesArray.map(async (file) => {
                try {
                    const isVideo = file.type.startsWith('video/');
                    const resourceType = isVideo ? 'video' : 'image';
                    const processedFile = isVideo ? file : (file.type.includes('webp') ? file : await compressImage(file));

                    const timestamp = Math.round((new Date()).getTime() / 1000);
                    const signRes = await fetch('/api/cloudinary/sign', {
                        method: 'POST',
                        body: JSON.stringify({
                            paramsToSign: {
                                timestamp,
                                upload_preset: "wedding_upload",
                                folder: options.folder
                            }
                        })
                    });

                    if (!signRes.ok) throw new Error("Failed to sign upload request");

                    const { signature, folder: signedFolder } = await signRes.json();
                    if (!signature || typeof signedFolder !== 'string') throw new Error("Invalid upload signature response");

                    const formData = new FormData();
                    formData.append("file", processedFile);
                    formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY!);
                    formData.append("timestamp", timestamp.toString());
                    formData.append("signature", signature);
                    formData.append("upload_preset", "wedding_upload");
                    formData.append("folder", signedFolder);

                    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                    if (!cloudName) throw new Error("Cloudinary Cloud Name is missing");

                    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
                        method: 'POST',
                        body: formData
                    });

                    if (!uploadRes.ok) throw new Error("Cloudinary upload failed");

                    const result = await uploadRes.json();

                    completedFiles++;
                    setProgress(Math.round((completedFiles / totalFiles) * 100));

                    return {
                        url: result.secure_url,
                        publicId: result.public_id,
                        type: isVideo ? 'VIDEO' : 'IMAGE',
                    };
                } catch (err) {
                    console.error("Single file upload failed", err);
                    if (isNetworkError(err)) networkFailure = true;
                    failedUploads.push(file);
                    return null;
                }
            });

            const results = await Promise.all(uploadPromises);
            const successItems: { url: string; publicId: string; type: "IMAGE" | "VIDEO" }[] = results
                .filter((item): item is { url: string; publicId: string; type: "IMAGE" | "VIDEO" } => item !== null)
                .map((item) => ({
                    url: item.url,
                    publicId: item.publicId,
                    type: item.type === "VIDEO" ? "VIDEO" : "IMAGE",
                }));
            setFailedFiles(failedUploads);
            if (failedUploads.length > 0) {
                setError(networkFailure
                    ? NETWORK_ERROR_MESSAGE
                    : `បង្ហោះបាន ${successItems.length}/${totalFiles} ឯកសារ។ ${failedUploads.length} ឯកសារបរាជ័យ។`);
            }

            if (options.onSuccess) {
                options.onSuccess(successItems);
            }

            return successItems;

        } catch (err) {
            console.error("Upload error:", err);
            setError(isNetworkError(err)
                ? NETWORK_ERROR_MESSAGE
                : err instanceof Error ? err.message : "ការបង្ហោះឯកសារបរាជ័យ។");
            if (options.onError) {
                options.onError(err);
            }
            return [];
        } finally {
            setUploading(false);
        }
    };

    return {
        uploadFiles,
        retryFailedUploads: () => failedFiles.length > 0 ? uploadFiles(failedFiles) : undefined,
        uploading,
        progress,
        error,
        failedFileCount: failedFiles.length,
    };
}

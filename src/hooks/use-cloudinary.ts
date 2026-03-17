import { useState } from 'react';

interface UseCloudinaryOptions {
    onSuccess?: (items: { url: string; publicId: string }[]) => void;
    onError?: (error: any) => void;
    folder?: string;
}

export function useCloudinary(options: UseCloudinaryOptions = {}) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<any>(null);

    const compressImage = (file: File): Promise<Blob | File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 2000;
                    const MAX_HEIGHT = 2000;
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
                    }, 'image/jpeg', 0.8);
                };
            };
        });
    };

    const uploadFiles = async (files: File[]) => {
        setUploading(true);
        setProgress(0);
        setError(null);

        const filesArray = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (filesArray.length === 0) {
            setUploading(false);
            return [];
        }

        const totalFiles = filesArray.length;
        let completedFiles = 0;
        const uploadedItems: { url: string; publicId: string }[] = [];

        try {
            const uploadPromises = filesArray.map(async (file) => {
                try {
                    // 1. Client-side compression
                    const processedFile = file.size > 1024 * 1024 ? await compressImage(file) : file;

                    // 2. Get Signature
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

                    const { signature } = await signRes.json();

                    // 3. Upload to Cloudinary
                    const formData = new FormData();
                    formData.append("file", processedFile);
                    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
                    formData.append("timestamp", timestamp.toString());
                    formData.append("signature", signature);
                    formData.append("upload_preset", "wedding_upload");
                    if (options.folder) formData.append("folder", options.folder);

                    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                    if (!cloudName) throw new Error("Cloudinary Cloud Name is missing");

                    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                        method: 'POST',
                        body: formData
                    });

                    if (!uploadRes.ok) throw new Error("Cloudinary upload failed");

                    const result = await uploadRes.json();
                    
                    completedFiles++;
                    setProgress(Math.round((completedFiles / totalFiles) * 100));

                    return { url: result.secure_url, publicId: result.public_id };
                } catch (err) {
                    console.error("Single file upload failed", err);
                    return null;
                }
            });

            const results = await Promise.all(uploadPromises);
            const successItems = results.filter((item): item is { url: string; publicId: string } => item !== null);

            if (options.onSuccess) {
                options.onSuccess(successItems);
            }

            return successItems;

        } catch (err) {
            console.error("Upload error:", err);
            setError(err);
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
        uploading,
        progress,
        error
    };
}

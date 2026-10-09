export async function uploadToCloudinary(file: File, folder?: string) {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    if (!cloudName || !apiKey) {
        throw new Error("Cloudinary upload configuration is missing");
    }

    // 1. Get Signature
    const response = await fetch('/api/cloudinary/sign', {
        headers: { "Content-Type": "application/json" },
        method: 'POST',
        body: JSON.stringify({
            paramsToSign: {
                timestamp: timestamp,
                upload_preset: "wedding_upload",
                ...(folder ? { folder } : {})
            }
        })
    });

    if (!response.ok) throw new Error("Failed to get upload signature");

    const { signature, folder: signedFolder } = await response.json();
    if (!signature || typeof signedFolder !== "string") throw new Error("Invalid upload signature response");

    // 2. Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("upload_preset", "wedding_upload");
    formData.append("folder", signedFolder);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    });

    if (!uploadRes.ok) throw new Error("Failed to upload image");

    const result = await uploadRes.json();
    if (typeof result.secure_url !== "string" || typeof result.public_id !== "string") {
        throw new Error("Cloudinary returned an invalid upload result");
    }
    return { url: result.secure_url as string, publicId: result.public_id as string };
}

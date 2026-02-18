export async function uploadToCloudinary(file: File) {
    const timestamp = Math.round((new Date()).getTime() / 1000);

    // 1. Get Signature
    const response = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        body: JSON.stringify({
            paramsToSign: {
                timestamp: timestamp,
                upload_preset: "wedding_upload"
            }
        })
    });

    if (!response.ok) throw new Error("Failed to get upload signature");

    const { signature } = await response.json();

    // 2. Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("upload_preset", "wedding_upload");

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
    });

    if (!uploadRes.ok) throw new Error("Failed to upload image");

    const result = await uploadRes.json();
    return result.secure_url;
}

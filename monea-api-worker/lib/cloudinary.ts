export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
}

/**
 * Universal Environment Variable Extractor for Vite / Next.js Client Runtimes
 */
function getClientEnv(key: string): string {
  // Vite env check
  if (typeof import.meta !== "undefined" && (import.meta as any).env) {
    if ((import.meta as any).env[key]) return (import.meta as any).env[key];
  }
  // Next.js client env check
  if (typeof process !== "undefined" && process.env) {
    if (process.env[key]) return process.env[key] || "";
  }
  return "";
}

/**
 * Uploads a file directly to Cloudinary using secure signed uploads.
 * Supports Images, Videos, and Audio files automatically.
 */
export async function uploadToCloudinary(
  file: File, 
  preset: string = "wedding_upload"
): Promise<CloudinaryUploadResult> {
  if (!file) throw new Error("No file provided for upload");

  const apiKey = 
    getClientEnv("VITE_CLOUDINARY_API_KEY") || 
    getClientEnv("NEXT_PUBLIC_CLOUDINARY_API_KEY");

  const cloudName = 
    getClientEnv("VITE_CLOUDINARY_CLOUD_NAME") || 
    getClientEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");

  if (!apiKey || !cloudName) {
    throw new Error("Missing Cloudinary Client Environment Variables");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);

  // 1. Fetch Signature from Backend API
  const response = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paramsToSign: {
        timestamp,
        upload_preset: preset
      }
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to retrieve Cloudinary upload signature");
  }

  const { signature } = await response.json();

  // 2. Determine Resource Type (image vs video/audio)
  const isVideoOrAudio = file.type.startsWith("video/") || file.type.startsWith("audio/");
  const resourceType = isVideoOrAudio ? "video" : "image";

  // 3. Construct Form Data for Direct Signed Upload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("upload_preset", preset);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Failed to upload asset to Cloudinary");
  }

  const result = await uploadRes.json();

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    resource_type: result.resource_type,
    format: result.format
  };
}
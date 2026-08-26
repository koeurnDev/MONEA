export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FlipOptions {
  horizontal: boolean;
  vertical: boolean;
}

/**
 * Dynamically loads an HTML Image element with cross-origin safety.
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    
    // Set crossOrigin BEFORE src attribute to prevent Tainted Canvas CORS security errors
    image.setAttribute('crossOrigin', 'anonymous');
    
    // Append timestamp cache buster for CORS-sensitive CDNs (Cloudinary / Unsplash)
    const safeUrl = url.startsWith('data:') || url.startsWith('blob:') 
      ? url 
      : `${url}${url.includes('?') ? '&' : '?'}cors=${Date.now()}`;
      
    image.src = safeUrl;
  });

/**
 * Converts degrees to radians.
 */
export function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Calculates bounding area dimensions of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * Crops, rotates, and flips an image using HTML5 Canvas client-side.
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
  flip: FlipOptions = { horizontal: false, vertical: false },
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality = 0.92
): Promise<Blob | null> {
  if (!imageSrc || !pixelCrop) return null;

  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const rotRad = getRadianAngle(rotation);

    // Calculate bounding box of rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    );

    // Set canvas size to match full bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Translate canvas context to central pivot point
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Draw full rotated image onto canvas
    ctx.drawImage(image, 0, 0);

    // Extract desired crop slice
    const data = ctx.getImageData(
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height
    );

    // Resize canvas to final cropped dimensions (Clears previous context)
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Place cropped data onto final canvas
    ctx.putImageData(data, 0, 0);

    // Export as Blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          // Cleanup memory
          canvas.width = 0;
          canvas.height = 0;
          resolve(blob);
        },
        outputFormat,
        quality
      );
    });
  } catch (error) {
    console.error("[getCroppedImg Error]:", error);
    return null;
  }
}
const MIN_SOCIAL_PREVIEW_ASPECT_RATIO = 1.6;
const MAX_SOCIAL_PREVIEW_ASPECT_RATIO = 2.1;

export function isRecommendedSocialPreviewAspectRatio(width: number, height: number): boolean {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return false;
    }

    const aspectRatio = width / height;
    return aspectRatio >= MIN_SOCIAL_PREVIEW_ASPECT_RATIO
        && aspectRatio <= MAX_SOCIAL_PREVIEW_ASPECT_RATIO;
}

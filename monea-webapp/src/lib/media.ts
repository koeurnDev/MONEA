/**
 * MONEA media URL optimiser.
 *
 * Every media CDN the platform uses (Cloudinary, ImageKit, Unsplash) supports
 * on-the-fly transformations. Loading an untouched original is the single
 * biggest avoidable cost on wedding/gallery pages, where uploads can be
 * 3000-5000 px JPEGs.
 *
 * Design rules (deliberately conservative):
 *  - Unknown hosts are returned **unchanged**. This function can never break an
 *    image, because it only rewrites URLs it positively recognises.
 *  - Never applied to `data:`/`blob:` URLs.
 *  - Idempotent: a URL that already carries transformations is left alone.
 */

export interface MediaTransformOptions {
  /** Target CSS pixel width. Required for a meaningful optimisation. */
  width?: number;
  /** Target height (only used by presets that need an aspect box). */
  height?: number;
  /** 1-100. Defaults to `auto` (CDN-side perceptual quality). */
  quality?: number | 'auto';
  /** Force a crop mode. Defaults to `limit` (never upscale). */
  crop?: 'limit' | 'fill' | 'fit' | 'scale';
  /** Produce a video poster frame instead of the video itself. */
  poster?: boolean;
}

const CLOUDINARY_MARKER = 'res.cloudinary.com';
const IMAGEKIT_MARKER = 'ik.imagekit.io';
const UNSPLASH_MARKER = 'images.unsplash.com';

/** True when the value can be safely handed to an <img src>. */
export function isRenderableUrl(url: unknown): url is string {
  if (typeof url !== 'string' || !url) return false;
  if (url.startsWith('data:') || url.startsWith('blob:')) return true;
  return /^(https?:\/\/|\/)/i.test(url);
}

/**
 * Inserts a Cloudinary transformation segment into an upload URL.
 * `.../image/upload/v123/x.jpg` -> `.../image/upload/f_auto,q_auto,w_800/v123/x.jpg`
 */
function cloudinaryUrl(url: string, options: MediaTransformOptions): string {
  if (/f_auto|q_auto|c_limit|c_fill/.test(url)) return url; // already transformed
  const match = url.match(/\/(image|video|raw)\/upload\/(.+)$/);
  if (!match) return url;

  const [, resourceType, rest] = match;
  const parts: string[] = [];

  if (options.poster) {
    // Video poster frame: a real <img> source derived from the video.
    return url
      .replace(/\/video\/upload\//, '/video/upload/so_0/')
      .replace(/\.(mp4|webm|mov|m4v)(\?.*)?$/i, '.jpg');
  }

  parts.push('f_auto');
  parts.push(
    options.quality === undefined || options.quality === 'auto'
      ? 'q_auto'
      : `q_${options.quality}`
  );
  parts.push(`c_${options.crop ?? 'limit'}`);
  if (options.width) parts.push(`w_${Math.round(options.width)}`);
  if (options.height) parts.push(`h_${Math.round(options.height)}`);

  // Resource type is preserved so video/raw assets keep working.
  return url.replace(
    `/${resourceType}/upload/`,
    `/${resourceType}/upload/${parts.join(',')}/`
  );
}

/** ImageKit transformations are query-string based and cheap to add. */
function imagekitUrl(url: string, options: MediaTransformOptions): string {
  if (/[?&]tr=/.test(url)) return url;
  const tr: string[] = [];
  if (options.width) tr.push(`w-${Math.round(options.width)}`);
  if (options.height) tr.push(`h-${Math.round(options.height)}`);
  tr.push(`c-${options.crop === 'fill' ? 'at_max' : 'at_max'}`);
  tr.push(`q-${options.quality === 'auto' || options.quality === undefined ? 80 : options.quality}`);
  tr.push('f-auto');
  return `${url}${url.includes('?') ? '&' : '?'}tr=${tr.join(',')}`;
}

/** Unsplash's image API takes plain query parameters. */
function unsplashUrl(url: string, options: MediaTransformOptions): string {
  try {
    const parsed = new URL(url);
    if (!options.width) return url;
    parsed.searchParams.set('w', String(Math.round(options.width)));
    parsed.searchParams.set('q', String(options.quality === 'auto' || options.quality === undefined ? 70 : options.quality));
    parsed.searchParams.set('fit', 'crop');
    if (parsed.searchParams.get('auto') === null) parsed.searchParams.set('auto', 'format');
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Returns an optimised URL for the given transform.
 * When no width is supplied the function still adds `f_auto`/`q_auto` for
 * Cloudinary, which alone typically saves 30-60% of bytes.
 */
export function optimizeMediaUrl(url: unknown, options: MediaTransformOptions = {}): string {
  if (!isRenderableUrl(url)) return '';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) return url;

  if (url.includes(CLOUDINARY_MARKER)) return cloudinaryUrl(url, options);
  if (url.includes(IMAGEKIT_MARKER)) return imagekitUrl(url, options);
  if (url.includes(UNSPLASH_MARKER)) return unsplashUrl(url, options);
  return url;
}

/**
 * Builds a `srcSet` string across the supplied widths.
 * Returns `undefined` when the URL is not a transformable CDN asset, so callers
 * can simply spread the result onto an <img>.
 */
export function buildSrcSet(
  url: unknown,
  widths: readonly number[],
  options: Omit<MediaTransformOptions, 'width'> = {}
): string | undefined {
  if (!isRenderableUrl(url)) return undefined;
  if (
    !url.includes(CLOUDINARY_MARKER) &&
    !url.includes(IMAGEKIT_MARKER) &&
    !url.includes(UNSPLASH_MARKER)
  ) {
    return undefined;
  }

  const unique = [...new Set(widths.filter((w) => w > 0))].sort((a, b) => a - b);
  const entries = unique.map(
    (w) => `${optimizeMediaUrl(url, { ...options, width: w })} ${w}w`
  );
  // Ascending order is what browsers expect; keep the largest as the fallback
  // only when the caller did not provide one.
  return entries.join(', ');
}

/** Common gallery widths - thumbnail, grid, lightbox, full bleed. */
export const MEDIA_WIDTHS = {
  thumbnail: [120, 240, 320],
  grid: [320, 480, 640, 960],
  lightbox: [640, 960, 1280, 1920],
} as const;

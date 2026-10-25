import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names using clsx and tailwind-merge.
 * Ensures that Tailwind utility classes are merged correctly without conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts Khmer numerals to English numerals.
 * Useful for normalizing phone numbers or numeric inputs in Cambodia.
 * @param str - The string containing Khmer numerals.
 * @returns The string with Khmer numerals replaced by English counterparts.
 */
export function khmerToEnglishNumbers(str: string): string {
  if (!str) return str;
  return str.replace(/[០-៩]/g, (d) =>
    (d.charCodeAt(0) - 6112).toString()
  );
}

/**
 * Standardized Cambodia Date Formatter
 * Always uses Asia/Phnom_Penh and Khmer locale by default
 */
export function formatCambodiaDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('km-KH', {
    timeZone: 'Asia/Phnom_Penh',
    ...options
  }).format(d);
}

/**
 * Centrally retrieves the user's IP address from common headers
 */
export function getIP(req: Request | any): string {
  const headers = req instanceof Request ? req.headers : new Headers(req.headers);
  
  // Cloudflare overwrites this header at its edge; proxy-supplied headers below
  // are only suitable as fallbacks outside production.
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf;

  const isProduction =
    process.env.NODE_ENV === "production" || process.env.ENVIRONMENT === "production";
  if (isProduction) return "unknown";
  
  // Local development can use common proxy headers when Cloudflare is absent.
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map(ip => ip.trim());
    if (ips[0]) return ips[0];
  }
  
  let ip = (req as any).ip || "unknown";

  // Normalize Loopback (Local Dev Consistency)
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    ip = "127.0.0.1";
  }
  
  return ip;
}

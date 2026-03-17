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
  
  // 1. Prioritize Trusted Cloudflare header if available
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf;
  
  // 2. Vercel/Standard Proxy header
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp;

  // 3. Fallback to X-Forwarded-For (Validated/Parsed)
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // Only take the first IP in the list to prevent spoofing
    const ips = forwarded.split(",").map(ip => ip.trim());
    if (ips[0]) return ips[0];
  }
  
  return (req as any).ip || "unknown";
}

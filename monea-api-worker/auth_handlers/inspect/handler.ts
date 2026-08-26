export const dynamic = 'force-dynamic';
import { COOKIE_NAMES } from "@/lib/constants";
import { getIP } from "@/lib/utils";

/**
 * Diagnostic Endpoint: GET /api/debug/cookies
 * Safely inspects incoming authentication cookies and headers for local debugging.
 */
export async function GET(req: Request) {
  // Security Guard: Prevent usage in Production environments unless explicitly allowed
  const isDev = process.env.NODE_ENV === "development" || process.env.VITE_DEV === "true";
  
  if (!isDev) {
    return Response.json(
      { error: "Access denied. Debug endpoints are disabled in production." },
      { status: 403 }
    );
  }

  const cookieHeader = req.headers.get("cookie") || "";
  
  // Safe Cookie Parsing Helper
  const parseCookie = (name: string): string | null => {
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(";");
    for (const cookie of cookies) {
      const [key, ...val] = cookie.trim().split("=");
      if (key === name) {
        return decodeURIComponent(val.join("="));
      }
    }
    return null;
  };

  const token = parseCookie(COOKIE_NAMES.TOKEN);
  const staffToken = parseCookie(COOKIE_NAMES.STAFF_TOKEN);

  // Extract all present cookie keys (Stripping sensitive values)
  const allCookies = cookieHeader
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter(Boolean);

  return Response.json(
    {
      cookiesPresent: {
        token: !!token,
        tokenValue: token ? `${token.substring(0, 10)}...` : null,
        staffToken: !!staffToken,
        staffTokenValue: staffToken ? `${staffToken.substring(0, 10)}...` : null,
      },
      clientIp: getIP(req),
      userAgent: req.headers.get("user-agent"),
      host: req.headers.get("host"),
      allCookieKeys: allCookies,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
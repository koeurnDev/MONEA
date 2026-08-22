export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const referer = request.headers.get("referer") || "unknown";
    const isDev   = referer.includes("localhost") || referer.includes("127.0.0.1");
    const secure  = !isDev ? "; Secure" : "";

    const headers = new Headers({ "Content-Type": "application/json" });
    // Web standard: append multiple Set-Cookie headers
    headers.append("Set-Cookie", `token=; HttpOnly${secure}; Path=/; SameSite=Strict; Max-Age=0`);
    headers.append("Set-Cookie", `staff_token=; HttpOnly${secure}; Path=/; SameSite=Strict; Max-Age=0`);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
}

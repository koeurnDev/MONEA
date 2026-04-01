export const runtime = 'edge';
import { NextResponse } from "next/server";

export async function GET() {
    // If the request makes it past the Edge Middleware, it means the user is
    // either an exempted SuperAdmin, or the system is NOT in maintenance mode.
    // Either way, they should NOT trigger the client-side auto-reload.
    return NextResponse.json({ maintenance: false }, {
        headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    });
}

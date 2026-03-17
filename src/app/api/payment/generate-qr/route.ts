import { NextResponse } from "next/server";
import { spawnSync } from "node:child_process";
import path from "path";

export async function POST(req: Request) {
    try {
        const {
            packageType,
            currency = "USD",
            orderId = "UPG-" + Date.now()
        } = await req.json();

        // 1. Strict Merchant Details (Hardcoded for security)
        const MERCHANT_NAME = "MONEA UPGRADE";
        const ACCOUNT_ID = "koeurn_seab@wing";

        // 2. Strict Amount Validation
        let amount = 0;
        if (packageType === "PRO") {
            amount = 19;
        } else if (packageType === "PREMIUM") {
            amount = 49;
        } else {
            return NextResponse.json({ error: "Invalid package type" }, { status: 400 });
        }

        const scriptPath = path.join(process.cwd(), "scripts", "generate-khqr.mjs");
        const payload = JSON.stringify({ 
            amount, 
            currency: "USD", // Force USD for now
            merchantName: MERCHANT_NAME, 
            accountID: ACCOUNT_ID, 
            orderId 
        });

        // Execute the CLI generator (bypasses Next.js bundler issues)
        const child = spawnSync("node", [scriptPath, payload], { encoding: 'utf-8' });

        if (child.error) {
            console.error("[API/KHQR] Spawn Error:", child.error);
            return NextResponse.json({ error: child.error.message }, { status: 500 });
        }

        if (child.status !== 0) {
            console.error("[API/KHQR] Script Error:", child.stderr);
            return NextResponse.json({ error: child.stderr || "KHQR Generation Failed" }, { status: 500 });
        }

        const result = JSON.parse(child.stdout);

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            qr: result.qr,
            orderId: orderId,
            md5: result.md5,
            success: true
        });

    } catch (e: any) {
        console.error("[API/KHQR] Server Error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

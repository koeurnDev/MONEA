import { Hono } from 'hono'
import { getDb } from "@/lib/drizzle"
import { weddings, systemConfig } from "@/drizzle/schema"
import { and, eq, desc } from "drizzle-orm"
import { getServerUser } from "@/lib/auth"
import { PaymentService } from "@/lib/PaymentService"
import { verifyTurnstile } from "@/lib/turnstile"
import { z } from "zod"
import { ROLES } from "@/lib/constants"
import { ResilientRatelimit } from "@/lib/ratelimit"

const paymentRouter = new Hono()

function isReceiptImageForWedding(receiptUrl: string, weddingId: string): boolean {
    try {
        const url = new URL(receiptUrl);
        if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") return false;

        const segments = url.pathname.split("/").filter(Boolean);
        const uploadIndex = segments.indexOf("upload");
        if (uploadIndex < 0) return false;

        const pathAfterUpload = segments.slice(uploadIndex + 1);
        const versionIndex = pathAfterUpload.findIndex((segment) => /^v\d+$/.test(segment));
        return versionIndex >= 0 && pathAfterUpload[versionIndex + 1] === weddingId;
    } catch {
        return false;
    }
}

// ── Rate limiters (Upstash Redis in prod, in-memory fallback in dev) ─────────
const checkStatusLimiter  = new ResilientRatelimit("@monea/payment/check-status",  10, 10_000) // 10 per 10s
const manualVerifyLimiter = new ResilientRatelimit("@monea/payment/manual-verify",  1,  3_000)  //  1 per 3s
const generateQrLimiter   = new ResilientRatelimit("@monea/payment/generate-qr",    5, 60_000)  //  5 per min

// ── POST /api/payment/check-status ───────────────────────────────────────────
// Polls Bakong NBC API for a transaction by MD5 hash or orderId.
// 2-layer probe: MD5 first, external ID fallback.
paymentRouter.post('/check-status', async (c) => {
    const user = await getServerUser(c.req.raw)
    if (!user) return c.json({ error: "Unauthorized" }, 401)

    // Per-user rate limit
    const rl = await checkStatusLimiter.limit(user.userId)
    if (!rl.success) return c.json({ error: "Too many requests. Please wait." }, 429)

    try {
        const body = await c.req.json()
        const request = z.object({
            md5: z.string().regex(/^[a-f0-9]{32}$/i),
            orderId: z.string().regex(/^UPG-(PRO|PREMIUM)-[a-z0-9]+-[a-z0-9]+$/i),
        }).safeParse(body)
        if (!request.success) return c.json({ error: "Invalid payment identifiers" }, 400)
        const { md5, orderId } = request.data

        const db = getDb(c.env)
        const wedding = await db.select({
            id: weddings.id,
            packageType: weddings.packageType,
            paymentStatus: weddings.paymentStatus,
            paymentHash: weddings.paymentHash,
            paymentInfo: weddings.paymentInfo,
            paymentOrderId: weddings.paymentOrderId,
        })
            .from(weddings)
            .where(user.weddingId ? eq(weddings.id, user.weddingId) : eq(weddings.userId, user.userId))
            .orderBy(desc(weddings.createdAt))
            .limit(1)
            .then((r: any) => r[0]);

        if (!wedding) return c.json({ error: "Wedding not found" }, 404)

        // Already paid — short-circuit
        if (wedding.paymentStatus === "PAID") {
            return c.json({ status: "PAID", packageType: wedding.packageType, alreadyPaid: true })
        }

        // Only verify the identifiers persisted when this wedding's upgrade QR was created.
        const storedOrderId = wedding.paymentOrderId
            || (wedding.paymentInfo?.startsWith("UPG-") ? wedding.paymentInfo : null);
        if (!wedding.paymentHash || !storedOrderId) {
            return c.json({ error: "No active payment attempt found" }, 409)
        }
        if (md5 !== wedding.paymentHash) return c.json({ error: "Invalid transaction hash" }, 400)
        if (orderId !== storedOrderId) return c.json({ error: "Invalid order ID" }, 400)

        const actualPackage = orderId.split("-")[1]

        const config = await db.select()
            .from(systemConfig)
            .where(eq(systemConfig.id, "GLOBAL"))
            .limit(1)
            .then((r: any) => r[0]);
            
        const bakongCfg = (config?.bakongConfig as any) || {}
        const accountID = bakongCfg.accountID || bakongCfg.accountId || process.env.BAKONG_ACCOUNT_ID || ""
        // A token stored from the admin console wins over the Worker secret.
        const bakongToken = (bakongCfg.token as string) || ""

        const result = await PaymentService.verifyBakongTransaction(
            wedding.id,
            md5,
            orderId,
            actualPackage,
            accountID,
            c.env,
            bakongToken,
        )

        return c.json({
            status:      result.status,
            packageType: result.status === "PAID" ? actualPackage : wedding.packageType,
            alreadyPaid: result.alreadyPaid,
            method:      (result as any).method,
        })
    } catch (e: any) {
        console.error("[payment/check-status]", e)
        return c.json({ error: "Server Error" }, 500)
    }
})

// ── POST /api/payment/confirm ────────────────────────────────────────────────
// Marks wedding as AWAITING_VERIFICATION after user initiates upgrade.
// Validates Turnstile CAPTCHA to prevent bots.
paymentRouter.post('/confirm', async (c) => {
    const user = await getServerUser(c.req.raw)
    if (!user) return c.json({ error: "Unauthorized" }, 401)

    try {
        const body = await c.req.json()
        const schema = z.object({
            packageType:    z.enum(["PRO", "PREMIUM"]),
            turnstileToken: z.string(),
        })
        const validated = schema.safeParse(body)
        if (!validated.success) return c.json({ error: "Invalid package or missing CAPTCHA" }, 400)

        const { packageType, turnstileToken } = validated.data
        const isHuman = await verifyTurnstile(turnstileToken, undefined, c.env)
        if (!isHuman) return c.json({ error: "CAPTCHA verification failed" }, 400)

        const db = getDb(c.env)
        let wedding
        
        if (user.role === ROLES.EVENT_STAFF) {
            if (!user.weddingId) return c.json({ error: "Staff not assigned to any wedding" }, 403)
            wedding = await db.select()
                .from(weddings)
                .where(eq(weddings.id, user.weddingId))
                .limit(1)
                .then((r: any) => r[0]);
        } else {
            wedding = await db.select()
                .from(weddings)
                .where(eq(weddings.userId, user.id))
                .orderBy(desc(weddings.createdAt))
                .limit(1)
                .then((r: any) => r[0]);
        }

        if (!wedding) return c.json({ error: "Wedding not found" }, 404)

        if (wedding.paymentStatus === "AWAITING_VERIFICATION") {
            return c.json({ error: "សម្នើសុំដំឡើងរបស់អ្នកកំពុងស្ថិតក្នុងការពិនិត្យ។ (Already awaiting verification)" }, 429)
        }

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        const updated = await db.update(weddings)
            .set({ 
                packageType, 
                paymentStatus: "AWAITING_VERIFICATION", 
                expiresAt, 
                status: "ACTIVE" 
            })
            .where(eq(weddings.id, wedding.id))
            .returning()
            .then((r: any) => r[0]);

        const ip = c.req.header("x-real-ip") || c.req.header("x-forwarded-for") || "unknown"
        const ua = c.req.header("user-agent") || "unknown"
        console.warn(`[payment/confirm] Wedding ${wedding.id} → ${packageType} by User ${user.id}. IP: ${ip}, UA: ${ua}`)

        return c.json({ success: true, wedding: updated })
    } catch (error) {
        console.error("[payment/confirm]", error)
        return c.json({ error: "មានបញ្ហាបច្ចេកទេស (Internal Server Error)" }, 500)
    }
})

// ── POST /api/payment/submit-slip ───────────────────────────────────────────
// User uploads their payment receipt slip image or transaction details for Admin manual review
paymentRouter.post('/submit-slip', async (c) => {
    const user = await getServerUser(c.req.raw)
    if (!user) return c.json({ error: "Unauthorized" }, 401)

    try {
        const body = await c.req.json()
        const request = z.object({
            packageType: z.enum(["PRO", "PREMIUM"]),
            receiptImage: z.string().max(2048).url().nullable().optional(),
            txRef: z.string().trim().max(200).optional().nullable(),
            note: z.string().trim().max(200).optional().nullable(),
            weddingId: z.string().min(1).optional(),
        }).safeParse(body);
        if (!request.success) return c.json({ error: "Invalid receipt submission" }, 400);
        const { packageType, receiptImage, txRef, note, weddingId } = request.data
        const normalizedTxRef = typeof txRef === "string" ? txRef.trim() : ""
        const normalizedNote = typeof note === "string" ? note.trim() : ""
        if (receiptImage == null && !normalizedTxRef && !normalizedNote) {
            return c.json({ error: "Submit a receipt image or transaction reference" }, 400)
        }

        const db = getDb(c.env)
        let targetWeddingId = weddingId

        const isPlatformOwner = user.role === ROLES.PLATFORM_OWNER || user.role === "SUPERADMIN"
        const isStaff = user.role === ROLES.EVENT_STAFF || user.type === "staff"
        if (isStaff && targetWeddingId && targetWeddingId !== user.weddingId) {
            return c.json({ error: "Forbidden" }, 403)
        }

        const weddingIdFilter = targetWeddingId
            ? eq(weddings.id, targetWeddingId)
            : isStaff
                ? eq(weddings.id, user.weddingId!)
                : eq(weddings.userId, user.userId || user.id);
        const ownershipFilter = targetWeddingId && !isPlatformOwner
            ? isStaff
                ? eq(weddings.id, user.weddingId!)
                : eq(weddings.userId, user.userId || user.id)
            : undefined;
        const wedding = await db.select({ id: weddings.id })
            .from(weddings)
            .where(ownershipFilter ? and(weddingIdFilter, ownershipFilter)! : weddingIdFilter)
            .orderBy(desc(weddings.createdAt))
            .limit(1)
            .then((r: any) => r[0]);

        if (!wedding) {
            return c.json({ error: "Wedding not found" }, 404)
        }

        if (receiptImage && !isReceiptImageForWedding(receiptImage, wedding.id)) {
            return c.json({ error: "Receipt image must be uploaded to the wedding's Cloudinary folder" }, 400)
        }

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        const updated = await db.update(weddings)
            .set({
                packageType,
                paymentStatus: "AWAITING_VERIFICATION",
                paymentInfo: receiptImage || null,
                paymentOrderId: null,
                paymentRejectedAt: null,
                paymentHash: normalizedTxRef || (normalizedNote ? `NOTE: ${normalizedNote}` : `SLIP_SUBMITTED_${Date.now()}`),
                expiresAt,
                status: "ACTIVE"
            })
            .where(eq(weddings.id, wedding.id))
            .returning()
            .then((r: any) => r[0]);

        return c.json({ success: true, message: "Receipt submitted successfully", wedding: updated })
    } catch (error: any) {
        console.error("[payment/submit-slip]", error)
        return c.json({ error: "Failed to submit receipt" }, 500)
    }
})

// ── POST /api/payment/generate-qr ───────────────────────────────────────────
// Generates a KHQR code for a package upgrade (PRO / PREMIUM).
// orderId encodes packageType server-side to prevent price manipulation.
paymentRouter.post('/generate-qr', async (c) => {
    const user = await getServerUser(c.req.raw)
    if (!user) return c.json({ error: "Unauthorized" }, 401)

    const rl = await generateQrLimiter.limit(user.userId)
    if (!rl.success) return c.json({ error: "Too many requests. Please wait." }, 429)

    try {
        const { packageType } = await c.req.json()
        if (!packageType || !["PRO", "PREMIUM"].includes(packageType)) {
            return c.json({ error: "packageType must be PRO or PREMIUM" }, 400)
        }

        const db = getDb(c.env)
        const userId = user.userId || user.id
        
        const wedding = await db.select()
            .from(weddings)
            .where(user.weddingId ? eq(weddings.id, user.weddingId) : eq(weddings.userId, userId))
            .orderBy(desc(weddings.createdAt))
            .limit(1)
            .then((r: any) => r[0]);

        if (!wedding) return c.json({ error: "Wedding not found" }, 404)

        const config = await db.select()
            .from(systemConfig)
            .where(eq(systemConfig.id, "GLOBAL"))
            .limit(1)
            .then((r: any) => r[0]);
            
        const stadPrice    = Number(config?.stadPrice ?? 9.00)
        const proPrice     = Number(config?.proPrice  ?? 19.00)
        const bakongCfg    = (config?.bakongConfig as any) || {}
        const MERCHANT_NAME = bakongCfg.merchantName || process.env.BAKONG_MERCHANT_NAME || "MONEA"
        const workerEnv = c.env as { BAKONG_ACCOUNT_ID?: string }
        const ACCOUNT_ID    = bakongCfg.accountID
            || bakongCfg.accountId
            || workerEnv.BAKONG_ACCOUNT_ID
            || process.env.BAKONG_ACCOUNT_ID

        if (!ACCOUNT_ID) {
            console.warn("[payment/generate-qr] Bakong receiving account is not configured (systemConfig.bakongConfig.accountID / BAKONG_ACCOUNT_ID)")
            // 400 (client/config error) rather than 500 — nothing is broken server-side.
            return c.json({ 
                error: "Payment system not configured", 
                message: "Online payments are not enabled yet. Set the Bakong receiving account in Admin -> Settings -> Bakong KHQR, or bind the BAKONG_ACCOUNT_ID secret to this Worker."
            }, 400)
        }

        const amount  = packageType === "PRO" ? stadPrice : proPrice
        if (!Number.isFinite(amount) || amount < 0) {
            console.error("[payment/generate-qr] Invalid configured package price:", { packageType })
            return c.json({ error: "Configured package price is invalid" }, 503)
        }
        // Server-side orderId encodes packageType — prevents client price manipulation
        const orderId = `UPG-${packageType}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`

        const result = await PaymentService.generateKHQR({
            amount,
            currency:     "USD",
            merchantName: MERCHANT_NAME,
            accountID:    ACCOUNT_ID,
            orderId,
            weddingId:    wedding?.id,
        })

        return c.json({ qr: result.qr, orderId: result.orderId, md5: result.md5, amount, expiresAt: result.expiresAt, success: true })
    } catch (e: any) {
        console.error("[payment/generate-qr]", e)
        return c.json({ error: e.message || "Internal Server Error" }, 500)
    }
})

// ── POST /api/payment/generate-gift-qr ──────────────────────────────────────
// Generates a KHQR for a wedding guest gift donation.
// Uses the Bakong account configured in the wedding's themeSettings.
paymentRouter.post('/generate-gift-qr', async (c) => {
    const user = await getServerUser(c.req.raw)
    if (!user) return c.json({ error: "Unauthorized" }, 401)

    const rl = await generateQrLimiter.limit(`gift:${user.userId}`)
    if (!rl.success) return c.json({ error: "Too many requests. Please wait." }, 429)

    try {
        const { amount, currency = "USD" } = await c.req.json()
        if (!amount || amount <= 0) return c.json({ error: "Invalid amount" }, 400)

        const db = getDb(c.env)
        const weddingId = user.weddingId || 
            (await db.select({ id: weddings.id })
                .from(weddings)
                .where(eq(weddings.userId, user.id))
                .limit(1)
                .then((r: any) => r[0]?.id));
                
        if (!weddingId) return c.json({ error: "Wedding not found" }, 404)

        const settings = await db.select({ themeSettings: weddings.themeSettings })
            .from(weddings)
            .where(eq(weddings.id, weddingId))
            .limit(1)
            .then((r: any) => r[0]);

        const bankAccounts  = (settings?.themeSettings as any)?.bankAccounts || []
        const bakongAccount = bankAccounts.find((acc: any) =>
            acc.bankName?.toLowerCase().includes("bakong") ||
            acc.bankName?.toLowerCase().includes("wing")   ||
            acc.bankName?.toLowerCase().includes("aba")
        )

        if (!bakongAccount) {
            return c.json({ error: "No Bakong account configured for this wedding" }, 400)
        }

        const orderId = `GFT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

        const result = await PaymentService.generateKHQR({
            amount:       parseFloat(amount),
            currency:     currency as "USD" | "KHR",
            merchantName: bakongAccount.accountName || "Wedding Gift",
            accountID:    bakongAccount.accountNumber,
            orderId,
        })

        return c.json(result)
    } catch (error: any) {
        console.error("[payment/generate-gift-qr]", error.message)
        return c.json({ error: error.message || "Failed to generate QR" }, 500)
    }
})

// ── POST /api/payment/manual-verify ─────────────────────────────────────────
// User-triggered re-verification of their most recent payment attempt.
// Strict rate limit: 1 request per 3 seconds per user.
paymentRouter.post('/manual-verify', async (c) => {
    const user = await getServerUser(c.req.raw)
    if (!user) return c.json({ error: "Unauthorized" }, 401)

    const rl = await manualVerifyLimiter.limit(user.userId)
    if (!rl.success) return c.json({ error: "Please wait before verifying again." }, 429)

    try {
        const db = getDb(c.env)
        const wedding = await db.select({
            id: weddings.id,
            packageType: weddings.packageType,
            paymentHash: weddings.paymentHash,
            paymentStatus: weddings.paymentStatus,
            paymentInfo: weddings.paymentInfo,
            paymentOrderId: weddings.paymentOrderId,
        })
            .from(weddings)
            .where(user.weddingId ? eq(weddings.id, user.weddingId) : eq(weddings.userId, user.userId))
            .orderBy(desc(weddings.createdAt))
            .limit(1)
            .then((r: any) => r[0]);

        if (!wedding)             return c.json({ error: "Wedding not found" }, 404)
        if (wedding.paymentStatus === "PAID") {
            return c.json({ status: "PAID", packageType: wedding.packageType, alreadyPaid: true })
        }
        const orderId = wedding.paymentOrderId
            || (wedding.paymentInfo?.startsWith("UPG-") ? wedding.paymentInfo : null)
        if (!orderId || !/^UPG-(PRO|PREMIUM)-[a-z0-9]+-[a-z0-9]+$/i.test(orderId)
            || !wedding.paymentHash || !/^[a-f0-9]{32}$/i.test(wedding.paymentHash)) {
            return c.json({ status: "AWAITING_PAYMENT", message: "No active KHQR payment attempt found." })
        }

        const config = await db.select()
            .from(systemConfig)
            .where(eq(systemConfig.id, "GLOBAL"))
            .limit(1)
            .then((r: any) => r[0]);
            
        const bakongCfg = (config?.bakongConfig as any) || {}
        const accountID = bakongCfg.accountID || bakongCfg.accountId || process.env.BAKONG_ACCOUNT_ID
        const bakongToken = (bakongCfg.token as string) || ""

        if (!accountID) return c.json({ error: "System misconfiguration: Missing Bakong receiving account (Admin -> Settings -> Bakong KHQR)" }, 500)

        const actualPackage = orderId.split("-")[1]

        const result: any = await PaymentService.verifyBakongTransaction(
            wedding.id,
            wedding.paymentHash,
            orderId,
            actualPackage,
            accountID,
            c.env,
            bakongToken,
        )

        if (result.status === "PAID") {
            result.orderId = orderId
            result.packageType = actualPackage
            result.amount = Number(actualPackage === "PREMIUM"
                ? (config?.proPrice ?? 19)
                : (config?.stadPrice ?? 9))
        }

        return c.json(result)
    } catch (error: any) {
        console.error("[payment/manual-verify]", error)
        return c.json({ error: "Verification failed", details: error.message }, 500)
    }
})

export default paymentRouter

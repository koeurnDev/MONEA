import { Hono } from 'hono'
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth"
import { PaymentService } from "@/services/PaymentService"
import { verifyTurnstile } from "@/lib/turnstile"
import { z } from "zod"
import { ROLES } from "@/lib/constants"
import { ResilientRatelimit } from "@/lib/ratelimit"

const paymentRouter = new Hono()

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
        const { md5, orderId, packageType: reqPackageType, weddingId: bodyWeddingId } = await c.req.json()

        const wedding = await prisma.wedding.findFirst({
            where: user.weddingId
                ? { id: user.weddingId }
                : { userId: user.userId },
            orderBy: { createdAt: 'desc' },
            select: { id: true, packageType: true, paymentStatus: true, paymentHash: true, paymentInfo: true }
        })

        if (!wedding) return c.json({ error: "Wedding not found" }, 404)

        // Already paid — short-circuit
        if (wedding.paymentStatus === "PAID") {
            return c.json({ status: "PAID", packageType: wedding.packageType, alreadyPaid: true })
        }

        // IDOR / replay protection — validate client-supplied hashes against DB
        if (md5     && wedding.paymentHash && md5     !== wedding.paymentHash)  return c.json({ error: "Invalid transaction hash" }, 400)
        if (orderId && wedding.paymentInfo && orderId !== wedding.paymentInfo)   return c.json({ error: "Invalid order ID" }, 400)

        const dbMd5      = wedding.paymentHash || md5     || ""
        const dbOrderId  = wedding.paymentInfo || orderId || ""

        // Extract true packageType from orderId to prevent price manipulation
        let actualPackage = reqPackageType || "PRO"
        if (dbOrderId.startsWith("UPG-")) {
            const parts = dbOrderId.split("-")
            if (parts[1] === "PRO" || parts[1] === "PREMIUM") actualPackage = parts[1]
        }

        const config    = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } })
        const accountID = (config?.bakongConfig as any)?.accountID || process.env.BAKONG_ACCOUNT_ID || ""

        const result = await PaymentService.verifyBakongTransaction(
            wedding.id,
            dbMd5,
            dbOrderId,
            actualPackage,
            accountID,
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
        const isHuman = await verifyTurnstile(turnstileToken)
        if (!isHuman) return c.json({ error: "CAPTCHA verification failed" }, 400)

        let wedding
        if (user.role === ROLES.EVENT_STAFF) {
            if (!user.weddingId) return c.json({ error: "Staff not assigned to any wedding" }, 403)
            wedding = await prisma.wedding.findUnique({ where: { id: user.weddingId } })
        } else {
            wedding = await prisma.wedding.findFirst({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
            })
        }

        if (!wedding) return c.json({ error: "Wedding not found" }, 404)

        if (wedding.paymentStatus === "AWAITING_VERIFICATION") {
            return c.json({ error: "សម្នើសុំដំឡើងរបស់អ្នកកំពុងស្ថិតក្នុងការពិនិត្យ។ (Already awaiting verification)" }, 429)
        }

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        const updated = await prisma.wedding.update({
            where: { id: wedding.id },
            data: { packageType, paymentStatus: "AWAITING_VERIFICATION", expiresAt, status: "ACTIVE" },
        })

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
        const { packageType, receiptImage, txRef, note, weddingId } = body

        let targetWeddingId = weddingId
        if (!targetWeddingId) {
            const wedding = await prisma.wedding.findFirst({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' }
            })
            if (!wedding) return c.json({ error: "Wedding not found" }, 404)
            targetWeddingId = wedding.id
        }

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        const updated = await prisma.wedding.update({
            where: { id: targetWeddingId },
            data: {
                packageType: packageType || "PRO",
                paymentStatus: "AWAITING_VERIFICATION",
                paymentInfo: receiptImage || null,
                paymentHash: txRef || (note ? `NOTE: ${note}` : `SLIP_SUBMITTED_${Date.now()}`),
                expiresAt,
                status: "ACTIVE"
            }
        })

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

        const userId  = user.userId || user.id
        const wedding = await prisma.wedding.findFirst({
            where: user.weddingId ? { id: user.weddingId } : { userId },
            orderBy: { createdAt: 'desc' },
        })

        const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } })
        const stadPrice    = config?.stadPrice  ?? 9.00
        const proPrice     = config?.proPrice   ?? 19.00
        const bakongCfg    = (config?.bakongConfig as any) || {}
        const MERCHANT_NAME = bakongCfg.merchantName || process.env.BAKONG_MERCHANT_NAME || "MONEA"
        const ACCOUNT_ID    = bakongCfg.accountID    || process.env.BAKONG_ACCOUNT_ID

        if (!ACCOUNT_ID) {
            console.error("[payment/generate-qr] BAKONG_ACCOUNT_ID not configured")
            return c.json({ error: "Bakong payment account is not configured" }, 500)
        }

        const amount  = packageType === "PRO" ? stadPrice : proPrice
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

        return c.json({ qr: result.qr, orderId: result.orderId, md5: result.md5, success: true })
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

        const weddingId = user.weddingId
            || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id
        if (!weddingId) return c.json({ error: "Wedding not found" }, 404)

        const settings = await prisma.wedding.findUnique({
            where:  { id: weddingId },
            select: { themeSettings: true },
        })

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
        const { packageType } = await c.req.json()

        const wedding = await prisma.wedding.findFirst({
            where:  { userId: user.userId },
            select: { id: true, paymentHash: true, paymentStatus: true, paymentInfo: true },
        })

        if (!wedding)             return c.json({ error: "Wedding not found" }, 404)
        if (wedding.paymentStatus === "PAID") return c.json({ status: "PAID", alreadyPaid: true })
        if (!wedding.paymentHash) return c.json({ status: "AWAITING_PAYMENT", message: "No recent payment attempt found." })

        const orderId = wedding.paymentInfo || `MANUAL_REFRESH_${Date.now()}`

        const config    = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } })
        const accountID = (config?.bakongConfig as any)?.accountID || process.env.BAKONG_ACCOUNT_ID

        if (!accountID) return c.json({ error: "System misconfiguration: Missing Bakong ID" }, 500)

        // Extract true packageType from orderId
        let actualPackage = packageType || "PRO"
        if (orderId.startsWith("UPG-")) {
            const parts = orderId.split("-")
            if (parts[1] === "PRO" || parts[1] === "PREMIUM") actualPackage = parts[1]
        }

        const result: any = await PaymentService.verifyBakongTransaction(
            wedding.id,
            wedding.paymentHash,
            orderId,
            actualPackage,
            accountID,
        )

        if (result.status === "PAID") {
            result.orderId = orderId
            result.amount  = actualPackage === "PREMIUM"
                ? (config?.proPrice   ?? 19)
                : (config?.stadPrice  ?? 9)
        }

        return c.json(result)
    } catch (error: any) {
        console.error("[payment/manual-verify]", error)
        return c.json({ error: "Verification failed", details: error.message }, 500)
    }
})

export default paymentRouter

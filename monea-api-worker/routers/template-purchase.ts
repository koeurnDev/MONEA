/**
 * Template Purchase Router
 * Handles per-template purchase flow and license activation
 */

import { Hono } from 'hono';
import { getServerUser } from '@/lib/auth';
import { getDb } from '@/lib/drizzle';
import { prisma } from '@/lib/prisma';
import { weddings, templateLicenses, userTemplateAccess } from '@/drizzle/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { sanitizeObject } from '@/lib/sanitize';
import { z } from 'zod';
import { PaymentService } from '@/lib/PaymentService';
import { ensureUserTemplateAccessSchema } from '@/lib/user-template-access-schema';

import { notifyTelegramLifecycle } from "@/lib/telegram-lifecycle";
import { getSystemTemplatePricing } from '@/lib/template-pricing-setup';
import { getTemplatePricing, isTemplateFree } from '@/lib/template-pricing';
import { generateId } from '@/lib/drizzle-helpers';
import { standardLimiter, getIP } from '@/lib/ratelimit';
import { logSecurityEvent, shouldRaiseSecurityAlert } from "@/lib/security-audit";

const templatePurchaseRouter = new Hono();

/**
 * GET /api/template-purchase/user-licenses
 * List template access granted to the authenticated user's account.
 */
templatePurchaseRouter.get('/user-licenses', async (c) => {
  try {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    // IMPORTANT: this endpoint must use Drizzle for UserTemplateAccess.
    // Prisma currently errors with: "relation \"public.UserTemplateAccess\" does not exist"
    // (schema/migration mismatch).
    const db = getDb(c.env);
    await ensureUserTemplateAccessSchema(db);
    const uid = user.userId || user.id;

    const licenses = await db
      .select({
        id: userTemplateAccess.id,
        templateId: userTemplateAccess.templateId,
        createdAt: userTemplateAccess.createdAt,
      })
      .from(userTemplateAccess)
      // Drizzle doesn't like `eq(column, null)` for nullable timestamp types in our typings;
      // use `isNull()`.
      .where(and(eq(userTemplateAccess.userId, uid), isNull(userTemplateAccess.revokedAt)))
      .orderBy(userTemplateAccess.createdAt);

    return c.json({
      licenses: licenses.map((license) => ({
        ...license,
        status: 'ACTIVE',
        source: 'user',
      })),
    });
  } catch (error) {
    console.error('[Template Purchase] User access list error:', error);
    return c.json({ error: 'Failed to load user template access' }, 500);
  }
});

// Validation schema for purchase initiation
const purchaseInitSchema = z.object({
  templateId: z.string().min(1, 'Template ID required'),
});
const purchaseVerifySchema = z.object({
  md5: z.string().regex(/^[a-fA-F0-9]{32}$/, 'Invalid payment QR reference'),
});
const receiptSubmissionSchema = z.object({
  receiptUrl: z.string().url().max(2048),
  reference: z.string().trim().max(200).optional().default(''),
});

function isReceiptImageForWedding(receiptUrl: string, weddingId: string): boolean {
  try {
    const url = new URL(receiptUrl);
    if (url.protocol !== 'https:') return false;

    if (url.hostname === 'media.moneoez.com') {
      return url.pathname.split('/').filter(Boolean)[0] === weddingId;
    }
    if (url.hostname !== 'res.cloudinary.com') return false;

    const segments = url.pathname.split('/').filter(Boolean);
    const uploadIndex = segments.indexOf('upload');
    if (uploadIndex < 0) return false;

    const pathAfterUpload = segments.slice(uploadIndex + 1);
    const versionIndex = pathAfterUpload.findIndex((segment) => /^v\d+$/.test(segment));
    return versionIndex >= 0 && pathAfterUpload[versionIndex + 1] === weddingId;
  } catch {
    return false;
  }
}

/**
 * GET /api/template-purchase/check/:templateId
 * Check if user has license for a template
 */
templatePurchaseRouter.get('/check/:templateId', async (c) => {
  try {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const templateId = c.req.param('templateId');
    // SECURITY: never trust client weddingId for ownership-sensitive checks.
    const requestedWeddingId = c.req.query('weddingId');
    const weddingIdFromToken = (user as any).weddingId;
    const weddingId = weddingIdFromToken || requestedWeddingId;

    if (requestedWeddingId && weddingIdFromToken && requestedWeddingId !== weddingIdFromToken) {
      await logSecurityEvent({
        c,
        event: 'TEMPLATE_PURCHASE_CHECK_WEDDINGID_MISMATCH',
        userId: user.userId || user.id,
        weddingId: requestedWeddingId,
        templateId,
        ip: getIP(c.req.raw as any),
        details: { requestedWeddingId, weddingIdFromToken },
      });
      if (shouldRaiseSecurityAlert('wedding mismatch')) {
        console.warn('[SECURITY ALERT] weddingId mismatch in /template-purchase/check', {
          requestedWeddingId,
          weddingIdFromToken,
          templateId,
          userId: user.userId || user.id,
        });
      }
    }

    // Use Drizzle for UserTemplateAccess (see /user-licenses).
    const db = getDb(c.env);
    await ensureUserTemplateAccessSchema(db);
    const uid = user.userId || user.id;
    const userAccess = await db
      .select({ revokedAt: userTemplateAccess.revokedAt })
      .from(userTemplateAccess)
      .where(
        and(
          eq(userTemplateAccess.userId, uid),
          eq(userTemplateAccess.templateId, templateId)
        )
      )
      .limit(1);

    if (userAccess[0] && !userAccess[0].revokedAt) {
      return c.json({
        hasLicense: true,
        requiresPurchase: false,
        templateId,
        source: 'user',
      });
    }

    if (!weddingId) {
      return c.json({ error: 'Wedding ID required' }, 400);
    }

    // Check if template is free
    const pricing = await getSystemTemplatePricing(c.env);
    if (isTemplateFree(templateId, pricing)) {
      return c.json({
        hasLicense: true,
        requiresPurchase: false,
        message: 'Template is free',
      });
    }

    // Check for active template license
    const license = await prisma.templateLicense.findUnique({
      where: {
        weddingId_templateId: {
          weddingId,
          templateId,
        },
      },
      select: {
        id: true,
        status: true,
        expiresAt: true,
      },
    });

    if (!license) {
      return c.json({
        hasLicense: false,
        requiresPurchase: true,
        templateId,
      });
    }

    const isExpired =
      license.status === 'EXPIRED' ||
      (license.expiresAt && new Date(license.expiresAt) < new Date());

    return c.json({
      hasLicense: license.status === 'ACTIVE' && !isExpired,
      requiresPurchase: isExpired,
      status: license.status,
      expiresAt: license.expiresAt,
    });
  } catch (error: any) {
    console.error('[Template Purchase] Check error:', error);
    return c.json({ error: 'Failed to check template license' }, 500);
  }
});

/**
 * POST /api/template-purchase/initiate
 * Initiate template purchase and generate payment QR
 */
templatePurchaseRouter.post('/initiate', async (c) => {
  const ip = getIP(c.req.raw as any);
  const { success } = await standardLimiter.limit(ip);
  if (!success) {
    console.warn(`[Template Purchase] Rate limit exceeded for IP: ${ip}`);
    return c.json({ error: 'Too many requests. Please slow down.' }, 429);
  }

  try {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = user.userId || user.id;

    let body;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON format' }, 400);
    }

    const validated = purchaseInitSchema.safeParse(body);
    if (!validated.success) {
      return c.json({ error: validated.error.issues }, 400);
    }

    const { templateId } = sanitizeObject<any>(validated.data);

    // Get user's wedding
    const db = getDb(c.env);
    await ensureUserTemplateAccessSchema(db);

    // Use Drizzle for UserTemplateAccess.
    const grantedUserAccess = await db
      .select({ revokedAt: userTemplateAccess.revokedAt })
      .from(userTemplateAccess)
      .where(
        and(
          eq(userTemplateAccess.userId, userId),
          eq(userTemplateAccess.templateId, templateId)
        )
      )
      .limit(1);

    const userHasActiveAccess =
      grantedUserAccess[0] && !grantedUserAccess[0].revokedAt;
    if (userHasActiveAccess) {
      return c.json(
        {
          error: 'Your account already has access to this template',
          hasLicense: true,
        },
        400
      );
    }

    const wedding = await db
      .select({ id: weddings.id })
      .from(weddings)
      .where(eq(weddings.userId, userId))
      .limit(1)
      .then((r) => r[0]);

    if (!wedding) {
      return c.json({ error: 'Wedding not found. Please create a wedding first.' }, 404);
    }

    const weddingId = wedding.id;

    // Check if template is free
    const pricing = await getSystemTemplatePricing(c.env);
    if (isTemplateFree(templateId, pricing)) {
      // Auto-activate free template license
      const existingLicense = await prisma.templateLicense.findUnique({
        where: {
          weddingId_templateId: { weddingId, templateId },
        },
      });

      if (!existingLicense) {
        await prisma.templateLicense.create({
          data: {
            id: generateId(),
            weddingId,
            templateId,
            status: 'ACTIVE',
            amount: 0,
            currency: 'USD',
            purchaseDate: new Date(),
          },
        });
      } else if (existingLicense.status === 'EXPIRED') {
        await prisma.templateLicense.update({
          where: { id: existingLicense.id },
          data: {
            status: 'ACTIVE',
            purchaseDate: new Date(),
          },
        });
      }

      return c.json({
        success: true,
        message: 'Free template activated',
        templateId,
        requiresPayment: false,
      });
    }

    // Check if user already has an active license
    const existingLicense = await prisma.templateLicense.findUnique({
      where: {
        weddingId_templateId: { weddingId, templateId },
      },
    });

    if (existingLicense && existingLicense.status === 'ACTIVE') {
      const isExpired =
        existingLicense.expiresAt && new Date(existingLicense.expiresAt) < new Date();
      if (!isExpired) {
        return c.json({
          error: 'You already have an active license for this template',
          hasLicense: true,
        }, 400);
      }
    }

    // Get template pricing
    const templatePricing = getTemplatePricing(templateId, pricing);
    if (!templatePricing) {
      return c.json({ error: 'Template pricing not found' }, 404);
    }

    const now = Date.now();
    if (
      existingLicense
      && existingLicense.status === 'INACTIVE'
      && !existingLicense.receiptReviewStatus
      && existingLicense.paymentQr
      && existingLicense.paymentHash
      && existingLicense.paymentOrderId
      && existingLicense.currency === 'USD'
      && existingLicense.expiresAt
      && new Date(existingLicense.expiresAt).getTime() > now
    ) {
      return c.json({
        success: true,
        templateId,
        templateName: templatePricing.name,
        amount: Number(existingLicense.amount),
        currency: existingLicense.currency,
        orderId: existingLicense.paymentOrderId,
        licenseId: existingLicense.id,
        requiresPayment: true,
        qrCode: existingLicense.paymentQr,
        paymentUrl: existingLicense.paymentQr,
        md5: existingLicense.paymentHash,
        expiresAt: new Date(existingLicense.expiresAt).getTime(),
        resumed: true,
        message: `Resumed payment for: ${templatePricing.name}`,
      });
    }

    const amount = templatePricing.price;
    const finalCurrency = 'USD';

    // Create pending license record
    const licenseId = generateId();
    const orderId = `TPL-${weddingId.slice(0, 8)}-${templateId.slice(0, 6)}-${Date.now().toString(36).toUpperCase()}`;

    const license = await prisma.templateLicense.upsert({
      where: {
        weddingId_templateId: { weddingId, templateId },
      },
      update: {
        id: licenseId,
        status: 'INACTIVE',
        paymentOrderId: orderId,
        paymentHash: null,
        paymentQr: null,
        expiresAt: null,
        receiptUrl: null,
        receiptReference: null,
        receiptReviewStatus: null,
        receiptSubmittedAt: null,
        receiptReviewedAt: null,
        amount: amount.toString(),
        currency: finalCurrency,
        purchaseDate: new Date(),
      },
      create: {
        id: licenseId,
        weddingId,
        templateId,
        status: 'INACTIVE',
        paymentOrderId: orderId,
        paymentQr: null,
        amount: amount.toString(),
        currency: finalCurrency,
      },
    });

    // Generate every template purchase QR in USD.
    let qrCode = null;
    let paymentUrl = null;
    let paymentHash = null;
    let finalOrderId = orderId;
    let expiresAt = null;

    try {
      const bakongConfig = await prisma.systemConfig.findUnique({
        where: { id: 'GLOBAL' },
        select: { bakongConfig: true },
      });

      const config = bakongConfig?.bakongConfig as any;
      const workerEnv = c.env as { BAKONG_ACCOUNT_ID?: string };
      const accountID =
        config?.accountID ||
        config?.accountId ||
        workerEnv.BAKONG_ACCOUNT_ID ||
        process.env.BAKONG_ACCOUNT_ID;
      if (!accountID) {
        console.error('[Template Purchase] Bakong receiving account is not configured');
        return c.json({ error: 'Bakong receiving account is not configured' }, 503);
      }

      const qrPayload = {
        amount,
        currency: 'USD' as const,
        merchantName: config.merchantName || 'MONEA',
        accountID,
        orderId,
        expiresInMs: 5 * 60 * 1000,
      };

      const khqrResult = await PaymentService.generateKHQR(qrPayload);
      qrCode = khqrResult.qr;
      paymentUrl = khqrResult.qr;
      paymentHash = khqrResult.md5;
      finalOrderId = khqrResult.orderId;
      expiresAt = khqrResult.expiresAt;
      if (!qrCode || !paymentHash || !expiresAt) {
        throw new Error('KHQR generator returned an incomplete payment response');
      }

      // Store the generated QR hash so verification can only confirm this order's QR.
      await prisma.templateLicense.update({
        where: { id: licenseId },
        data: {
          paymentOrderId: finalOrderId,
          paymentHash,
          paymentQr: qrCode,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      });
    } catch (error: any) {
      console.error('[Template Purchase] KHQR generation error:', error);
      return c.json({ error: 'Failed to generate template payment QR' }, 503);
    }

    return c.json({
      success: true,
      templateId,
      templateName: templatePricing.name,
      amount,
      currency: finalCurrency,
      orderId: finalOrderId,
      licenseId,
      requiresPayment: true,
      qrCode,
      paymentUrl,
      md5: paymentHash,
      expiresAt,
      resumed: false,
      message: `Ready to purchase: ${templatePricing.name} for ${amount} ${finalCurrency}`,
    });
  } catch (error: any) {
    console.error('[Template Purchase] Initiate error:', error);
    return c.json(
      { error: error?.message || 'Failed to initiate template purchase' },
      500
    );
  }
});

/**
 * POST /api/template-purchase/submit-slip/:orderId
 * Submit a receipt for manual administrator review without activating the license.
 */
templatePurchaseRouter.post('/submit-slip/:orderId', async (c) => {
  try {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    let body;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON format' }, 400);
    }
    const parsed = receiptSubmissionSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: 'Invalid receipt submission' }, 400);

    const license = await prisma.templateLicense.findFirst({
      where: { paymentOrderId: c.req.param('orderId') },
      select: {
        id: true,
        weddingId: true,
        templateId: true,
        paymentOrderId: true,
        amount: true,
        currency: true,
        status: true,
        receiptReviewStatus: true,
      },
    });
    if (!license) return c.json({ error: 'Purchase order not found' }, 404);

    const wedding = await prisma.wedding.findFirst({
      where: { id: license.weddingId, userId: user.userId || user.id },
      select: { id: true },
    });
    if (!wedding && user.role !== 'SUPERADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }
    if (license.status !== 'INACTIVE') {
      return c.json({
        error: license.status === 'ACTIVE'
          ? 'Template license is already active'
          : 'This purchase order is no longer awaiting payment',
      }, 409);
    }
    if (license.receiptReviewStatus === 'PENDING') {
      return c.json({ error: 'Receipt is already waiting for administrator review' }, 409);
    }
    if (!isReceiptImageForWedding(parsed.data.receiptUrl, license.weddingId)) {
      return c.json({ error: "Receipt image must be uploaded to the wedding's media folder" }, 400);
    }

    const submittedAt = new Date();
    await prisma.templateLicense.update({
      where: { id: license.id },
      data: {
        receiptUrl: parsed.data.receiptUrl,
        receiptReference: parsed.data.reference || null,
        receiptReviewStatus: 'PENDING',
        receiptSubmittedAt: submittedAt,
        receiptReviewedAt: null,
      },
    });

    void notifyTelegramLifecycle({
      event: "TEMPLATE_RECEIPT_SUBMITTED",
      dedupKey: `template-receipt:${license.id}:${submittedAt.toISOString()}`,
      weddingId: license.weddingId,
      userId: user.userId || user.id,
      userName: (user as any).name || null,
      userEmail: (user as any).email || null,
      orderId: license.paymentOrderId,
      templateId: license.templateId,
      amount: Number(license.amount),
      currency: license.currency,
    }, { env: c.env });

    return c.json({
      success: true,
      status: 'PENDING_REVIEW',
      message: 'Receipt submitted for administrator review',
    });
  } catch (error) {
    console.error('[Template Purchase] Receipt submission error:', error);
    return c.json({ error: 'Failed to submit payment receipt' }, 500);
  }
});

/**
 * POST /api/template-purchase/verify/:orderId
 * Verify template purchase payment
 */
templatePurchaseRouter.post('/verify/:orderId', async (c) => {
  try {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const orderId = c.req.param('orderId');
    let body;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON format' }, 400);
    }

    const validated = purchaseVerifySchema.safeParse(body);
    if (!validated.success) {
      return c.json({ error: 'Valid payment QR reference required' }, 400);
    }
    const { md5 } = sanitizeObject<{ md5: string }>(validated.data);

    // Find license with this order ID
    const license = await prisma.templateLicense.findFirst({
      where: { paymentOrderId: orderId },
      select: {
        id: true,
        weddingId: true,
        templateId: true,
        status: true,
        paymentHash: true,
        amount: true,
        currency: true,
      },
    });

    if (!license) {
      return c.json({ error: 'Purchase order not found' }, 404);
    }

    const wedding = await prisma.wedding.findFirst({
      where: {
        id: license.weddingId,
        userId: user.userId || user.id,
      },
      select: { id: true },
    });
    if (!wedding && user.role !== 'SUPERADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    if (license.status === 'ACTIVE') {
      return c.json({ success: true, status: 'ACTIVE' });
    }
    if (!license.paymentHash || license.paymentHash !== md5) {
      return c.json({ error: 'Payment QR does not match this order' }, 400);
    }

    try {
      const bakongConfig = await prisma.systemConfig.findUnique({
        where: { id: 'GLOBAL' },
        select: { bakongConfig: true },
      });

      if (!bakongConfig?.bakongConfig) {
        return c.json({ error: 'Bakong not configured' }, 503);
      }

      const config = bakongConfig.bakongConfig as any;

      const verification = await PaymentService.verifyAndActivateTemplateLicense(
        license.id,
        license.templateId,
        license.weddingId,
        md5,
        orderId,
        config.accountID || config.accountId || '',
        c.env,
        config.token
      );

      if (verification.status !== 'ACTIVE') {
        return c.json({
          status: 'pending',
          message: 'Payment verification pending',
        });
      }

      // Best-effort Telegram lifecycle notification (non-blocking)
      void notifyTelegramLifecycle({
        event: "TEMPLATE_PAYMENT_CONFIRMED",
        dedupKey: `template-confirmed:${verification.license?.id || license.id}:${orderId}`,
        weddingId: license.weddingId,
        userId: (user as any).userId || (user as any).id || null,
        userName: (user as any).name || null,
        userEmail: (user as any).email || null,
        orderId,
        templateId: license.templateId,
        amount: Number(license.amount),
        currency: license.currency,
        method: "Bakong",
      }, { env: c.env });

      return c.json({
        success: true,
        status: 'ACTIVE',
        message: `${license.templateId} template license activated`,
        license: {
          id: verification.license?.id,
          templateId: verification.license?.templateId,
          status: verification.license?.status,
          purchaseDate: verification.license?.purchaseDate,
        },
      });
    } catch (error: any) {
      console.error('[Template Purchase] Bakong verification error:', error);
      return c.json({
        error: 'Payment verification failed',
        details: error?.message,
      }, 500);
    }
  } catch (error: any) {
    console.error('[Template Purchase] Verify error:', error);
    return c.json(
      { error: 'Failed to verify purchase' },
      500
    );
  }
});

/**
 * GET /api/template-purchase/status/:weddingId/:templateId
 * Get purchase status for a template
 */
templatePurchaseRouter.get('/status/:weddingId/:templateId', async (c) => {
  try {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const weddingId = c.req.param('weddingId');
    const templateId = c.req.param('templateId');

    // Verify access
    const wedding = await prisma.wedding.findFirst({
      where: {
        id: weddingId,
        userId: user.userId || user.id,
      },
      select: { id: true },
    });

    if (!wedding && user.role !== 'SUPERADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const license = await prisma.templateLicense.findUnique({
      where: {
        weddingId_templateId: { weddingId, templateId },
      },
    });

    if (!license) {
      return c.json({
        hasPurchase: false,
        templateId,
      });
    }

    const isExpired =
      license.expiresAt && new Date(license.expiresAt) < new Date();

    return c.json({
      hasPurchase: true,
      status: license.status,
      isExpired,
      purchaseDate: license.purchaseDate,
      expiresAt: license.expiresAt,
      amount: license.amount,
      currency: license.currency,
    });
  } catch (error: any) {
    console.error('[Template Purchase] Status error:', error);
    return c.json({ error: 'Failed to get purchase status' }, 500);
  }
});

/**
 * GET /api/template-purchase/list/:weddingId
 * List all purchased/active template licenses for a wedding
 */
templatePurchaseRouter.get('/list/:weddingId', async (c) => {
  try {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const weddingId = c.req.param('weddingId');

    const db = getDb(c.env);
    await ensureUserTemplateAccessSchema(db);
    const uid = user.userId || user.id;

    // Verify access
    const wedding = await prisma.wedding.findFirst({
      where: {
        id: weddingId,
        userId: user.userId || user.id,
      },
      select: { id: true },
    });

    if (!wedding && user.role !== 'SUPERADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const licenses = await prisma.templateLicense.findMany({
      where: { weddingId },
      orderBy: { purchaseDate: 'desc' },
    });
    const userAccess = await db
      .select({
        id: userTemplateAccess.id,
        templateId: userTemplateAccess.templateId,
        createdAt: userTemplateAccess.createdAt,
      })
      .from(userTemplateAccess)
      .where(and(eq(userTemplateAccess.userId, uid), isNull(userTemplateAccess.revokedAt)))
      .orderBy(userTemplateAccess.createdAt);

    const active = licenses.filter(
      (l) =>
        l.status === 'ACTIVE' &&
        (!l.expiresAt || new Date(l.expiresAt) > new Date())
    );

    return c.json({
      weddingId,
      total: licenses.length + userAccess.length,
      active: active.length + userAccess.length,
      licenses: [
        ...licenses.map((l) => ({
          id: l.id,
          templateId: l.templateId,
          status: l.status,
          purchaseDate: l.purchaseDate,
          expiresAt: l.expiresAt,
          amount: l.amount,
          currency: l.currency,
          receiptReviewStatus: l.receiptReviewStatus,
          source: 'wedding',
        })),
        ...userAccess.map((license) => ({
          id: license.id,
          templateId: license.templateId,
          status: 'ACTIVE',
          purchaseDate: license.createdAt,
          expiresAt: null,
          amount: 0,
          currency: 'USD',
          receiptReviewStatus: null,
          source: 'user',
        })),
      ],
    });
  } catch (error: any) {
    console.error('[Template Purchase] List error:', error);
    return c.json({ error: 'Failed to list template licenses' }, 500);
  }
});

export default templatePurchaseRouter;

/**
 * Template Licensing Utilities
 * Handles per-template license checks and validation
 */

import { prisma } from '@/lib/prisma';
import { getDb } from '@/lib/drizzle';
import { eq, isNull, and } from 'drizzle-orm';
import { userTemplateAccess } from '@/drizzle/schema';
import { getSystemTemplatePricing } from '@/lib/template-pricing-setup';
import { isTemplateFree } from '@/lib/template-pricing';

export interface TemplateAccessInfo {
  hasAccess: boolean;
  reason?: 'free' | 'licensed' | 'expired' | 'not_owned';
}

/**
 * Check if a user (wedding) can use a specific template
 */
export async function canUseTemplate(
  wedding: any,
  templateId: string,
  activeLicenses?: any[],
  isFreeTemplate?: boolean
): Promise<boolean> {
  try {
    // Get template pricing
    const pricing = await getSystemTemplatePricing();
    
    // If template is free, always allow
    if (isTemplateFree(templateId, pricing)) {
      return true;
    }

    // Check if user has active license for this template
    if (!wedding?.id) {
      return false;
    }

    const userId = wedding.userId;
    const db = getDb();
    const userAccess = userId
      ? await db
          .select({ revokedAt: userTemplateAccess.revokedAt })
          .from(userTemplateAccess)
          .where(
            and(
              eq(userTemplateAccess.userId, userId),
              eq(userTemplateAccess.templateId, templateId)
            )
          )
          .limit(1)
      : [];

    if (userAccess[0] && !userAccess[0].revokedAt) {
      return true;
    }

    // If activeLicenses is passed in, use it (for performance)
    let licenses = activeLicenses;
    
    if (!licenses) {
      licenses = await prisma.templateLicense.findMany({
        where: {
          weddingId: wedding.id,
          status: 'ACTIVE',
        },
      });
    }

    // Check if any license matches this template and is not expired
    const hasLicense = licenses?.some(
      (license: any) =>
        license.templateId === templateId &&
        (!license.expiresAt || new Date(license.expiresAt) > new Date())
    );

    return hasLicense || false;
  } catch (error) {
    console.error('[Template Licensing] Error checking template access:', error);
    return false;
  }
}

/**
 * Get detailed access info for a template
 */
export async function getTemplateAccessInfo(
  wedding: any,
  templateId: string
): Promise<TemplateAccessInfo> {
  try {
    const pricing = await getSystemTemplatePricing();

    // If template is free
    if (isTemplateFree(templateId, pricing)) {
      return { hasAccess: true, reason: 'free' };
    }

    // Check for active license
    if (!wedding?.id) {
      return { hasAccess: false, reason: 'not_owned' };
    }

    if (wedding.userId) {
      const db = getDb();
      const userAccess = await db
        .select({ revokedAt: userTemplateAccess.revokedAt })
        .from(userTemplateAccess)
        .where(
          and(
            eq(userTemplateAccess.userId, wedding.userId),
            eq(userTemplateAccess.templateId, templateId)
          )
        )
        .limit(1);

      if (userAccess[0] && !userAccess[0].revokedAt) {
        return { hasAccess: true, reason: 'licensed' };
      }
    }

    const license = await prisma.templateLicense.findUnique({
      where: {
        weddingId_templateId: {
          weddingId: wedding.id,
          templateId,
        },
      },
    });

    if (!license) {
      return { hasAccess: false, reason: 'not_owned' };
    }

    if (license.status !== 'ACTIVE') {
      return { hasAccess: false, reason: 'not_owned' };
    }

    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      return { hasAccess: false, reason: 'expired' };
    }

    return { hasAccess: true, reason: 'licensed' };
  } catch (error) {
    console.error('[Template Licensing] Error getting template access info:', error);
    return { hasAccess: false, reason: 'not_owned' };
  }
}

/**
 * Get all active template licenses for a wedding
 */
export async function getActiveTemplates(weddingId: string): Promise<string[]> {
  try {
    const db = getDb();
    const [wedding, licenses] = await Promise.all([
      prisma.wedding.findUnique({ where: { id: weddingId }, select: { userId: true } }),
      prisma.templateLicense.findMany({
        where: {
          weddingId,
          status: 'ACTIVE',
        },
        select: { templateId: true },
      }),
    ]);

    const userAccess = wedding
      ? await db
          .select({ templateId: userTemplateAccess.templateId })
          .from(userTemplateAccess)
          .where(
            and(
              isNull(userTemplateAccess.revokedAt),
              eq(userTemplateAccess.userId, wedding.userId)
            )
          )
      : [];

    return [
      ...new Set([
        ...licenses.map((l) => l.templateId),
        ...userAccess.map((a: any) => a.templateId),
      ]),
    ];
  } catch (error) {
    console.error('[Template Licensing] Error getting active templates:', error);
    return [];
  }
}

/**
 * Validate template compatibility with event type
 */
export function isTemplateCompatible(
  templateMetadata: any,
  templateId: string,
  eventType: 'wedding' | 'anniversary'
): boolean {
  if (!templateMetadata || !templateMetadata[templateId]) {
    return false;
  }

  const meta = templateMetadata[templateId];
  return meta.eventTypes?.includes(eventType) || false;
}

/**
 * Normalize template pricing from various sources
 */
export function normalizeTemplatePricing(rawPricing: any): any {
  if (!rawPricing) return null;

  try {
    if (typeof rawPricing === 'string') {
      return JSON.parse(rawPricing);
    }
    if (typeof rawPricing === 'object') {
      return rawPricing;
    }
    return null;
  } catch (error) {
    console.error('[Template Licensing] Error parsing pricing:', error);
    return null;
  }
}

/**
 * Check if wedding has legacy package (PRO/PREMIUM) vs new template licensing
 */
export function hasLegacyPackage(wedding: any): boolean {
  if (!wedding) return false;
  const packageType = wedding.packageType;
  return packageType === 'PRO' || packageType === 'PREMIUM';
}

/**
 * Check hosting window for published template
 */
export async function resolveHostingWindow(
  templateLicense: any
): Promise<{ isActive: boolean; expiresAt?: Date }> {
  if (!templateLicense) {
    return { isActive: false };
  }

  const now = new Date();
  const isActive =
    templateLicense.status === 'ACTIVE' &&
    (!templateLicense.hostingExpiresAt ||
      new Date(templateLicense.hostingExpiresAt) > now);

  return {
    isActive,
    expiresAt: templateLicense.hostingExpiresAt,
  };
}

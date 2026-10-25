/**
 * Template Pricing Setup Utility
 * Initializes and manages template pricing in SystemConfig
 */

import { prisma } from '@/lib/prisma';
import { getDb } from '@/lib/drizzle';
import { systemConfig } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import {
  DEFAULT_TEMPLATE_PRICING,
  normalizeTemplatePricing,
  TemplatePricingConfig,
} from '@/lib/template-pricing';

/**
 * Initialize template pricing in SystemConfig
 * Called on system startup or when pricing needs to be reset
 */
export async function initializeTemplatePricing(env?: any) {
  try {
    // Try Prisma first (for backward compatibility)
    const config = await prisma.systemConfig.findUnique({
      where: { id: 'GLOBAL' },
    });

    if (!config) {
      // Create new SystemConfig if it doesn't exist
      const newConfig = await prisma.systemConfig.create({
        data: {
          id: 'GLOBAL',
          templatePricing: DEFAULT_TEMPLATE_PRICING,
        },
      });
      console.log('[Template Pricing] Initialized new SystemConfig with pricing');
      return newConfig;
    }

    // If pricing is not set, update it
    if (!config.templatePricing) {
      const updated = await prisma.systemConfig.update({
        where: { id: 'GLOBAL' },
        data: {
          templatePricing: DEFAULT_TEMPLATE_PRICING,
        },
      });
      console.log('[Template Pricing] Added pricing to existing SystemConfig');
      return updated;
    }

    console.log('[Template Pricing] Pricing already configured in SystemConfig');
    return config;
  } catch (error) {
    console.error('[Template Pricing Setup] Error initializing pricing:', error);
    throw error;
  }
}

/**
 * Get current template pricing from SystemConfig
 */
export async function getSystemTemplatePricing(
  env?: any
): Promise<TemplatePricingConfig> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { id: 'GLOBAL' },
      select: { templatePricing: true },
    });

    const normalized = normalizeTemplatePricing(config?.templatePricing);
    if (!normalized) return DEFAULT_TEMPLATE_PRICING;

    return normalized;
  } catch (error) {
    console.error('[Template Pricing] Error fetching system pricing:', error);
    return DEFAULT_TEMPLATE_PRICING;
  }
}

/**
 * Update template pricing in SystemConfig
 */
export async function updateTemplatePricing(
  newPricing: TemplatePricingConfig,
  env?: any
): Promise<any> {
  try {
    const updated = await prisma.systemConfig.update({
      where: { id: 'GLOBAL' },
      data: {
        templatePricing: newPricing,
        updatedAt: new Date(),
      },
    });

    console.log('[Template Pricing] Updated pricing configuration');
    return updated;
  } catch (error) {
    console.error('[Template Pricing] Error updating pricing:', error);
    throw error;
  }
}

/**
 * Update pricing for a single template
 */
export async function updateTemplatePrice(
  templateId: string,
  price: number,
  env?: any
): Promise<TemplatePricingConfig> {
  try {
    const currentPricing = await getSystemTemplatePricing(env);

    if (!currentPricing[templateId]) {
      throw new Error(`Template '${templateId}' not found in pricing config`);
    }

    const updated: TemplatePricingConfig = {
      ...currentPricing,
      [templateId]: {
        ...currentPricing[templateId],
        price,
        currency: 'USD',
      },
    };

    await updateTemplatePricing(updated, env);
    return updated;
  } catch (error) {
    console.error('[Template Pricing] Error updating single template price:', error);
    throw error;
  }
}

/**
 * Add or create pricing for a new template
 */
export async function addTemplatePrice(
  templateId: string,
  name: string,
  price: number,
  description: string,
  eventTypes: ('wedding' | 'anniversary')[],
  env?: any
): Promise<TemplatePricingConfig> {
  try {
    const currentPricing = await getSystemTemplatePricing(env);

    if (currentPricing[templateId]) {
      throw new Error(`Template '${templateId}' already exists in pricing config`);
    }

    const updated: TemplatePricingConfig = {
      ...currentPricing,
      [templateId]: {
        name,
        price,
        currency: 'USD',
        description,
        isFree: price === 0,
        eventTypes,
      },
    };

    await updateTemplatePricing(updated, env);
    return updated;
  } catch (error) {
    console.error('[Template Pricing] Error adding new template price:', error);
    throw error;
  }
}

/**
 * Enable/disable template pricing (soft delete from pricing list)
 */
export async function setTemplatePricingStatus(
  templateId: string,
  enabled: boolean,
  env?: any
): Promise<TemplatePricingConfig> {
  try {
    const currentPricing = await getSystemTemplatePricing(env);

    if (!currentPricing[templateId]) {
      throw new Error(`Template '${templateId}' not found`);
    }

    if (!enabled) {
      // Remove from pricing if disabling
      const { [templateId]: _, ...rest } = currentPricing;
      await updateTemplatePricing(rest, env);
      return rest;
    }

    // Re-enable with default pricing if enabling
    const updated = {
      ...currentPricing,
      [templateId]: DEFAULT_TEMPLATE_PRICING[templateId],
    };

    await updateTemplatePricing(updated, env);
    return updated;
  } catch (error) {
    console.error('[Template Pricing] Error setting template status:', error);
    throw error;
  }
}

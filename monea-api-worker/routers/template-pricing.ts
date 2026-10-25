/**
 * Template Pricing Management Router
 * Admin endpoints for managing per-template pricing
 */

import { Hono } from 'hono';
import { getServerUser } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import {
  getSystemTemplatePricing,
  updateTemplatePricing,
  updateTemplatePrice,
  addTemplatePrice,
  setTemplatePricingStatus,
} from '@/lib/template-pricing-setup';
import {
  TemplatePricingConfig,
  validateTemplatePricing,
  DEFAULT_TEMPLATE_PRICING,
} from '@/lib/template-pricing';
import { sanitizeObject } from '@/lib/sanitize';

const templatePricingRouter = new Hono();

/**
 * GET /api/template-pricing
 * Public endpoint to get current template pricing
 */
templatePricingRouter.get('/', async (c) => {
  try {
    const pricing = await getSystemTemplatePricing(c.env);
    return c.json({ data: pricing });
  } catch (error: any) {
    console.error('[Template Pricing API] GET error:', error);
    return c.json(
      { error: 'Failed to fetch template pricing' },
      500
    );
  }
});

/**
 * GET /api/template-pricing/admin
 * Admin endpoint to manage pricing
 * Requires PLATFORM_OWNER role
 */
templatePricingRouter.get('/admin', async (c) => {
  try {
    const user = await getServerUser(c.req.raw);
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const pricing = await getSystemTemplatePricing(c.env);
    return c.json({ data: pricing });
  } catch (error: any) {
    console.error('[Template Pricing API] GET admin error:', error);
    return c.json(
      { error: 'Failed to fetch template pricing' },
      500
    );
  }
});

/**
 * PUT /api/template-pricing/:templateId
 * Update price for a specific template
 * Admin only
 */
templatePricingRouter.put('/:templateId', async (c) => {
  try {
    const user = await getServerUser(c.req.raw);
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const templateId = c.req.param('templateId');
    let body;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON' }, 400);
    }

    const sanitized = sanitizeObject<any>(body);
    const { price, currency = 'USD' } = sanitized;

    if (typeof price !== 'number' || price < 0) {
      return c.json({ error: 'Price must be a non-negative number' }, 400);
    }

    if (price > 99.99) {
      return c.json({ error: 'Price cannot exceed $99.99' }, 400);
    }

    if (currency !== 'USD') {
      return c.json({ error: 'Template prices must use USD' }, 400);
    }

    const updated = await updateTemplatePrice(
      templateId,
      price,
      c.env
    );

    return c.json({
      data: updated,
      message: `Template '${templateId}' price updated to ${price} ${currency}`,
    });
  } catch (error: any) {
    console.error('[Template Pricing API] PUT error:', error);
    return c.json(
      { error: error?.message || 'Failed to update template price' },
      500
    );
  }
});

/**
 * POST /api/template-pricing
 * Add or update entire pricing configuration
 * Admin only
 */
templatePricingRouter.post('/', async (c) => {
  try {
    const user = await getServerUser(c.req.raw);
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    let body;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON' }, 400);
    }

    const { pricing } = sanitizeObject<any>(body);

    if (!pricing || typeof pricing !== 'object') {
      return c.json({ error: 'Pricing configuration required' }, 400);
    }

    // Validate pricing structure
    if (!validateTemplatePricing(pricing)) {
      return c.json(
        { error: 'Invalid pricing configuration format' },
        400
      );
    }

    // Validate all prices are non-negative and within limits
    for (const [templateId, config] of Object.entries(pricing)) {
      const price = (config as any).price;
      if (typeof price !== 'number' || price < 0) {
        return c.json(
          { error: `Invalid price for template ${templateId}: must be non-negative` },
          400
        );
      }
      if (price > 99.99) {
        return c.json(
          { error: `Invalid price for template ${templateId}: cannot exceed $99.99` },
          400
        );
      }
    }

    const updated = await updateTemplatePricing(pricing, c.env);

    return c.json({
      data: updated,
      message: 'Template pricing updated successfully',
    });
  } catch (error: any) {
    console.error('[Template Pricing API] POST error:', error);
    return c.json(
      { error: error?.message || 'Failed to update template pricing' },
      500
    );
  }
});

/**
 * POST /api/template-pricing/reset
 * Reset pricing to default values
 * Admin only
 */
templatePricingRouter.post('/reset', async (c) => {
  try {
    const user = await getServerUser(c.req.raw);
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await updateTemplatePricing(DEFAULT_TEMPLATE_PRICING, c.env);

    return c.json({
      data: DEFAULT_TEMPLATE_PRICING,
      message: 'Template pricing reset to default values',
    });
  } catch (error: any) {
    console.error('[Template Pricing API] Reset error:', error);
    return c.json(
      { error: 'Failed to reset template pricing' },
      500
    );
  }
});

/**
 * PATCH /api/template-pricing/:templateId/toggle
 * Enable/disable template availability
 * Admin only
 */
templatePricingRouter.patch('/:templateId/toggle', async (c) => {
  try {
    const user = await getServerUser(c.req.raw);
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const templateId = c.req.param('templateId');
    let body;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON' }, 400);
    }

    const { enabled } = sanitizeObject<any>(body);

    if (typeof enabled !== 'boolean') {
      return c.json({ error: 'Enabled flag must be a boolean' }, 400);
    }

    const updated = await setTemplatePricingStatus(
      templateId,
      enabled,
      c.env
    );

    return c.json({
      data: updated,
      message: `Template '${templateId}' ${enabled ? 'enabled' : 'disabled'}`,
    });
  } catch (error: any) {
    console.error('[Template Pricing API] Toggle error:', error);
    return c.json(
      { error: error?.message || 'Failed to toggle template status' },
      500
    );
  }
});

export default templatePricingRouter;

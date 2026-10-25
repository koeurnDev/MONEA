/**
 * Template Pricing Management
 * Handles per-template pricing configuration and validation
 */

export interface TemplatePricingConfig {
  [templateId: string]: {
    name: string;
    price: number;
    currency: 'USD';
    description: string;
    isFree?: boolean;
    originalPrice?: number; // តម្លៃដើម (មុនបញ្ចុះ)
    onSale?: boolean; // មានការបញ្ចុះតម្លៃឬទេ
    eventTypes: ('wedding' | 'anniversary')[];
  };
}

/**
 * Default template pricing configuration
 * Used as fallback if no pricing is configured in SystemConfig
 */
export const DEFAULT_TEMPLATE_PRICING: TemplatePricingConfig = {
  'khmer-legacy': {
    name: 'Khmer Legacy',
    price: 25,
    currency: 'USD',
    description: 'Classic Khmer-style wedding template',
    isFree: false,
    eventTypes: ['wedding', 'anniversary'],
  },
  'modern-minimal': {
    name: 'Modern Minimal',
    price: 0,
    currency: 'USD',
    description: 'Clean and minimalist design',
    isFree: true,
    eventTypes: ['wedding', 'anniversary'],
  },
  'fortune-harmony': {
    name: 'Fortune Harmony',
    price: 7,
    currency: 'USD',
    description: 'Traditional with modern touch',
    eventTypes: ['wedding', 'anniversary'],
  },
  'blossom-romance': {
    name: 'Blossom Romance',
    price: 7,
    currency: 'USD',
    description: 'Elegant floral-inspired design',
    eventTypes: ['wedding', 'anniversary'],
  },
  'nea-m05': {
    name: 'Nea M05',
    price: 8,
    currency: 'USD',
    description: 'Contemporary elegant template',
    eventTypes: ['wedding', 'anniversary'],
  },
  'emerald-garden': {
    name: 'Emerald Garden',
    price: 8,
    currency: 'USD',
    description: 'Lush garden-inspired design',
    eventTypes: ['wedding', 'anniversary'],
  },
  'anniversary-elegant': {
    name: 'Anniversary Elegant',
    price: 6,
    currency: 'USD',
    description: 'Elegant template for anniversaries',
    eventTypes: ['anniversary'],
  },
  'garden-editorial': {
    name: 'Garden Editorial',
    price: 9,
    currency: 'USD',
    description: 'Professional editorial-style garden template',
    eventTypes: ['wedding'],
  },
};

/**
 * Get pricing for a specific template
 */
export function getTemplatePricing(
  templateId: string,
  customPricing?: TemplatePricingConfig | null
): TemplatePricingConfig[string] | null {
  const pricing = customPricing || DEFAULT_TEMPLATE_PRICING;
  const templateConfig = pricing[templateId];
  
  if (!templateConfig) {
    console.warn(`[Template Pricing] Template '${templateId}' not found in pricing config, returning null`);
    return null;
  }
  
  return templateConfig;
}

/**
 * Check if a template is free
 */
export function isTemplateFree(
  templateId: string,
  customPricing?: TemplatePricingConfig | null
): boolean {
  const pricing = getTemplatePricing(templateId, customPricing);
  return pricing ? pricing.isFree || pricing.price === 0 : false;
}

/**
 * Get all templates available for an event type
 */
export function getTemplatesForEventType(
  eventType: 'wedding' | 'anniversary',
  customPricing?: TemplatePricingConfig | null
): string[] {
  const pricing = customPricing || DEFAULT_TEMPLATE_PRICING;
  return Object.entries(pricing)
    .filter(([, config]) => config.eventTypes.includes(eventType))
    .map(([templateId]) => templateId);
}

/**
 * Normalize template pricing from SystemConfig
 */
export function normalizeTemplatePricing(
  rawPricing: any
): TemplatePricingConfig | null {
  let pricing = rawPricing;
  if (typeof pricing === 'string') {
    try {
      pricing = JSON.parse(pricing);
    } catch (error) {
      console.error('[Template Pricing] Failed to parse pricing config:', error);
      return null;
    }
  }
  if (!pricing || typeof pricing !== 'object' || Array.isArray(pricing)) return null;

  const normalized: TemplatePricingConfig = {};
  for (const [templateId, rawConfig] of Object.entries(pricing)) {
    if (templateId === '__proto__' || templateId === 'constructor' || templateId === 'prototype') continue;
    if (!rawConfig || typeof rawConfig !== 'object' || Array.isArray(rawConfig)) continue;
    const config = rawConfig as Record<string, unknown>;
    const priceValue = config.price ?? config.amount;
    const price = typeof priceValue === 'number' ? priceValue : Number(priceValue);
    if (!Number.isFinite(price) || price < 0) continue;

    const defaults = DEFAULT_TEMPLATE_PRICING[templateId];
    const originalPriceValue = config.originalPrice ?? config.originalAmount;
    const parsedOriginalPrice = originalPriceValue === undefined || originalPriceValue === null
      ? undefined
      : Number(originalPriceValue);
    const originalPrice = parsedOriginalPrice !== undefined
      && Number.isFinite(parsedOriginalPrice)
      && parsedOriginalPrice >= 0
      ? parsedOriginalPrice
      : undefined;

    normalized[templateId] = {
      name: typeof config.name === 'string' && config.name.trim()
        ? config.name
        : defaults?.name || templateId,
      price,
      currency: 'USD',
      description: typeof config.description === 'string'
        ? config.description
        : defaults?.description || '',
      isFree: typeof config.isFree === 'boolean' ? config.isFree : price === 0,
      ...(originalPrice !== undefined ? { originalPrice } : {}),
      onSale: typeof config.onSale === 'boolean'
        ? config.onSale
        : originalPrice !== undefined && originalPrice > price,
      eventTypes: Array.isArray(config.eventTypes)
        ? config.eventTypes.filter((eventType): eventType is 'wedding' | 'anniversary' =>
          eventType === 'wedding' || eventType === 'anniversary')
        : defaults?.eventTypes || ['wedding', 'anniversary'],
    };
  }

  if (Object.keys(normalized).length === 0) {
    console.error('[Template Pricing] Pricing config contained no valid template prices');
    return null;
  }

  return normalized;
}

/**
 * Validate template pricing configuration
 */
export function validateTemplatePricing(pricing: any): boolean {
  if (!pricing || typeof pricing !== 'object' || Array.isArray(pricing)) {
    return false;
  }

  for (const [templateId, config] of Object.entries(pricing)) {
    if (typeof templateId !== 'string') return false;
    if (!config || typeof config !== 'object') return false;

    const c = config as any;
    if (typeof c.name !== 'string') return false;
    if (typeof c.price !== 'number' || c.price < 0) return false;
    if (c.currency && c.currency !== 'USD') return false;
    if (typeof c.description !== 'string') return false;
    if (!Array.isArray(c.eventTypes)) return false;
    if (!c.eventTypes.every((et: any) => et === 'wedding' || et === 'anniversary')) {
      return false;
    }
  }

  return true;
}

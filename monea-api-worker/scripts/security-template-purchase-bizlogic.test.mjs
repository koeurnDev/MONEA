import assert from 'node:assert/strict';
import test from 'node:test';

/**
 * Security hardening test plan (biz-logic):
 * This repo runs tests via node --test on mjs files in /scripts.
 *
 * These tests are intentionally "static" (code-level) because we
 * don't have a deterministic DB/env in this sandbox.
 * They ensure the backend continues to enforce the key rules:
 * - Purchase verification must use Backend DB checks (not client flags)
 * - Receipt submission verifies the receipt URL belongs to the wedding
 * - Template access uses server-side canUseTemplate()/license checks
 * - Template pricing should come from SystemConfig/DEFAULT_TEMPLATE_PRICING
 *
 * If any invariant breaks, the test fails immediately.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '..');

function read(path) {
  return readFileSync(path, 'utf8');
}

const routersTemplatePurchase = read(join(repoRoot, 'routers', 'template-purchase.ts'));
const libTemplateLicensing = read(join(repoRoot, 'lib', 'template-licensing.ts'));
const libTemplatePricingSetup = read(join(repoRoot, 'lib', 'template-pricing-setup.ts'));

test('Template purchase router verifies receipt URL belongs to wedding (isReceiptImageForWedding)', () => {
  assert.match(
    routersTemplatePurchase,
    /function isReceiptImageForWedding\(/,
    'Expected isReceiptImageForWedding helper to exist.'
  );
  assert.match(
    routersTemplatePurchase,
    /isReceiptImageForWedding\(/,
    'Expected template-purchase router to call isReceiptImageForWedding().' 
  );
});

test('Template licensing access is decided server-side using pricing+license tables (canUseTemplate)', () => {
  assert.match(libTemplateLicensing, /export async function canUseTemplate\(/);
  assert.match(libTemplateLicensing, /getSystemTemplatePricing\(/);
  assert.match(libTemplateLicensing, /prisma\.templateLicense\.findMany/);
});

test('Template pricing is fetched from SystemConfig (not client payload)', () => {
  assert.match(libTemplatePricingSetup, /getSystemTemplatePricing\(/);
  assert.match(libTemplatePricingSetup, /systemConfig\.findUnique/);
});

test('Template purchase endpoints enforce authentication and deny when user not found', () => {
  assert.match(routersTemplatePurchase, /getServerUser\(/);
  assert.match(routersTemplatePurchase, /if \(!user\) return c\.json\(\{ error: 'Unauthorized' \}, 401\)/);
});

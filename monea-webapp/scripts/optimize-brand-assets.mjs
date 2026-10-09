/**
 * MONEA brand/icon asset optimiser.
 *
 * Measured problem: `public/favicon.png`, `public/icons/icon-192x192.png` and
 * `public/icons/icon-512x512.png` were all the *same* unoptimised 640x640,
 * ~408 KB PNG. A single landing-page visit fetched two of them (816 KB) - more
 * than half of the entire page weight - and the PWA manifest declared sizes
 * (192/512) that did not match the actual pixels.
 *
 * This script regenerates them at their true displayed sizes. It is idempotent:
 * it never upscales, so re-running is safe.
 *
 * Usage:
 *   node scripts/optimize-brand-assets.mjs            # apply
 *   node scripts/optimize-brand-assets.mjs --dry-run  # report only
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

/** destination -> target edge length in px */
const TARGETS = [
  { rel: 'public/icons/icon-512x512.png', size: 512, from: 'public/icons/icon-512x512.png' },
  { rel: 'public/icons/icon-192x192.png', size: 192, from: 'public/icons/icon-512x512.png' },
  { rel: 'public/favicon.png', size: 64, from: 'public/icons/icon-512x512.png' },
  { rel: 'public/logo.png', size: 256, from: 'public/logo.png' },
];

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

let totalBefore = 0;
let totalAfter = 0;

for (const target of TARGETS) {
  const srcPath = path.join(ROOT, target.from);
  const dstPath = path.join(ROOT, target.rel);

  if (!fs.existsSync(srcPath)) {
    console.log(`[skip] missing source: ${target.from}`);
    continue;
  }

  const before = fs.statSync(dstPath).size;
  totalBefore += before;

  const meta = await sharp(srcPath).metadata();
  if (!meta.width || !meta.height) {
    console.log(`[skip] unreadable image: ${target.from}`);
    continue;
  }

  // Never upscale: if the source is already at or below the target size, keep it.
  const edge = Math.min(meta.width, meta.height);
  if (edge <= target.size && before < 60 * 1024) {
    console.log(`[keep] ${target.rel} already ${meta.width}x${meta.height} (${kb(before)})`);
    totalAfter += before;
    continue;
  }

  if (meta.width !== meta.height) {
    console.warn(`[warn] ${target.rel} source is not square (${meta.width}x${meta.height}); centring crop`);
  }

  const buffer = await sharp(srcPath)
    .resize(target.size, target.size, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();

  if (DRY_RUN) {
    console.log(`[dry ] ${target.rel} ${meta.width}x${meta.height} -> ${target.size}x${target.size}  ${kb(before)} -> ${kb(buffer.length)}`);
    totalAfter += buffer.length;
    continue;
  }

  fs.writeFileSync(dstPath, buffer);
  const after = fs.statSync(dstPath).size;
  totalAfter += after;
  console.log(
    `[ok  ] ${target.rel.padEnd(34)} ${String(meta.width).padStart(4)}px -> ${String(target.size).padStart(4)}px   ` +
      `${kb(before).padStart(9)} -> ${kb(after).padStart(9)}  (-${(100 - (after / before) * 100).toFixed(1)}%)`
  );
}

console.log('');
console.log(`brand assets total: ${kb(totalBefore)} -> ${kb(totalAfter)} (${
  totalBefore ? (100 - (totalAfter / totalBefore) * 100).toFixed(1) : '0'
}% smaller)${DRY_RUN ? '  [dry-run, nothing written]' : ''}`);

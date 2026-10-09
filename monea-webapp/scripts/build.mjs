/**
 * MONEA production build entry point.
 *
 * Why this file exists
 * -------------------
 * `vite build` decides between React's production and development runtime from
 * `process.env.NODE_ENV`, which it resolves **before** the user config function
 * runs and after it has loaded `.env` files. A leftover `NODE_ENV=development`
 * line in a git-ignored `.env` therefore silently produced a *development* React
 * bundle for production: React's `jsxDEV` transform plus the development
 * react-dom build. Verified on the deployed artifact
 * (https://monea-webapp.pages.dev) where ~470 `jsxDEV` call sites were present.
 *
 * Setting the variable here - in a committed, cross-platform Node entry point -
 * guarantees a production build no matter what a local `.env` contains or which
 * machine/CI runner executes it. `vite.config.ts` additionally refuses to emit a
 * bundle that contains the development runtime, so the regression cannot return.
 *
 * Usage: npm run build   (type-checks first, then builds)
 */
import { build } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(ROOT, '..');

// Must be set before Vite loads .env / resolves the config.
process.env.NODE_ENV = 'production';
process.env.VITE_USER_NODE_ENV = 'production';
process.env.VITE_API_URL = 'https://monea-api.seabkoeurn64.workers.dev';
process.env.VITE_APP_URL = 'https://monea-webapp.pages.dev';

await build({
  root: projectRoot,
  mode: 'production',
  logLevel: 'info',
});

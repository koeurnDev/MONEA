import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Build guard: a production bundle must never contain React's development JSX
 * runtime.
 *
 * This regressed silently in the past. A stray `NODE_ENV=development` line in a
 * git-ignored `.env` file made Vite compute `import.meta.env.DEV === true` for
 * `vite build`, which in turn switched @vitejs/plugin-react to the `jsxDEV`
 * transform and shipped React's development build to production (verified in
 * the deployed bundle: ~470 `jsxDEV` call sites). That bundle is measurably
 * slower on low-end Android and substantially larger.
 *
 * Failing the build is the only durable fix: it turns a silent 40% performance
 * regression into a loud build error.
 */
function forbidDevReactRuntime(): Plugin {
  const DEV_MARKERS = ['jsxDEV', 'react-dom.development']
  return {
    name: 'monea:forbid-dev-react-runtime',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const offenders: string[] = []
      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type !== 'chunk') continue
        for (const marker of DEV_MARKERS) {
          if (output.code.includes(marker)) {
            offenders.push(`${fileName} (${marker})`)
            break
          }
        }
      }
      if (offenders.length) {
        this.error(
          'Production bundle contains the React DEVELOPMENT runtime: ' +
            `${offenders.slice(0, 5).join(', ')}${offenders.length > 5 ? ` (+${offenders.length - 5} more)` : ''}.\n` +
            'This is caused by NODE_ENV not being "production" during `vite build` ' +
            '(check .env / .env.local / CI environment). Refusing to emit a release ' +
            'bundle that is ~40% slower and much larger than necessary.'
        )
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Pin the build to production mode *before* @vitejs/plugin-react is created,
  // because the plugin reads process.env.NODE_ENV when it is instantiated.
  if (command === 'build') {
    process.env.NODE_ENV = 'production'
  }

  return {
    plugins: [react(), forbidDevReactRuntime()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
        'react/jsx-runtime': path.resolve(import.meta.dirname, './node_modules/react/jsx-runtime.js'),
        'react/jsx-dev-runtime': path.resolve(import.meta.dirname, './node_modules/react/jsx-dev-runtime.js'),
        'react-dom/client': path.resolve(import.meta.dirname, './node_modules/react-dom/client.js'),
        react: path.resolve(import.meta.dirname, './node_modules/react'),
        'react-dom': path.resolve(import.meta.dirname, './node_modules/react-dom'),
      },
      dedupe: ['react', 'react-dom', 'swr'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'swr'],
    },
    build: {
      outDir: 'dist',
      sourcemap: false, // Disable sourcemaps for mobile performance
      // Use Vite 8's default minifier (oxc). Setting 'esbuild' here fails
      // outright because the `esbuild` package is not a dependency of the
      // rolldown-based Vite, and oxc produces equivalent or smaller output.
      rollupOptions: {
      output: {
        // ------------------------------------------------------------------
        // Chunking strategy
        //
        // Measured history: a large hand-written `manualChunks` map used to live
        // here. Every `*.includes('node_modules/pkg')` rule created a *bucket*
        // chunk. Buckets that are shared between the entry and any lazily loaded
        // route are added to the entry's preload list, so the landing page was
        // downloading Radix dialog/select/popover (~134 KB), react-easy-crop and
        // react-joyride - none of which the landing page renders.
        //
        // The bundler already co-locates a dependency with the routes that
        // actually import it and hoists genuinely shared modules into common
        // chunks, which is exactly the behaviour we want. The only rules kept
        // below are for single-purpose, always-needed libraries where an explicit
        // boundary measurably helps caching, and they are all verified against
        // index.html's preload list by scripts/perf/analyze-chunk-graph.mjs.
        // ------------------------------------------------------------------
        manualChunks: (id) => {
          const norm = id.replace(/\\/g, '/')
          if (!norm.includes('node_modules')) return undefined

          if (/node_modules\/(react|react-dom|scheduler)\//.test(norm)) return 'react-core'
          if (/node_modules\/react-router(-dom)?\//.test(norm)) return 'react-router'
          if (norm.includes('node_modules/swr/')) return 'data-fetching'

          // `framer-motion` and `lucide-react` are deliberately NOT bucketed.
          // Both are used by the first-paint graph (`AnimationProvider` needs
          // only LazyMotion + domAnimation; the toast UI needs 4 icons) but are
          // also used heavily by lazy routes. A shared bucket chunk is the union
          // of all of those, and because the entry imports part of it the whole
          // union becomes a blocking download - measured at 42 KB (gzip) of
          // animation runtime and 12 KB (gzip) of icons the landing page never
          // rendered. Un-bucketed, the bundler gives the entry only what it
          // statically needs and lets each route pay for its own extras.

          // Everything else: let the bundler decide. This is what keeps
          // radix / react-easy-crop / react-joyride / xlsx out of first paint.
          return undefined
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            // Route-based code splitting for mobile
            if (facadeModuleId.includes('/dashboard/')) {
              return 'routes/dashboard-[name]-[hash].js'
            }
            if (facadeModuleId.includes('/admin/')) {
              return 'routes/admin-[name]-[hash].js'
            }
            if (facadeModuleId.includes('/(auth)/')) {
              return 'routes/auth-[name]-[hash].js'
            }
            if (facadeModuleId.includes('/wedding/')) {
              return 'routes/wedding-[name]-[hash].js'
            }
          }
          return 'chunks/[name]-[hash].js'
        }
      }
    },
    // Reduced chunk size limit for mobile
    chunkSizeWarningLimit: 300,
  },
  // NOTE: console.log stripping was evaluated and deliberately not enabled.
  // Vite 8 (rolldown) no longer forwards `esbuild.pure`, and the measured
  // saving was a few KB of already-gzipped output - not worth a fragile
  // regex pass over minified code that could corrupt string literals.
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
    proxy: {
      '/api': {
        // Use the API configured in .env; fall back to the local Worker for development.
        target: env.VITE_API_URL || 'http://127.0.0.1:8787',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
      },
    },
  },
}
})

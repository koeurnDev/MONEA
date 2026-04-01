import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'plus.unsplash.com',
                pathname: '/**',
            },
        ],
    },
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: false,
    },
    transpilePackages: ['@upstash/redis', '@upstash/ratelimit'],
    experimental: {
        serverComponentsExternalPackages: ['otplib', '@scure/base'],
        instrumentationHook: true,
        webpackBuildWorker: false,
        optimizePackageImports: [
            'lucide-react',
            'date-fns',
            'lodash',
            'framer-motion',
            '@radix-ui/react-icons'
        ],
    },
    async redirects() {
        return [
            {
                source: '/dashboard/settings',
                destination: '/dashboard/design',
                permanent: true,
            },
        ]
    },
    async headers() {
        return [
            {
                source: '/images/(.*).(webp|png|jpg|jpeg|svg|ico)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/fonts/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
    // Add webpack alias for '@' to resolve to 'src'
    webpack: (config, { nextRuntime }) => {
        config.resolve.alias['@'] = resolve(__dirname, 'src');
        
        // Force the bundler to use the isomorphic/browser entry point for Upstash
        // when building for the Edge Runtime to avoid Node.js-only API leaks.
        if (nextRuntime === 'edge') {
            config.resolve.alias['@upstash/redis'] = resolve(__dirname, 'node_modules/@upstash/redis/cloudflare.mjs');
        }

        return config;
    },
};

export default bundleAnalyzer(withSentryConfig(
    nextConfig,
    {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options

        // Suppresses source map uploading logs during bundling
        silent: true,
        org: "monea",
        project: "monea-platform",
    },
    {
        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

        // Upload a larger set of source maps for prettier stack traces (increases build time)
        widenClientFileUpload: true,

        // Transpiles SDK to be compatible with IE11 (increases bundle size)
        transpileClientSDK: false,

        // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
        tunnelRoute: "/api/sentry-tunnel",

        // Hides source maps from generated client bundles
        hideSourceMaps: true,

        // Automatically tree-shake Sentry logger statements to reduce bundle size
        disableLogger: true,

        // Enables automatic instrumentation of Vercel Cron Monitors.
        // See the following for more information:
        // https://docs.sentry.io/product/crons/
        // https://vercel.com/docs/cron-jobs
        automaticVercelMonitors: true,
    }
));

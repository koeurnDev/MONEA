/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'plus.unsplash.com',
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        serverComponentsExternalPackages: ['otplib', '@scure/base'],
    },
    async redirects() {
        return [
            {
                source: '/dashboard/settings',
                destination: '/dashboard/design',
                permanent: true,
            },
        ]
    }
};

export default nextConfig;

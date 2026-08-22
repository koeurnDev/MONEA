/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        // Cloudflare Pages មិន Support Node.js Image Processor ដូច Vercel ទេ
        unoptimized: true,
        remotePatterns: [
            { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
            { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
            { protocol: 'https', hostname: 'plus.unsplash.com', pathname: '/**' },
        ],
    },
};

export default nextConfig;

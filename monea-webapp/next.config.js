/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // Configure webpack to exclude Node.js modules from Edge Runtime
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude cloudinary from being bundled in Edge Runtime
      config.externals = config.externals || [];
      config.externals.push('cloudinary');
    }
    return config;
  },

  images: {
    unoptimized: true, // Cloudflare Pages doesn't support Node.js Image Processor
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'plus.unsplash.com', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;

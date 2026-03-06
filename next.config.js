/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  /* PWA support */
  headers: async () => {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },

  /* Image optimization */
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  /* Experimental features safe for this stage */
  experimental: {
    // Optimization features can be added here as needed
  },
};

module.exports = nextConfig;

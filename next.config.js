/**
 * @type {import('next').NextConfig}
 */
const { withSentryConfig } = require("@sentry/nextjs");

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

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "hub-jogos",
    project: "hub-jogos",
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  }
);


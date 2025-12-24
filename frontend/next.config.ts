import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.elections\.kalshi\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'kalshi-api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /^\/api\/kalshi\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {}, // Acknowledge webpack config from next-pwa
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kalshi-public-docs.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = withPWA(nextConfig);

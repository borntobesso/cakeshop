/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16: eslint config moved to package.json or eslint.config.js
  // Use --lint flag with next build if needed

  // Enable turbopack explicitly to silence the warning
  turbopack: {},

  // Webpack config for fallback (still needed for some libraries)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        https: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@zaqathon/types'],
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;

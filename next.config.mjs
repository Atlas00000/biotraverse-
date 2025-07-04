/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix file watching in WSL
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Use polling for file watching in WSL
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git'],
      }
    }
    return config
  },
  // Enable experimental features for better WSL support
  experimental: {
    // Improve file watching
    webpackBuildWorker: false,
  },
}

export default nextConfig

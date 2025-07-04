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
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
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

    // Handle web workers and fallbacks
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
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

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
  
  // Fix file watching in WSL and handle Cesium
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Use polling for file watching in WSL
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git'],
      }
    }

    // Handle Cesium web workers
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    // Copy Cesium web workers
    config.module.rules.push({
      test: /\.worker\.js$/,
      type: 'asset/resource',
    })

    return config
  },
  // Enable experimental features for better WSL support
  experimental: {
    // Improve file watching
    webpackBuildWorker: false,
  },
  // Handle Cesium static assets
  async headers() {
    return [
      {
        source: '/cesium/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ]
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Disable React strict mode in production if needed
  reactStrictMode: true,
  
  // Enable SWC minification for better performance
  swcMinify: true,

  // Environment variables that should be available in the browser
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Image optimization configuration
  images: {
    unoptimized: true, // Set to true if you want to disable Next.js image optimization
  },
}

module.exports = nextConfig

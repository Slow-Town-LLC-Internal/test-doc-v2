/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // For GitHub Pages deployment
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  
  // Export as static site
  output: 'export',
  
  // Images configuration for static export
  images: {
    unoptimized: true,
  },
  
  // Required for GitHub Pages deployment
  trailingSlash: true,
};

module.exports = nextConfig;
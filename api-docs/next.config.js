/** @type {import('next').NextConfig} */

// Determine the repository name from environment variable or use a default
// In your GitHub Actions workflow, set this to the repository name
// REPOSITORY_NAME will be set to the repository name (e.g., 'infra-docs') to support
// different deployment locations
const repoName = process.env.REPOSITORY_NAME || 'test-doc-v2';

const nextConfig = {
  reactStrictMode: true,
  
  // For GitHub Pages deployment
  basePath: process.env.NODE_ENV === 'production' ? `/${repoName}` : '',
  
  // Set asset prefix for GitHub Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? `/${repoName}` : '',
  
  // Export as static site
  output: 'export',
  
  // Images configuration for static export
  images: {
    unoptimized: true,
  },
  
  // Required for GitHub Pages deployment
  trailingSlash: true,

  // Make the repository name available to the application
  env: {
    REPOSITORY_NAME: repoName,
  }
};

module.exports = nextConfig;
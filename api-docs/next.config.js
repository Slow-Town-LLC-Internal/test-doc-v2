/** @type {import('next').NextConfig} */
const fs = require('fs');
const path = require('path');

// Determine the repository name from environment variable or use a default
// In your GitHub Actions workflow, set this to the repository name
// REPOSITORY_NAME will be set to the repository name (e.g., 'infra-docs') to support
// different deployment locations
const repoName = process.env.REPOSITORY_NAME || 'test-doc-v2';
const isProd = process.env.NODE_ENV === 'production';

// Allow environment to be specified via environment variable
// This can be set in GitHub Actions or local .env file
// e.g., APP_ENVIRONMENT=staging npm run build
const appEnvironment = process.env.APP_ENVIRONMENT || (isProd ? 'production' : 'development');
console.log(`Building for environment: ${appEnvironment}`);

// Update app-config.json with the specified environment
try {
  const configPath = path.join(__dirname, 'config', 'app-config.json');
  if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);
    
    // Set the current environment
    if (!config.deployment) {
      config.deployment = { environments: {} };
    }
    
    config.deployment.currentEnvironment = appEnvironment;
    console.log(`Setting currentEnvironment to: ${appEnvironment}`);
    
    // Write the updated config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Updated app-config.json with environment setting');
  }
} catch (error) {
  console.error('❌ Error updating environment in app-config.json:', error);
}

// If in production build, ensure static config file exists
if (isProd) {
  // Make sure the public/api directory exists
  const apiDir = path.join(__dirname, 'public', 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  // Copy the app-config.json to public/api/config.json for static access
  try {
    const configPath = path.join(__dirname, 'config', 'app-config.json');
    const targetPath = path.join(apiDir, 'config.json');
    fs.copyFileSync(configPath, targetPath);
    console.log('✅ Created static config file for production: public/api/config.json');
    
    // Create an additional copy at the root for fallback
    const altTargetPath = path.join(__dirname, 'public', 'api-config.json');
    fs.copyFileSync(configPath, altTargetPath);
    console.log('✅ Created alternative config file for production: public/api-config.json');
  } catch (error) {
    console.error('❌ Error creating static config file:', error);
  }
  
  // Ensure api-specs directory exists
  const specsDir = path.join(__dirname, 'public', 'api-specs');
  if (!fs.existsSync(specsDir)) {
    fs.mkdirSync(specsDir, { recursive: true });
    console.log('✅ Created api-specs directory');
  }
  
  // Check if we need to copy sample specs
  try {
    // Check sources.json to see what specs we should have
    const sourcesPath = path.join(__dirname, 'config', 'sources.json');
    if (fs.existsSync(sourcesPath)) {
      const sourcesData = fs.readFileSync(sourcesPath, 'utf8');
      const sources = JSON.parse(sourcesData);
      
      if (sources && sources.apis) {
        sources.apis.forEach(api => {
          // Extract filename from specPath
          const specFileName = api.specPath.split('/').pop();
          const targetSpecPath = path.join(specsDir, specFileName);
          
          // Check if spec file exists
          if (!fs.existsSync(targetSpecPath)) {
            console.log(`❌ Missing spec file: ${specFileName}`);
            
            // Try to find sample spec in scripts directory
            const sampleSpecPath = path.join(__dirname, 'scripts', `sample-${specFileName}`);
            if (fs.existsSync(sampleSpecPath)) {
              // Copy sample spec to target
              fs.copyFileSync(sampleSpecPath, targetSpecPath);
              console.log(`✅ Created spec from sample: ${specFileName}`);
            } else {
              console.log(`❌ No sample found for: ${specFileName}`);
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('❌ Error checking or copying spec files:', error);
  }
}

const nextConfig = {
  reactStrictMode: true,
  
  // For GitHub Pages deployment
  basePath: isProd ? `/${repoName}` : '',
  
  // Set asset prefix for GitHub Pages
  assetPrefix: isProd ? `/${repoName}` : '',
  
  // Export as static site only in production
  output: isProd ? 'export' : undefined,
  
  // Images configuration for static export
  images: {
    unoptimized: true,
  },
  
  // Required for GitHub Pages deployment
  trailingSlash: true,

  // Make the repository name and environment available to the application
  env: {
    REPOSITORY_NAME: repoName,
    APP_ENVIRONMENT: appEnvironment
  }
};

module.exports = nextConfig;
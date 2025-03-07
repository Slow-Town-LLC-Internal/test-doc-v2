import { AppConfig } from '@/types/config';

// Default configuration in case file is missing
const defaultConfig: AppConfig = {
  features: {
    auth: {
      enabled: false,
      provider: 'password',
      passwordProtected: false
    },
    theme: {
      darkMode: true,
      colorScheme: 'blue'
    }
  },
  meta: {
    title: 'API Documentation Platform',
    description: 'Interactive API documentation for platform services'
  }
};

// Cache the config to avoid reading the file multiple times
let cachedConfig: AppConfig | null = null;

// Client-side config fetcher
async function fetchConfig(): Promise<AppConfig> {
  try {
    // Determine base path based on environment or GitHub Pages URL structure
    let basePath = '';
    
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // For GitHub Pages deployments, detect repo name from URL path
      if (window.location.hostname.includes('github.io')) {
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length > 1 && pathParts[1]) {
          basePath = '/' + pathParts[1];
        }
      } else if (process.env.NODE_ENV === 'production') {
        // For other production environments, use REPOSITORY_NAME env var
        basePath = process.env.REPOSITORY_NAME ? `/${process.env.REPOSITORY_NAME}` : '';
      }
    } else if (process.env.NODE_ENV === 'production') {
      // Server-side in production
      basePath = process.env.REPOSITORY_NAME ? `/${process.env.REPOSITORY_NAME}` : '';
    }
    
    console.log('Using base path for config:', basePath);
      
    // First try API route in development
    try {
      const endpoint = `${basePath}/api/config`;
      console.log('Fetching config from API endpoint:', endpoint);
      const response = await fetch(endpoint);
      if (response.ok) {
        return await response.json() as AppConfig;
      }
    } catch (error) {
      console.log('API endpoint not available, trying static file');
    }
    
    // Fallback to static JSON file (for production/GitHub Pages)
    const staticConfigUrl = `${basePath}/api/config.json`;
    console.log('Fetching config from static file:', staticConfigUrl);
    const staticResponse = await fetch(staticConfigUrl);
    if (!staticResponse.ok) {
      throw new Error(`Failed to fetch config from static file: ${staticResponse.status}`);
    }
    return await staticResponse.json() as AppConfig;
  } catch (error) {
    console.error('Error fetching config:', error);
    return defaultConfig;
  }
}

// Client-side safe config getter
export function getAppConfig(): AppConfig {
  if (typeof window !== 'undefined') {
    // We're on the client side
    if (!cachedConfig) {
      // For client side, use default config for immediate response
      // and trigger fetch in background
      cachedConfig = { ...defaultConfig };
      
      // Fetch the real config and update the cache
      fetchConfig().then(config => {
        cachedConfig = config;
      });
    }
    return cachedConfig;
  } else {
    // We're on the server side
    if (cachedConfig) {
      return cachedConfig;
    }

    try {
      // Only import fs and path on the server side
      const fs = require('fs');
      const path = require('path');
      
      const configPath = path.join(process.cwd(), 'config', 'app-config.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      cachedConfig = JSON.parse(configData) as AppConfig;
      return cachedConfig;
    } catch (error) {
      console.warn('Error loading app-config.json, using default config:', error);
      return defaultConfig;
    }
  }
}

// Utility function to check if auth is enabled
export function isAuthEnabled(): boolean {
  const config = getAppConfig();
  return config.features.auth.enabled;
}

// Utility function to check if password auth is enabled
export function isPasswordAuthEnabled(): boolean {
  const config = getAppConfig();
  return config.features.auth.enabled && 
         config.features.auth.provider === 'password';
}
import { AppConfig } from '@/types/config';

// Default configuration in case file is missing
const defaultConfig: AppConfig = {
  features: {
    auth: {
      enabled: false,
      provider: 'github',
      whitelist: 'whitelist.txt'
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

// Client-side safe config getter
export function getAppConfig(): AppConfig {
  if (typeof window !== 'undefined') {
    // We're on the client side
    if (!cachedConfig) {
      // For client side, we'll use the default config
      // In a real app, you'd fetch this via an API endpoint
      cachedConfig = defaultConfig;
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
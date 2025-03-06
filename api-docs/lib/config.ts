import fs from 'fs';
import path from 'path';

interface AuthConfig {
  enabled: boolean;
  provider: string;
  whitelist: string;
}

interface ThemeConfig {
  darkMode: boolean;
  colorScheme: string;
}

interface MetaConfig {
  title: string;
  description: string;
}

export interface AppConfig {
  features: {
    auth: AuthConfig;
    theme: ThemeConfig;
  };
  meta: MetaConfig;
}

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

export function getAppConfig(): AppConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const configPath = path.join(process.cwd(), 'config', 'app-config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    cachedConfig = JSON.parse(configData) as AppConfig;
    return cachedConfig;
  } catch (error) {
    console.warn('Error loading app-config.json, using default config:', error);
    return defaultConfig;
  }
}

// Utility function to check if auth is enabled
export function isAuthEnabled(): boolean {
  const config = getAppConfig();
  return config.features.auth.enabled;
}
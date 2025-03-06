import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { AppConfig } from '@/types/config';

// Default configuration in case file is missing
const defaultConfig: AppConfig = {
  features: {
    auth: {
      enabled: false, // Default to disabled for safety
      provider: 'password',
      tokenKey: 'docs_auth_token',
      expiryKey: 'docs_auth_expiry'
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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AppConfig>
) {
  try {
    const configPath = path.join(process.cwd(), 'config', 'app-config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData) as AppConfig;
    
    // Return the config as is
    res.status(200).json(config);
  } catch (error) {
    console.warn('Error loading config, using default:', error);
    res.status(200).json(defaultConfig);
  }
}
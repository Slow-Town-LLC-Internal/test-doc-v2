export interface AuthConfig {
  enabled: boolean;
  provider: string;
  whitelist: string;
}

export interface ThemeConfig {
  darkMode: boolean;
  colorScheme: string;
}

export interface MetaConfig {
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
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const StoplightElements = dynamic(
  () => import('@stoplight/elements').then((mod) => mod.API),
  { ssr: false }
);

interface ApiViewerProps {
  specUrl: string;
}

export function ApiViewer({ specUrl }: ApiViewerProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const [apiUrl, setApiUrl] = useState('');

  // Handle client-side rendering and avoid hydration mismatch
  useEffect(() => {
    setMounted(true);

    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Try to load configuration from file first
    const tryConfigBasedLoading = async () => {
      try {
        // Determine initial path for config loading
        let initialBasePath = '';
        const hostname = window.location.hostname;
        
        // Detect GitHub Pages
        if (hostname.includes('github.io')) {
          const pathParts = window.location.pathname.split('/');
          if (pathParts.length > 1 && pathParts[1]) {
            initialBasePath = '/' + pathParts[1];
          }
        } else if (process.env.NODE_ENV === 'production') {
          initialBasePath = process.env.REPOSITORY_NAME ? `/${process.env.REPOSITORY_NAME}` : '';
        }
        
        // Try to load config
        const configUrl = `${window.location.origin}${initialBasePath}/api/config.json`;
        console.log('Loading config from:', configUrl);
        
        const response = await fetch(configUrl);
        if (response.ok) {
          const config = await response.json();
          console.log('Successfully loaded config');
          
          // Check if we have deployment configuration
          if (config.deployment && config.deployment.environments) {
            let deployConfig = null;
            let envKey = null;
            
            // Check for explicitly configured environment first
            if (config.deployment?.currentEnvironment) {
              envKey = config.deployment.currentEnvironment;
              console.log('Using explicitly configured environment:', envKey);
            }
            // Otherwise detect based on hostname
            else if (hostname === 'localhost' || hostname === '127.0.0.1') {
              envKey = 'development';
            } else if (hostname === 'slow-town-llc-internal.github.io') {
              envKey = 'staging';
            } else if (hostname === 'laughing-adventure-w6ko5ze.pages.github.io') {
              envKey = 'production';
            } else if (hostname.includes('github.io')) {
              envKey = 'github-pages';
            }
            
            console.log('Detected environment:', envKey);
            
            // Try to get configuration for this environment
            if (envKey && config.deployment.environments[envKey]) {
              deployConfig = config.deployment.environments[envKey];
              console.log('Using deployment config:', deployConfig);
              
              // Construct URL using config
              const baseUrl = deployConfig.baseUrl || window.location.origin;
              const basePath = deployConfig.basePath || '';
              
              // Ensure specUrl starts with a slash
              const normalizedSpecUrl = specUrl.startsWith('/') ? specUrl : `/${specUrl}`;
              
              // Build URL ensuring no double slashes
              let fullUrl = `${baseUrl}${basePath}`;
              if (fullUrl.endsWith('/') && normalizedSpecUrl.startsWith('/')) {
                fullUrl += normalizedSpecUrl.substring(1);
              } else {
                fullUrl += normalizedSpecUrl;
              }
              
              console.log('Loading API spec using config URL:', fullUrl);
              setApiUrl(fullUrl);
              return true;
            }
          }
        }
      } catch (error) {
        console.error('Error loading config-based spec URL:', error);
      }
      
      return false;
    };
    
    // Fallback to traditional URL detection
    const useTraditionalLoading = () => {
      // Determine the base path for different environments
      let basePath = '';
      const isLocalDev = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
                        
      if (window.location.hostname.includes('github.io')) {
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length > 1 && pathParts[1]) {
          basePath = '/' + pathParts[1];
        }
      } else if (process.env.NODE_ENV === 'production') {
        // For other production environments
        basePath = process.env.REPOSITORY_NAME ? `/${process.env.REPOSITORY_NAME}` : '';
      }
      
      // Ensure specUrl starts with a slash if it doesn't already
      const normalizedSpecUrl = specUrl.startsWith('/') ? specUrl : `/${specUrl}`;
      
      // Set the full URL to the API spec, accounting for basePath
      const fullSpecUrl = `${window.location.origin}${basePath}${normalizedSpecUrl}`;
      setApiUrl(fullSpecUrl);
      console.log('Loading API spec from (traditional method):', fullSpecUrl);
      
      // Additional debugging to help diagnose spec load issues
      if (isLocalDev) {
        console.log('Local development environment detected');
        // Also check if we need to try an alternative path
        fetch(fullSpecUrl)
          .then(response => {
            if (!response.ok) {
              console.warn(`Spec not found at ${fullSpecUrl}, status: ${response.status}`);
              
              // Try alternative path for local development
              const altSpecUrl = `${window.location.origin}${normalizedSpecUrl}`;
              console.log('Trying alternative spec URL:', altSpecUrl);
              
              return fetch(altSpecUrl).then(altResponse => {
                if (altResponse.ok) {
                  console.log(`Spec found at alternative URL: ${altSpecUrl}`);
                  setApiUrl(altSpecUrl);
                } else {
                  console.warn(`Spec also not found at alternative URL: ${altSpecUrl}`);
                }
                return altResponse;
              });
            } else {
              console.log(`Spec successfully loaded from ${fullSpecUrl}`);
            }
          })
          .catch(error => {
            console.error('Error checking spec availability:', error);
          });
      }
    };
    
    // Try config-based loading first, fall back to traditional if needed
    tryConfigBasedLoading().then(success => {
      if (!success) {
        console.log('Config-based loading failed, using traditional method');
        useTraditionalLoading();
      }
    });
  }, [specUrl]);

  // Only render on client side
  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-pulse text-gray-400">Loading API documentation...</div>
      </div>
    );
  }

  return (
    <div className="elements-container">
      {/* Import Stoplight CSS directly in component to avoid Next.js CSS ordering issues */}
      <link 
        rel="stylesheet" 
        href="https://unpkg.com/@stoplight/elements/styles.min.css" 
      />
      
      {/* Use theme class instead of appearance prop */}
      <div className={`sl-elements ${resolvedTheme === 'dark' ? 'sl-elements-dark' : 'sl-elements-light'}`}>
        <StoplightElements
          apiDescriptionUrl={apiUrl}
          router="hash"
          layout="sidebar"
        />
      </div>
    </div>
  );
}
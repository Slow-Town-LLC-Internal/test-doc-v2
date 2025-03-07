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
    
    // Determine the base path for different environments
    let basePath = '';
    let isLocalDev = false;
    
    // If deployed on GitHub Pages, extract repo name from URL
    if (typeof window !== 'undefined') {
      // Check if this is a local development environment
      isLocalDev = window.location.hostname === 'localhost' || 
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
    }
    
    // Ensure specUrl starts with a slash if it doesn't already
    const normalizedSpecUrl = specUrl.startsWith('/') ? specUrl : `/${specUrl}`;
    
    // Set the full URL to the API spec, accounting for basePath
    const fullSpecUrl = `${window.location.origin}${basePath}${normalizedSpecUrl}`;
    setApiUrl(fullSpecUrl);
    console.log('Loading API spec from:', fullSpecUrl);
    
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
                console.warn(`Spec also not found at alternative URL: ${altSpecUrl}, status: ${altResponse.status}`);
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
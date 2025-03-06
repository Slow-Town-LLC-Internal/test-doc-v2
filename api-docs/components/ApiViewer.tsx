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
    // Set the full URL to the API spec
    setApiUrl(`${window.location.origin}${specUrl}`);
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
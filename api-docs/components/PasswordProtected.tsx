import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isPasswordAuthEnabled } from '@/lib/config';

interface PasswordProtectedProps {
  children: ReactNode;
}

export function PasswordProtected({ children }: PasswordProtectedProps) {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  
  // Check if password auth is enabled and user is authenticated
  useEffect(() => {
    // Only run on client side
    setMounted(true);
    
    const checkAuth = () => {
      const passwordAuthEnabled = isPasswordAuthEnabled();
      
      // If auth is disabled, allow access
      if (!passwordAuthEnabled) {
        setIsAuthenticated(true);
        return;
      }
      
      // Check for token and expiry in localStorage
      const token = localStorage.getItem('docs_auth_token');
      const expiry = localStorage.getItem('docs_auth_expiry');
      
      if (!token || !expiry) {
        // No token or expiry, redirect to login
        router.push('/login.html');
        return;
      }
      
      // Check if token has expired
      const now = Math.floor(Date.now() / 1000);
      if (now > parseInt(expiry, 10)) {
        // Token expired, redirect to login
        localStorage.removeItem('docs_auth_token');
        localStorage.removeItem('docs_auth_expiry');
        router.push('/login.html');
        return;
      }
      
      // Token valid, allow access
      setIsAuthenticated(true);
    };
    
    if (mounted) {
      checkAuth();
    }
  }, [mounted, router]);
  
  // For server-side rendering or before hydration, just render the children
  if (!mounted) {
    return <>{children}</>;
  }
  
  // If authenticated, show content
  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  // Otherwise show loading while redirecting to login
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-gray-400">Loading...</div>
    </div>
  );
}
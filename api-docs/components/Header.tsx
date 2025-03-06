import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { useEffect, useState } from 'react';
import { isPasswordAuthEnabled } from '@/lib/config';

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Handle client-side only rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Check for authentication token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('docs_auth_token');
      const expiry = localStorage.getItem('docs_auth_expiry');
      
      if (token && expiry) {
        const now = Math.floor(Date.now() / 1000);
        if (now < parseInt(expiry, 10)) {
          setIsAuthenticated(true);
        }
      }
    }
  }, []);
  
  // Handle logout
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('docs_auth_token');
      localStorage.removeItem('docs_auth_expiry');
      window.location.href = '/login.html';
    }
  };
  
  // Don't render auth components on server or before client hydration
  if (!mounted) {
    return (
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              API Documentation
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Home
              </Link>
              <Link href="/api-docs/platform" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Platform API
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {/* Placeholder for ThemeToggle with same dimensions */}
            <div className="w-10 h-10"></div>
            {/* Placeholder for auth button with same dimensions */}
            <div className="w-20 h-8"></div>
          </div>
        </div>
        {/* Mobile navigation */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Home
              </Link>
              <Link href="/api-docs/platform" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Platform API
              </Link>
            </nav>
          </div>
        </div>
      </header>
    );
  }
  
  // Check if password auth is enabled
  const passwordAuthEnabled = isPasswordAuthEnabled();
  
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            API Documentation
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Home
            </Link>
            <Link href="/api-docs/platform" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Platform API
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {/* Password Auth Logout Button - Only shown when authenticated */}
          {passwordAuthEnabled && isAuthenticated && (
            <button
              id="logout-button"
              onClick={handleLogout}
              className="text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-1.5 px-3 rounded-md transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
      {/* Mobile navigation */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-2">
          <nav className="flex space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Home
            </Link>
            <Link href="/api-docs/platform" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Platform API
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
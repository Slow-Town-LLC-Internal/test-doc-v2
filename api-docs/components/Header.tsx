import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { signIn, signOut, useSession } from 'next-auth/react';
import { isAuthEnabled } from '@/lib/config';
import Image from 'next/image';

export function Header() {
  const { data: session, status } = useSession();
  const authEnabled = isAuthEnabled();
  const loading = status === 'loading';
  
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
          
          {/* Authentication Button */}
          {authEnabled && (
            <>
              {loading ? (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              ) : session ? (
                <div className="flex items-center">
                  <div className="hidden sm:flex items-center mr-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
                      {session.user?.name || session.user?.login}
                    </span>
                    {session.user?.image && (
                      <div className="h-8 w-8 rounded-full overflow-hidden">
                        <img 
                          src={session.user.image}
                          alt={session.user.name || 'User'} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-1.5 px-3 rounded-md transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn('github')}
                  className="text-sm bg-gray-900 hover:bg-gray-800 text-white py-1.5 px-3 rounded-md flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"></path>
                  </svg>
                  Sign In
                </button>
              )}
            </>
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
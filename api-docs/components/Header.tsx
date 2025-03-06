import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
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
          {/* Add GitHub login button in Phase 2 */}
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
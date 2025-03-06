import { ReactNode } from 'react';
import Head from 'next/head';
import { Header } from './Header';
import { Protected } from './Protected';
import { getAppConfig } from '@/lib/config';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  requireAuth?: boolean;
}

export function Layout({ children, title = 'API Documentation', requireAuth = true }: LayoutProps) {
  const config = getAppConfig();
  const appTitle = config.meta.title || 'API Documentation';
  const fullTitle = title === appTitle ? title : `${title} | ${appTitle}`;
  
  // Content inside the layout wrapper
  const layoutContent = (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={config.meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="py-4 px-4 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} {appTitle}
          </div>
        </footer>
      </div>
    </>
  );
  
  // If auth is required and enabled, wrap content in Protected component
  if (requireAuth && config.features.auth.enabled) {
    return <Protected>{layoutContent}</Protected>;
  }
  
  // Otherwise, return the content without protection
  return layoutContent;
}
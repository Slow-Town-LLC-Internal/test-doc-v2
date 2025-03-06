import { ReactNode } from 'react';
import Head from 'next/head';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title = 'API Documentation' }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="API documentation platform" />
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
            © {new Date().getFullYear()} API Documentation Platform
          </div>
        </footer>
      </div>
    </>
  );
}
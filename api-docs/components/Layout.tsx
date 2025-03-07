import { ReactNode } from 'react';
import Head from 'next/head';
import { Header } from './Header';
import { PasswordProtected } from './PasswordProtected';
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
        <link rel="icon" href={`${process.env.NODE_ENV === 'production' ? `/${process.env.REPOSITORY_NAME}` : ''}/favicon.ico`} />
        <script 
          src={`${process.env.NODE_ENV === 'production' ? `/${process.env.REPOSITORY_NAME}` : ''}/js/auth.js`}
          defer 
          id="auth-script"
          data-check-exists="true"
          dangerouslySetInnerHTML={{
            __html: 'if(document.getElementById("auth-script") && document.getElementById("auth-script") !== this) { this.parentNode.removeChild(this); }'
          }}
        ></script>
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
  
  // If auth is required, wrap content in PasswordProtected component
  if (requireAuth) {
    return <PasswordProtected>{layoutContent}</PasswordProtected>;
  }
  
  // Otherwise, return the content without protection
  return layoutContent;
}
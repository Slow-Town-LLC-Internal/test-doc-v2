import { Layout } from '@/components/Layout';
import { getAppConfig } from '@/lib/config';
import { GetServerSideProps } from 'next';
import { getCsrfToken, signIn } from 'next-auth/react';

interface SignInProps {
  csrfToken: string;
  authEnabled: boolean;
}

export default function SignIn({ csrfToken, authEnabled }: SignInProps) {
  if (!authEnabled) {
    return (
      <Layout title="Sign In" requireAuth={false}>
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Authentication Disabled
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Authentication is currently disabled in the application configuration.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Sign In" requireAuth={false}>
      <div className="container mx-auto py-12 px-4 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Sign In
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Sign in with your GitHub account to access the API documentation.
        </p>
        
        <button
          onClick={() => signIn('github', { callbackUrl: '/' })}
          className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md flex items-center transition-colors"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"></path>
          </svg>
          Sign in with GitHub
        </button>
        
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Note: Only authorized GitHub users can access this documentation.
        </p>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const csrfToken = await getCsrfToken(context);
  const config = getAppConfig();
  
  return {
    props: {
      csrfToken: csrfToken || '',
      authEnabled: config.features.auth.enabled,
    },
  };
};
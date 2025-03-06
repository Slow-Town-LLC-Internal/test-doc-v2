import { Layout } from '@/components/Layout';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;
  
  let errorMessage = 'An error occurred during authentication';
  
  // Provide specific error messages based on error type
  if (error === 'AccessDenied') {
    errorMessage = 'Your GitHub account is not authorized to access this documentation.';
  } else if (error === 'Verification') {
    errorMessage = 'The sign in link has expired or has already been used.';
  } else if (error === 'OAuthSignin' || error === 'OAuthCallback' || error === 'OAuthCreateAccount') {
    errorMessage = 'There was a problem with the GitHub authentication flow.';
  } else if (error === 'Configuration') {
    errorMessage = 'There is a problem with the server configuration.';
  }

  return (
    <Layout title="Authentication Error" requireAuth={false}>
      <div className="container mx-auto py-12 px-4 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Authentication Error
        </h1>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-8 max-w-xl w-full">
          <p className="text-red-700 dark:text-red-400">
            {errorMessage}
          </p>
        </div>
        
        {error === 'AccessDenied' && (
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-xl">
            Only GitHub users on the approved whitelist can access this documentation. 
            Please contact the administrator if you believe you should have access.
          </p>
        )}
        
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Return Home
          </button>
          
          <button
            onClick={() => signIn('github')}
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md flex items-center transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </Layout>
  );
}
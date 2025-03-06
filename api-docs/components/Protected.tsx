import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';
import { isAuthEnabled } from '@/lib/config';

interface ProtectedProps {
  children: ReactNode;
}

export function Protected({ children }: ProtectedProps) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter();
  const authEnabled = isAuthEnabled();
  
  useEffect(() => {
    // Skip protection if auth is disabled
    if (!authEnabled) return;
    
    // If the session loaded and there's no user, redirect to sign in
    if (!loading && !session) {
      router.push('/auth/signin');
    }
  }, [session, loading, router, authEnabled]);

  if (!authEnabled) {
    // If auth is disabled, render the children without protection
    return <>{children}</>;
  }

  if (loading) {
    // Show loading state while session is being fetched
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  // If session exists, show protected content
  if (session) {
    return <>{children}</>;
  }

  // Otherwise don't render anything (will redirect)
  return null;
}
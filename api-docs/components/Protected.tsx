import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import { isAuthEnabled } from '@/lib/config';

interface ProtectedProps {
  children: ReactNode;
}

export function Protected({ children }: ProtectedProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authState, setAuthState] = useState({
    enabled: false,
    loading: true
  });
  
  // Handle client-side only rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const enabled = isAuthEnabled();
    
    setAuthState({
      enabled: enabled,
      loading: status === 'loading'
    });
    
    // Redirect logic
    if (enabled && status !== 'loading' && !session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // For server-side rendering or before hydration, just render the children
  // This avoids hydration mismatches by deferring auth checks to client side
  if (!mounted) {
    return <>{children}</>;
  }

  // After client-side hydration, apply protection logic
  if (!authState.enabled) {
    // If auth is disabled, render the children without protection
    return <>{children}</>;
  }

  if (authState.loading) {
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

  // Otherwise show loading (will redirect via useEffect)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-gray-400">Redirecting to sign in...</div>
    </div>
  );
}
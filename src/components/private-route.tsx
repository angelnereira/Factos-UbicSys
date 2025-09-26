
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // NOTE: The development check is a temporary bypass to allow dashboard access
    // while fixing OAuth configuration in Google Cloud Console.
    // In production, this check will not apply, and users must be logged in.
    if (!loading && !user && process.env.NODE_ENV !== 'development') {
      router.push('/');
    }
  }, [user, loading, router]);
  
  // In development, we can bypass the auth check to work on the UI.
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;

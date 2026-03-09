'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type RoleRequirement = 'any' | 'admin' | 'broker' | 'client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: RoleRequirement;
}

export function ProtectedRoute({ children, role = 'any' }: ProtectedRouteProps) {
  const { isLoggedIn, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      router.replace(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (role === 'admin' && user?.role !== 'admin') {
      router.replace('/');
      return;
    }
    if (role === 'broker' && user?.role !== 'broker' && user?.role !== 'admin') {
      router.replace('/');
      return;
    }
  }, [isLoading, isLoggedIn, user?.role, role, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn || (role === 'admin' && user?.role !== 'admin') || (role === 'broker' && user?.role !== 'broker' && user?.role !== 'admin')) {
    return null;
  }

  return <>{children}</>;
}

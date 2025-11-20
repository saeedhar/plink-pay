/**
 * Public Route Component - Redirects authenticated users away from auth pages
 * Prevents authenticated users from accessing login/register pages
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = '/app/dashboard' }: PublicRouteProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const isAuth = !!token;

      if (isAuth) {
        // User is authenticated, redirect to dashboard
        navigate(redirectTo, { replace: true });
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate, redirectTo]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}


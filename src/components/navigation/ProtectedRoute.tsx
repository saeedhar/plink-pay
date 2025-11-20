/**
 * Protected Route Component - Protects authenticated routes
 * Redirects to login if user is not authenticated
 * Prevents back navigation to login when user has valid token
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const isAuth = !!token;
      setIsAuthenticated(isAuth);

      if (!isAuth) {
        // Redirect to login, preserving the intended destination
        navigate('/login', {
          replace: true,
          state: { from: location.pathname }
        });
      }
    };

    checkAuth();

    // Listen for storage changes (e.g., logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate, location.pathname]);

  // Prevent back navigation to login when user has valid token
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    // Only prevent back navigation if user is authenticated
    if (!token) {
      return;
    }

    // Store current authenticated route
    if (location.pathname.startsWith('/app/')) {
      sessionStorage.setItem('lastAuthenticatedRoute', location.pathname);
    }

    const handlePopState = (event: PopStateEvent) => {
      // Get the current pathname from the URL after navigation
      const currentPath = window.location.pathname;
      
      // If user navigated to login page or splash screen, immediately redirect back
      if (currentPath === '/login' || currentPath.startsWith('/login/') || currentPath === '/') {
        console.log('🚫 Preventing back navigation to login/splash - user is authenticated');
        
        // Get the last authenticated route or default to dashboard
        const lastRoute = sessionStorage.getItem('lastAuthenticatedRoute') || '/app/dashboard';
        
        // Immediately navigate back to authenticated route
        // Use replace to prevent adding to history
        navigate(lastRoute, { replace: true });
      } else if (currentPath.startsWith('/app/')) {
        // Store the current authenticated route for future use
        sessionStorage.setItem('lastAuthenticatedRoute', currentPath);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, location.pathname]);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}


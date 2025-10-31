import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { ChangePasswordScreen } from '../pages/AdminChangePasswordScreen';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { token, user, isLoading, passwordChangeRequired } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      !isLoading &&
      (!token || !user || user.role?.toUpperCase() !== 'ADMIN')
    ) {
      // Redirect to login, preserving the intended destination
      navigate('/admin/login', {
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [token, user, isLoading, navigate, location.pathname]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!token || !user || user.role?.toUpperCase() !== 'ADMIN') {
    return null;
  }

  // Require password change before allowing access
  if (passwordChangeRequired) {
    return <ChangePasswordScreen />;
  }

  return <>{children}</>;
}
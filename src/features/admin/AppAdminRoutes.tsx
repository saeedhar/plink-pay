import { Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './auth/AdminAuthProvider';
import { AdminProtectedRoute } from './auth/AdminProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminHomePage } from './pages/AdminHomePage';
import { AdminKybOptionsPage } from './pages/AdminKybOptionsPage';
import { AdminUserManagementPage } from './pages/AdminUserManagementPage';
import { AdminFiltersPage } from './pages/AdminFiltersPage';

export function AppAdminRoutes() {
  if (import.meta.env.VITE_ADMIN_ENABLED !== 'true') {
    return null;
  }

  return (
    <AdminAuthProvider>
      <Routes>
        {/* Login page - no layout wrapper */}
        <Route path="/login" element={<AdminLoginPage />} />
        
        {/* Protected admin pages with layout */}
        <Route 
          path="/" 
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminHomePage />} />
          <Route path="kyb-options" element={<AdminKybOptionsPage />} />
          <Route path="users" element={<AdminUserManagementPage />} />
          <Route path="filters" element={<AdminFiltersPage />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}

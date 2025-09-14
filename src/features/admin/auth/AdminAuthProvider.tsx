import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AdminUser {
  name: string;
  role: 'admin';
}

export interface AdminAuthState {
  token: string | null;
  user: AdminUser | null;
  isLoading: boolean;
}

export interface AdminAuthContextType extends AdminAuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const STORAGE_KEY = 'admin_token';
const USER_STORAGE_KEY = 'admin_user';

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [state, setState] = useState<AdminAuthState>({
    token: null,
    user: null,
    isLoading: true,
  });

  // Load persisted auth state on mount
  useEffect(() => {
    const token = sessionStorage.getItem(STORAGE_KEY);
    const userStr = sessionStorage.getItem(USER_STORAGE_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as AdminUser;
        setState({
          token,
          user,
          isLoading: false,
        });
      } catch {
        // Clear invalid stored data
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(USER_STORAGE_KEY);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      throw new Error('Email and password are required');
    }

    // Use adminAuthService for actual API call
    const { adminAuthService } = await import('../api/adminAuthService');
    const response = await adminAuthService.login(email, password);

    setState({
      token: response.token,
      user: {
        name: response.name,
        role: response.role,
      },
      isLoading: false,
    });
  };

  const signOut = (): void => {
    // Clear sessionStorage immediately for security
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    
    // Also use adminAuthService for consistent cleanup
    import('../api/adminAuthService').then(({ adminAuthService }) => {
      adminAuthService.signOut();
    });
    
    setState({
      token: null,
      user: null,
      isLoading: false,
    });
  };

  const contextValue: AdminAuthContextType = {
    ...state,
    signIn,
    signOut,
  };

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}

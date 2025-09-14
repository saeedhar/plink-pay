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

    // Mock authentication - accept any non-empty credentials
    const mockToken = `adm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockUser: AdminUser = {
      name: 'Admin',
      role: 'admin',
    };

    // Persist to sessionStorage
    sessionStorage.setItem(STORAGE_KEY, mockToken);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));

    setState({
      token: mockToken,
      user: mockUser,
      isLoading: false,
    });
  };

  const signOut = (): void => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    
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

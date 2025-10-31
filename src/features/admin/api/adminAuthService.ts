import { adminHttp } from './adminHttp';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: 'ADMIN' | 'USER';
  name: string;
  email?: string;
  passwordChangeRequired?: boolean;
}

export interface AdminProfile {
  role: 'ADMIN' | 'USER';
  name?: string;
  email?: string;
}

/**
 * Admin authentication service
 */
export class AdminAuthService {
  /**
   * Authenticate admin user and return profile with token
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await adminHttp<LoginResponse>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    // Store token in sessionStorage for future requests
    if (response.token) {
      sessionStorage.setItem('admin_token', response.token);
      sessionStorage.setItem('admin_user', JSON.stringify({
        role: response.role,
        name: response.name,
        email: response.email
      }));
    }

    return response;
  }

  /**
   * Get current admin profile (requires valid token)
   */
  async me(): Promise<AdminProfile> {
    return adminHttp<AdminProfile>('/api/admin/me');
  }

  /**
   * Sign out admin user
   */
  signOut(): void {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
  }

  /**
   * Check if admin is currently authenticated
   */
  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('admin_token');
    return !!token; // JWT from backend
  }

  /**
   * Get stored admin profile without API call
   */
  getStoredProfile(): AdminProfile | null {
    try {
      const userStr = sessionStorage.getItem('admin_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Change admin password (used for temp/first login force-change)
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    const res = await adminHttp<{ success: boolean; message?: string; error?: string }>('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword })
    });
    if (res.success) return res;
    throw new Error(res.error || res.message || 'Failed to change password');
  }
}

// Export singleton instance
export const adminAuthService = new AdminAuthService();

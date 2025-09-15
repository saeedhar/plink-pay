import { adminHttp } from './adminHttp';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: 'admin';
  name: string;
}

export interface AdminProfile {
  role: 'admin';
  name: string;
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
        name: response.name
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
    return !!token && token.startsWith('adm_');
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
}

// Export singleton instance
export const adminAuthService = new AdminAuthService();

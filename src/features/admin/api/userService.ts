import { adminHttp } from './adminHttp';

export interface User {
  id: string;
  email?: string;
  phoneE164?: string;
  idUnn?: string;
  dateOfBirth?: string;
  status: string;
  role?: 'ADMIN' | 'USER';
  lockedAt?: string;
  lockReason?: string;
  lockType?: string;
  unlockMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsersListResponse {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateUserRequest {
  email?: string;
  phoneE164: string;
  idUnn?: string;
  dateOfBirth?: string;
  status?: string;
}

export interface UpdateUserRequest {
  email?: string;
  phoneE164?: string;
  idUnn?: string;
  dateOfBirth?: string;
  status?: string;
  lockReason?: string;
  lockType?: string;
  role?: 'ADMIN' | 'USER';
}

/**
 * User management service for admin portal
 */
export class UserService {
  /**
   * Get all users with pagination
   */
  async listUsers(page: number = 0, pageSize: number = 50): Promise<UsersListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString()
    });

    return adminHttp<UsersListResponse>(`/api/admin/users?${params}`);
  }

  /**
   * Get a single user by ID
   */
  async getUser(userId: string): Promise<User> {
    return adminHttp<User>(`/api/admin/users/${userId}`);
  }

  /**
   * Create a new user
   */
  async createUser(payload: CreateUserRequest): Promise<User> {
    return adminHttp<User>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Update an existing user
   */
  async updateUser(userId: string, payload: UpdateUserRequest): Promise<User> {
    return adminHttp<User>(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    return adminHttp<void>(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Lock a user account
   */
  async lockUser(userId: string, reason: string, lockType: 'soft' | 'hard'): Promise<User> {
    return adminHttp<User>(`/api/admin/users/${userId}/lock`, {
      method: 'POST',
      body: JSON.stringify({ reason, lockType })
    });
  }

  /**
   * Unlock a user account
   */
  async unlockUser(userId: string): Promise<User> {
    return adminHttp<User>(`/api/admin/users/${userId}/unlock`, {
      method: 'POST'
    });
  }

  /**
   * Reset user password to default test password
   * FOR TESTING ONLY - will be removed in production
   */
  async resetPassword(userId: string): Promise<{ message: string; tempPassword: string; user: User }> {
    return adminHttp<{ message: string; tempPassword: string; user: User }>(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST'
    });
  }

  /** Create a new admin user (email + optional phone + password) */
  async createAdmin(payload: { email: string; phoneE164?: string; password: string }): Promise<User> {
    return adminHttp<User>(`/api/admin/admin-users`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /** Promote a user to ADMIN */
  async makeAdmin(userId: string): Promise<User> {
    return adminHttp<User>(`/api/admin/users/${userId}/make-admin`, { method: 'POST' });
  }

  /** Demote a user to USER */
  async makeRegular(userId: string): Promise<User> {
    return adminHttp<User>(`/api/admin/users/${userId}/make-regular`, { method: 'POST' });
  }
}

// Export singleton instance
export const userService = new UserService();


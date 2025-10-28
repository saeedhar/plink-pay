import { useState, useEffect } from 'react';
import { userService, type User, type UpdateUserRequest } from '../api/userService';

export function AdminUserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    phoneE164: '',
    idUnn: '',
    dateOfBirth: '',
    status: 'active',
    lockReason: '',
    lockType: 'soft' as 'soft' | 'hard'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Pagination
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  // Load users on mount and page change
  useEffect(() => {
    loadUsers();
  }, [page]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await userService.listUsers(page, pageSize);
      setUsers(response.items);
      setTotal(response.total);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDrawer = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email || '',
      phoneE164: user.phoneE164 || '',
      idUnn: user.idUnn || '',
      dateOfBirth: user.dateOfBirth || '',
      status: user.status,
      lockReason: user.lockReason || '',
      lockType: (user.lockType as 'soft' | 'hard') || 'soft'
    });
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
    setFormData({
      email: '',
      phoneE164: '',
      idUnn: '',
      dateOfBirth: '',
      status: 'active',
      lockReason: '',
      lockType: 'soft'
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.phoneE164.trim()) {
      errors.phoneE164 = 'Phone number is required';
    } else if (!formData.phoneE164.startsWith('+')) {
      errors.phoneE164 = 'Phone must be in E.164 format (e.g., +966XXXXXXXXX)';
    }
    
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Invalid email format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const payload: UpdateUserRequest = {
        phoneE164: formData.phoneE164.trim() || undefined,
        email: formData.email.trim() || undefined,
        idUnn: formData.idUnn.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        status: formData.status,
        lockReason: formData.lockReason.trim() || undefined,
        lockType: formData.lockType
      };
      await userService.updateUser(selectedUser.id, payload);
      setSuccessMessage('User updated successfully!');
      
      closeDrawer();
      await loadUsers();
    } catch (err) {
      setFormErrors({
        submit: err instanceof Error ? err.message : 'Failed to update user'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user ${user.phoneE164}?`)) {
      return;
    }

    try {
      await userService.deleteUser(user.id);
      setSuccessMessage('User deleted successfully!');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleLockToggle = async (user: User) => {
    try {
      if (user.lockedAt) {
        await userService.unlockUser(user.id);
        setSuccessMessage('User unlocked successfully!');
      } else {
        const reason = prompt('Enter lock reason:');
        if (!reason) return;
        await userService.lockUser(user.id, reason, 'soft');
        setSuccessMessage('User locked successfully!');
      }
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user lock status');
    }
  };

  const handleResetPassword = async (user: User) => {
    if (!confirm(`Reset password for user ${user.phoneE164}? This will set their password to the default test password.`)) {
      return;
    }

    try {
      const response = await userService.resetPassword(user.id);
      setSuccessMessage(`Password reset successfully! New password: ${response.tempPassword}`);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage all users in the system. Users are created through the onboarding process.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">All Users</h3>
            <p className="text-sm text-gray-500 mt-1">Total: {total} users</p>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID/UNN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className={user.lockedAt ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-gray-50'} style={{ transition: 'background-color 0.2s' }}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.phoneE164 || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.idUnn || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              user.status === 'active' 
                                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20' 
                                : 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20'
                            }`}>
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 8 8">
                                <circle cx="4" cy="4" r="3" />
                              </svg>
                              {user.status}
                            </span>
                            {user.lockedAt && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 ring-1 ring-rose-600/20">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                Locked
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => openEditDrawer(user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-blue-200 hover:ring-blue-300 transition-all duration-200"
                              title="Edit"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleLockToggle(user)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                user.lockedAt 
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200 hover:ring-emerald-300' 
                                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100 ring-1 ring-orange-200 hover:ring-orange-300'
                              }`}
                              title={user.lockedAt ? 'Unlock' : 'Lock'}
                            >
                              {user.lockedAt ? (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                  </svg>
                                  Unlock
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                  </svg>
                                  Lock
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleResetPassword(user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 ring-1 ring-purple-200 hover:ring-purple-300 transition-all duration-200"
                              title="Reset Password (Test)"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                              </svg>
                              Reset
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 ring-1 ring-red-200 hover:ring-red-300 transition-all duration-200"
                              title="Delete"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > pageSize && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-700">
                    Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, total)} of {total} users
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={(page + 1) * pageSize >= total}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create/Edit User Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeDrawer}></div>
            <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  <div className="flex-1 py-6 px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">
                        Edit User
                      </h2>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          onClick={closeDrawer}
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <span className="sr-only">Close panel</span>
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      {/* Phone Number */}
                      <div>
                        <label htmlFor="phoneE164" className="block text-sm font-medium text-gray-700">
                          Phone Number (E.164 format) *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="phoneE164"
                            value={formData.phoneE164}
                            onChange={(e) => setFormData(prev => ({ ...prev, phoneE164: e.target.value }))}
                            className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                              formErrors.phoneE164 ? 'border-red-300' : ''
                            }`}
                            placeholder="+966XXXXXXXXX"
                            disabled={true}
                          />
                          {formErrors.phoneE164 && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.phoneE164}</p>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email (optional)
                        </label>
                        <div className="mt-1">
                          <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                              formErrors.email ? 'border-red-300' : ''
                            }`}
                            placeholder="user@example.com"
                          />
                          {formErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                          )}
                        </div>
                      </div>

                      {/* ID/UNN */}
                      <div>
                        <label htmlFor="idUnn" className="block text-sm font-medium text-gray-700">
                          ID/UNN (optional)
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="idUnn"
                            value={formData.idUnn}
                            onChange={(e) => setFormData(prev => ({ ...prev, idUnn: e.target.value }))}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="National ID or UNN"
                          />
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                          Date of Birth (optional)
                        </label>
                        <div className="mt-1">
                          <input
                            type="date"
                            id="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <div className="mt-1">
                          <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                      </div>

                      <>
                          {/* Lock Reason */}
                          <div>
                            <label htmlFor="lockReason" className="block text-sm font-medium text-gray-700">
                              Lock Reason (optional)
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id="lockReason"
                                value={formData.lockReason}
                                onChange={(e) => setFormData(prev => ({ ...prev, lockReason: e.target.value }))}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Reason for locking account"
                              />
                            </div>
                          </div>

                          {/* Lock Type */}
                          <div>
                            <label htmlFor="lockType" className="block text-sm font-medium text-gray-700">
                              Lock Type
                            </label>
                            <div className="mt-1">
                              <select
                                id="lockType"
                                value={formData.lockType}
                                onChange={(e) => setFormData(prev => ({ ...prev, lockType: e.target.value as 'soft' | 'hard' }))}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="soft">Soft Lock</option>
                                <option value="hard">Hard Lock</option>
                              </select>
                            </div>
                          </div>
                      </>

                      {/* Submit Error */}
                      {formErrors.submit && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="text-sm text-red-700">{formErrors.submit}</div>
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Footer */}
                  <div className="flex-shrink-0 px-4 py-4 flex justify-end space-x-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeDrawer}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Saving...' : 'Update User'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}


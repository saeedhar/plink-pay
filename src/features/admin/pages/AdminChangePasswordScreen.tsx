import { useState } from 'react';
import { adminAuthService } from '../api/adminAuthService';
import { useAdminAuth } from '../auth/AdminAuthProvider';

export function ChangePasswordScreen() {
  const { setPasswordChangeDone, signOut } = useAdminAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [err, setErr] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setSuccess('');
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setErr('All fields required');
      return;
    }
    if (newPassword.length < 8) {
      setErr('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await adminAuthService.changePassword(oldPassword, newPassword);
      setSuccess('Password changed! Please sign in again.');
      setTimeout(() => {
        setPasswordChangeDone();
        signOut(); // For security: force login
      }, 1500);
    } catch (ex: any) {
      setErr(ex instanceof Error ? ex.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Change Your Password</h2>
        <p className="text-gray-500 mb-4 text-center">You are required to set a new password before continuing.</p>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Current (Temp) Password</label>
            <input type="password" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} className="block w-full rounded-lg px-4 py-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">New Password</label>
            <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="block w-full rounded-lg px-4 py-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="block w-full rounded-lg px-4 py-2 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20" />
          </div>
          {err && <div className="rounded bg-red-50 text-red-700 p-3 text-center text-sm">{err}</div>}
          {success && <div className="rounded bg-green-50 text-green-800 p-3 text-center text-sm">{success}</div>}
          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-60">
              {loading ? 'Changing password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

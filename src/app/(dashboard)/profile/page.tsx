'use client';

import { useAuth } from '@/providers/auth-provider';
import { useState, FormEvent } from 'react';
import { apiClient } from '@/lib/api-client';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    country: user?.country || '',
    preferredLanguage: user?.preferredLanguage || 'auto',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await apiClient.patch<{ data: { user: typeof user } }>('/api/profile', formData);
      if (response.data.user) {
        updateUser(response.data.user);
      }
      setMessage('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      country: user?.country || '',
      preferredLanguage: user?.preferredLanguage || 'auto',
    });
    setIsEditing(false);
    setError('');
    setMessage('');
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {message && <div className="p-3 bg-emerald-500/10 border border-green-200 rounded-lg text-green-700 text-sm">{message}</div>}
      {error && <div className="p-3 bg-red-500/10 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Account Information</h2>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="text-sm text-blue-600 hover:text-blue-800">
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" disabled={isLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
              <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="input-field" placeholder="Your country" disabled={isLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Preferred Language</label>
              <select value={formData.preferredLanguage} onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })} className="input-field" disabled={isLoading}>
                <option value="auto">Auto-detect</option>
                <option value="english">English</option>
                <option value="roman_urdu">Roman Urdu</option>
                <option value="urdu">Urdu</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={handleCancel} className="btn-secondary">Cancel</button>
            </div>
          </form>
        ) : (
          <dl className="space-y-4">
            <div><dt className="text-sm text-gray-500">Name</dt><dd className="text-sm font-medium">{user.name}</dd></div>
            <div><dt className="text-sm text-gray-500">Email</dt><dd className="text-sm font-medium">{user.email}</dd></div>
            <div><dt className="text-sm text-gray-500">Country</dt><dd className="text-sm font-medium">{user.country || 'Not set'}</dd></div>
            <div><dt className="text-sm text-gray-500">Language</dt><dd className="text-sm font-medium capitalize">{user.preferredLanguage?.replace('_', ' ')}</dd></div>
            <div><dt className="text-sm text-gray-500">Role</dt><dd className="text-sm font-medium capitalize">{user.role}</dd></div>
          </dl>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Security</h2>
        <div className="space-y-3">
          <a href="/change-password" className="block px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            <span className="text-sm font-medium">Change Password</span>
            <p className="text-xs text-gray-500">Update your account password</p>
          </a>
        </div>
      </div>
    </div>
  );
}

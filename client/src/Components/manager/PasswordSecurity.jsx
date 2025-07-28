import React, { useState } from "react";
import toast from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';

export default function PasswordSecurity() {
  const { put } = useApi();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (oldPassword === newPassword) {
      toast.error('New password must be different from old password');
      return;
    }
    setLoading(true);
    try {
      const response = await put('/api/manager/update-password', { oldPassword, newPassword });
      
      if (response.ok) {
        toast.success('Password updated successfully!');
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        toast.error(data.error || data.message || 'Failed to update password');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-4">
      <div className="text-3xl font-bold text-black mb-1">Password & Securities</div>
      <p className="text-base text-gray-500 mb-8 max-w-2xl">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisi. Arcu ullamcorper a in molestie et risus pulvinar orci vel.
      </p>
      <div className="bg-white rounded-xl shadow border border-gray-200 p-8 w-full max-w-2xl">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="old-password" className="block text-gray-700 font-medium mb-2">Old password</label>
            <input
              id="old-password"
              type="password"
              className="w-full border border-blue-400 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="new-password" className="block text-gray-700 font-medium mb-2">New Password</label>
              <input
                id="new-password"
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="confirm-password" className="block text-gray-700 font-medium mb-2">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">Your new password must be more than 8 characters.</p>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

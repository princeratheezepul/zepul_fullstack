import React, { useState } from 'react';
import { Link } from 'react-router-dom';
const Passwordsec = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setMessage('New passwords do not match.');
    }

    try {
      setLoading(true);
      setMessage('');

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.data.accessToken}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(result.error || 'Failed to update password');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-xl mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-center">Change Password</h2>
      {message && <p className="mb-4 text-center text-red-500">{message}</p>}
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Old Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
        <Link to="/manager/forgot-password">Forgot Password</Link>

      </form>
    </div>
  );
};

export default Passwordsec;

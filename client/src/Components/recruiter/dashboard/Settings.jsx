import React, { useState } from 'react';
import AccountInfo from './AccountInfo';
import EmailNotification from './EmailNotification';
import { useAuth } from '../../../context/AuthContext';
import { logoutUser } from '../../../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

const Settings = () => {
  const [activeSetting, setActiveSetting] = useState('Account Info');
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const settingsNav = [
    { name: 'Account Info' },
    { name: 'Change Password' },
    { name: 'Email Notification' },
    { name: 'Logout' },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser(navigate, user?.type);
      logout();
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      navigate('/signin/recruiter');
    }
  };

  const PasswordChange = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e) => {
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
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/change-password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ oldPassword, newPassword }),
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
          toast.success('Password updated successfully!');
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          toast.error(data.message || 'Failed to update password');
        }
      } catch (error) {
        console.error('Password update error:', error);
        toast.error('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="w-full max-w-3xl pt-4">
        <h1 className="text-2xl font-bold text-black mb-1">Password & Securities</h1>
        <p className="text-base text-gray-500 mb-8 max-w-2xl">
          Update your password to keep your account secure.
        </p>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-8 w-full max-w-2xl">
          <form onSubmit={handlePasswordChange} className="space-y-6">
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
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Sidebar click handler
  const handleSidebarClick = (item) => {
    if (item.name === 'Logout') {
      handleLogout();
    } else {
      setActiveSetting(item.name);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50 ml-20">
      <Toaster position="top-center" />
      {/* Sidebar Navigation */}
      <aside className="w-full max-w-xs md:w-64 bg-white border-r border-gray-200 flex-shrink-0 min-h-screen px-4 py-8 hidden sm:block">
        <div className="text-xs text-gray-400 font-semibold mb-6 tracking-widest">SETTINGS</div>
        <nav>
          <ul className="flex flex-col gap-2">
            {settingsNav.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleSidebarClick(item)}
                  className={`w-full text-left py-2 px-4 rounded-lg transition-colors font-medium text-base cursor-pointer ${
                    activeSetting === item.name && item.name !== 'Logout'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-start px-4 sm:px-8 lg:px-16 py-8 w-full bg-gray-50">
        {activeSetting === 'Account Info' && <AccountInfo />}
        {activeSetting === 'Change Password' && <PasswordChange />}
        {activeSetting === 'Email Notification' && <EmailNotification />}
        {/* No LogoutContent here, logout is immediate */}
      </main>
    </div>
  );
};

export default Settings; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { logoutUser, getAuthHeaders } from '../../../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import EmailNotification from './EmailNotification';
import { useApi } from '../../../hooks/useApi';

const settingsNav = [
  { name: 'Account Info' },
  { name: 'Password & Securities' },
  { name: 'Email Notification' },
  { name: 'Logout' },
];

function PasswordAndSecurity() {
  const { user } = useAuth();
  const { put } = useApi();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
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
      // Use the correct endpoint for manager password update
      const response = await put(`${import.meta.env.VITE_BACKEND_URL}/api/manager/update-password`, {
        oldPassword,
        newPassword,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to change password');
      }

      // Success
      toast.success('Password changed successfully!');
      
      // Clear form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Password & Securities</h1>
      <p className="text-gray-500 mb-6 max-w-2xl text-sm sm:text-base">
        Update your password to keep your account secure. Make sure to use a strong password with at least 8 characters.
      </p>
      <form onSubmit={handlePasswordChange} className="bg-white border rounded-xl p-4 sm:p-6 lg:p-8 max-w-3xl w-full space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your current password"
            required
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new password"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mt-2 space-y-4 lg:space-y-0">
          <span className="text-xs text-gray-500">Your new password must be at least 8 characters long.</span>
          <button
            type="submit"
            className="w-full lg:w-32 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Updating...
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

const AccountInfoContent = () => {
  const { user } = useAuth();
  const { get, put } = useApi();
  const [formData, setFormData] = useState({
    fullname: '',
    DOB: '',
    gender: '',
    email: '',
    phone: '',
    onboardedBy: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchProfileData();
    } else {
      setLoading(false);
      setError('User not authenticated. Please login again.');
    }
  }, [user]);

  const getApiEndpoint = () => {
    const userType = user?.type;
    console.log("[AccountInfo] user object:", user);
    if (userType === 'manager') {
      return `${import.meta.env.VITE_BACKEND_URL}/api/manager/profile`;
    } else if (userType === 'recruiter') {
      return `${import.meta.env.VITE_BACKEND_URL}/api/recruiter/profile`;
    } else {
      // Try to infer from email if possible (optional)
      if (user?.email && user?.email.includes('recruiter')) {
        console.warn('[AccountInfo] user.type missing, inferring recruiter from email');
        return `${import.meta.env.VITE_BACKEND_URL}/api/recruiter/profile`;
      }
      if (user?.email && user?.email.includes('manager')) {
        console.warn('[AccountInfo] user.type missing, inferring manager from email');
        return `${import.meta.env.VITE_BACKEND_URL}/api/manager/profile`;
      }
      throw new Error(`[AccountInfo] Unsupported or missing user type: ${userType}. Please re-login.`);
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching profile for user:', user);
      
      const endpoint = getApiEndpoint();
      console.log('Using endpoint:', endpoint);
      
      const response = await get(endpoint);

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch profile data');
      }

      const data = await response.json();
      console.log('Profile data received:', data);
      
      // Handle both manager and recruiter data structures
      const profileData = data.manager || data.recruiter;
      
      setFormData({
        fullname: profileData.fullname || '',
        DOB: profileData.DOB || '',
        gender: profileData.gender || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        onboardedBy: profileData.onboardedBy || 'N/A'
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const endpoint = getApiEndpoint();
      
      const updateData = {
        fullname: formData.fullname,
        DOB: formData.DOB,
        gender: formData.gender,
        phone: formData.phone,
      };

      const response = await put(endpoint, updateData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Account Info</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Account Info</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={fetchProfileData}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Account Info</h1>
      <p className="text-gray-500 mb-6 text-sm sm:text-base">
        Update your personal information and account details. Your email and onboarded by information cannot be changed.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          <div className="lg:col-span-2">
            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input 
              type="text" 
              id="fullname" 
              name="fullname"
              value={formData.fullname} 
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg focus:border-blue-500 px-3 py-2" 
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="DOB" className="block text-sm font-medium text-gray-700 mb-1">
                DOB
              </label>
              <input 
                type="date" 
                id="DOB" 
                name="DOB"
                value={formData.DOB} 
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg focus:border-blue-500 px-3 py-2" 
              />
            </div>
            <div className="flex-1">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select 
                id="gender" 
                name="gender"
                value={formData.gender} 
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg focus:border-blue-500 px-3 py-2"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          <div className="lg:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input 
              type="email" 
              id="email" 
              value={formData.email} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" 
              disabled 
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <div className="flex">
              <select className="border border-gray-300 rounded-l-lg focus:border-blue-500 px-2">
                <option>🇮🇳</option>
              </select>
              <input 
                type="text" 
                id="phone" 
                name="phone"
                value={formData.phone} 
                onChange={handleInputChange}
                className="w-full border-t border-b border-r border-gray-300 rounded-r-lg focus:border-blue-500 px-3 py-2" 
                placeholder="+91 000000"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="onboardedBy" className="block text-sm font-medium text-gray-700 mb-1">
            Onboarded by
          </label>
          <input 
            type="text" 
            id="onboardedBy" 
            value={formData.onboardedBy} 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" 
            disabled 
          />
        </div>
        <div>
          <button 
            type="submit" 
            disabled={saving}
            className="w-full sm:w-56 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </form>
    </>
  );
};

const LogoutContent = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call the logout utility function which handles server logout and redirects to appropriate login page
      await logoutUser(navigate, user?.type);
      
      // Update the auth context
      logout();
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if server logout fails, clear client state and redirect
      logout();
      navigate('/manager/login');
    }
  };

  return (
    <div className="w-full flex flex-col">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Logout</h1>
      <p className="text-gray-500 mb-6 max-w-2xl text-sm sm:text-base">
        Are you sure you want to logout? You will be redirected to the login page.
      </p>
      <div className="bg-white border rounded-xl p-4 sm:p-6 lg:p-8 max-w-3xl w-full">
        <div className="flex flex-col space-y-4">
          <p className="text-gray-700">
            Click the button below to securely logout from your account.
          </p>
          <button
            onClick={handleLogout}
            className="w-full sm:w-56 bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const AccountInfo = () => {
  return <AccountInfoContent />;
};

export default AccountInfo; 
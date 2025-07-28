import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { logoutUser, getAuthHeaders } from '../../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import EmailNotification from './EmailNotification';
import PasswordSecurity from './PasswordSecurity';

const settingsNav = [
  { name: 'Account Info' },
  { name: 'Password & Securities' },
  { name: 'Email Notification' },
  { name: 'Logout' },
];

const ManagerAccountSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Account Info');
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
    // eslint-disable-next-line
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/manager/profile`;
      const response = await fetch(endpoint, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profile data');
      }
      const data = await response.json();
      const profileData = data.manager;
      setFormData({
        fullname: profileData.fullname || '',
        DOB: profileData.DOB || '',
        gender: profileData.gender || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        onboardedBy: profileData.onboardedBy || 'N/A'
      });
    } catch (err) {
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
      const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/manager/profile`;
      const updateData = {
        fullname: formData.fullname,
        DOB: formData.DOB ? new Date(formData.DOB).toISOString() : '',
        gender: formData.gender,
        phone: formData.phone,
      };
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      toast.success('Profile updated successfully!');
      await fetchProfileData();
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser(navigate, user?.type);
      logout();
    } catch (error) {
      logout();
      navigate('/manager/login');
    }
  };

  // Tab content
  let content;
  if (activeTab === 'Account Info') {
    if (loading) {
      content = (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    } else if (error) {
      content = (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <button onClick={fetchProfileData} className="mt-2 text-blue-600 hover:text-blue-800 underline">Try again</button>
        </div>
      );
    } else {
      content = (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
            <div className="lg:col-span-2">
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" id="fullname" name="fullname" value={formData.fullname} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg focus:border-blue-500 px-3 py-2" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="DOB" className="block text-sm font-medium text-gray-700 mb-1">DOB</label>
                <input type="date" id="DOB" name="DOB" value={formData.DOB} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg focus:border-blue-500 px-3 py-2" />
              </div>
              <div className="flex-1">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg focus:border-blue-500 px-3 py-2">
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="email" value={formData.email} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" disabled />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="flex">
                <select className="border border-gray-300 rounded-l-lg focus:border-blue-500 px-2">
                  <option>🇮🇳</option>
                </select>
                <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border-t border-b border-r border-gray-300 rounded-r-lg focus:border-blue-500 px-3 py-2" placeholder="+91 000000" />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="onboardedBy" className="block text-sm font-medium text-gray-700 mb-1">Onboarded by</label>
            <input type="text" id="onboardedBy" value={formData.onboardedBy} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" disabled />
          </div>
          <div>
            <button type="submit" disabled={saving} className="w-full sm:w-56 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed">
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
      );
    }
  } else if (activeTab === 'Password & Securities') {
    content = <PasswordSecurity />;
  } else if (activeTab === 'Email Notification') {
    content = <EmailNotification />;
  } else if (activeTab === 'Logout') {
    content = (
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
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Toaster />
      {/* Sidebar Navigation */}
      <aside className="w-full max-w-xs md:w-64 bg-white border-r border-gray-200 flex-shrink-0 min-h-screen px-4 py-8">
        <div className="text-xs text-gray-400 font-semibold mb-6 tracking-widest">SETTINGS</div>
        <nav>
          <ul className="flex flex-col gap-2">
            {settingsNav.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full text-left py-2 px-4 rounded-lg transition-colors font-medium text-base cursor-pointer ${
                    activeTab === item.name
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
      <main className="flex-1 min-h-screen bg-white flex flex-col items-start justify-start p-12 w-full">
        {content}
      </main>
    </div>
  );
};

export default ManagerAccountSettings; 
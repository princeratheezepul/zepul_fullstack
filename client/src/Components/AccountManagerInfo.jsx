import React, { useState, useEffect } from 'react';

const AccountManagerInfo = () => {
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
  const [success, setSuccess] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const accountmanagerId = userInfo?.data?.user?._id;
  const accessToken = userInfo?.data?.accessToken;

  useEffect(() => {
    if (accountmanagerId && accessToken) {
      fetchProfileData();
    } else {
      setLoading(false);
      setError('User not authenticated. Please login again.');
    }
    // eslint-disable-next-line
  }, [accountmanagerId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/${accountmanagerId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to fetch profile data');
      }
      const data = await response.json();
      const profileData = data.user;
      setFormData({
        fullname: profileData.fullname || '',
        DOB: profileData.DOB ? profileData.DOB.slice(0, 10) : '',
        gender: profileData.gender || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        onboardedBy: profileData.adminId?.fullname || 'N/A',
      });
    } catch (err) {
      setError(err.message);
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
    setError(null);
    setSuccess(null);
    try {
      const updateData = {
        fullname: formData.fullname,
        DOB: formData.DOB,
        gender: formData.gender,
        phone: formData.phone,
      };
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/${accountmanagerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to update profile');
      }
      setSuccess('Profile updated successfully!');
      fetchProfileData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col">
        <div className="text-2xl sm:text-3xl font-bold mb-2">Account Info</div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col">
        <div className="text-2xl sm:text-3xl font-bold mb-2">Account Info</div>
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
      <div className="text-2xl sm:text-3xl font-bold mb-2">Account Info</div>
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
        {success && <div className="text-green-600 text-sm font-medium">{success}</div>}
        {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
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

export default AccountManagerInfo;

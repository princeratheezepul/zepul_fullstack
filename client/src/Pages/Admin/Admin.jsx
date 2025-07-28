import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {  FaUser, FaUsers, FaUserTie, FaUserShield, FaChartLine,  FaEdit, FaTrash,  FaBriefcase, FaSave } from 'react-icons/fa';

import AdminJobs from '../../components/admin/dashboard/AdminJobs';
import AdminCompanyDetails from '../../components/admin/dashboard/AdminCompanyDetails.jsx';
import JobCard from '../../components/recruiter/dashboard/JobCard';
import JobDetails from '../../components/recruiter/dashboard/JobDetails';
import CandidateList from '../../components/recruiter/dashboard/CandidateList';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../utils/authUtils';
import toast from 'react-hot-toast';

const Admin = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState(0); // 0: dashboard, 1: user roles, 2: jobs, 3: company data
  const [stats, setStats] = useState([
    { label: 'Total Users', value: 0, change: '+0%', percentageDisplay: '+0%', icon: <FaUser />, since: 'Since last week' },
    { label: 'Manager', value: 0, change: '+0%', percentageDisplay: '+0%', icon: <FaUserTie />, since: 'Since last week' },
    { label: 'Recruiter', value: 0, change: '+0%', percentageDisplay: '+0%', icon: <FaUsers />, since: 'Since last week' },
    { label: 'Account Manager', value: 0, change: '+0%', percentageDisplay: '+0%', icon: <FaUserShield />, since: 'Since last week' },
    { label: 'Success Ratio', value: '0%', change: '+0', percentageDisplay: '+0%', icon: <FaChartLine />, since: 'Since last week' },
  ]);
  const { user, isAuthenticated } = useAuth();

  // Fetch user counts on component mount
  useEffect(() => {
    fetchUserCounts();
  }, []);

  const fetchUserCounts = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/user-counts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const counts = data.data;

        // Helper function to format change display
        const formatChange = (change) => {
          if (change.count > 0) {
            return `+${change.count} (+${change.percentage}%)`;
          } else if (change.count < 0) {
            return `${change.count} (${change.percentage}%)`;
          } else {
            return `0 (0%)`;
          }
        };

        // Helper function to extract percentage for display
        const getPercentageDisplay = (change) => {
          if (change.count > 0) {
            return `+${change.percentage}%`;
          } else if (change.count < 0) {
            return `${change.percentage}%`;
          } else {
            return `0%`;
          }
        };

        // Update dashboard stats with user counts from entire database
        // Total Users = sum of all user types (manager + recruiter + account manager) excluding admin
        // Individual counts = count of users for each specific type in the entire database
        setStats([
          {
            label: 'Total Users',
            value: counts.total,
            change: formatChange(counts.changes.total),
            percentageDisplay: getPercentageDisplay(counts.changes.total),
            icon: <FaUser />,
            since: 'Since last week'
          },
          {
            label: 'Manager',
            value: counts.managers,
            change: formatChange(counts.changes.managers),
            percentageDisplay: getPercentageDisplay(counts.changes.managers),
            icon: <FaUserTie />,
            since: 'Since last week'
          },
          {
            label: 'Recruiter',
            value: counts.recruiters,
            change: formatChange(counts.changes.recruiters),
            percentageDisplay: getPercentageDisplay(counts.changes.recruiters),
            icon: <FaUsers />,
            since: 'Since last week'
          },
          {
            label: 'Account Manager',
            value: counts.accountManagers,
            change: formatChange(counts.changes.accountManagers),
            percentageDisplay: getPercentageDisplay(counts.changes.accountManagers),
            icon: <FaUserShield />,
            since: 'Since last week'
          },
          {
            label: 'Success Ratio',
            value: '0%',
            change: '+0',
            percentageDisplay: '+0%',
            icon: <FaChartLine />,
            since: 'Since last week'
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching user counts:', error);
    }
  };

  // Make fetchUserCounts available globally for other components
  useEffect(() => {
    window.fetchUserCounts = fetchUserCounts;
    return () => {
      delete window.fetchUserCounts;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-16 md:w-20 bg-black flex flex-col justify-between py-4 md:py-6 px-1 md:px-2 h-screen">
        <div className="flex flex-col gap-8 md:gap-12 items-center">
          <div className="mb-8 cursor-pointer" onClick={() => { setActiveSidebar(0); setShowProfile(false); }}>
            <img
              src="/zepul_sidebar_logo.png"
              alt="Zepul Logo"
              className="h-7 w-7 object-contain"
            />
          </div>
          <FaUsers className={`text-lg md:text-xl cursor-pointer ${activeSidebar === 1 ? 'text-blue-600' : 'text-gray-400'}`} onClick={() => { setActiveSidebar(1); setShowProfile(false); }} />
          <FaBriefcase className={`text-lg md:text-xl cursor-pointer ${activeSidebar === 2 ? 'text-blue-600' : 'text-gray-400'}`} onClick={() => { setActiveSidebar(2); setShowProfile(false); }} />
          <FaChartLine className={`text-lg md:text-xl cursor-pointer ${activeSidebar === 3 ? 'text-blue-600' : 'text-gray-400'}`} onClick={() => { setActiveSidebar(3); setShowProfile(false); }} />
          {/* <FaCog className="text-lg md:text-xl text-gray-400 hover:text-blue-600 cursor-pointer" /> */}
        </div>
        <div className="flex flex-col items-center">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="profile"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-blue-600 cursor-pointer"
            onClick={() => setShowProfile(true)}
          />
        </div>
      </aside>
      {/* Main Content or Profile Page */}
      {showProfile ? (
        <AccountInfoPage onBack={() => setShowProfile(false)} />
      ) : activeSidebar === 1 ? (
        <UserRoles />
      ) : activeSidebar === 2 ? (
        <AdminJobs />
      ) : activeSidebar === 3 ? (
        <AdminCompanyDetails />
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 md:px-8 py-4 md:py-6 bg-white gap-4">
            <div>
              <div className="text-xs text-blue-600 font-semibold">DASHBOARD</div>
              <h1 className="text-xl md:text-2xl font-bold">Admin Overview</h1>
            </div>
          </div>
          {/* Separator Line */}
          <div className="flex justify-center px-4 md:px-8">
            <div className="w-4/5 h-px bg-gray-200"></div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4 md:px-8 py-6">
            {stats.map((stat, idx) => {
              // Determine if change is positive, negative, or neutral
              const isPositive = stat.change.includes('+') && !stat.change.includes('0 (0%)');
              const isNegative = stat.change.includes('-') && !stat.change.includes('0 (0%)');
              const isNeutral = stat.change.includes('0 (0%)');

              return (
                <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-lg">{stat.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-gray-600 text-sm font-medium">{stat.label}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${isPositive ? 'bg-green-50 text-green-600' :
                        isNegative ? 'bg-red-50 text-red-600' :
                          'bg-gray-50 text-gray-600'
                      }`}>
                      <span className={`text-xs ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                        {isPositive ? '▲' : isNegative ? '▼' : '—'}
                      </span>
                      <span>{stat.percentageDisplay}</span>
                    </div>
                    <span className="text-gray-400 text-xs">{stat.since}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Dashboard Content */}
          <div className="flex flex-col gap-4 md:gap-6 px-4 md:px-8 pb-4 md:pb-8">
            {/* Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-8">
              <div className="font-bold text-xl md:text-2xl mb-6">Company Stats</div>
              <div className="w-full h-64 md:h-80 relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-4 flex flex-col justify-between h-56 md:h-72 z-10">
                  <span className="text-gray-400 font-semibold text-sm">30K</span>
                  <span className="text-gray-400 font-semibold text-sm">20K</span>
                  <span className="text-gray-400 font-semibold text-sm">10K</span>
                  <span className="text-gray-400 font-semibold text-sm">0</span>
                </div>
                {/* Chart SVG */}
                <svg viewBox="0 0 1200 240" className="w-full h-56 md:h-72">
                  {/* Area gradient */}
                  <defs>
                    <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  <g stroke="#f3f4f6" strokeWidth="1" opacity="0.5">
                    <line x1="0" y1="60" x2="1200" y2="60" />
                    <line x1="0" y1="120" x2="1200" y2="120" />
                    <line x1="0" y1="180" x2="1200" y2="180" />
                  </g>

                  {/* Dashed line (comparison/target) */}
                  <polyline
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="1"
                    strokeDasharray="6,4"
                    points="0,132 133,168 266,60 399,120 532,108 665,96 798,72 931,84 1064,84 1197,72"
                    opacity="0.6"
                  />

                  {/* Main solid line */}
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    points="0,108 133,144 266,96 399,72 532,72 665,36 798,12 931,24 1064,60 1197,48"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(37, 99, 235, 0.1))' }}
                  />

                  {/* Area under main line */}
                  <polygon
                    fill="url(#area-gradient)"
                    points="0,240 0,108 133,144 266,96 399,72 532,72 665,36 798,12 931,24 1064,60 1197,48 1197,240"
                  />
                </svg>

                {/* X-axis labels */}
                <div className="absolute left-0 right-0 bottom-2 flex justify-between text-gray-500 font-semibold text-sm px-4">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                </div>
              </div>
            </div>
            {/* User Table */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow p-4 md:p-8 border">
              <div className="font-bold text-xl md:text-2xl mb-4 md:mb-6">User Account Overview</div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-4 mb-4">
                <button className="bg-black text-white px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium focus:outline-none">All Data <span className="ml-1">▼</span></button>
                <button className="bg-black text-white px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium focus:outline-none">2022 <span className="ml-1">▼</span></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 text-sm md:text-base border-b font-medium">
                      <th className="py-3 md:py-4 pl-2">User Name</th>
                      <th className="py-3 md:py-4">Role</th>
                      <th className="py-3 md:py-4">Status</th>
                      <th className="py-3 md:py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                        <td className="py-3 md:py-5 pl-2 text-sm md:text-base font-normal">{user.name}</td>
                        <td className="py-3 md:py-5 text-sm md:text-base font-normal">{user.role}</td>
                        <td className="py-3 md:py-5 text-sm md:text-base font-normal">{user.status}</td>
                        <td className="py-3 md:py-5 text-sm md:text-base font-normal"><button className="text-blue-500 hover:underline">Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



const users = [
  { name: 'Sita', role: 'Ux Designer', status: 'Activate' },
  { name: 'Geta', role: 'Developer', status: 'Inactivate' },
  { name: 'Joy', role: 'Sales Manager', status: 'Activate' },
  { name: 'Jack', role: 'Developer', status: 'Inactivate' },
  { name: 'Sia', role: 'Ux Designer', status: 'Activate' },
  { name: 'Sam', role: 'Developer', status: 'Inactivate' },
  { name: 'Sam', role: 'Developer', status: 'Inactivate' },
];

const settingsNav = [
  { name: 'Account Info' },
  { name: 'Change Password' },
  { name: 'Email Notification' },
  { name: 'Organization Info' },
  { name: 'Logout' },
];

function AccountInfoPage({ onBack }) {
  const [activeTab, setActiveTab] = useState('Account Info');
  const [isLoading, setIsLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullname: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: ''
  });
  const [formData, setFormData] = useState({
    fullname: '',
    dateOfBirth: '',
    gender: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    setError('');
    try {
      console.log('Fetching profile data...');

      // Get user info from localStorage like other admin components
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.status === 200) {
        const admin = data.data;
        const profile = {
          fullname: admin.fullname || '',
          dateOfBirth: admin.dateOfBirth ? new Date(admin.dateOfBirth).toISOString().split('T')[0] : '',
          gender: admin.gender || '',
          email: admin.email || '',
          phone: admin.phone || ''
        };
        setProfileData(profile);
        setFormData(profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      console.error('Error details:', err.message);
      setError(`Failed to load profile data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get user info from localStorage like other admin components
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 200) {
        setProfileData(formData);
        setSuccess('Profile updated successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(`Failed to update profile: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call the logout utility function with user type for proper redirection
      await logoutUser(navigate, user?.type);

      // Update the auth context
      logout();

    } catch (err) {
      console.error(err);
    }
  };

  const handleTabClick = (tabName) => {
    if (tabName === 'Logout') {
      handleLogout();
    } else {
      setActiveTab(tabName);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Settings Sidebar */}
      <aside className="w-48 md:w-64 border-r pt-16 px-3 md:px-4 lg:px-8 bg-white">
        <div className="text-xs text-gray-400 font-semibold mb-4 md:mb-6 tracking-widest">SETTINGS</div>
        <ul className="space-y-3 md:space-y-4">
          {settingsNav.map((item) => (
            <li
              key={item.name}
              className={`font-medium cursor-pointer text-sm md:text-base ${activeTab === item.name ? 'text-blue-600' : 'text-gray-700'}`}
              onClick={() => handleTabClick(item.name)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-start pt-16 px-4 md:px-8 lg:px-16 w-full">
        {activeTab === 'Account Info' && (
          <div className="w-full max-w-3xl">
            <div className="text-2xl font-bold mb-1">Account Info</div>
            <div className="mb-6 text-gray-500 text-sm max-w-xl">
              Manage your account information and personal details. You can update your profile information here.
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">Full Name</label>
                    <input
                      type="text"
                      className="w-full border border-blue-500 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600 bg-white transition-colors"
                      value={formData.fullname}
                      onChange={(e) => handleInputChange('fullname', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">Date of Birth</label>
                    <input
                      type="date"
                      className="w-full border border-blue-500 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600 bg-white transition-colors"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">Gender</label>
                    <select
                      className="w-full border border-blue-500 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600 bg-white transition-colors"
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                      value={formData.email}
                      readOnly
                      disabled
                    />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-blue-500 bg-gray-50 rounded-l-lg text-gray-500 text-sm">
                        <img src="https://flagcdn.com/in.svg" alt="IN" className="w-5 h-5 mr-1" />+91
                      </span>
                      <input
                        type="text"
                        className="flex-1 border border-blue-500 rounded-r-lg px-4 py-2 focus:outline-none focus:border-blue-600 bg-white transition-colors"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    onClick={handleSaveChanges}
                    disabled={saveLoading}
                  >
                    {saveLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <FaSave className="text-sm" />
                    )}
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        {activeTab === 'Change Password' && <PasswordSecuritiesForm />}
        {activeTab === 'Email Notification' && <EmailNotificationSettings />}
        {activeTab === 'Organization Info' && <OrganizationInfoForm />}
        {/* Add other tab content as needed */}
      </div>
    </div>
  );
}

function PasswordSecuritiesForm() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      setError('Current password is required');
      return false;
    }
    if (!formData.newPassword.trim()) {
      setError('New password is required');
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get user info from localStorage like other admin components
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/update-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password updated successfully!');
        // Clear form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="text-2xl font-bold mb-1">Password & Security</div>
      <div className="mb-6 text-gray-500 text-sm max-w-xl">
        Update your password to keep your account secure. Make sure to use a strong password that you can remember.
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form className="bg-white border rounded-2xl p-8 space-y-6 shadow" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-gray-500 text-sm mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              className="w-full border border-blue-500 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-blue-600"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              placeholder="Enter your current password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => togglePasswordVisibility('current')}
            >
              {showPasswords.current ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-500 text-sm mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                className="w-full border border-blue-500 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-blue-600"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                className="w-full border border-blue-500 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-blue-600"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FaSave className="text-sm" />
            )}
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

function EmailNotificationSettings() {
  const notifications = [
    {
      id: 1,
      leftTitle: 'Notification from us',
      leftDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisi. Arcu ullamcorper a in molestie et risus pulvinar orci vel.',
      enabled: true,
      rightTitle: 'New Job Assigned',
      rightDesc: 'Get News about product and feature updates.'
    },
    {
      id: 2,
      leftTitle: 'Notification from us',
      leftDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisi. Arcu ullamcorper a in molestie et risus pulvinar orci vel.',
      enabled: true,
      rightTitle: 'Candidate No-show',
      rightDesc: 'Get News about product and feature updates.'
    },
    {
      id: 3,
      leftTitle: 'Notification from us',
      leftDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisi. Arcu ullamcorper a in molestie et risus pulvinar orci vel.',
      enabled: true,
      rightTitle: 'Candidate No-show',
      rightDesc: 'Get News about product and feature updates.'
    },
    {
      id: 4,
      leftTitle: 'Notification from us',
      leftDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisi. Arcu ullamcorper a in molestie et risus pulvinar orci vel.',
      enabled: false,
      rightTitle: 'Scorecard Submission Reminder',
      rightDesc: 'Get News about product and feature updates.'
    },
    {
      id: 5,
      leftTitle: 'Notification from us',
      leftDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisi. Arcu ullamcorper a in molestie et risus pulvinar orci vel.',
      enabled: true,
      rightTitle: 'Deadline Reminder',
      rightDesc: 'Get News about product and feature updates.'
    },
  ];
  return (
    <div className="w-full max-w-5xl">
      <div className="text-2xl font-bold mb-1">Email Notification</div>
      <div className="mb-6 text-gray-500 text-sm max-w-xl">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisi. Arcu ullamcorper a in molestie et risus pulvinar orci vel.
      </div>
      <div className="divide-y divide-gray-200 border rounded-2xl bg-white shadow">
        {notifications.map((n) => (
          <div key={n.id} className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-6">
            <div className="flex-1 min-w-0 mb-2 md:mb-0">
              <div className="font-semibold text-base text-black mb-1">{n.leftTitle}</div>
              <div className="text-gray-500 text-sm max-w-md">{n.leftDesc}</div>
            </div>
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              {/* Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${n.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  tabIndex="0"
                >
                  <span
                    className={`inline-block w-5 h-5 transform bg-white rounded-full shadow transition-transform duration-200 ${n.enabled ? 'translate-x-6' : ''}`}
                  />
                </button>
                <span className={`text-xs font-semibold ${n.enabled ? 'text-blue-600' : 'text-gray-400'}`}>{n.enabled ? 'Yes' : 'NO'}</span>
              </div>
              {/* Right label */}
              <div className="min-w-[160px]">
                <div className="font-semibold text-sm text-black">{n.rightTitle}</div>
                <div className="text-gray-400 text-xs">{n.rightDesc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrganizationInfoForm() {
  return (
    <div className="w-full max-w-3xl">
      <form className="space-y-5">
        <div>
          <label className="block text-gray-500 text-sm mb-1">Domain</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" value="Technology" readOnly />
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1">Company Name</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" value="Company" readOnly />
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1">Company Type</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" value="PVT .ltd" readOnly />
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1">Director Name</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" value="djsgbhudhj" readOnly />
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1">Founder Name</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" value="djsgbhudhj" readOnly />
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1">Internal Notes</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" rows={3} readOnly>Note..</textarea>
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1">Location</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" value="Punjab" readOnly />
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1">Employee Number</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" value="200-500" readOnly />
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1">About Section</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" rows={3} readOnly>Dxdfcgvbhncghvj mn m bmmcgvhbjnkm</textarea>
        </div>
      </form>
    </div>
  );
}

function CreateUserForm({ role, onBack }) {
  // Get admin's fullname from localStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const adminFullname = userInfo?.data?.user?.fullname || 'Admin';

  const [formData, setFormData] = useState({
    fullname: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    onboardedBy: adminFullname // Prefill with admin's fullname
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreateUser = async () => {
    // Validate form
    if (!formData.fullname.trim() || !formData.email.trim() || !formData.dateOfBirth || !formData.gender) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Get user info from localStorage
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        toast.error('No authentication token found');
        return;
      }

      const randomPassword = generateRandomPassword();

      const requestData = {
        fullname: formData.fullname,
        email: formData.email,
        password: randomPassword,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        onboardedBy: formData.onboardedBy || 'Admin',
        adminId: userInfo.data.user._id
      };

      let endpoint = '';
      switch (role) {
        case 'recruiter':
          endpoint = '/api/recruiter/create-by-admin';
          break;
        case 'manager':
          endpoint = '/api/manager/create-by-admin';
          break;
        case 'account manager':
          endpoint = '/api/accountmanager/create-by-admin';
          break;
        default:
          toast.error('Invalid role');
          return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`User created successfully! Password reset link has been sent to ${formData.email}`);
        // Clear form but keep the admin's name in onboardedBy
        setFormData({
          fullname: '',
          dateOfBirth: '',
          gender: '',
          email: '',
          phone: '',
          onboardedBy: adminFullname // Keep the admin's name
        });
        // Refresh user counts and user list
        if (typeof window.fetchUserCounts === 'function') {
          window.fetchUserCounts();
        }
        if (typeof window.fetchUsers === 'function') {
          window.fetchUsers();
        }
      } else {
        toast.error(data.message || 'Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      toast.error('Failed to create user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 px-8 py-8">
      <div className="text-xs text-blue-600 font-semibold mb-2">CREATE {role.toUpperCase()}</div>
      <div className="text-3xl font-bold mb-8">Fill in the form</div>

      <form className="space-y-6 max-w-5xl" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-1">
            <label className="block text-gray-500 text-sm mb-1">Full Name *</label>
            <input
              type="text"
              className="w-full border border-blue-500 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-lg"
              value={formData.fullname}
              onChange={(e) => handleInputChange('fullname', e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-1">
            <label className="block text-gray-500 text-sm mb-1">DOB *</label>
            <input
              type="date"
              className="w-full border border-blue-500 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-lg"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              required
            />
          </div>
          <div className="col-span-1 md:col-span-1">
            <label className="block text-gray-500 text-sm mb-1">Gender *</label>
            <select
              className="w-full border border-blue-500 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-lg"
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-500 text-sm mb-1">Email *</label>
            <input
              type="email"
              className="w-full border border-blue-500 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-lg"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Phone</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-blue-500 bg-gray-50 rounded-l-lg text-gray-500 text-lg">
                <img src="https://flagcdn.com/in.svg" alt="IN" className="w-6 h-6 mr-1" />+91
              </span>
              <input
                type="text"
                className="w-full border border-blue-500 rounded-r-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-lg"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1">Onboarded by</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed text-lg"
            value={formData.onboardedBy}
            readOnly
            disabled
          />
          <p className="text-xs text-gray-400 mt-1">This field is automatically filled with your name</p>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            className="mt-4 bg-blue-600 text-white px-16 py-3 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCreateUser}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create'}
          </button>
          <button
            type="button"
            className="mt-4 bg-gray-500 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-600 transition-colors"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

function CreateUserRoles({ onBack }) {
  const [showForm, setShowForm] = useState(null); // null or 'manager' | 'recruiter' | 'account manager'
  const [userCounts, setUserCounts] = useState({
    managers: 0,
    recruiters: 0,
    accountManagers: 0
  });

  // Fetch user counts on component mount
  useEffect(() => {
    fetchUserCounts();
  }, []);

  const fetchUserCounts = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/user-counts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserCounts(data.data);
      }
    } catch (error) {
      console.error('Error fetching user counts:', error);
    }
  };

  const roles = [
    {
      key: 'manager',
      title: 'Create Manager',
      tooltip: 'Add a manager who can oversee jobs and recruiters',
      list: `${userCounts.managers} Manager List`, // Total count of users with type 'manager' in database
    },
    {
      key: 'recruiter',
      title: 'Create Recruiter',
      tooltip: 'Add a manager who can oversee jobs and recruiters',
      list: `${userCounts.recruiters} Recruiter List`, // Total count of users with type 'recruiter' in database
    },
    {
      key: 'account manager',
      title: 'Create Account Manager',
      tooltip: 'Add a manager who can oversee jobs and recruiters',
      list: `${userCounts.accountManagers} Account Manager List`, // Total count of users with type 'accountmanager' in database
    },
  ];
  if (showForm) return <CreateUserForm role={showForm} onBack={() => setShowForm(null)} />;
  return (
    <div className="flex-1 px-8 py-8">
      <div className="text-xs text-blue-600 font-semibold mb-2">ADMIN</div>
      <div className="text-2xl font-bold mb-8">Create User Roles</div>
      <div className="space-y-8">
        {roles.map((role, idx) => (
          <div key={idx} className="bg-white border rounded-xl shadow p-0">
            <div className="flex flex-col md:flex-row items-center justify-between px-6 pt-6 pb-0 mb-2">
              <button className="border border-blue-600 text-blue-600 rounded-lg px-8 py-2 font-medium mb-4 md:mb-0 md:mr-8 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 transition mb-4 cursor-pointer" onClick={() => setShowForm(role.key)}>{role.title}</button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium flex items-center gap-2 w-full md:w-auto justify-center md:justify-end focus:outline-none mt-4 md:mt-0">
                <span className="text-lg">👥</span>
                {role.list}
              </button>
            </div>
            <div className="bg-gray-100 rounded-b-xl px-6 py-4 flex items-center gap-3">
              <span className="text-2xl text-gray-400">💡</span>
              <div>
                <div className="font-medium text-gray-700 text-lg">Tooltip</div>
                <div className="text-gray-500 text-base">{role.tooltip}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserRoles() {
  const [showCreate, setShowCreate] = useState(false);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Store all users for filtering
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'disabled'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Fetch users on component mount and when page changes
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        console.error('No authentication token found');
        return;
      }

      // Fetch all users for filtering (no pagination)
      const allUsersResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users?limit=1000`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch paginated users for display
      const paginatedResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users?page=${currentPage}&limit=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (allUsersResponse.ok && paginatedResponse.ok) {
        const allUsersData = await allUsersResponse.json();
        const paginatedData = await paginatedResponse.json();

        setAllUsers(allUsersData.data.users); // All users for filtering
        setUsers(paginatedData.data.users); // Paginated users for display
        setTotalPages(paginatedData.data.pagination.totalPages);
        setTotalUsers(paginatedData.data.pagination.totalUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);

    // Apply current filters to all users
    let filteredUsers = allUsers;

    if (activeFilter === 'active') {
      filteredUsers = allUsers.filter(user => user.status === 'active');
    } else if (activeFilter === 'disabled') {
      filteredUsers = allUsers.filter(user => user.status === 'disabled');
    }

    // Apply search filter if there's a search term
    if (searchTerm.trim()) {
      filteredUsers = filteredUsers.filter(user =>
        user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Get users for the requested page
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    const pageUsers = filteredUsers.slice(startIndex, endIndex);

    setUsers(pageUsers);
  };

  // Filter users based on status
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filtering

    // Apply filters to all users and get the first page
    let filteredUsers = allUsers;

    if (filter === 'active') {
      filteredUsers = allUsers.filter(user => user.status === 'active');
    } else if (filter === 'disabled') {
      filteredUsers = allUsers.filter(user => user.status === 'disabled');
    }

    // Apply search filter if there's a search term
    if (searchTerm.trim()) {
      filteredUsers = filteredUsers.filter(user =>
        user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Get first 10 users for display
    const firstPageUsers = filteredUsers.slice(0, 10);
    setUsers(firstPageUsers);

    // Update pagination info
    const totalFilteredUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalFilteredUsers / 10);
    setTotalPages(totalPages);
    setTotalUsers(totalFilteredUsers);
  };

  // Search functionality
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setCurrentPage(1); // Reset to first page when searching

    let filteredUsers = allUsers;

    // Apply status filter first
    if (activeFilter === 'active') {
      filteredUsers = filteredUsers.filter(user => user.status === 'active');
    } else if (activeFilter === 'disabled') {
      filteredUsers = filteredUsers.filter(user => user.status === 'disabled');
    }

    // Then apply search filter
    if (searchValue.trim()) {
      filteredUsers = filteredUsers.filter(user =>
        user.fullname?.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Get first 10 users for display
    const firstPageUsers = filteredUsers.slice(0, 10);
    setUsers(firstPageUsers);

    // Update pagination info
    const totalFilteredUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalFilteredUsers / 10);
    setTotalPages(totalPages);
    setTotalUsers(totalFilteredUsers);
  };

  // Handle delete button click
  const handleDeleteClick = (user, e) => {
    e.stopPropagation(); // Prevent row click
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        toast.error('No authentication token found');
        return;
      }

      // Use the unified admin delete endpoint
      const endpoint = `/api/admin/users/${userToDelete._id}`;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: userToDelete.source
        })
      });

      if (response.ok) {
        toast.success('User deleted successfully!');
        // Refresh the user list
        fetchUsers();
        // Refresh user counts in dashboard
        if (typeof window.fetchUserCounts === 'function') {
          window.fetchUserCounts();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. Please try again.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Handle edit/toggle button click
  const handleToggleClick = (user, e) => {
    e.stopPropagation(); // Prevent row click
    setUserToToggle(user);
    setShowToggleModal(true);
  };

  // Handle toggle confirmation
  const handleToggleConfirm = async () => {
    if (!userToToggle) return;

    setToggleLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        toast.error('No authentication token found');
        return;
      }

      const newStatus = userToToggle.status === 'active' ? 'disabled' : 'active';
      const actionText = newStatus === 'active' ? 'activate' : 'disable';

      // Use the unified admin toggle endpoint
      const endpoint = `/api/admin/users/${userToToggle._id}/toggle-status`;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: userToToggle.source,
          newStatus: newStatus
        })
      });

      if (response.ok) {
        toast.success(`User ${actionText}d successfully!`);
        // Refresh the user list
        fetchUsers();
        // Refresh user counts in dashboard
        if (typeof window.fetchUserCounts === 'function') {
          window.fetchUserCounts();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${actionText} user`);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to toggle user status. Please try again.');
    } finally {
      setToggleLoading(false);
      setShowToggleModal(false);
      setUserToToggle(null);
    }
  };

  // Handle toggle cancel
  const handleToggleCancel = () => {
    setShowToggleModal(false);
    setUserToToggle(null);
  };

  if (showCreate) return <CreateUserRoles onBack={() => setShowCreate(false)} />;
  return (
    <div className="flex-1 px-2 sm:px-4 md:px-8 py-4 md:py-8 w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-4">
        <div>
          <div className="text-xl md:text-2xl font-bold">User Roles</div>
          <div className="text-gray-500 text-sm">Reviewing the roles list</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 md:px-5 py-2 rounded-lg font-medium cursor-pointer transition-colors ${activeFilter === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            onClick={() => handleFilterChange('all')}
          >
            All ({allUsers.length})
          </button>
          <button
            className={`px-4 md:px-5 py-2 rounded-lg font-medium cursor-pointer transition-colors ${activeFilter === 'active'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            onClick={() => handleFilterChange('active')}
          >
            Active ({allUsers.filter(u => u.status === 'active').length})
          </button>
          <button
            className={`px-4 md:px-5 py-2 rounded-lg font-medium cursor-pointer transition-colors ${activeFilter === 'disabled'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            onClick={() => handleFilterChange('disabled')}
          >
            Disabled ({allUsers.filter(u => u.status === 'disabled').length})
          </button>
          <button
            className="px-4 md:px-5 py-2 rounded-lg border border-black text-black font-medium cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowCreate(true)}
          >
            Add +
          </button>
        </div>
      </div>
      <div className="bg-gray-100 rounded-lg px-2 md:px-4 py-2 flex items-center mb-2">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="bg-gray-100 outline-none w-full text-sm md:text-base"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm md:text-base">
            <thead>
              <tr className="text-gray-500 border-b border-gray-200">
                <th className="py-3">Name</th>
                <th className="py-3">Role</th>
                <th className="py-3">Status</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user._id || idx} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition cursor-pointer">
                  <td className="py-6 flex items-center gap-3 min-w-[200px]">
                    <img
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      alt={user.fullname}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="flex flex-col">
                      <div className="font-bold text-black text-base leading-tight">{user.fullname}</div>
                      <div className="text-gray-500 text-sm leading-tight">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-6 text-left text-sm md:text-base font-normal min-w-[120px] capitalize">
                    {user.type === 'accountmanager' ? 'Account Manager' : user.type}
                  </td>
                  <td className="py-6 text-left min-w-[100px]">
                    {user.status === 'active' ? (
                      <span className="text-green-600 font-semibold text-sm">Success</span>
                    ) : (
                      <span className="text-red-500 font-semibold text-sm">Disabled</span>
                    )}
                  </td>
                  <td className="py-6 text-left min-w-[100px]">
                    <div className="flex items-center gap-1 text-gray-500">
                      <FaEdit
                        className="cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={(e) => handleToggleClick(user, e)}
                      />
                      <span className="text-gray-300">/</span>
                      <FaTrash
                        className="cursor-pointer hover:text-red-600 transition-colors"
                        onClick={(e) => handleDeleteClick(user, e)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{userToDelete?.fullname}</span>?
                This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleteLoading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Exit
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Status Confirmation Modal */}
      {showToggleModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEdit className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {userToToggle?.status === 'active' ? 'Disable User' : 'Activate User'}
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to{' '}
                <span className="font-semibold">
                  {userToToggle?.status === 'active' ? 'disable' : 'activate'}
                </span>{' '}
                <span className="font-semibold">{userToToggle?.fullname}</span>?
                {userToToggle?.status === 'active'
                  ? ' They will not be able to access the system.'
                  : ' They will be able to access the system.'
                }
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleToggleCancel}
                  disabled={toggleLoading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Exit
                </button>
                <button
                  onClick={handleToggleConfirm}
                  disabled={toggleLoading}
                  className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer ${userToToggle?.status === 'active'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  {toggleLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {userToToggle?.status === 'active' ? 'Disabling...' : 'Activating...'}
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateJob({ onBack }) {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [keyResponsibilities, setKeyResponsibilities] = useState([]);
  const [keyRespInput, setKeyRespInput] = useState("");
  const [preferredQualifications, setPreferredQualifications] = useState([]);
  const [prefQualInput, setPrefQualInput] = useState("");
  const [hiringDeadline, setHiringDeadline] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [priority, setPriority] = useState([]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [experience, setExperience] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Add point handlers
  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };
  const handleRemoveSkill = (idx) => setSkills(skills.filter((_, i) => i !== idx));

  const handleAddKeyResp = () => {
    if (keyRespInput.trim()) {
      setKeyResponsibilities([...keyResponsibilities, keyRespInput.trim()]);
      setKeyRespInput("");
    }
  };
  const handleRemoveKeyResp = (idx) => setKeyResponsibilities(keyResponsibilities.filter((_, i) => i !== idx));

  const handleAddPrefQual = () => {
    if (prefQualInput.trim()) {
      setPreferredQualifications([...preferredQualifications, prefQualInput.trim()]);
      setPrefQualInput("");
    }
  };
  const handleRemovePrefQual = (idx) => setPreferredQualifications(preferredQualifications.filter((_, i) => i !== idx));

  // Priority handler
  const handlePriorityChange = (level) => {
    setPriority((prev) =>
      prev.includes(level) ? prev.filter((p) => p !== level) : [...prev, level]
    );
  };

  // Create job handler
  const handleCreateJob = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        toast.error("No authentication token found");
        return;
      }

      // Validate required fields
      if (!jobTitle.trim()) {
        toast.error("Job title is required");
        setIsLoading(false);
        return;
      }

      if (!type) {
        toast.error("Job type is required");
        setIsLoading(false);
        return;
      }

      // Validate hiring deadline
      if (hiringDeadline) {
        const deadlineDate = new Date(hiringDeadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

        if (deadlineDate <= today) {
          toast.error("Hiring deadline must be greater than today's date");
          setIsLoading(false);
          return;
        }
      }

      // Compose salary object
      const salary = {
        min: salaryMin ? Number(salaryMin) : 0,
        max: salaryMax ? Number(salaryMax) : 0
      };

      // Compose payload
      const payload = {
        jobtitle: jobTitle,
        description,
        location,
        type,
        employmentType,
        salary,
        openpositions: 1, // or add a field for this
        skills,
        experience: experience ? Number(experience) : 0,
        keyResponsibilities,
        preferredQualifications,
        priority,
        company: company, // Include company name
        hiringDeadline: hiringDeadline || null,
        internalNotes: internalNotes || "",
      };

      console.log("Creating job with payload:", payload);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/addjob`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userInfo.data.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        toast.success("Job created successfully!");
        // Refresh jobs list if the function exists
        if (typeof window.refreshJobs === 'function') {
          window.refreshJobs();
        }
        // Go back to jobs list
        onBack();
      } else {
        toast.error(data.message || "Failed to create job");
      }
    } catch (err) {
      console.error("Error creating job:", err);
      toast.error("Failed to create job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      <div className="flex items-center px-8 pt-8">
        <button onClick={onBack} className="mr-4 text-2xl text-gray-500 hover:text-blue-600 font-bold">←</button>
        <h1 className="text-3xl font-bold">Create Job</h1>
      </div>
      <form id="create-job-form" className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 pt-8 w-full flex-1" onSubmit={handleCreateJob}>
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-gray-500 text-sm mb-1">Job Title</label>
            <input type="text" placeholder="Frontend Developer" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 bg-white text-base" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Company</label>
            <input type="text" placeholder="Company" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 bg-white text-base" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Location</label>
            <input type="text" placeholder="Remote" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 bg-white text-base" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Type</label>
            <select className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 bg-white text-base" value={type} onChange={e => setType(e.target.value)} required>
              <option value="">Select Type</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Employment Type</label>
            <input type="text" placeholder="Full-time" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 bg-white text-base" value={employmentType} onChange={e => setEmploymentType(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Job Description</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 bg-white text-base min-h-[100px]" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          {/* Required Skills & Expertise */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Required Skills & Expertise</label>
            <div className="flex gap-2 mb-2">
              <input type="text" className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base" placeholder="Add a skill point" value={skillInput} onChange={e => setSkillInput(e.target.value)} />
              <button type="button" className="bg-blue-600 text-white px-3 py-2 rounded-lg" onClick={handleAddSkill}>+</button>
            </div>
            <ul className="list-disc pl-6">
              {skills.map((skill, idx) => (
                <li key={idx} className="flex items-center justify-between mb-1">
                  <span>{skill}</span>
                  <button type="button" className="text-red-400 ml-2" onClick={() => handleRemoveSkill(idx)}>×</button>
                </li>
              ))}
            </ul>
          </div>
          {/* Key Responsibilities */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Key Responsibilities</label>
            <div className="flex gap-2 mb-2">
              <input type="text" className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base" placeholder="Add a responsibility" value={keyRespInput} onChange={e => setKeyRespInput(e.target.value)} />
              <button type="button" className="bg-blue-600 text-white px-3 py-2 rounded-lg" onClick={handleAddKeyResp}>+</button>
            </div>
            <ul className="list-disc pl-6">
              {keyResponsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-center justify-between mb-1">
                  <span>{resp}</span>
                  <button type="button" className="text-red-400 ml-2" onClick={() => handleRemoveKeyResp(idx)}>×</button>
                </li>
              ))}
            </ul>
          </div>
          {/* Preferred Qualifications */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Preferred Qualifications (Nice to Have)</label>
            <div className="flex gap-2 mb-2">
              <input type="text" className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base" placeholder="Add a qualification" value={prefQualInput} onChange={e => setPrefQualInput(e.target.value)} />
              <button type="button" className="bg-blue-600 text-white px-3 py-2 rounded-lg" onClick={handleAddPrefQual}>+</button>
            </div>
            <ul className="list-disc pl-6">
              {preferredQualifications.map((qual, idx) => (
                <li key={idx} className="flex items-center justify-between mb-1">
                  <span>{qual}</span>
                  <button type="button" className="text-red-400 ml-2" onClick={() => handleRemovePrefQual(idx)}>×</button>
                </li>
              ))}
            </ul>
          </div>
          {/* Salary */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-500 text-sm mb-1">Salary Min</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base" placeholder="Min" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} min={0} />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Salary Max</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base" placeholder="Max" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} min={0} />
            </div>
          </div>
          {/* Experience */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Experience (years)</label>
            <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base" placeholder="Years" value={experience} onChange={e => setExperience(e.target.value)} min={0} />
          </div>
          {/* Hiring Deadline */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Hiring Deadline</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base"
              value={hiringDeadline}
              onChange={e => setHiringDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Set minimum date to today
            />
            <p className="text-xs text-gray-500 mt-1">Deadline must be after today's date</p>
          </div>
          {/* Internal Notes */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Internal Notes</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base min-h-[60px]" value={internalNotes} onChange={e => setInternalNotes(e.target.value)} />
          </div>
          {/* Priority */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Priority</label>
            <div className="flex flex-col gap-2 mt-2">
              {['Low', 'Medium', 'High'].map((level) => (
                <label key={level} className="flex items-center gap-2">
                  <input type="checkbox" className="form-checkbox accent-blue-600" checked={priority.includes(level)} onChange={() => handlePriorityChange(level)} /> {level}
                </label>
              ))}
            </div>
          </div>
        </div>
      </form>
      <div className="px-8 pt-4 pb-8">
        <button
          type="submit"
          form="create-job-form"
          className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 rounded-lg font-semibold text-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </div>
          ) : (
            "Create"
          )}
        </button>
      </div>
    </div>
  );
}

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobCounts, setJobCounts] = useState({ all: 0, opened: 0, urgent: 0, closed: 0 });
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCandidateList, setShowCandidateList] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);

  // Fetch jobs on component mount and when page/filter changes
  useEffect(() => {
    fetchJobs();
    fetchJobCounts();
  }, [currentPage, activeFilter]);

  // Make fetchJobs available globally for other components
  useEffect(() => {
    window.refreshJobs = () => {
      fetchJobs();
      fetchJobCounts();
    };
    return () => {
      delete window.refreshJobs;
    };
  }, [currentPage, activeFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/admin/jobs?page=${currentPage}&limit=10&filter=${activeFilter}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.data.jobs);
        setTotalPages(data.data.pagination.totalPages);
        setTotalJobs(data.data.pagination.totalJobs);
      } else {
        console.error('Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobCounts = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/admin/job-counts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJobCounts(data.data);
      } else {
        console.error('Failed to fetch job counts');
      }
    } catch (error) {
      console.error('Error fetching job counts:', error);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getFilterCounts = () => {
    return jobCounts;
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  const handleBack = () => {
    setSelectedJob(null);
    setShowCandidateList(false);
  };

  const handleShowCandidates = () => {
    setShowCandidateList(true);
  };

  const handleBackToJobDetails = () => {
    setShowCandidateList(false);
  };

  if (selectedJob) {
    if (showCandidateList) {
      return <CandidateList job={selectedJob} onBack={handleBackToJobDetails} />;
    }
    return <JobDetails job={selectedJob} onBack={handleBack} onShowCandidates={handleShowCandidates} />;
  }

  if (showCreateJob) {
    return <CreateJob onBack={() => setShowCreateJob(false)} />;
  }

  const filterCounts = getFilterCounts();

  return (
    <div className="bg-gray-50 w-full px-2 sm:px-4 md:px-8 lg:px-16 py-0 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-8 pt-8 border-b border-gray-200 mb-8 gap-4">
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-black mb-1">Jobs</h1>
          <p className="text-base text-gray-500">Manage and track all your job posting here</p>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex gap-4 flex-wrap">
            <button
              className={`rounded-lg px-6 py-2 text-base font-semibold shadow border border-black cursor-pointer transition-colors ${activeFilter === 'all' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              onClick={() => handleFilterChange('all')}
            >
              All Jobs ({filterCounts.all})
            </button>
            <button
              className={`rounded-lg px-6 py-2 text-base font-semibold border border-black cursor-pointer transition-colors ${activeFilter === 'opened' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              onClick={() => handleFilterChange('opened')}
            >
              Opened Jobs ({filterCounts.opened})
            </button>
            <button
              className={`rounded-lg px-6 py-2 text-base font-semibold border border-black cursor-pointer transition-colors ${activeFilter === 'urgent' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              onClick={() => handleFilterChange('urgent')}
            >
              Urgent ({filterCounts.urgent})
            </button>
            <button
              className={`rounded-lg px-6 py-2 text-base font-semibold border border-black cursor-pointer transition-colors ${activeFilter === 'closed' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              onClick={() => handleFilterChange('closed')}
            >
              Closed Jobs ({filterCounts.closed})
            </button>
          </div>
        </div>
        <button
          className="ml-0 md:ml-8 px-10 py-2 rounded-xl border border-blue-500 text-lg font-semibold text-black bg-white hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
          style={{ boxShadow: '0 0 0 2px #2563eb' }}
          onClick={() => setShowCreateJob(true)}
        >
          Create Job
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div>
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} onClick={handleJobClick} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-3 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Admin;




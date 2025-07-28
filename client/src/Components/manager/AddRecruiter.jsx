import React, { useState } from "react";

export default function AddRecruiter({ onClose }) {
  // Get manager's info from localStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const managerFullname = userInfo?.data?.user?.fullname || 'Manager';
  const managerId = userInfo?.data?.user?._id;

  const [form, setForm] = useState({
    fullname: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    onboardedBy: managerFullname // Prefill with manager's fullname
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!form.fullname.trim() || !form.email.trim() || !form.dateOfBirth || !form.gender) {
      alert('Please fill in all required fields');
      return;
    }

    if (!form.email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get user info from localStorage
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        alert('No authentication token found');
        return;
      }

      const randomPassword = generateRandomPassword();
      
      const requestData = {
        fullname: form.fullname,
        email: form.email,
        password: randomPassword,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        phone: form.phone,
        onboardedBy: form.onboardedBy || 'Manager',
        managerId: managerId
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/create-by-manager`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Recruiter created successfully! Password reset link has been sent to ${form.email}`);
        console.log('Password set URL:', data.data?.user?.resetPasswordToken ? 
          `${import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/recruiter/set_password/${data.data.user._id}/${data.data.user.resetPasswordToken}` : 
          'URL not available in response');
        
        // Clear form but keep the manager's name in onboardedBy
        setForm({
          fullname: "",
          dateOfBirth: "",
          gender: "",
          email: "",
          phone: "",
          onboardedBy: managerFullname // Keep the manager's name
        });
        
        if (onClose) onClose();
      } else {
        alert(data.message || 'Failed to create recruiter');
      }
    } catch (err) {
      console.error('Error creating recruiter:', err);
      alert('Failed to create recruiter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-start py-8 px-2 md:px-12">
      <div className="relative w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-none p-0 md:p-0">
        {/* Close Button */}
        <button
          className="absolute top-0 right-0 mt-2 mr-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="mb-2 text-xs text-blue-600 font-semibold tracking-wide mt-2 md:mt-4 ml-2 md:ml-0">ADD RECRUITER</div>
        <h2 className="text-2xl font-bold mb-8 text-gray-900 ml-2 md:ml-0">Fill in the form</h2>
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="flex flex-col col-span-2">
              <label className="text-sm text-gray-500 mb-1">Full Name</label>
              <input
                type="text"
                name="fullname"
                value={form.fullname}
                onChange={handleChange}
                className="border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full Name"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-500 mb-1">DOB</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-500 mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="flex flex-col">
              <label className="text-sm text-gray-500 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-500 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone Number"
                required
              />
            </div>
          </div>
          <div className="flex flex-col w-full">
            <label className="text-sm text-gray-500 mb-1">Onboarded by</label>
            <input
              type="text"
              name="onboardedBy"
              value={form.onboardedBy}
              onChange={handleChange}
              className="border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Manager Name"
              required
            />
          </div>
          <div className="flex justify-start mt-2 w-full">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-lg px-8 py-3 rounded-lg font-semibold shadow-none w-full md:w-56"
            >
              {isLoading ? 'Creating...' : 'Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
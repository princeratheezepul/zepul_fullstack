import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AccountManagerSignup = () => {
  const navigate = useNavigate();

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const adminId=userInfo.data.user._id;
  
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    fullname: '',
    adminId,
    type: 'accountmanager',
  });



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        
        alert('Signup successful!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add AccountManager</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="fullname"
          placeholder="Full name"
          value={form.fullname}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="type"
          placeholder="Type"
          value={form.type}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Add AccountManager
        </button>
      </form>
    </div>
  );
};

export default AccountManagerSignup;

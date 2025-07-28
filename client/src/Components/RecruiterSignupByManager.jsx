import React, { useState } from 'react';

const RecruiterSignup = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userId = userInfo?.data?.user?._id;

  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    type: 'recruiter',
    userId,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/signup`, {
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
      <h2 className="text-2xl font-bold mb-4">Add Recruiter (Manager)</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="border px-4 py-2 rounded" />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="border px-4 py-2 rounded" />
        <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} required className="border px-4 py-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Add Recruiter</button>
      </form>
    </div>
  );
};

export default RecruiterSignup;

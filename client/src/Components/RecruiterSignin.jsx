import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function recruiterSignin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("hit--");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/recruiter/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // IMPORTANT to receive cookie
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (res.ok) {
        console.log('Login successful, data:', data);
        console.log('Cookies after login:', document.cookie);
        console.log('Access token:', data.accessToken);
        console.log('Refresh token:', data.refreshToken);
        
        // Store user data in AuthContext with accessToken included
        const userData = {
          data: {
            user: {
              _id: data.user._id,
              email: data.user.email,
              username: data.user.username,
              fullname: data.user.fullname || '',
              type: data.user.type,
              adminId: data.user.adminId,
              userId: data.user.userId
            },
            accessToken: data.accessToken,
            refreshToken: data.refreshToken
          }
        };
        
        console.log('userData being stored:', userData);
        console.log('accessToken in userData:', userData.data.accessToken);
        
        // Store the userData in userInfo (this will be used by the login function)
        localStorage.setItem('userInfo', JSON.stringify(userData));
        
        // Verify what was stored
        const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
        console.log('Stored userInfo:', storedUserInfo);
        console.log('accessToken in stored userInfo:', storedUserInfo?.data?.accessToken);
        
        // Optionally, store authToken separately if needed
        if (data.accessToken) {
          localStorage.setItem('authToken', data.accessToken);
        }
        
        // Call login function but pass the complete userData
        login(userData);
        toast.success("Login successful!");
        navigate("/recruiter/dashboard");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Signin error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-gray-900">
            Login to your Account
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Please log in with the credentials provided to you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Id
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <a 
            href="/recruiter/forgot-password" 
            className="text-gray-600 hover:text-blue-600 cursor-pointer"
          >
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
}

export default recruiterSignin;

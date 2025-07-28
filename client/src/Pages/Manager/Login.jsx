import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to appropriate dashboard based on user type
      const dashboardRoutes = {
        'admin': '/admin',
        'manager': '/manager',
        'accountmanager': '/accountmanager'
      };
      
      const dashboardRoute = dashboardRoutes[user.type] || '/manager';
      navigate(dashboardRoute);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = { email, password };
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/login`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || "Invalid credentials");
      }
      const userData = await response.json();
      // Store token if present
      if (userData.token) {
        localStorage.setItem('authToken', userData.token);
      }
      // Use the AuthContext login function
      login(userData);
      
      // Redirect to appropriate dashboard based on user type
      const dashboardRoutes = {
        'admin': '/admin',
        'manager': '/manager',
        'accountmanager': '/accountmanager'
      };
      
      const dashboardRoute = dashboardRoutes[userData.data.user.type] || '/manager';
      navigate(dashboardRoute);
    } catch (error) {
      toast.error(error.message || "Login failed! ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Toaster position="top-center" />
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
          <span className="text-xl font-bold text-gray-900">ZEPUL</span>
        </div>
        <a href="#" className="text-gray-500 text-sm hover:underline">Help</a>
      </div>
      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-lg shadow-none px-6 py-10 flex flex-col space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Login to your Account</h2>
            <p className="text-sm text-gray-500">Please log in with the credentials provided to you</p>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Id
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Susheel@fesigns.com"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : null}
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <div className="text-center mt-2">
            <Link to="/manager/forgot-password" className="text-gray-500 text-sm hover:underline">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

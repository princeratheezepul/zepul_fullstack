import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const roleEndpoints = {
  recruiter: "/api/recruiter/signin",
  manager: "/api/manager/login",
  accountmanager: "/api/accountmanager/login"
};

const dashboardRoutes = {
  recruiter: "/recruiter",
  manager: "/manager",
  accountmanager: "/accountmanager"
};

export default function UnifiedLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("recruiter");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardRoute = dashboardRoutes[user.type] || "/";
      navigate(dashboardRoute);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const endpoint = roleEndpoints[role];
    if (!endpoint) {
      toast.error("Invalid role selected");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      const userData = await response.json();
      if (!response.ok) {
        throw new Error(userData.message || "Login failed");
      }
      // Store token if present
      if (userData.token || userData.accessToken) {
        localStorage.setItem('authToken', userData.token || userData.accessToken);
      }
      // Normalize recruiter response
      let normalizedUserData = userData;
      if (role === 'recruiter') {
        normalizedUserData = {
          data: {
            user: userData.user,
            accessToken: userData.accessToken,
            refreshToken: userData.refreshToken
          }
        };
      }
      login(normalizedUserData);
      toast.success("Login successful!");
      const dashboardRoute = dashboardRoutes[normalizedUserData.data?.user?.type] || "/";
      navigate(dashboardRoute);
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle button group for roles
  const roles = [
    { value: "recruiter", label: "Recruiter" },
    { value: "manager", label: "Manager" },
    { value: "accountmanager", label: "Account Manager" }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <Toaster position="top-center" />
      {/* Left illustration */}
      <div className="hidden md:flex flex-col justify-center items-center md:w-1/2 bg-gray-50 relative p-4">
        <img
          src="/Mobile login-cuate 1(1).png"
          alt="Illustration"
          className="w-full max-w-2xl md:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mb-8 object-contain"
        />
      </div>
      {/* Right login form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 min-h-screen px-4 py-8 md:py-0">
        <div className="w-full max-w-xl p-0 md:p-0 rounded-xl">
          <h2 className="text-3xl font-semibold mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8 text-sm">Your dashboard is ready to help you stay on track.</p>
          {/* Role toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              {roles.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer ${role === r.value ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              
              <a href="#" className="text-blue-600 hover:underline" onClick={(e) => {
                e.preventDefault();
                if (role === 'recruiter') navigate('/recruiter/forgot-password');
                else if (role === 'manager') navigate('/manager/forgot-password');
                else if (role === 'accountmanager') navigate('/accountmanager/forgot-password');
              }}>Forgot password?</a>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors text-base"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
            <span>
              By signing in your accepting our{' '}
              <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a>,{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </span>
            
          </div>
        </div>
      </div>
    </div>
  );
} 
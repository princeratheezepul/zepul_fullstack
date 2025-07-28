import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/ui/Loader.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
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
      
      const dashboardRoute = dashboardRoutes[user.type] || '/admin';
      navigate(dashboardRoute);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      email,
      password,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || "Login failed! ❌");
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
      
      const dashboardRoute = dashboardRoutes[userData.data.user.type] || '/admin';
      navigate(dashboardRoute);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
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
            Please log in with your admin credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

      </div>
      {isLoading && <Loader />}
    </div>
  );
}

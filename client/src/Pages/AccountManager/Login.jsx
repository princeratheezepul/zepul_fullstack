import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/ui/Loader.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/react.svg"; // Replace with your actual logo path
import toast from "react-hot-toast";

export default function AccountManagerLogin() {
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
      
      const dashboardRoute = dashboardRoutes[user.type] || '/accountmanager';
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
      console.log(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/login`);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const responseData = await response.json();
        toast.error(responseData.message || "Login failed! ❌");
        throw new Error(responseData.message || "Login failed! ❌");
      }

      const userData = await response.json();
      // Store token if present
      if (userData.token) {
        localStorage.setItem('authToken', userData.token);
      }
      // Use the AuthContext login function
      login(userData);
      toast.success("Login successful!");
      // Redirect to appropriate dashboard based on user type
      const dashboardRoutes = {
        'admin': '/admin',
        'manager': '/manager',
        'accountmanager': '/accountmanager'
      };
      
      const dashboardRoute = dashboardRoutes[userData.data.user.type] || '/accountmanager';
      navigate(dashboardRoute);
    } catch (error) {
      console.error("Login error:", error);
      if (!error.message.includes('Login failed!')) {
        toast.error(error.message || "An error occurred during login.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Header with logo and Help link */}
      <div className="flex justify-between items-center px-8 pt-8">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="ZEPUL Logo" className="h-7 w-7" />
          <span className="font-bold text-xl tracking-wide">ZEPUL</span>
        </div>
        <a href="#" className="text-gray-600 text-sm hover:underline">Help</a>
      </div>

      {/* Centered Login Card */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white p-10 rounded-xl max-w-md w-full relative">
          <h2 className="text-2xl font-bold text-black mb-1 text-left">Login to your Account</h2>
          <p className="text-gray-500 mb-8 text-left text-sm">Please log in with the credentials provided to you</p>
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div>
              <label htmlFor="email" className="block font-medium text-gray-700 mb-1 text-sm">
                Email Id
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder-gray-400"
              />
            </div>
            <div>
              <label htmlFor="password" className="block font-medium text-gray-700 mb-1 text-sm">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg uppercase font-semibold transition"
              disabled={isLoading}
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/accountmanager/forgot-password" className="text-gray-500 text-sm hover:underline">
              Forgot your password?
            </Link>
          </div>
        </div>
        {/* Loader overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
}

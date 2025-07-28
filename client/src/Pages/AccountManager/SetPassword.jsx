import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SetPassword = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alreadySet, setAlreadySet] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [userData, setUserData] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    label: "Weak",
    color: "bg-transparent",
    width: "0%",
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const getPasswordStrength = (password) => {
    if (password.length === 0) {
      return {
        label: "Weak",
        color: "bg-transparent",
        width: "0%",
      };
    }

    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (password.length < 8) {
      return { label: "Weak", color: "bg-red-500", width: "33%" };
    }

    if (hasLetters && hasNumbers && hasSpecial) {
      return { label: "Strong", color: "bg-green-500", width: "100%" };
    }

    if (
      (hasLetters && hasNumbers) ||
      (hasLetters && hasSpecial) ||
      (hasNumbers && hasSpecial)
    ) {
      return { label: "Average", color: "bg-orange-500", width: "66%" };
    }

    return { label: "Weak", color: "bg-red-500", width: "33%" };
  };

  useEffect(() => {
    setPasswordStrength(getPasswordStrength(password));
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    validateToken();
  }, [id, token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/validate-set-password/${id}/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.firstPassSet) {
          setAlreadySet(true);
        } else {
          setUserData(data.user);
        }
      } else {
        toast.error(data.message || 'Invalid or expired token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error validating token:', error);
      toast.error('Error validating token');
      navigate('/login');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordsMatch || password.length === 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/set-password/${id}/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Password set successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(data.message || 'Failed to set password');
      }
    } catch (error) {
      console.error('Error setting password:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const SuccessMessage = () => {
    const [changeTime, setChangeTime] = useState("");

    useEffect(() => {
      const now = new Date();
      const date = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const time = now
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(" ", "")
        .toLowerCase();
      setChangeTime(`${date} at ${time}`);
    }, []);

    return (
      <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-lg flex items-center">
        <svg
          className="w-6 h-6 mr-3 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div>
          <p className="font-semibold">Password changed successfully</p>
          <p className="text-sm">Password changed on {changeTime}</p>
        </div>
      </div>
    );
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (alreadySet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Already Set</h2>
            <p className="text-gray-600 mb-6">
              You have already set your password. Please use your existing password to log in.
            </p>
            <button
              onClick={() => navigate('/accountmanager/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Set Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been set successfully. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate('/accountmanager/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Set Your Password</h1>
            <p className="text-gray-600 text-sm">
              Welcome {userData?.fullname}! Please set your password to activate your account.
            </p>
          </div>

          <form className="space-y-6">
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    // Eye Off Icon
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.057 10.057 0 012.642-4.362M6.404 6.404A9.969 9.969 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-4.262 5.108M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    // Eye Icon
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.057 10.057 0 012.642-4.362M6.404 6.404A9.969 9.969 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-4.262 5.108M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-full rounded-full ${passwordStrength.color} transition-all duration-300`}
                  style={{ width: passwordStrength.width }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1">
                {!passwordsMatch && confirmPassword ? (
                  <p className="text-red-500 text-xs">
                    Passwords do not match
                  </p>
                ) : (
                  <div></div>
                )}
                <p
                  className={`text-xs ${
                    password.length === 0 ? "text-gray-400" : ""
                  }`}
                >
                  {password.length > 0
                    ? `${passwordStrength.label} Password`
                    : ""}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!passwordsMatch || password.length === 0 || loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-300"
            >
              {loading ? "Setting Password..." : "Set Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetPassword; 
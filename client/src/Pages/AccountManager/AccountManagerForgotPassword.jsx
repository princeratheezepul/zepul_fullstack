import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

function AccountManagerForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(80);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0 && success) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && success) {
      setCanResend(true);
    }
  }, [timer, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.Status === 'Success') {
        toast.success("Password reset email sent successfully! 📧");
        setSuccess(true);
        setTimer(80);
        setCanResend(false);
      } else {
        toast.error(data.message || "Failed to send reset email ❌");
      }
    } catch (err) {
      toast.error("Network error. Please try again. ❌");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !canResend) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accountmanager/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.Status === 'Success') {
        toast.success("Reset email resent successfully! 📧");
        setTimer(80);
        setCanResend(false);
      } else {
        toast.error(data.message || "Failed to resend email ❌");
      }
    } catch (err) {
      toast.error("Network error. Please try again. ❌");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // Branding bar
  const BrandingBar = () => (
    <div className="w-full flex justify-between items-center px-8 py-6 md:py-8">
      <div className="flex items-center gap-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill="#fff"/>
          <rect x="6" y="8" width="20" height="4" rx="2" fill="#2563eb"/>
          <rect x="6" y="20" width="20" height="4" rx="2" fill="#2563eb"/>
        </svg>
        <span className="font-bold text-xl text-gray-900 tracking-tight">ZEPUL</span>
      </div>
      <a href="#" className="text-gray-500 text-sm hover:underline">Help</a>
    </div>
  );

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <BrandingBar />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md p-8 space-y-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Check your mail</h1>
            <p className="text-gray-600 max-w-md leading-relaxed mb-8 px-4">
              We have sent a password recover instructions to your email.<br />
              <span className="font-medium text-black">"{email}"</span> didn't receive the email? check your spam filter, or
            </p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <span className="text-black text-lg font-mono">{formatTime(timer)}</span>
              <button
                onClick={handleResend}
                disabled={!canResend || isLoading}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  canResend && !isLoading 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? "Sending..." : "Resend mail"}
              </button>
            </div>
          </div>
        </div>
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <BrandingBar />
      <div className="flex flex-1 flex-col md:flex-row items-center justify-center w-full px-4 md:px-0">
        {/* Left: Illustration */}
        <div className="hidden md:flex flex-1 items-center justify-center h-full">
          <img
            src={"/Forgot password-cuate (1) 1.png"}
            alt="Forgot password illustration"
            className="max-w-[900px] w-[98%] h-auto object-contain xl:max-w-[1100px]"
            draggable="false"
          />
        </div>
        {/* Right: Form */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-none md:shadow-none">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
            <p className="text-gray-500 text-sm mb-8">Please enter your email address to search for your account.</p>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="block w-full px-4 py-3 placeholder-gray-400 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-base font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

export default AccountManagerForgotPassword;

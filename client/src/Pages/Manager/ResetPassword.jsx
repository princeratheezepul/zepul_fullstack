import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const { id, token } = useParams()

  const evaluatePassword = (password) => {
    const hasLowerCase = /[a-z]/.test(password)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    let strength = 0
    const feedback = []

    if (password.length >= 8) strength += 1
    if (password.length >= 12) strength += 1
    if (hasLowerCase) strength += 1
    if (hasUpperCase) strength += 1
    if (hasNumbers) strength += 1
    if (hasSpecialChars) strength += 1

    if (!hasLowerCase) feedback.push("Add lowercase letters")
    if (!hasUpperCase) feedback.push("Add uppercase letters")
    if (!hasNumbers) feedback.push("Add numbers")
    if (!hasSpecialChars) feedback.push("Add special characters")
    if (password.length < 8) feedback.push("Make it at least 8 characters")

    let strengthLevel = "weak"
    let strengthColor = "bg-red-500"
    let strengthText = "Weak Password"
    let strengthTextColor = "text-red-500"

    if (strength >= 4) {
      strengthLevel = "strong"
      strengthColor = "bg-green-500"
      strengthText = "Strong Password"
      strengthTextColor = "text-green-500"
    } else if (strength >= 2) {
      strengthLevel = "moderate"
      strengthColor = "bg-yellow-500"
      strengthText = "Moderate Password"
      strengthTextColor = "text-yellow-500"
    }

    return {
      score: strength,
      level: strengthLevel,
      color: strengthColor,
      text: strengthText,
      textColor: strengthTextColor,
      feedback: feedback.slice(0, 2),
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (evaluatePassword(password).score < 2) {
      setError("Please create a stronger password")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/manager/reset-password/${id}/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ password }),
        }
      )

      const data = await response.json()

      if (data.Status === "Success") {
        navigate("/login")
      } else {
        setError(data.message || "Reset failed. Please try again.")
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordEval = evaluatePassword(password)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded"></div>
          <span className="text-xl font-bold text-gray-900">ZEPUL</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Forgot Password?</h1>
            <p className="text-gray-600">Please enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Re-enter password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Re-enter password"
                required
              />
            </div>

            {/* Password Strength Indicator Bar */}
            {password && (
              <div className="space-y-2">
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordEval.color} transition-all duration-300 ease-in-out`}
                    style={{ width: `${(passwordEval.score / 6) * 100}%` }}
                  ></div>
                </div>

                {/* Password Strength Text and Feedback */}
                <div className="flex justify-between items-center">
                  <p className={`text-sm font-medium ${passwordEval.textColor}`}>
                    {passwordEval.text}
                  </p>

                  {passwordEval.level !== "strong" && (
                    <p className="text-xs text-gray-500">{passwordEval.feedback.join(" • ")}</p>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:bg-blue-400"
            >
              {isLoading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

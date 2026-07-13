import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";

export default function AuthPage() {
  const { loginWithPassword, sendOtp, verifyOtp, loginWithGoogle } = useAuth();

  // UI States
  const [authMode, setAuthMode] = useState("password"); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form Fields
  const [mobileNo, setMobileNo] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    if (authMode === "password") {
      const res = await loginWithPassword({ mobileNo, countryCode, password });
      if (!res.success) setErrorMessage(res.error);
    } else {
      // OTP Flow
      if (!otpSent) {
        const res = await sendOtp(mobileNo);
        if (res.success) {
          setOtpSent(true);
        } else {
          setErrorMessage(res.error);
        }
      } else {
        const res = await verifyOtp({ mobileNo, otp, countryCode });
        if (!res.success) setErrorMessage(res.error);
      }
    }
    setIsLoading(false);
  };

  // Mock Google Success Trigger for Testing
  const handleGoogleClick = async () => {
    setErrorMessage("");
    setIsLoading(true);
    // Passing the mock Google credential string token you provided in the spec
    const mockGoogleJwt =
      "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdiMDIxNjcxZWRlOTBlZTVhMzc1YzAyMmE1MjNkNDkwMTgxYTJjOWQiLCJ0eXAiOiJKV1QifQ...";
    const res = await loginWithGoogle(mockGoogleJwt);
    if (!res.success) setErrorMessage(res.error);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface p-[var(--card-padding)] rounded-themeCard shadow-[var(--card-shadow)] border border-[var(--border-color)] transition-all duration-300">
        {/* Header / Brand */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-textMain font-heading">
            Welcome Back
          </h2>
          <p className="text-sm text-textSecondary font-base mt-1">
            Sign in to your AI Assistant Dashboard
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-[var(--danger-color)] rounded-lg text-xs text-[var(--danger-color)] font-base">
            {errorMessage}
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Row: Country Code & Mobile Number */}
          <div className="flex gap-2">
            <div className="w-1/4">
              <TextField
                label="Code"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                placeholder="+91"
                required
              />
            </div>
            <div className="flex-1">
              <TextField
                label="Mobile Number"
                type="tel"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                placeholder="Enter phone number"
                disabled={otpSent}
                required
              />
            </div>
          </div>

          {/* Conditional Form Layer: Password Input */}
          {authMode === "password" && (
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          )}

          {/* Conditional Form Layer: OTP Input */}
          {authMode === "otp" && otpSent && (
            <TextField
              label="One-Time Password (OTP)"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit verification code"
              maxLength={6}
              required
            />
          )}

          {/* Main Action Submit Button */}
          <Button type="submit" isLoading={isLoading} className="mt-2">
            {authMode === "password"
              ? "Sign In with Password"
              : otpSent
                ? "Verify & Continue"
                : "Request Secure OTP"}
          </Button>
        </form>

        {/* Divider Layer */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute w-full border-t border-[var(--border-color)]"></div>
          <span className="relative bg-surface px-3 text-xs text-textSecondary font-base uppercase tracking-wider z-10">
            Or connect via
          </span>
        </div>

        {/* Third-Party Authentication Actions */}
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={handleGoogleClick}
            isLoading={isLoading}
          >
            <svg className="w-4 h-4 mr-2 inline-block" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.227C18.422 1.921 15.6 1 12.24 1 5.617 1 0 6.617 0 13.24s5.617 12.24 12.24 12.24c6.913 0 11.527-4.857 11.527-11.726 0-.788-.085-1.39-.189-1.969H12.24z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Toggle Button between Password and OTP modes */}
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === "password" ? "otp" : "password");
              setOtpSent(false);
              setErrorMessage("");
            }}
            className="text-xs text-primary font-medium font-base hover:underline text-center mt-2 focus:outline-hidden"
          >
            {authMode === "password"
              ? "Use Phone number & OTP Sign-In instead"
              : "Switch back to Standard Password Sign-In"}
          </button>
        </div>
      </div>
    </div>
  );
}

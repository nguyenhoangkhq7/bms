"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/auth/context";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { sendForgotPasswordOtp, confirmForgotPassword, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setFieldErrors({ email: "Email is required" });
      return;
    }
    
    try {
      clearError();
      await sendForgotPasswordOtp({ email: email.trim() });
      setStep(2);
      setFieldErrors({});
    } catch (err) {
      // Error handled by context
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};
    if (!otpCode.trim()) errors.otpCode = "OTP is required";
    if (!newPassword) errors.newPassword = "New password is required";
    if (newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      clearError();
      await confirmForgotPassword({
        email: email.trim(),
        otpCode: otpCode.trim(),
        newPassword
      });
      setSuccessMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err) {
      // Error handled by context
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-[#FDFBF7] rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">
              {step === 1 ? "Forgot Password" : "Reset Password"}
            </h1>
            <p className="text-[#666]">
              {step === 1 
                ? "Enter your email to receive a 6-digit OTP code." 
                : "Enter the OTP sent to your email and your new password."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded text-green-700 text-sm font-medium">
              {successMessage}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    fieldErrors.email ? "border-red-400 bg-red-50" : "border-[#D4C4B0] focus:border-[#1F4788]"
                  } focus:outline-none disabled:opacity-50`}
                />
                {fieldErrors.email && <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.email}</p>}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1F4788] hover:bg-[#2C5AA0] disabled:bg-[#8b9dc3] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">OTP Code</label>
                <input
                  "use client";

                  import { useState } from "react";
                  import Link from "next/link";
                  import { useRouter } from "next/navigation";
                  import { useAuth } from "@/src/auth/context";

                  export default function ForgotPasswordPage() {
                    const router = useRouter();
                    const { sendForgotPasswordOtp, confirmForgotPassword, isLoading, error, clearError } = useAuth();
  
                    const [email, setEmail] = useState("");
                    const [otpCode, setOtpCode] = useState("");
                    const [newPassword, setNewPassword] = useState("");
                    const [confirmPassword, setConfirmPassword] = useState("");
                    const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
                    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
                    const [successMessage, setSuccessMessage] = useState("");

                    const handleSendOtp = async (e: React.FormEvent) => {
                      e.preventDefault();
                      if (!email.trim()) {
                        setFieldErrors({ email: "Email is required" });
                        return;
                      }
    
                      try {
                        clearError();
                        await sendForgotPasswordOtp({ email: email.trim() });
                        setStep(2);
                        setFieldErrors({});
                      } catch (err) {
                        // Error handled by context
                      }
                    };

                    const handleResetPassword = async (e: React.FormEvent) => {
                      e.preventDefault();
                      const errors: { [key: string]: string } = {};
                      if (!otpCode.trim()) errors.otpCode = "OTP is required";
                      if (!newPassword) errors.newPassword = "New password is required";
                      if (newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    
                      if (Object.keys(errors).length > 0) {
                        setFieldErrors(errors);
                        return;
                      }

                      try {
                        clearError();
                        await confirmForgotPassword({
                          email: email.trim(),
                          otpCode: otpCode.trim(),
                          newPassword
                        });
                        setSuccessMessage("Password reset successfully! Redirecting to login...");
                        setTimeout(() => {
                          router.push("/auth/login");
                        }, 3000);
                      } catch (err) {
                        // Error handled by context
                      }
                    };

                    return (
                      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4 py-12">
                        <div className="w-full max-w-md">
                          <div className="bg-[#FDFBF7] rounded-2xl shadow-xl p-8">
                            <div className="mb-8">
                              <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">
                                {step === 1 ? "Forgot Password" : "Reset Password"}
                              </h1>
                              <p className="text-[#666]">
                                {step === 1 
                                  ? "Enter your email to receive a 6-digit OTP code." 
                                  : "Enter the OTP sent to your email and your new password."}
                              </p>
                            </div>

                            {error && (
                              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm font-medium">
                                {error}
                              </div>
                            )}

                            {successMessage && (
                              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded text-green-700 text-sm font-medium">
                                {successMessage}
                              </div>
                            )}

                            {step === 1 ? (
                              <form onSubmit={handleSendOtp} className="space-y-6">
                                <div>
                                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Email Address</label>
                                  <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    disabled={isLoading}
                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                                      fieldErrors.email ? "border-red-400 bg-red-50" : "border-[#D4C4B0] focus:border-[#1F4788]"
                                    } focus:outline-none disabled:opacity-50`}
                                  />
                                  {fieldErrors.email && <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.email}</p>}
                                </div>
                                <button
                                  type="submit"
                                  disabled={isLoading}
                                  className="w-full bg-[#1F4788] hover:bg-[#2C5AA0] disabled:bg-[#8b9dc3] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                  {isLoading ? "Sending OTP..." : "Send OTP"}
                                </button>
                              </form>
                            ) : (
                              <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">OTP Code</label>
                                  <input
                                    type="text"
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    disabled={isLoading}
                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors text-center text-xl tracking-widest font-bold ${
                                      fieldErrors.otpCode ? "border-red-400 bg-red-50" : "border-[#D4C4B0] focus:border-[#1F4788]"
                                    } focus:outline-none`}
                                  />
                                  {fieldErrors.otpCode && <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.otpCode}</p>}
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">New Password</label>
                                  <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min 8 characters"
                                    disabled={isLoading}
                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                                      fieldErrors.newPassword ? "border-red-400 bg-red-50" : "border-[#D4C4B0] focus:border-[#1F4788]"
                                    } focus:outline-none`}
                                  />
                                  {fieldErrors.newPassword && <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.newPassword}</p>}
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Confirm New Password</label>
                                  <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat new password"
                                    disabled={isLoading}
                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                                      fieldErrors.confirmPassword ? "border-red-400 bg-red-50" : "border-[#D4C4B0] focus:border-[#1F4788]"
                                    } focus:outline-none`}
                                  />
                                  {fieldErrors.confirmPassword && <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.confirmPassword}</p>}
                                </div>

                                <button
                                  type="submit"
                                  disabled={isLoading}
                                  className="w-full bg-[#1F4788] hover:bg-[#2C5AA0] disabled:bg-[#8b9dc3] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                  {isLoading ? "Resetting..." : "Reset Password"}
                                </button>
              
                                <button 
                                  type="button"
                                  onClick={() => setStep(1)}
                                  className="w-full text-[#666] hover:text-[#1a1a1a] font-semibold text-sm py-2"
                                >
                                  Back to Email Entry
                                </button>
                              </form>
                            )}

                            <div className="mt-6 text-center">
                              <Link href="/auth/login" className="text-sm font-bold text-[#1F4788] hover:text-[#2C5AA0]">
                                Back to Login
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }


              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    fieldErrors.confirmPassword ? "border-red-400 bg-red-50" : "border-[#D4C4B0] focus:border-[#1F4788]"
                  } focus:outline-none`}
                />
                {fieldErrors.confirmPassword && <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1F4788] hover:bg-[#2C5AA0] disabled:bg-[#8b9dc3] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
              
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-[#666] hover:text-[#1a1a1a] font-semibold text-sm py-2"
              >
                Back to Email Entry
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm font-bold text-[#1F4788] hover:text-[#2C5AA0]">
              Back to Login
            </Link>
          </div>
        </div>
>>>>>>> main
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/auth/context";
import { LoginRequest } from "@/src/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const redirectPath = useMemo(() => {
    const value = searchParams.get("redirect");
    if (!value || !value.startsWith("/") || value.startsWith("/auth")) {
      return "/";
    }

    return value;
  }, [searchParams]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!username.trim()) {
      errors.username = "Username is required";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      clearError();
      const credentials: LoginRequest = {
        username: username.trim(),
        password,
      };

      const userProfile = await login(credentials);
      if (userProfile.role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace(redirectPath);
      }
    } catch {
      // Error is handled by context
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#FDFBF7] rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">
              Welcome Back
            </h1>
            <p className="text-[#666]">Sign in to your account</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-[#1a1a1a] mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoCapitalize="off"
                autoCorrect="off"
                placeholder="Enter your username"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  fieldErrors.username
                    ? "border-red-400 bg-red-50"
                    : "border-[#D4C4B0] bg-white focus:border-[#1F4788] focus:bg-[#FDFBF7]"
                } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#1a1a1a]`}
              />
              {fieldErrors.username && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#1a1a1a] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors pr-12 ${
                    fieldErrors.password
                      ? "border-red-400 bg-red-50"
                      : "border-[#D4C4B0] bg-white focus:border-[#1F4788] focus:bg-[#FDFBF7]"
                  } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#1a1a1a]`}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1F4788] font-semibold text-sm hover:text-[#2C5AA0] disabled:opacity-50"
                >
                  {passwordVisible ? "Hide" : "Show"}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-[#1F4788] hover:text-[#2C5AA0] font-semibold text-sm"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1F4788] hover:bg-[#2C5AA0] disabled:bg-[#8b9dc3] text-white font-bold py-3 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-[#666]">
              Do not have an account?{" "}
              <Link
                href="/auth/register"
                className="font-bold text-[#1F4788] hover:text-[#2C5AA0]"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center text-[#999] text-sm mt-6">
          Protected by secure authentication
        </p>
      </div>
    </div>
  );
}

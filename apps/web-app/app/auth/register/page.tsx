"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/auth/context";
import { useRegisterForm } from "@/src/auth/hooks";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();
  const { formData, errors, updateField, validate, getSubmitData } =
    useRegisterForm();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      clearError();
      const data = getSubmitData();
      await register(data);
      router.push("/");
    } catch (err: any) {
      // Error is handled by context
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        {/* Card */}
        <div className="bg-[#FDFBF7] rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">
              Create Account
            </h1>
            <p className="text-[#666]">Join us today</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-[#1a1a1a] mb-2"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => updateField("username", e.target.value)}
                disabled={isLoading}
                placeholder="Choose username"
                autoCapitalize="off"
                autoCorrect="off"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  errors.username
                    ? "border-red-400 bg-red-50"
                    : "border-[#D4C4B0] bg-white focus:border-[#1F4788] focus:bg-white"
                } focus:outline-none disabled:opacity-50`}
              />
              {errors.username && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Full Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-[#1a1a1a] mb-2"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                disabled={isLoading}
                placeholder="Your full name"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  errors.name
                    ? "border-red-400 bg-red-50"
                    : "border-[#D4C4B0] bg-white focus:border-[#1F4788] focus:bg-white"
                } focus:outline-none disabled:opacity-50`}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#1a1a1a] mb-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                disabled={isLoading}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  errors.email
                    ? "border-red-400 bg-red-50"
                    : "border-[#D4C4B0] bg-white focus:border-[#1F4788] focus:bg-white"
                } focus:outline-none disabled:opacity-50`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Number Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-[#1a1a1a] mb-2"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => updateField("phoneNumber", e.target.value)}
                disabled={isLoading}
                placeholder="0912345678"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  errors.phoneNumber
                    ? "border-red-400 bg-red-50"
                    : "border-[#D4C4B0] bg-white focus:border-[#1F4788] focus:bg-white"
                } focus:outline-none disabled:opacity-50`}
              />
              {errors.phoneNumber && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Date of Birth Field */}
            <div>
              <label
                htmlFor="dob"
                className="block text-sm font-semibold text-[#1a1a1a] mb-2"
              >
                Date of Birth (Optional)
              </label>
              <input
                id="dob"
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
                disabled={isLoading}
                max={new Date(Date.now() - 86400000).toISOString().split("T")[0]}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  errors.dateOfBirth
                    ? "border-red-400 bg-red-50"
                    : "border-[#D4C4B0] bg-white focus:border-[#1F4788] focus:bg-white"
                } focus:outline-none disabled:opacity-50`}
              />
              {errors.dateOfBirth && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            {/* Address Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">
                Address Information <span className="text-red-500">*</span>
              </h3>

              {/* Street Address */}
              <div className="mb-4">
                <label
                  htmlFor="street"
                  className="block text-sm font-semibold text-[#1a1a1a] mb-2"
                >
                  Street Address
                </label>
                <input
                  id="street"
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => updateField("streetAddress", e.target.value)}
                  disabled={isLoading}
                  placeholder="123 Main Street"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    errors.streetAddress
                      ? "border-red-400 bg-red-50"
                      : "border-[#D4C4B0] bg-white focus:border-[#1F4788] focus:bg-white"
                  } focus:outline-none disabled:opacity-50`}
                />
                {errors.streetAddress && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.streetAddress}
                  </p>
                )}
              </div>

              {/* Ward, District, City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="ward"
                    className="block text-sm font-semibold text-[#1a1a1a] mb-2"
                  >
                    Ward
                  </label>
                  <input
                    id="ward"
                    type="text"
                    value={formData.ward}
                    onChange={(e) => updateField("ward", e.target.value)}
                    disabled={isLoading}
                    placeholder="Ward name"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                      errors.ward
                        ? "border-red-400 bg-red-50"
                        : "border-[#D4C4B0] bg-white focus:border-[#1F4788] focus:bg-white"
                    } focus:outline-none disabled:opacity-50`}
                  />
                  {errors.ward && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {errors.ward}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="district"
                    className="block text-sm font-semibold text-[#1a1a1a] mb-2"
                  >
                    District
                  </label>
                  <input
                    id="district"
                    type="text"
                    value={formData.district}
                    onChange={(e) => updateField("district", e.target.value)}
                    disabled={isLoading}
                    placeholder="District name"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                      errors.district
                        ? "border-red-400 bg-red-50"
                        : "border-[#D4C4B0] bg-white focus:border-[#1F4788] focus:bg-white"
                    } focus:outline-none disabled:opacity-50`}
                  />
                  {errors.district && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {errors.district}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="city"
                  className="block text-sm font-semibold text-[#1a1a1a] mb-2"
                >
                  City/Province
                </label>
                <input
                  id="city"
                  type="text"
                  value={formData.cityProvince}
                  onChange={(e) => updateField("cityProvince", e.target.value)}
                  disabled={isLoading}
                  placeholder="City or province name"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    errors.cityProvince
                      ? "border-red-400 bg-red-50"
                      : "border-[#D4C4B0] bg-white focus:border-[#1F4788] focus:bg-white"
                  } focus:outline-none disabled:opacity-50`}
                />
                {errors.cityProvince && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.cityProvince}
                  </p>
                )}
              </div>
            </div>

            {/* Security Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">
                Security <span className="text-red-500">*</span>
              </h3>

              {/* Password */}
              <div className="mb-4">
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
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    disabled={isLoading}
                    placeholder="Create password"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors pr-12 ${
                      errors.password
                        ? "border-red-400 bg-red-50"
                        : "border-[#D4C4B0] bg-white focus:border-[#1F4788] focus:bg-white"
                    } focus:outline-none disabled:opacity-50`}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1F4788] font-semibold text-sm hover:text-[#2C5AA0]"
                  >
                    {passwordVisible ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-[#1a1a1a] mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={confirmPasswordVisible ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      updateField("confirmPassword", e.target.value)
                    }
                    disabled={isLoading}
                    placeholder="Confirm password"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors pr-12 ${
                      errors.confirmPassword
                        ? "border-red-400 bg-red-50"
                        : "border-[#D4C4B0] bg-white focus:border-[#1F4788] focus:bg-white"
                    } focus:outline-none disabled:opacity-50`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1F4788] font-semibold text-sm hover:text-[#2C5AA0]"
                  >
                    {confirmPasswordVisible ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1F4788] hover:bg-[#2C5AA0] disabled:bg-[#8b9dc3] text-white font-bold py-3 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-[#666]">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-bold text-[#1F4788] hover:text-[#2C5AA0]"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <p className="text-center text-[#666] text-sm mt-6">
          Protected by secure authentication
        </p>
      </div>
    </div>
  );
}

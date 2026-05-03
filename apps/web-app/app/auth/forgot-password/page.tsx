"use client";

import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-md flex-col justify-center px-6 py-12">
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">Forgot Password</h1>
          <p className="text-sm text-gray-600">
            Password reset is not available yet. Please contact an administrator or return to login.
          </p>
        </div>

        <Link
          href="/auth/login"
          className="block rounded-md bg-black px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

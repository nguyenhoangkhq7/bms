'use client';

import { useAuth } from '@/src/auth/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const { isSignedIn, user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push('/auth/login');
    }
  }, [isSignedIn, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-[#F5F0E8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-12 w-12 text-indigo-600"
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
          <p className="text-[#666]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#F5F0E8]">
      {/* Header */}
      <header className="bg-[#FDFBF7] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">
              Book Management System
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-[#666]">Welcome,</p>
              <p className="font-semibold text-[#1a1a1a]">{user?.fullName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#d32f2f] hover:bg-[#b71c1c] text-white rounded-lg font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#FDFBF7] rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">
            Welcome to BMS!
          </h2>
          <p className="text-[#666] mb-6">
            You have successfully logged in. This is your dashboard.
          </p>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">
              Your Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#666]">Email</p>
                <p className="text-lg font-semibold text-[#1a1a1a]">
                  {user?.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#666]">Username</p>
                <p className="text-lg font-semibold text-[#1a1a1a]">
                  {user?.username}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#666]">Role</p>
                <p className="text-lg font-semibold text-[#1a1a1a]">
                  {user?.role}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#666]">Status</p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  {user?.status}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/books"
              className="p-4 bg-[#F5F0E8] hover:bg-indigo-100 rounded-lg border-2 border-[#D4C4B0] transition-colors"
            >
              <h4 className="font-semibold text-indigo-900 mb-2">Books</h4>
              <p className="text-sm text-[#1F4788]">Browse and manage books</p>
            </Link>
            <Link
              href="/orders"
              className="p-4 bg-[#F5F0E8] hover:bg-blue-100 rounded-lg border-2 border-[#D4C4B0] transition-colors"
            >
              <h4 className="font-semibold text-blue-900 mb-2">Orders</h4>
              <p className="text-sm text-[#1F4788]">View your orders</p>
            </Link>
            <Link
              href="/profile"
              className="p-4 bg-[#F5F0E8] hover:bg-purple-100 rounded-lg border-2 border-[#D4C4B0] transition-colors"
            >
              <h4 className="font-semibold text-purple-900 mb-2">Profile</h4>
              <p className="text-sm text-[#1F4788]">Manage your profile</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}



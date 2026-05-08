"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  authApi,
  UserProfile,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ForgotPasswordConfirmRequest,
  ChangePasswordWithOtpRequest,
} from "../api/auth";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isSignedIn: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  sendForgotPasswordOtp: (data: ForgotPasswordRequest) => Promise<void>;
  confirmForgotPassword: (data: ForgotPasswordConfirmRequest) => Promise<void>;
  sendChangePasswordOtp: () => Promise<void>;
  confirmChangePassword: (data: ChangePasswordWithOtpRequest) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      const cachedUser = localStorage.getItem("user");

      if (token && cachedUser) {
        const parsedUser = JSON.parse(cachedUser) as UserProfile;
        setUser(parsedUser);
        localStorage.setItem("userId", String(parsedUser.id));
        localStorage.setItem("authMode", "real");
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        setIsLoading(true);
        clearError();
        await authApi.login(credentials);

        // Fetch user profile
        const userProfile = await authApi.me();
        localStorage.setItem("user", JSON.stringify(userProfile));
        localStorage.setItem("userId", String(userProfile.id));
        localStorage.setItem("authMode", "real");
        setUser(userProfile);
      } catch (err: any) {
        const errorMessage =
          (typeof err === "string" ? err : undefined) ||
          err?.error?.message ||
          err?.message ||
          "Login failed. Please try again.";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        setIsLoading(true);
        clearError();
        await authApi.register(data);

        // Fetch user profile
        const userProfile = await authApi.me();
        localStorage.setItem("user", JSON.stringify(userProfile));
        localStorage.setItem("userId", String(userProfile.id));
        localStorage.setItem("authMode", "real");
        setUser(userProfile);
      } catch (err: any) {
        const errorMessage =
          (typeof err === "string" ? err : undefined) ||
          err?.error?.message ||
          err?.message ||
          "Registration failed. Please try again.";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError],
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("authMode");
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const sendForgotPasswordOtp = useCallback(
    async (data: ForgotPasswordRequest) => {
      try {
        setIsLoading(true);
        clearError();
        await authApi.sendForgotPasswordOtp(data);
      } catch (err: any) {
        setError(err?.message || "Failed to send OTP.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError],
  );

  const confirmForgotPassword = useCallback(
    async (data: ForgotPasswordConfirmRequest) => {
      try {
        setIsLoading(true);
        clearError();
        await authApi.confirmForgotPassword(data);
      } catch (err: any) {
        setError(err?.message || "Failed to reset password.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError],
  );

  const sendChangePasswordOtp = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      await authApi.sendChangePasswordOtp();
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const confirmChangePassword = useCallback(
    async (data: ChangePasswordWithOtpRequest) => {
      try {
        setIsLoading(true);
        clearError();
        await authApi.confirmChangePassword(data);
      } catch (err: any) {
        setError(err?.message || "Failed to change password.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError],
  );

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSignedIn: !!user,
        login,
        register,
        logout,
        checkAuth,
        sendForgotPasswordOtp,
        confirmForgotPassword,
        sendChangePasswordOtp,
        confirmChangePassword,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

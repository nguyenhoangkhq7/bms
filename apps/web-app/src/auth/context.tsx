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
} from "../api/auth";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isSignedIn: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
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
        setUser(JSON.parse(cachedUser));
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
        setUser(userProfile);
      } catch (err: any) {
        const errorMessage =
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
        setUser(userProfile);
      } catch (err: any) {
        const errorMessage =
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
      localStorage.removeItem("user");
      setUser(null);
      setIsLoading(false);
    }
  }, []);

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

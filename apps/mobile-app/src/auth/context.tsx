import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  authApi,
  UserProfile,
  LoginRequest,
  RegisterRequest,
} from "../api/auth";
import { apiClient } from "../api/client";

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

  const clearError = useCallback(() => setError(null), []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      const cachedUser = await AsyncStorage.getItem("user");

      if (token && cachedUser) {
        await apiClient.setAccessToken(token);
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
        const response = await authApi.login(credentials);

        await apiClient.setAccessToken(response.token);

        // Fetch user profile
        const userProfile = await authApi.me();
        await AsyncStorage.setItem("user", JSON.stringify(userProfile));
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
        const response = await authApi.register(data);

        await apiClient.setAccessToken(response.token);

        // Fetch user profile
        const userProfile = await authApi.me();
        await AsyncStorage.setItem("user", JSON.stringify(userProfile));
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
      const response = await authApi.logout();
      console.log("Logout successful:", response);
    } catch (err) {
      console.error("Logout error:", err);
      // Tiếp tục xóa token ngay cả nếu API call thất bại
    } finally {
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("user");
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  authApi,
  UserProfile,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ForgotPasswordConfirmRequest,
  ChangePasswordWithOtpRequest,
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

  const clearError = useCallback(() => setError(null), []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync("access_token");
      console.log("[Auth] Checking token:", token ? "Found" : "Missing");

      if (token && token !== "null" && token !== "undefined") {
        try {
          const userProfile = await authApi.me();
          console.log("[Auth] Me API success, user:", userProfile.username);
          
          // Kiểm tra tính hợp lệ của profile
          if (!userProfile.email || !userProfile.id) {
            throw new Error("Invalid profile data");
          }

          await AsyncStorage.setItem("user", JSON.stringify(userProfile));
          setUser(userProfile);
        } catch (apiErr) {
          console.error("[Auth] Validation failed, clearing storage");
          await SecureStore.deleteItemAsync("access_token");
          await SecureStore.deleteItemAsync("refresh_token");
          await AsyncStorage.removeItem("user");
          setUser(null);
        }
      } else {
        console.log("[Auth] No valid token found, ensuring clean state");
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        await AsyncStorage.removeItem("user");
        setUser(null);
      }
    } catch (err) {
      console.error("[Auth] Global check auth error:", err);
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

        await apiClient.setTokens(response.accessToken, response.refreshToken);

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

        await apiClient.setTokens(response.accessToken, response.refreshToken);

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
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      await AsyncStorage.removeItem("user");
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
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSignedIn: !!user && !!user.id,
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

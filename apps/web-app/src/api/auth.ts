import { httpClient, apiClient } from "./client";

export interface RegisterRequest {
  username: string;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  cityProvince: string;
  dateOfBirth?: string; // ISO format: YYYY-MM-DD
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordConfirmRequest {
  email: string;
  otpCode: string;
  newPassword: string;
}

export interface ChangePasswordWithOtpRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  role: string;
  status: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await httpClient.post<AuthResponse>("/auth/login", data);
      apiClient.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
      );
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await httpClient.post<AuthResponse>(
        "/auth/register",
        data,
      );
      apiClient.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
      );
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },

  me: async (): Promise<UserProfile> => {
    try {
      const response = await httpClient.get<UserProfile>("/auth/me");
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await httpClient.post("/auth/logout");
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },

  sendForgotPasswordOtp: async (data: ForgotPasswordRequest): Promise<void> => {
    try {
      await httpClient.post("/auth/forgot-password/send-otp", data);
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },

  confirmForgotPassword: async (
    data: ForgotPasswordConfirmRequest,
  ): Promise<void> => {
    try {
      await httpClient.post("/auth/forgot-password/confirm", data);
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },

  sendChangePasswordOtp: async (): Promise<void> => {
    try {
      await httpClient.post("/auth/change-password/send-otp");
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },

  confirmChangePassword: async (
    data: ChangePasswordWithOtpRequest,
  ): Promise<void> => {
    try {
      await httpClient.post("/auth/change-password/confirm", data);
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },
};

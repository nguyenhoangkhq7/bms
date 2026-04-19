import { httpClient } from "./client";

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

export interface AuthResponse {
  token: string;
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
};

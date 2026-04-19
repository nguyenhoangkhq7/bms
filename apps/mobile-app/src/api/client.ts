import axios, { AxiosInstance, AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api";

class ApiClient {
  private instance: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshResponse = await this.instance.post("/auth/refresh");
            const { token } = refreshResponse.data;

            await AsyncStorage.setItem("access_token", token);
            this.accessToken = token;

            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            await AsyncStorage.removeItem("access_token");
            await AsyncStorage.removeItem("user");
            // TODO: Navigate to login screen
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  async setAccessToken(token: string) {
    this.accessToken = token;
    await AsyncStorage.setItem("access_token", token);
  }

  getClient() {
    return this.instance;
  }
}

export const apiClient = new ApiClient();
export const httpClient = apiClient.getClient();

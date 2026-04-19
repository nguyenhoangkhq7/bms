import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Enable cookies for refresh token
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
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

            localStorage.setItem("access_token", token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            // Redirect to login
            window.location.href = "/auth/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  setAccessToken(token: string) {
    localStorage.setItem("access_token", token);
  }

  getClient() {
    return this.instance;
  }
}

export const apiClient = new ApiClient();
export const httpClient = apiClient.getClient();

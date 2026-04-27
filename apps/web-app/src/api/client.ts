import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1/identity";

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
        if (
          token &&
          !config.url?.includes("/auth/login") &&
          !config.url?.includes("/auth/register")
        ) {
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

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes("/auth/")
        ) {
          originalRequest._retry = true;

          try {
            const storedRefreshToken = localStorage.getItem("refresh_token");
            if (!storedRefreshToken) {
              throw new Error("No refresh token found");
            }

            const refreshResponse = await this.instance.post("/auth/refresh", {
              refreshToken: storedRefreshToken,
            });
            const { accessToken, refreshToken } = refreshResponse.data as {
              accessToken: string;
              refreshToken: string;
            };

            this.setTokens(accessToken, refreshToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
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

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  }

  getClient() {
    return this.instance;
  }
}

export const apiClient = new ApiClient();
export const httpClient = apiClient.getClient();

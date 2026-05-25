import axios, { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";

// Derive gateway base from identity URL, then point to product-service
const IDENTITY_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.112/api/v1/identity";
const GATEWAY_BASE = IDENTITY_URL.replace(/\/api\/v1\/identity\/?$/, "");
const PRODUCT_BASE_URL = `${GATEWAY_BASE}/api/v1/products`;

class ProductApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: PRODUCT_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Attach auth token if available
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  getClient() {
    return this.instance;
  }
}

export const productApiClient = new ProductApiClient();
export const productHttp = productApiClient.getClient();
export { GATEWAY_BASE };

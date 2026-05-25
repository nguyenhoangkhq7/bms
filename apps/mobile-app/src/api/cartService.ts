import axios from "axios";
import * as SecureStore from "expo-secure-store";

const IDENTITY_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.112/api/v1/identity";
const GATEWAY_BASE = IDENTITY_URL.replace(/\/api\/v1\/identity\/?$/, "");
const ORDER_BASE_URL = `${GATEWAY_BASE}/api/v1/orders`;

const orderHttp = axios.create({
  baseURL: ORDER_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

orderHttp.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AddToCartRequest {
  userId: number;
  bookId: number;
  quantity: number;
}

export const cartService = {
  addToCart: async (payload: AddToCartRequest) => {
    const response = await orderHttp.post("/cart/add", payload);
    return response.data;
  },
};

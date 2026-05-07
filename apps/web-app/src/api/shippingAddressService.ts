import axios from "axios";
import type { ShippingAddress, ShippingAddressRequest } from "@/src/checkout/types";

const configuredBase = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || process.env.BACKEND_API_BASE_URL;
const BACKEND_BASE_CANDIDATES = configuredBase
  ? [configuredBase]
  : ["http://localhost/api/v1/orders", "/api/v1/orders", "http://localhost:8083"];

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function tryCandidates<T>(fn: (base: string) => Promise<T>): Promise<T> {
  let lastError: any = null;
  for (let i = 0; i < BACKEND_BASE_CANDIDATES.length; i += 1) {
    const base = BACKEND_BASE_CANDIDATES[i];
    try {
      return await fn(base);
    } catch (err: any) {
      lastError = err;
      const isLast = i === BACKEND_BASE_CANDIDATES.length - 1;
      if (err.response?.status === 404 && !isLast) continue;
      if (err.response) throw err;
    }
  }
  throw lastError;
}

export async function getShippingAddresses(userId: number): Promise<ShippingAddress[]> {
  const headers = getAuthHeaders();
  return tryCandidates(async (base) => {
    const res = await axios.get(`${base}/api/shipping-addresses`, { headers, params: { userId } });
    return res.data;
  });
}

export async function createShippingAddress(payload: ShippingAddressRequest): Promise<ShippingAddress> {
  const headers = getAuthHeaders();
  return tryCandidates(async (base) => {
    const res = await axios.post(`${base}/api/shipping-addresses`, payload, { headers });
    return res.data;
  });
}

export async function updateShippingAddress(id: number, payload: ShippingAddressRequest): Promise<ShippingAddress> {
  const headers = getAuthHeaders();
  return tryCandidates(async (base) => {
    const res = await axios.put(`${base}/api/shipping-addresses/${id}`, payload, { headers });
    return res.data;
  });
}

export async function setDefaultShippingAddress(id: number, userId: number): Promise<ShippingAddress> {
  const headers = getAuthHeaders();
  return tryCandidates(async (base) => {
    const res = await axios.patch(`${base}/api/shipping-addresses/${id}/default`, null, {
      headers,
      params: { userId },
    });
    return res.data;
  });
}

export async function deleteShippingAddress(id: number, userId: number): Promise<void> {
  const headers = getAuthHeaders();
  await tryCandidates(async (base) => {
    await axios.delete(`${base}/api/shipping-addresses/${id}`, { headers, params: { userId } });
  });
}
